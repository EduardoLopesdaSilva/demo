import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Publico } from "./pages/Publico";
import Supervisor from "./pages/Supervisor";
import CentralRelatorios from "./pages/CentralRelatorios";
import GerenciamentoGuardaVidas from "./pages/GerenciamentoGuardaVidas";
import Checkin from "./pages/Checkin";
import Checkout from "./pages/Checkout";
import Perfil from "./pages/Perfil";
import { Menu } from "./components/Menu";
import { Autenticacao } from "./components/Autenticacao";
import { AutorizacaoSupervisor } from "./components/AutorizacaoSupervisor";
import { AuthProvider } from "./context/AuthContext";

function App() {
  useEffect(() => {
    // Carregar tema escuro
    const isDark = localStorage.getItem("dark_theme") === "true";
    if (isDark) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    // Carregar tamanho da fonte
    const fontSize = localStorage.getItem("font_size") || "normal";
    document.body.classList.remove("font-large", "font-xl");
    if (fontSize === "large") {
      document.body.classList.add("font-large");
    } else if (fontSize === "xl") {
      document.body.classList.add("font-xl");
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Menu />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publico" element={<Publico />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/supervisor"
            element={
              <AutorizacaoSupervisor>
                <Supervisor />
              </AutorizacaoSupervisor>
            }
          />
          <Route
            path="/relatorios"
            element={
              <AutorizacaoSupervisor>
                <CentralRelatorios />
              </AutorizacaoSupervisor>
            }
          />
          <Route
            path="/gerenciamento-guarda-vidas"
            element={
              <AutorizacaoSupervisor>
                <GerenciamentoGuardaVidas />
              </AutorizacaoSupervisor>
            }
          />
          <Route
            path="/checkin"
            element={
              <Autenticacao>
                <Checkin />
              </Autenticacao>
            }
          />
          <Route
            path="/checkout"
            element={
              <Autenticacao>
                <Checkout />
              </Autenticacao>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Autenticacao>
                <Dashboard />
              </Autenticacao>
            }
          />
          <Route
            path="/perfil"
            element={
              <Autenticacao>
                <Perfil />
              </Autenticacao>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
