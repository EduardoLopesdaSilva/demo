import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import { getActiveShift, saveActiveShift, subscribeToActiveShift } from "../utils/shiftSession";
import { prepareImageFile } from "../utils/imageUpload";

export default function Checkin() {
  const navigate = useNavigate();
  const { user, isSupervisor } = useAuth();

  useEffect(() => {
    if (isSupervisor) {
      navigate("/supervisor", { replace: true });
    }
  }, [isSupervisor, navigate]);

  const [postos, setPostos] = useState([]);
  const [postoSelecionado, setPostoSelecionado] = useState("");
  const [foto, setFoto] = useState("sem_foto");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [turnoAtivo, setTurnoAtivo] = useState(() => getActiveShift());
  const cameraInputRef = useRef(null);

  useEffect(() => {
    setCarregando(true);
    apiRequest("/postos")
      .then(setPostos)
      .catch(() => setErro("Falha ao carregar os postos."))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => subscribeToActiveShift(setTurnoAtivo), []);

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

  const iniciarTurno = async () => {
    setErro("");

    if (turnoAtivo) {
      setErro(`Ja existe um turno ativo em ${turnoAtivo.postoNome}. Finalize-o antes de iniciar outro.`);
      return;
    }

    if (!postoSelecionado) {
      setErro("Selecione um posto livre.");
      return;
    }

    if (foto === "sem_foto") {
      setErro("Tire uma foto de presenca no posto.");
      return;
    }

    try {
      setCarregando(true);
      await apiRequest("/check/in", {
        method: "POST",
        body: {
          idUsuario: user.id,
          postoId: Number(postoSelecionado),
          foto,
        },
      });

      const posto = postos.find((item) => Number(item.id) === Number(postoSelecionado));
      saveActiveShift({
        postoId: postoSelecionado,
        postoNome: posto?.nome || "Posto",
        counters: {
          prevencoes: 0,
          lesoes: 0,
          queimaduras: 0,
        },
      });

      navigate("/dashboard", {
        state: {
          feedback: {
            type: "success",
            message: "Turno iniciado com sucesso.",
          },
        },
      });
    } catch (error) {
      setErro(error.message || "Erro ao iniciar o turno.");
    } finally {
      setCarregando(false);
    }
  };

  const disabled = carregando || Boolean(turnoAtivo);

  return (
    <main className="app-shell page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Operacao</p>
          <h1>Iniciar turno</h1>
          <p className="page-description">Selecione o posto livre e confirme sua presenca para iniciar o servico.</p>
        </div>
      </header>

      <section className="content-grid">
        <div className="card span-6 form-grid">
          <div className="section-title">
            <h2>Dados do turno</h2>
          </div>

          {turnoAtivo && (
            <div className="alert alert-info">
              Turno ativo localizado em {turnoAtivo.postoNome}. Finalize o checkout antes de abrir outro turno.
            </div>
          )}

          <div className="field">
            <label htmlFor="posto-checkin">Posto de atuacao</label>
            <select
              id="posto-checkin"
              className="select"
              onChange={(event) => setPostoSelecionado(event.target.value)}
              value={postoSelecionado}
              disabled={disabled}
            >
              <option value="">Selecione um posto disponivel</option>
              {postos
                .filter((posto) => posto.status === "LIVRE")
                .map((posto) => (
                  <option key={posto.id} value={posto.id}>
                    {posto.nome}
                  </option>
                ))}
            </select>
          </div>

          <div className="field">
            <label>Foto de presenca no posto *</label>
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
                <img src={foto} alt="Presenca" className="photo-preview-image" />
                <button type="button" className="photo-remove-btn" onClick={removerFoto} aria-label="Remover foto" disabled={disabled}>
                  &times;
                </button>
              </div>
            )}
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}

          <button className="btn btn-primary btn-wide" type="button" onClick={iniciarTurno} disabled={disabled}>
            {carregando ? "Confirmando..." : "Confirmar inicio"}
          </button>
        </div>

        <aside className="card span-6" style={{ height: "fit-content" }}>
          <div className="section-title">
            <h2>Recomendacoes importantes</h2>
          </div>
          <div className="list">
            <div className="list-item" style={{ borderLeft: "4px solid var(--azul-700)" }}>
              <strong>Confira o posto selecionado no painel</strong>
            </div>
            <div className="list-item" style={{ borderLeft: "4px solid var(--azul-700)" }}>
              <strong>Verifique os equipamentos de salvamento</strong>
            </div>
            <div className="list-item" style={{ borderLeft: "4px solid var(--azul-700)" }}>
              <strong>Mantenha o radio na frequencia correta</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
