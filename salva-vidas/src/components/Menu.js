import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getActiveShift, subscribeToActiveShift } from "../utils/shiftSession";

export function Menu() {
  const { isAuthenticated, isSupervisor, logout, user } = useAuth();
  const [activeShift, setActiveShift] = useState(() => getActiveShift());

  useEffect(() => subscribeToActiveShift(setActiveShift), []);

  const nomeUsuario = user?.nomeCompleto || user?.nome || user?.cpf || "Usuario";
  const perfil = isSupervisor ? "Sargento" : "Guarda-Vidas";
  const hasActiveTurn = Boolean(activeShift);
  const turnoPath = hasActiveTurn ? "/checkout" : "/checkin";
  const turnoLabel = hasActiveTurn ? "Finalizar turno" : "Iniciar turno";

  return (
    <>
      <header className="app-header">
        <NavLink to={isAuthenticated ? "/dashboard" : "/"} className="brand" aria-label="Pagina inicial">
          <span className="brand-mark" aria-hidden="true"></span>
          <span className="brand-title">
            <strong>Gestao de Salva-Vidas</strong>
            <span>Corpo de Bombeiros Militar de Santa Catarina</span>
          </span>
        </NavLink>

        {isAuthenticated && (
          <div className="header-user" aria-label="Usuario conectado">
            <strong>{nomeUsuario}</strong>
            <span>{perfil}</span>
          </div>
        )}
      </header>

      {isAuthenticated && (
        <aside className="sidebar" aria-label="Menu principal">
          <div className="sidebar-group">Operacao</div>
          <nav className="sidebar-nav">
            {!isSupervisor && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  <span className="nav-icon"></span>
                  Painel
                </NavLink>
                <NavLink to={turnoPath} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  <span className="nav-icon"></span>
                  {turnoLabel}
                </NavLink>
              </>
            )}
            <NavLink to="/perfil" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon"></span>
              Perfil
            </NavLink>

            {isSupervisor && (
              <>
                <div className="sidebar-group">Supervisao</div>
                <NavLink to="/supervisor" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  <span className="nav-icon"></span>
                  Painel Operacional
                </NavLink>
                <NavLink to="/relatorios" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  <span className="nav-icon"></span>
                  Central de Relatorios
                </NavLink>
                <NavLink
                  to="/gerenciamento-guarda-vidas"
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="nav-icon"></span>
                  Guarda-Vidas
                </NavLink>
              </>
            )}

            <button className="logout-button" type="button" onClick={logout}>
              Sair do sistema
            </button>
          </nav>
        </aside>
      )}

      {isAuthenticated && (
        <nav className="bottom-nav" aria-label="Navegacao movel">
          {!isSupervisor ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                <span className="bottom-nav-icon"></span>
                <span>Painel</span>
              </NavLink>

              <NavLink to={turnoPath} className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                <span className="bottom-nav-icon"></span>
                <span>{hasActiveTurn ? "Finalizar" : "Iniciar"}</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/supervisor" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                <span className="bottom-nav-icon"></span>
                <span>Comando</span>
              </NavLink>

              <NavLink to="/relatorios" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                <span className="bottom-nav-icon"></span>
                <span>Relatorios</span>
              </NavLink>

              <NavLink to="/gerenciamento-guarda-vidas" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                <span className="bottom-nav-icon"></span>
                <span>Profissionais</span>
              </NavLink>
            </>
          )}

          <NavLink to="/perfil" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
            <span className="bottom-nav-icon"></span>
            <span>Perfil</span>
          </NavLink>
        </nav>
      )}
    </>
  );
}