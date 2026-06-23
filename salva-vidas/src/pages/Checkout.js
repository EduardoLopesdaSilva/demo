import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import { clearActiveShift, getActiveShift, updateShiftCounters } from "../utils/shiftSession";
import { prepareImageFile } from "../utils/imageUpload";

const EMPTY_COUNTERS = {
  prevencoes: 0,
  lesoes: 0,
  queimaduras: 0,
};

export default function Checkout() {
  const navigate = useNavigate();
  const { isSupervisor } = useAuth();

  useEffect(() => {
    if (isSupervisor) {
      navigate("/supervisor", { replace: true });
    }
  }, [isSupervisor, navigate]);

  const turnoAtivo = getActiveShift();
  const [postos, setPostos] = useState([]);
  const [postoSelecionado, setPostoSelecionado] = useState(() => String(turnoAtivo?.postoId || ""));
  const [turno, setTurno] = useState(() => turnoAtivo?.counters || EMPTY_COUNTERS);
  const [foto, setFoto] = useState("sem_foto");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    setCarregando(true);
    apiRequest("/postos")
      .then(setPostos)
      .catch(() => setErro("Erro ao carregar a lista de postos."))
      .finally(() => setCarregando(false));
  }, []);

  const persistirTurno = (nextTurno) => {
    setTurno(nextTurno);
    if (turnoAtivo) {
      updateShiftCounters(nextTurno);
    }
  };

  const handleIncrement = (campo) => {
    persistirTurno({
      ...turno,
      [campo]: Number(turno[campo] || 0) + 1,
    });
  };

  const handleDecrement = (campo) => {
    persistirTurno({
      ...turno,
      [campo]: Math.max(0, Number(turno[campo] || 0) - 1),
    });
  };

  const handleFileChange = async (event) => {
    setErro("");
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const prepared = await prepareImageFile(file, { maxSizeBytes: 1024 * 1024 });
      setFoto(prepared.dataUrl);
    } catch (error) {
      setErro(error.message || "Nao foi possivel preparar a foto.");
    }
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const removerFoto = () => {
    setFoto("sem_foto");
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const finalizarTurno = async () => {
    setErro("");

    if (!turnoAtivo) {
      setErro("Nenhum turno ativo encontrado. Faca check-in antes do checkout.");
      return;
    }

    if (Number(postoSelecionado) !== Number(turnoAtivo.postoId)) {
      setErro("O checkout deve ser realizado no mesmo posto do turno ativo.");
      return;
    }

    if (foto === "sem_foto") {
      setErro("Tire uma foto de encerramento no posto.");
      return;
    }

    if (turno.prevencoes === null || turno.prevencoes === undefined || String(turno.prevencoes).trim() === "") {
      setErro("Informe a quantidade de prevenções.");
      return;
    }
    if (turno.lesoes === null || turno.lesoes === undefined || String(turno.lesoes).trim() === "") {
      setErro("Informe a quantidade de lesões.");
      return;
    }
    if (turno.queimaduras === null || turno.queimaduras === undefined || String(turno.queimaduras).trim() === "") {
      setErro("Informe a quantidade de queimaduras.");
      return;
    }

    try {
      setCarregando(true);
      await apiRequest("/checkout/out", {
        method: "POST",
        body: {
          postoId: Number(postoSelecionado),
          foto,
          prevencoes: String(turno.prevencoes),
          lesoes: String(turno.lesoes),
          queimaduras: String(turno.queimaduras),
        },
      });

      clearActiveShift();
      navigate("/dashboard", {
        state: {
          feedback: {
            type: "success",
            message: "Turno finalizado com sucesso.",
          },
        },
      });
    } catch (error) {
      setErro(error.message || "Erro ao finalizar turno.");
    } finally {
      setCarregando(false);
    }
  };

  const postoAtual = postos.find((posto) => Number(posto.id) === Number(postoSelecionado));
  const disabled = carregando || !turnoAtivo;

  return (
    <main className="app-shell page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Operacao</p>
          <h1>Finalizar turno</h1>
          <p className="page-description">Revise os numeros do atendimento e encerre a atividade do posto.</p>
        </div>
      </header>

      <section className="content-grid">
        <div className="card span-7 form-grid">
          <div className="section-title">
            <h2>Relatorio de fechamento</h2>
          </div>

          {!turnoAtivo && <div className="alert alert-info">Nenhum turno ativo foi encontrado nesta sessao.</div>}
          <div className="field">
            <label htmlFor="posto-checkout">Posto de atuacao</label>
            <select
              id="posto-checkout"
              className="select"
              value={postoSelecionado}
              onChange={(event) => setPostoSelecionado(event.target.value)}
              disabled={disabled}
            >
              <option value="">Selecione seu posto</option>
              {postos
                .filter((posto) => posto.status === "OCUPADO")
                .map((posto) => (
                  <option key={posto.id} value={posto.id}>
                    {posto.nome}
                  </option>
                ))}
            </select>
            {turnoAtivo && <small>O checkout usa o mesmo posto salvo no turno ativo.</small>}
          </div>

          <div className="field">
            <label>Foto de encerramento no posto *</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              className="hidden-file-input"
              onChange={handleFileChange}
              disabled={disabled}
            />

            {foto === "sem_foto" ? (
              <button type="button" className="btn btn-primary btn-wide" onClick={triggerCamera} disabled={disabled}>
                📸 Tirar foto
              </button>
            ) : (
              <div className="photo-preview-wrap" style={{ maxHeight: "240px" }}>
                <img src={foto} alt="Encerramento" className="photo-preview-image" />
                <button type="button" className="photo-remove-btn" onClick={removerFoto} aria-label="Remover foto" disabled={disabled}>
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="field">
            <label>Prevencoes realizadas</label>
            <small>Orientacoes dadas a banhistas na praia.</small>
            <div className="counter-control" style={{ marginTop: "6px" }}>
              <button type="button" className="counter-btn" onClick={() => handleDecrement("prevencoes")} disabled={disabled}>-</button>
              <input
                type="number"
                min="0"
                className="counter-value-input"
                value={turno.prevencoes}
                onChange={(event) => {
                  const val = event.target.value;
                  persistirTurno({
                    ...turno,
                    prevencoes: val === "" ? "" : Math.max(0, Number(val))
                  });
                }}
                disabled={disabled}
              />
              <button type="button" className="counter-btn" onClick={() => handleIncrement("prevencoes")} disabled={disabled}>+</button>
            </div>
          </div>

          <div className="field">
            <label>Lesoes registradas (Agua-Viva)</label>
            <small>Atendimentos por queimaduras de aguas-vivas ou caravelas.</small>
            <div className="counter-control" style={{ marginTop: "6px" }}>
              <button type="button" className="counter-btn" onClick={() => handleDecrement("lesoes")} disabled={disabled}>-</button>
              <input
                type="number"
                min="0"
                className="counter-value-input"
                value={turno.lesoes}
                onChange={(event) => {
                  const val = event.target.value;
                  persistirTurno({
                    ...turno,
                    lesoes: val === "" ? "" : Math.max(0, Number(val))
                  });
                }}
                disabled={disabled}
              />
              <button type="button" className="counter-btn" onClick={() => handleIncrement("lesoes")} disabled={disabled}>+</button>
            </div>
          </div>

          <div className="field">
            <label>Queimaduras / Outros</label>
            <small>Queimaduras solares ou pequenos atendimentos de primeiros socorros.</small>
            <div className="counter-control" style={{ marginTop: "6px" }}>
              <button type="button" className="counter-btn" onClick={() => handleDecrement("queimaduras")} disabled={disabled}>-</button>
              <input
                type="number"
                min="0"
                className="counter-value-input"
                value={turno.queimaduras}
                onChange={(event) => {
                  const val = event.target.value;
                  persistirTurno({
                    ...turno,
                    queimaduras: val === "" ? "" : Math.max(0, Number(val))
                  });
                }}
                disabled={disabled}
              />
              <button type="button" className="counter-btn" onClick={() => handleIncrement("queimaduras")} disabled={disabled}>+</button>
            </div>
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}

          <button className="btn btn-primary btn-wide" type="button" onClick={finalizarTurno} disabled={disabled} style={{ marginTop: "10px" }}>
            {carregando ? "Finalizando..." : "Finalizar turno"}
          </button>
        </div>

        <aside className="card span-5" style={{ height: "fit-content" }}>
          <div className="section-title">
            <h2>Resumo operacional</h2>
          </div>
          <div className="list">
            <div className="list-item">
              <div>
                <strong>Posto</strong>
                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Turno em andamento</div>
              </div>
              <span>{turnoAtivo?.postoNome || postoAtual?.nome || "Nao informado"}</span>
            </div>
            <div className="list-item">
              <div>
                <strong>Prevencoes</strong>
                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Acumulado do turno</div>
              </div>
              <span className="badge badge-free" style={{ fontSize: "var(--font-md)", padding: "8px 16px" }}>{turno.prevencoes}</span>
            </div>
            <div className="list-item">
              <div>
                <strong>Lesoes</strong>
                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Agua-Viva / Acidentes</div>
              </div>
              <span className="badge badge-busy" style={{ fontSize: "var(--font-md)", padding: "8px 16px" }}>{turno.lesoes}</span>
            </div>
            <div className="list-item">
              <div>
                <strong>Queimaduras / Outros</strong>
                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Primeiros socorros</div>
              </div>
              <span className="badge badge-alert" style={{ fontSize: "var(--font-md)", padding: "8px 16px" }}>{turno.queimaduras}</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
