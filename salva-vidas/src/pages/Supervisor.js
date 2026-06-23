import { useEffect, useMemo, useState } from "react";
import { apiRequest, API_BASE_URL } from "../services/api";

/* ─────────────────────────────────────────
   UTILITIES
───────────────────────────────────────── */
function toInputDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getNumber(value) {
  return Number(value) || 0;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getStatus(posto) {
  return String(posto?.status || posto?.situacao || "").toUpperCase();
}

function getPosto(checkin, fallback) {
  return checkin?.posto || checkin?.getPosto || fallback?.posto || fallback?.getPosto || null;
}

function getUsuario(checkin) {
  return checkin?.usuario || checkin?.getUsuario || null;
}

function getCheckinIdFromCheckout(checkout) {
  return Number(checkout?.checkinId || checkout?.checkin?.id || checkout?.getCheckin?.id || 0);
}

function getExpectedTime(turno) {
  return String(turno || "").toUpperCase() === "TARDE" ? "13:00" : "08:00";
}

function getDelayMinutes(row) {
  const expected = getExpectedTime(row.turno);
  const checkin = new Date(row.checkinAt);
  const [hours, minutes] = expected.split(":").map(Number);
  const limit = new Date(checkin);
  limit.setHours(hours, minutes, 0, 0);
  return Math.max(0, Math.round((checkin.getTime() - limit.getTime()) / 60000));
}

/* ─────────────────────────────────────────
   TABS  (apenas operacionais)
───────────────────────────────────────── */
const TABS = [
  { id: "monitoramento", label: "Monitoramento", icon: "👁" },
  { id: "fotos",         label: "Fotos",          icon: "📷" },
  { id: "resumo",        label: "Resumo",         icon: "▦" },
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function MetricCard({ label, value, tone = "default", helper }) {
  return (
    <div className={`command-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Supervisor() {
  const [activeTab, setActiveTab]     = useState("monitoramento");
  const [postos, setPostos]           = useState([]);
  const [checkins, setCheckins]       = useState([]);
  const [checkouts, setCheckouts]     = useState([]);
  const [usuarios, setUsuarios]       = useState([]);
  const [erro, setErro]               = useState("");
  const [carregando, setCarregando]   = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  /* filtros de foto */
  const [fotoFiltros, setFotoFiltros] = useState({
    data: toInputDate(new Date()), posto: "", nome: ""
  });

  useEffect(() => {
    let mounted = true;
    async function carregarDados() {
      setCarregando(true);
      setErro("");
      try {
        const [postosData, checkinsData, checkoutsData, usuariosData] = await Promise.all([
          apiRequest("/postos"),
          apiRequest("/check/history"),
          apiRequest("/checkout/history"),
          apiRequest("/usuarios"),
        ]);
        if (!mounted) return;
        setPostos(Array.isArray(postosData)    ? postosData    : []);
        setCheckins(Array.isArray(checkinsData) ? checkinsData : []);
        setCheckouts(Array.isArray(checkoutsData) ? checkoutsData : []);
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      } catch (error) {
        if (mounted) setErro(error.message || "Falha ao carregar dados operacionais.");
      } finally {
        if (mounted) setCarregando(false);
      }
    }
    carregarDados();
    return () => { mounted = false; };
  }, []);

  /* ── combina check-ins + check-outs ── */
  const registros = useMemo(() => {
    return checkins.map((checkin) => {
      const checkout = checkouts.find((o) => getCheckinIdFromCheckout(o) === Number(checkin.id));
      const usuario  = getUsuario(checkin) || usuarios.find((u) => Number(u.id) === Number(checkin.usuarioId));
      const posto    = getPosto(checkin, checkout);
      const checkinAt  = checkin.createdAt || checkin.horario;
      const checkoutAt = checkout?.createdAt || checkin.fim || null;
      const fim    = checkoutAt ? new Date(checkoutAt) : new Date();
      const inicio = new Date(checkinAt);

      const row = {
        id: checkin.id,
        nome:      usuario?.nomeCompleto || usuario?.nome || "Nao informado",
        cpf:       usuario?.cpf || "-",
        usuarioId: usuario?.id || "",
        posto:     posto?.nome || checkin.postoNome || checkout?.postoNome || "Nao informado",
        postoId:   posto?.id || "",
        data:      checkinAt,
        turno:     checkin.turno || checkout?.turno || "MANHA",
        checkinAt,
        checkoutAt,
        finalizado:   Boolean(checkoutAt),
        tempoMinutos: Number.isNaN(fim - inicio) ? 0 : Math.max(0, (fim - inicio) / 60000),
        prevencoes:   getNumber(checkout?.prevencoes),
        lesoes:       getNumber(checkout?.lesoes),
        queimaduras:  getNumber(checkout?.queimaduras),
        fotoCheckinId:  checkin.foto?.id  || null,
        fotoCheckoutId: checkout?.foto?.id || null,
      };
      row.minutosAtraso = getDelayMinutes({ ...row, checkinAt });
      return row;
    });
  }, [checkins, checkouts, usuarios]);

  /* ── métricas do dia ── */
  const todayRows  = useMemo(() => registros.filter((r) => toInputDate(r.data) === toInputDate(new Date())), [registros]);
  const activeRows = registros.filter((r) => !r.finalizado);
  const occupiedNow = postos.filter((p) => getStatus(p) === "OCUPADO").length;
  const freeNow     = postos.filter((p) => getStatus(p) === "LIVRE").length;

  const resumo = useMemo(() => ({
    guardaVidasServico: activeRows.length,
    postosOcupados:     occupiedNow,
    postosLivres:       freeNow,
    checkinsHoje:       todayRows.length,
    checkoutsHoje:      todayRows.filter((r) => r.finalizado).length,
    prevencoesHoje:     todayRows.reduce((s, r) => s + r.prevencoes,  0),
    lesoesHoje:         todayRows.reduce((s, r) => s + r.lesoes,      0),
    queimadurasHoje:    todayRows.reduce((s, r) => s + r.queimaduras, 0),
    atrasosHoje:        todayRows.filter((r) => r.minutosAtraso > 0).length,
  }), [activeRows.length, occupiedNow, freeNow, todayRows]);

  /* ── fotos filtradas ── */
  const fotosFiltradas = useMemo(() => {
    return registros.filter((r) => {
      if (!r.fotoCheckinId && !r.fotoCheckoutId) return false;
      const dataOk  = !fotoFiltros.data  || toInputDate(r.data) === fotoFiltros.data;
      const postoOk = !fotoFiltros.posto || r.posto === fotoFiltros.posto;
      const nomeOk  = !fotoFiltros.nome  || normalizeText(r.nome).includes(normalizeText(fotoFiltros.nome));
      return dataOk && postoOk && nomeOk;
    });
  }, [registros, fotoFiltros]);

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  return (
    <main className="app-shell page supervisor-command">
      <header className="page-header command-header">
        <div>
          <p className="page-kicker">Supervisao / Sargento</p>
          <h1>Painel Operacional</h1>
          <p className="page-description">
            Acompanhe em tempo real os postos, equipes em serviço e registros fotográficos.
          </p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => window.location.reload()} disabled={carregando}>
          Atualizar
        </button>
      </header>

      {/* ── TABS ── */}
      <section className="command-tabs" aria-label="Painel do supervisor">
        {TABS.map((tab) => (
          <button key={tab.id} type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </section>

      <section className="content-grid command-grid">
        {erro       && <div className="alert alert-error span-12">{erro}</div>}
        {carregando && <div className="alert alert-info  span-12">Atualizando dados operacionais...</div>}

        {/* ════════════════════════════ MONITORAMENTO ══════════════════════════════ */}
        {activeTab === "monitoramento" && (
          <div className="span-12">
            {/* métricas rápidas */}
            <div className="command-metric-row" style={{ marginBottom: "24px" }}>
              <MetricCard label="Guarda-Vidas em serviço" value={resumo.guardaVidasServico} tone="danger" />
              <MetricCard label="Postos ocupados"          value={resumo.postosOcupados}     tone="warning" />
              <MetricCard label="Postos livres"            value={resumo.postosLivres}        tone="success" />
            </div>

            {/* grade de postos */}
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <h2>Status dos Postos — Tempo Real</h2>
              <p className="page-description">Todos os postos cadastrados e equipes em atividade.</p>
            </div>

            <div className="monitor-grid">
              {postos.map((posto) => {
                const activeShift = registros.find((r) => Number(r.postoId) === Number(posto.id) && !r.finalizado);
                const isOccupied  = getStatus(posto) === "OCUPADO" || Boolean(activeShift);

                return (
                  <div key={posto.id} className={`monitor-card ${isOccupied ? "occupied" : "free"}`}>
                    <div>
                      <div className="monitor-card-header">
                        <span className="monitor-card-title">{posto.nome}</span>
                        <span className={`monitor-card-badge ${isOccupied ? "occupied" : "free"}`}>
                          {isOccupied ? "Em Serviço" : "Livre"}
                        </span>
                      </div>

                      <div className="monitor-card-body">
                        {isOccupied && activeShift ? (
                          <>
                            <div className="monitor-info-row">
                              <span>Guarda-Vidas</span>
                              <strong>{activeShift.nome}</strong>
                            </div>
                            <div className="monitor-info-row">
                              <span>CPF</span>
                              <span>{activeShift.cpf}</span>
                            </div>
                            <div className="monitor-info-row">
                              <span>Entrada</span>
                              <strong>{formatTime(activeShift.checkinAt)}</strong>
                            </div>
                            <div className="monitor-info-row">
                              <span>Turno</span>
                              <span>{activeShift.turno}</span>
                            </div>
                          </>
                        ) : (
                          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "10px 0" }}>
                            Posto disponível para check-in.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="monitor-card-footer">{posto.descricao || "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════ FOTOS ══════════════════════════════ */}
        {activeTab === "fotos" && (
          <section className="card span-12 command-report">
            <div className="section-title command-section-title">
              <div>
                <p className="page-kicker">Visualização fotográfica</p>
                <h2>Registro Fotográfico de Atividades</h2>
              </div>
            </div>

            {/* filtros simples */}
            <div className="command-filters" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="field">
                <label>Data</label>
                <input className="input" type="date" value={fotoFiltros.data}
                  onChange={(e) => setFotoFiltros((f) => ({ ...f, data: e.target.value }))} />
              </div>
              <div className="field">
                <label>Posto</label>
                <select className="select" value={fotoFiltros.posto}
                  onChange={(e) => setFotoFiltros((f) => ({ ...f, posto: e.target.value }))}>
                  <option value="">Todos</option>
                  {postos.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Guarda-Vidas</label>
                <input className="input" value={fotoFiltros.nome} placeholder="Nome do profissional"
                  onChange={(e) => setFotoFiltros((f) => ({ ...f, nome: e.target.value }))} />
              </div>
            </div>

            {fotosFiltradas.length === 0 ? (
              <div className="empty-state">Nenhuma foto encontrada para os filtros selecionados.</div>
            ) : (
              <div className="photos-grid">
                {fotosFiltradas.map((row) => (
                  <div className="photo-card" key={row.id}>
                    <div className="photo-card-header">
                      <h4>{row.nome}</h4>
                      <div>CPF: {row.cpf}</div>
                      <div>Posto: <strong>{row.posto}</strong> · Turno: {row.turno}</div>
                      <div>Data: {formatDate(row.data)}</div>
                    </div>
                    <div className="photo-card-images">
                      {/* CHECK-IN */}
                      <div className="photo-box">
                        <span className="checkin">Check-In</span>
                        <div className="photo-thumbnail-container">
                          {row.fotoCheckinId ? (
                            <img
                              src={`${API_BASE_URL}/arquivos/ver/${row.fotoCheckinId}`}
                              alt="Check-In"
                              onClick={() => setSelectedPhoto({
                                url:     `${API_BASE_URL}/arquivos/ver/${row.fotoCheckinId}`,
                                title:   `Check-In — ${row.nome}`,
                                details: `Posto: ${row.posto} · ${formatDate(row.data)} · Entrada: ${formatTime(row.checkinAt)}`
                              })}
                            />
                          ) : (
                            <div className="photo-placeholder">Sem foto de check-in</div>
                          )}
                        </div>
                        <small>{formatTime(row.checkinAt)}</small>
                      </div>
                      {/* CHECK-OUT */}
                      <div className="photo-box">
                        <span className="checkout">Check-Out</span>
                        <div className="photo-thumbnail-container">
                          {row.fotoCheckoutId ? (
                            <img
                              src={`${API_BASE_URL}/arquivos/ver/${row.fotoCheckoutId}`}
                              alt="Check-Out"
                              onClick={() => setSelectedPhoto({
                                url:     `${API_BASE_URL}/arquivos/ver/${row.fotoCheckoutId}`,
                                title:   `Check-Out — ${row.nome}`,
                                details: `Posto: ${row.posto} · ${formatDate(row.data)} · Saída: ${formatTime(row.checkoutAt)}`
                              })}
                            />
                          ) : (
                            <div className="photo-placeholder">
                              {row.finalizado ? "Sem foto de check-out" : "Turno em andamento"}
                            </div>
                          )}
                        </div>
                        <small>{row.finalizado ? formatTime(row.checkoutAt) : "—"}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ════════════════════════════ RESUMO DO DIA ══════════════════════════════ */}
        {activeTab === "resumo" && (
          <>
            <MetricCard label="Guarda-Vidas em serviço" value={resumo.guardaVidasServico} tone="danger" />
            <MetricCard label="Postos ocupados"          value={resumo.postosOcupados}     tone="warning" />
            <MetricCard label="Postos livres"            value={resumo.postosLivres}        tone="success" />
            <MetricCard label="Check-Ins hoje"           value={resumo.checkinsHoje}  />
            <MetricCard label="Check-Outs hoje"          value={resumo.checkoutsHoje} />
            <MetricCard label="Prevenções do dia"        value={resumo.prevencoesHoje}  />
            <MetricCard label="Lesões do dia"            value={resumo.lesoesHoje}      />
            <MetricCard label="Queimaduras do dia"       value={resumo.queimadurasHoje} />
            <MetricCard label="Atrasos hoje"             value={resumo.atrasosHoje}     tone="danger" />
          </>
        )}
      </section>

      {/* ═══════════════ MODAL DE FOTO ═══════════════ */}
      {selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setSelectedPhoto(null)}>&times;</button>
            <img src={selectedPhoto.url} alt={selectedPhoto.title} />
            <div className="photo-modal-caption">
              <h3>{selectedPhoto.title}</h3>
              <p>{selectedPhoto.details}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
