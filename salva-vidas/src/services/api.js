import { clearActiveShift } from "../utils/shiftSession";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const USER_KEY = "auth_user";

function hasStoredSession() {
  return Boolean(localStorage.getItem("token") || localStorage.getItem(USER_KEY));
}

function clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("usuario_id");
  clearActiveShift();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

function extractErrorMessage(data, status) {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === "object") {
    const candidates = [
      data.message,
      data.error,
      data.details,
      data.detail,
      data.title,
    ];

    const firstMessage = candidates.find(
      (value) => typeof value === "string" && value.trim()
    );

    if (firstMessage) {
      return firstMessage.trim();
    }
  }

  if (status === 401) {
    return "Sua sessao expirou. Faca login novamente.";
  }

  if (status === 403) {
    return "Voce nao tem permissao para acessar esta area.";
  }

  if (status >= 500) {
    return "Nao foi possivel concluir a operacao. Tente novamente.";
  }

  return "Erro ao comunicar com o servidor.";
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const hadStoredSession = hasStoredSession();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body && !(options.body instanceof FormData)
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch {
    throw new Error(
      "Nao foi possivel conectar com a API. Verifique a rede ou o endereco configurado."
    );
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && hadStoredSession) {
      clearSessionAndRedirect();
    }

    const apiError = new Error(extractErrorMessage(data, response.status));
    apiError.status = response.status;
    apiError.payload = data;
    throw apiError;
  }

  return data;
}
