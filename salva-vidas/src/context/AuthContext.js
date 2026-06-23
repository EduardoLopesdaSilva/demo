import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import { clearActiveShift, saveActiveShift } from "../utils/shiftSession";

const AuthContext = createContext(null);
const USER_KEY = "auth_user";

function readStoredUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function normalizeAccessLevel(value) {
  return String(value || "").trim().toUpperCase();
}

function isOperationalAccess(value) {
  return ["GUARDA_VIDAS", "OCUPADO", "LIVRE"].includes(normalizeAccessLevel(value));
}

function normalizeUser(data = {}) {
  const source = data.usuario || data.user || data;
  const nome = source.nome || source.nomeCompleto || "";

  return {
    id: source.id,
    nome,
    nomeCompleto: source.nomeCompleto || nome,
    cpf: source.cpf,
    email: source.email,
    nivelAcesso: normalizeAccessLevel(source.nivelAcesso),
  };
}

function persistSession(data) {
  const user = normalizeUser(data);
  const token = data.token || data.accessToken || data.jwt;

  if (token) {
    localStorage.setItem("token", token);
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (user.id !== undefined && user.id !== null) {
    localStorage.setItem("usuario_id", String(user.id));
  }

  return user;
}

export function limparCpf(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

export function cpfBasicoValido(cpf) {
  const cpfLimpo = limparCpf(cpf);
  return cpfLimpo.length === 11 && !/^(\d)\1{10}$/.test(cpfLimpo);
}

function normalizarIdentificadorLogin(valor) {
  const texto = String(valor || "").trim();
  const somenteNumeros = limparCpf(texto);

  return /^[\d.\-\s]+$/.test(texto) ? somenteNumeros : texto;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const syncActiveShift = useCallback(async (currentUser) => {
    if (!currentUser?.id || !localStorage.getItem("token")) {
      return;
    }

    if (!isOperationalAccess(currentUser.nivelAcesso)) {
      clearActiveShift();
      return;
    }

    try {
      const activeShift = await apiRequest(`/check/active?usuarioId=${encodeURIComponent(currentUser.id)}`);

      if (activeShift?.postoId) {
        saveActiveShift({
          postoId: activeShift.postoId,
          postoNome: activeShift.postoNome,
          startedAt: activeShift.startedAt,
          counters: {
            prevencoes: activeShift.prevencoes,
            lesoes: activeShift.lesoes,
            queimaduras: activeShift.queimaduras,
          },
        });
      } else {
        clearActiveShift();
      }
    } catch {
      // Mantem a sessao local quando a consulta de turno ativo falhar temporariamente.
    }
  }, []);

  useEffect(() => {
    if (user) {
      syncActiveShift(user);
    }
  }, [syncActiveShift, user]);

  const login = async ({ cpf, email, senha }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        cpf: cpf ? normalizarIdentificadorLogin(cpf) : null,
        email: email || null,
        senha,
      },
    });

    const loggedUser = persistSession(data);
    setUser(loggedUser);
    await syncActiveShift(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("usuario_id");
    clearActiveShift();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && localStorage.getItem("token")),
      isSupervisor: ["ADMIN", "SUPERVISOR", "SARGENTO"].includes(
        normalizeAccessLevel(user?.nivelAcesso)
      ),
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
