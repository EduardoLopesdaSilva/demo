import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

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

function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins  = total % 60;
  if (!hours) return `${mins} min`;
  return `${hours}h ${String(mins).padStart(2, "0")}min`;
}

function getNumber(value) { return Number(value) || 0; }

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
  const checkin  = new Date(row.checkinAt);
  const [h, m]   = expected.split(":").map(Number);
  const limit = new Date(checkin);
  limit.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((checkin - limit) / 60000));
}

function groupSum(items, keyFn, valueFn = () => 1) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || "Nao informado";
    acc[key] = (acc[key] || 0) + valueFn(item);
    return acc;
  }, {});
}

function toChartData(grouped) {
  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function isInsideRange(value, filters) {
  const date = toInputDate(value);
  const { start, end } = getPeriodoRange(filters);
  return (!start || date >= start) && (!end || date <= end);
}

function getPeriodoRange(filters) {
  const today    = new Date();
  const selected = filters.data ? new Date(`${filters.data}T00:00:00`) : today;

  if (filters.periodo === "semana") {
    const start = new Date(selected);
    const day   = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toInputDate(start), end: toInputDate(end) };
  }
  if (filters.periodo === "mes") {
    const [year, month] = String(filters.mes || toInputDate(today).slice(0, 7)).split("-").map(Number);
    return { start: toInputDate(new Date(year, month - 1, 1)), end: toInputDate(new Date(year, month, 0)) };
  }
  if (filters.periodo === "ano") {
    const year = Number(filters.ano) || today.getFullYear();
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }
  if (filters.periodo === "personalizado") {
    return { start: filters.dataInicial, end: filters.dataFinal };
  }
  return { start: filters.data, end: filters.data };
}

/* ─────────────────────────────────────────
   EXPORTAÇÃO
───────────────────────────────────────── */
function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCell(value) {
  return String(value ?? "").replace(/"/g, '""');
}

function buildHtmlDocument(title, headers, rows) {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "")}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;color:#1f2937}h1{color:#7f1d1d}table{border-collapse:collapse;width:100%}th{background:#7f1d1d;color:#fff;text-align:left}td,th{border:1px solid #d1d5db;padding:8px;font-size:12px}</style></head><body><h1>${title}</h1><p>Exportado em ${new Date().toLocaleString("pt-BR")}</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

