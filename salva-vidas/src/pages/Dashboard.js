import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getActiveShift, subscribeToActiveShift } from "../utils/shiftSession";

function formatarHorario(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("pt-BR");
}

export function Dashboard() {
  const { user, isSupervisor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [turnoAtivo, setTurnoAtivo] = useState(() => getActiveShift());
  const [feedback, setFeedback] = useState(() => location.state?.feedback || null);

  useEffect(() => {
    if (isSupervisor) {
      navigate("/supervisor", { replace: true });
    }
  }, [isSupervisor, navigate]);

  useEffect(() => subscribeToActiveShift(setTurnoAtivo), []);

  useEffect(() => {
    if (!location.state?.feedback) {
      return;
    }

    setFeedback(location.state.feedback);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  const nomeUsuario = user?.nomeCompleto || user?.nome || "Guarda-Vidas";

  return (
    <main className="app-shell page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Guarda-Vidas</p>
          <h1>Meu Painel</h1>
          <p className="page-description">Acompanhe seu status atual de servico e acesse rapidamente as acoes do turno.</p>
        </div>
      </header>

      <section className="content-grid">
        {feedback?.message && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-info"} span-12`}>
            {feedback.message}
          </div>
        )}

        <div className="card span-12" style={{ textAlign: "center", padding: "40px 20px" }}>
          {turnoAtivo ? (
            <>
              <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🔴</div>
              <h2 style={{ color: "var(--vermelho-700)", marginBottom: "8px" }}>EM SERVICO</h2>
              <p style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{turnoAtivo.postoNome}</p>
              <p style={{ fontSize: "0.95rem", marginBottom: "24px", color: "var(--text-secondary)" }}>
                Inicio registrado em {formatarHorario(turnoAtivo.startedAt) || "horario indisponivel"}
              </p>
              <button className="btn btn-danger btn-wide" type="button" onClick={() => navigate("/checkout")}>
                Finalizar Turno
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⚪</div>
              <h2 style={{ color: "var(--text-muted)", marginBottom: "8px" }}>FORA DE SERVICO</h2>
              <p style={{ fontSize: "1rem", marginBottom: "24px", color: "var(--text-secondary)" }}>
                Ola, {nomeUsuario}. Faca check-in para iniciar seu turno.
              </p>
              <button className="btn btn-primary btn-wide" type="button" onClick={() => navigate("/checkin")}>
                Iniciar Turno
              </button>
            </>
          )}
        </div>

        <div className="card span-6">
          <div className="section-title">
            <h2>Status do turno</h2>
          </div>
          <div className="list">
            <div className="list-item">
              <strong>Situacao</strong>
              <span className={`badge ${turnoAtivo ? "badge-busy" : "badge-free"}`}>
                {turnoAtivo ? "Em servico" : "Disponivel"}
              </span>
            </div>
            <div className="list-item">
              <strong>Posto atual</strong>
              <span>{turnoAtivo?.postoNome || "Nenhum posto selecionado"}</span>
            </div>
          </div>
        </div>

        <div className="card span-6">
          <div className="section-title">
            <h2>Resumo operacional</h2>
          </div>
          {turnoAtivo ? (
            <div className="list">
              <div className="list-item">
                <strong>Prevencoes</strong>
                <span className="badge badge-free">{turnoAtivo.counters.prevencoes}</span>
              </div>
              <div className="list-item">
                <strong>Lesoes</strong>
                <span className="badge badge-busy">{turnoAtivo.counters.lesoes}</span>
              </div>
              <div className="list-item">
                <strong>Queimaduras / Outros</strong>
                <span className="badge badge-alert">{turnoAtivo.counters.queimaduras}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">Os contadores do turno aparecem aqui apos o check-in.</div>
          )}
        </div>
      </section>
    </main>
  );
}