function exportReport(format, title, headers, rows) {
  const safeName = normalizeText(title).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (format === "csv") {
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${escapeCell(c)}"`).join(";")).join("\n");
    downloadBlob(`${safeName}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
    return;
  }
  const html = buildHtmlDocument(title, headers, rows);
  if (format === "excel") {
    downloadBlob(`${safeName}.xlsx`, html, "application/vnd.ms-excel;charset=utf-8");
    return;
  }
  if (format === "doc") {
    downloadBlob(`${safeName}.docx`, html, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    return;
  }
  const win = window.open("", "_blank", "width=1100,height=760");
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
}

/* ─────────────────────────────────────────
   ABAS  (apenas relatórios)
───────────────────────────────────────── */
const TABS = [
  { id: "atrasos",     label: "Atrasos",           icon: "⏱" },
  { id: "historico",   label: "Histórico",          icon: "◷" },
  { id: "ocupacao",    label: "Ocupação",           icon: "▤" },
  { id: "prevencoes",  label: "Prevenções",         icon: "🛟" },
  { id: "lesoes",      label: "Lesões",             icon: "✚" },
  { id: "queimaduras", label: "Queimaduras",        icon: "☀" },
  { id: "turnos",      label: "Turnos",             icon: "⇄" },
  { id: "guardaVidas", label: "Guarda-Vidas",       icon: "👤" },
  { id: "postos",      label: "Postos",             icon: "⌂" },
];

const REPORT_TITLES = {
  atrasos:     "Relatório de Atrasos",
  historico:   "Histórico Operacional",
  ocupacao:    "Ocupação dos Postos",
  prevencoes:  "Relatório de Prevenções",
  lesoes:      "Relatório de Lesões",
  queimaduras: "Relatório de Queimaduras",
  turnos:      "Relatório de Turnos",
  guardaVidas: "Relatório Individual de Guarda-Vidas",
  postos:      "Relatório de Postos",
};

const DEFAULT_FILTERS = {
  periodo: "dia",
  data: toInputDate(new Date()),
  mes: toInputDate(new Date()).slice(0, 7),
  ano: String(new Date().getFullYear()),
  dataInicial: toInputDate(new Date()),
  dataFinal:   toInputDate(new Date()),
  nome: "",
  cpf:  "",
  posto: "",
  turno: "",
  guardaVidaId: "",
};

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function MetricCard({ label, value, helper }) {
  return (
    <div className="command-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

function FilterPanel({ filters, setFilters, tab, postos, usuarios }) {
  const showName  = ["atrasos","historico","prevencoes","lesoes","queimaduras","turnos"].includes(tab);
  const showCpf   = tab === "historico";
  const showPosto = ["atrasos","historico","prevencoes","lesoes","queimaduras","turnos","postos"].includes(tab);
  const showTurno = ["historico","prevencoes","lesoes","queimaduras","turnos"].includes(tab);
  const showGuard = tab === "guardaVidas";
  const upd = (f, v) => setFilters((c) => ({ ...c, [f]: v }));

  return (
    <section className="command-filters">
      <div className="field">
        <label>Período</label>
        <select className="select" value={filters.periodo} onChange={(e) => upd("periodo", e.target.value)}>
          <option value="dia">Dia</option>
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
          <option value="ano">Ano</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      {["dia","semana"].includes(filters.periodo) && (
        <div className="field">
          <label>Data</label>
          <input className="input" type="date" value={filters.data} onChange={(e) => upd("data", e.target.value)} />
        </div>
      )}
      {filters.periodo === "mes" && (
        <div className="field">
          <label>Mês</label>
          <input className="input" type="month" value={filters.mes} onChange={(e) => upd("mes", e.target.value)} />
        </div>
      )}
      {filters.periodo === "ano" && (
        <div className="field">
          <label>Ano</label>
          <input className="input" type="number" value={filters.ano} onChange={(e) => upd("ano", e.target.value)} />
        </div>
      )}
      {filters.periodo === "personalizado" && (
        <>
          <div className="field"><label>Data inicial</label>
            <input className="input" type="date" value={filters.dataInicial} onChange={(e) => upd("dataInicial", e.target.value)} />
          </div>
          <div className="field"><label>Data final</label>
            <input className="input" type="date" value={filters.dataFinal} onChange={(e) => upd("dataFinal", e.target.value)} />
          </div>
        </>
      )}

      {showName && (
        <div className="field"><label>Nome</label>
          <input className="input" value={filters.nome} onChange={(e) => upd("nome", e.target.value)} placeholder="Guarda-Vidas" />
        </div>
      )}
      {showCpf && (
        <div className="field"><label>CPF</label>
          <input className="input" value={filters.cpf} onChange={(e) => upd("cpf", e.target.value)} placeholder="CPF" />
        </div>
      )}
      {showPosto && (
        <div className="field"><label>Posto</label>
          <select className="select" value={filters.posto} onChange={(e) => upd("posto", e.target.value)}>
            <option value="">Todos</option>
            {postos.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
          </select>
        </div>
      )}
      {showTurno && (
        <div className="field"><label>Turno</label>
          <select className="select" value={filters.turno} onChange={(e) => upd("turno", e.target.value)}>
            <option value="">Todos</option>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
          </select>
        </div>
      )}
      {showGuard && (
        <div className="field command-filter-wide"><label>Guarda-Vidas</label>
          <select className="select" value={filters.guardaVidaId} onChange={(e) => upd("guardaVidaId", e.target.value)}>
            <option value="">Selecione</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nomeCompleto} — {u.cpf}</option>)}
          </select>
        </div>
      )}
    </section>
  );
}

function ExportBar({ title, headers, rows }) {
  return (
    <div className="export-bar">
      <button type="button" onClick={() => exportReport("pdf",   title, headers, rows)}>▣ Exportar PDF</button>
      <button type="button" onClick={() => exportReport("excel", title, headers, rows)}>▦ Exportar Excel</button>
      <button type="button" onClick={() => exportReport("csv",   title, headers, rows)}>≡ Exportar CSV</button>
      <button type="button" onClick={() => exportReport("doc",   title, headers, rows)}>□ Exportar Documento</button>
    </div>
  );
}

function DataTable({ headers, rows, emptyText = "Nenhum registro encontrado." }) {
  if (!rows.length) return <div className="empty-state">{emptyText}</div>;
  return (
    <>
      <div className="table-wrap command-table-wrap">
        <table className="data-table">
          <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="responsive-cards-container">
        {rows.map((row, i) => (
          <div className="user-mobile-card" key={i}>
            {headers.map((h, j) => (
              <div className="user-card-details" key={h}>
                <strong>{h}</strong><span>{row[j]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function BarChart({ data, title }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="command-chart">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <div className="empty-state">Sem dados para o período.</div>
      ) : (
        data.map((item) => (
          <div className="chart-row" key={item.label}>
            <span>{item.label}</span>
            <div><i style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} /></div>
            <strong>{item.value}</strong>
          </div>
        ))
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CentralRelatorios() {
  const [activeTab, setActiveTab]   = useState("historico");
  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [postos, setPostos]         = useState([]);
  const [checkins, setCheckins]     = useState([]);
  const [checkouts, setCheckouts]   = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [erro, setErro]             = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function carregar() {
      setCarregando(true); setErro("");
      try {
        const [p, ci, co, u] = await Promise.all([
          apiRequest("/postos"),
          apiRequest("/check/history"),
          apiRequest("/checkout/history"),
          apiRequest("/usuarios"),
        ]);
        if (!mounted) return;
        setPostos(Array.isArray(p)  ? p  : []);
        setCheckins(Array.isArray(ci) ? ci : []);
        setCheckouts(Array.isArray(co) ? co : []);
        setUsuarios(Array.isArray(u)  ? u  : []);
      } catch (e) {
        if (mounted) setErro(e.message || "Falha ao carregar dados.");
      } finally {
        if (mounted) setCarregando(false);
      }
    }
    carregar();
    return () => { mounted = false; };
  }, []);

  /* ── build registros ── */
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
        checkinAt, checkoutAt,
        finalizado:   Boolean(checkoutAt),
        tempoMinutos: Number.isNaN(fim - inicio) ? 0 : Math.max(0, (fim - inicio) / 60000),
        prevencoes:   getNumber(checkout?.prevencoes),
        lesoes:       getNumber(checkout?.lesoes),
        queimaduras:  getNumber(checkout?.queimaduras),
        horarioPrevisto: getExpectedTime(checkin.turno || checkout?.turno || "MANHA"),
      };
      row.minutosAtraso = getDelayMinutes({ ...row, checkinAt });
      return row;
    });
  }, [checkins, checkouts, usuarios]);

  /* ── registros filtrados ── */
  const filtered = useMemo(() => {
    return registros.filter((r) => {
      const nomeOk  = !filters.nome  || normalizeText(r.nome).includes(normalizeText(filters.nome));
      const cpfOk   = !filters.cpf   || String(r.cpf).includes(filters.cpf.replace(/\D/g, ""));
      const postoOk = !filters.posto || r.posto === filters.posto;
      const turnoOk = !filters.turno || r.turno === filters.turno;
      const guardOk = !filters.guardaVidaId || Number(r.usuarioId) === Number(filters.guardaVidaId);
      return isInsideRange(r.data, filters) && nomeOk && cpfOk && postoOk && turnoOk && guardOk;
    });
  }, [filters, registros]);

  const atrasoRows = filtered.filter((r) => r.minutosAtraso > 0);
  const totalMinutosAtraso = atrasoRows.reduce((s, r) => s + r.minutosAtraso, 0);
  const maiorAtrasado = toChartData(groupSum(atrasoRows, (r) => r.nome))[0]?.label || "-";
  const occupiedNow = postos.filter((p) => String(p.status || "").toUpperCase() === "OCUPADO").length;
  const freeNow     = postos.filter((p) => String(p.status || "").toUpperCase() === "LIVRE").length;

  /* ── tabela atual ── */
  const tableConfig = useMemo(() => {
    if (activeTab === "atrasos") return {
      headers: ["Nome", "CPF", "Posto", "Data", "Previsto", "Check-In", "Min. Atraso"],
      rows: atrasoRows.map((r) => [r.nome, r.cpf, r.posto, formatDate(r.data), r.horarioPrevisto, formatTime(r.checkinAt), r.minutosAtraso]),
    };
    if (activeTab === "historico") return {
      headers: ["Nome", "CPF", "Posto", "Data", "Turno", "Check-In", "Check-Out", "Tempo", "Prevenções", "Lesões", "Queimaduras"],
      rows: filtered.map((r) => [r.nome, r.cpf, r.posto, formatDate(r.data), r.turno, formatTime(r.checkinAt), formatTime(r.checkoutAt), formatDuration(r.tempoMinutos), r.prevencoes, r.lesoes, r.queimaduras]),
    };
    if (["prevencoes","lesoes","queimaduras"].includes(activeTab)) {
      const labels = { prevencoes: "Prevenções", lesoes: "Lesões", queimaduras: "Queimaduras" };
      return {
        headers: ["Guarda-Vidas", "CPF", "Posto", labels[activeTab], "Data", "Turno"],
        rows: filtered.filter((r) => r[activeTab] > 0)
          .map((r) => [r.nome, r.cpf, r.posto, r[activeTab], formatDate(r.data), r.turno]),
      };
    }
    if (activeTab === "turnos") return {
      headers: ["Guarda-Vidas", "CPF", "Posto", "Data", "Turno", "Status", "Prevenções", "Lesões", "Queimaduras"],
      rows: filtered.map((r) => [r.nome, r.cpf, r.posto, formatDate(r.data), r.turno, r.finalizado ? "Finalizado" : "Em andamento", r.prevencoes, r.lesoes, r.queimaduras]),
    };
    if (activeTab === "postos") {
      const byPosto = postos.map((posto) => {
        const rows = filtered.filter((r) => r.posto === posto.nome);
        const top = toChartData(groupSum(rows, (r) => r.nome))[0]?.label || "-";
        return [posto.nome, rows.length,
          formatDuration(rows.reduce((s, r) => s + r.tempoMinutos, 0)),
          rows.length ? formatDuration(rows.reduce((s, r) => s + r.tempoMinutos, 0) / rows.length) : "0 min",
          rows.reduce((s, r) => s + r.prevencoes, 0),
          top];
      });
      return { headers: ["Posto", "Usos", "Tempo total", "Média", "Prevenções", "GV mais frequente"], rows: byPosto };
    }
    if (activeTab === "guardaVidas") {
      const sel = usuarios.find((u) => Number(u.id) === Number(filters.guardaVidaId));
      const rows = sel ? filtered : [];
      return {
        headers: ["Campo", "Valor"],
        rows: sel ? [
          ["Nome", sel.nomeCompleto], ["CPF", sel.cpf],
          ["Turnos realizados", rows.length],
          ["Check-Ins",  rows.length],
          ["Check-Outs", rows.filter((r) => r.finalizado).length],
          ["Total prevenções", rows.reduce((s, r) => s + r.prevencoes, 0)],
          ["Total lesões",     rows.reduce((s, r) => s + r.lesoes, 0)],
          ["Total queimaduras",rows.reduce((s, r) => s + r.queimaduras, 0)],
          ["Total atrasos",    rows.filter((r) => r.minutosAtraso > 0).length],
          ["Média permanência", rows.length ? formatDuration(rows.reduce((s, r) => s + r.tempoMinutos, 0) / rows.length) : "0 min"],
        ] : [],
      };
    }
    if (activeTab === "ocupacao") return { headers: ["Data", "Turnos"], rows: toChartData(groupSum(filtered, (r) => formatDate(r.data))).map(({ label, value }) => [label, value]) };
    return { headers: [], rows: [] };
  }, [activeTab, atrasoRows, filtered, filters.guardaVidaId, postos, usuarios]);

  /* ── métricas de cabeçalho por aba ── */
  const metricas = {
    atrasos:     [["Total de atrasos", atrasoRows.length], ["Minutos totais", totalMinutosAtraso], ["Média de atraso", atrasoRows.length ? formatDuration(totalMinutosAtraso / atrasoRows.length) : "0 min"], ["Maior reincidência", maiorAtrasado]],
    ocupacao:    [["Postos ocupados agora", occupiedNow], ["Postos livres agora", freeNow], ["Taxa de ocupação", postos.length ? `${Math.round((occupiedNow / postos.length) * 100)}%` : "0%"]],
    prevencoes:  [["Total no período", filtered.reduce((s, r) => s + r.prevencoes, 0)], ["Turnos com prevenção", filtered.filter((r) => r.prevencoes > 0).length], ["Posto líder", toChartData(groupSum(filtered, (r) => r.posto, (r) => r.prevencoes))[0]?.label || "-"]],
    lesoes:      [["Total no período", filtered.reduce((s, r) => s + r.lesoes, 0)], ["Registros com lesão", filtered.filter((r) => r.lesoes > 0).length]],
    queimaduras: [["Total no período", filtered.reduce((s, r) => s + r.queimaduras, 0)], ["Registros com queimadura", filtered.filter((r) => r.queimaduras > 0).length]],
    turnos:      [["Total de turnos", filtered.length], ["Profissionais no período", new Set(filtered.map((r) => r.usuarioId || r.nome)).size], ["Postos utilizados", new Set(filtered.map((r) => r.posto)).size]],
  };

  const chartData = {
    atrasos:     toChartData(groupSum(atrasoRows, (r) => r.nome, (r) => r.minutosAtraso)),
    ocupacao:    toChartData(groupSum(filtered, (r) => formatDate(r.data))),
    postosMais:  toChartData(groupSum(filtered, (r) => r.posto)),
    postosMenos: toChartData(groupSum(filtered, (r) => r.posto)).reverse(),
    prevencoes:  toChartData(groupSum(filtered, (r) => r.posto, (r) => r.prevencoes)),
    lesoes:      toChartData(groupSum(filtered, (r) => formatDate(r.data), (r) => r.lesoes)),
    queimaduras: toChartData(groupSum(filtered, (r) => formatDate(r.data), (r) => r.queimaduras)),
    turnos:      toChartData(groupSum(filtered, (r) => r.nome)),
  };

  return (
    <main className="app-shell page supervisor-command">
      <header className="page-header command-header">
        <div>
          <p className="page-kicker">Supervisão / Sargento</p>
          <h1>Central de Relatórios</h1>
          <p className="page-description">
            Histórico operacional, análises, indicadores, gráficos e exportações de documentos.
          </p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => window.location.reload()} disabled={carregando}>
          Atualizar
        </button>
      </header>

      {/* ABAS */}
      <section className="command-tabs" aria-label="Central de Relatórios">
        {TABS.map((tab) => (
          <button key={tab.id} type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </section>

      <section className="content-grid command-grid">
        {erro       && <div className="alert alert-error span-12">{erro}</div>}
        {carregando && <div className="alert alert-info  span-12">Carregando dados do relatório...</div>}

        <section className="card span-12 command-report">
          {/* TÍTULO DO RELATÓRIO */}
          <div className="section-title command-section-title">
            <div>
              <p className="page-kicker">Relatório selecionado</p>
              <h2>{REPORT_TITLES[activeTab]}</h2>
            </div>
          </div>

          {/* FILTROS */}
          <FilterPanel filters={filters} setFilters={setFilters} tab={activeTab} postos={postos} usuarios={usuarios} />

          {/* EXPORTAÇÕES */}
          <ExportBar title={REPORT_TITLES[activeTab]} headers={tableConfig.headers} rows={tableConfig.rows} />

          {/* MÉTRICAS */}
          {metricas[activeTab] && (
            <div className="command-metric-row">
              {metricas[activeTab].map(([label, value]) => (
                <MetricCard key={label} label={label} value={value} />
              ))}
            </div>
          )}

          {/* GRÁFICOS POR TIPO */}
          {activeTab === "atrasos" && (
            <BarChart title="Minutos de atraso por Guarda-Vidas" data={chartData.atrasos} />
          )}
          {activeTab === "ocupacao" && (
            <div className="command-chart-grid">
              <BarChart title="Evolução da ocupação por data" data={chartData.ocupacao} />
              <BarChart title="Postos mais utilizados"        data={chartData.postosMais} />
              <BarChart title="Postos menos utilizados"       data={chartData.postosMenos} />
            </div>
          )}
          {activeTab === "prevencoes"  && <BarChart title="Prevenções por posto"    data={chartData.prevencoes} />}
          {activeTab === "lesoes"      && <BarChart title="Lesões por período"       data={chartData.lesoes} />}
          {activeTab === "queimaduras" && <BarChart title="Queimaduras por período"  data={chartData.queimaduras} />}
          {activeTab === "turnos"      && <BarChart title="Turnos por Guarda-Vidas"  data={chartData.turnos} />}
          {activeTab === "postos"      && <BarChart title="Utilização dos postos"    data={chartData.postosMais} />}

          {/* TABELA */}
          <DataTable headers={tableConfig.headers} rows={tableConfig.rows} />
        </section>
      </section>
    </main>
  );
}
