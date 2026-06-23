const SHIFT_STORAGE_KEY = "active_turn_session";
const LEGACY_POSTO_ID_KEY = "active_turn_posto";
const LEGACY_POSTO_NAME_KEY = "active_turn_posto_name";
const LEGACY_COUNTERS_KEY = "current_shift_counters";
const SHIFT_EVENT_NAME = "active-shift-change";

function normalizeCounters(counters) {
  const safeCounters =
    counters && typeof counters === "object" ? counters : {};

  return {
    prevencoes: Math.max(0, Number(safeCounters.prevencoes) || 0),
    lesoes: Math.max(0, Number(safeCounters.lesoes) || 0),
    queimaduras: Math.max(0, Number(safeCounters.queimaduras) || 0),
  };
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLegacyKeys(shift) {
  if (!shift) {
    localStorage.removeItem(LEGACY_POSTO_ID_KEY);
    localStorage.removeItem(LEGACY_POSTO_NAME_KEY);
    localStorage.removeItem(LEGACY_COUNTERS_KEY);
    return;
  }

  localStorage.setItem(LEGACY_POSTO_ID_KEY, String(shift.postoId));
  localStorage.setItem(LEGACY_POSTO_NAME_KEY, shift.postoNome || "Posto");
  localStorage.setItem(LEGACY_COUNTERS_KEY, JSON.stringify(shift.counters));
}

function emitShiftChange() {
  window.dispatchEvent(new CustomEvent(SHIFT_EVENT_NAME, { detail: getActiveShift() }));
}

function readLegacyShift() {
  const postoId = localStorage.getItem(LEGACY_POSTO_ID_KEY);
  const postoNome = localStorage.getItem(LEGACY_POSTO_NAME_KEY);
  const counters = readJson(LEGACY_COUNTERS_KEY);

  if (!postoId) {
    return null;
  }

  return {
    postoId: Number(postoId),
    postoNome: postoNome || "Posto",
    counters: normalizeCounters(counters),
    startedAt: null,
  };
}

export function getActiveShift() {
  const stored = readJson(SHIFT_STORAGE_KEY);

  if (stored?.postoId) {
    return {
      postoId: Number(stored.postoId),
      postoNome: stored.postoNome || "Posto",
      counters: normalizeCounters(stored.counters),
      startedAt: stored.startedAt || null,
    };
  }

  const legacyShift = readLegacyShift();

  if (legacyShift) {
    saveActiveShift(legacyShift);
    return legacyShift;
  }

  return null;
}

export function hasActiveShift() {
  return Boolean(getActiveShift());
}

export function saveActiveShift({ postoId, postoNome, counters, startedAt }) {
  const shift = {
    postoId: Number(postoId),
    postoNome: postoNome || "Posto",
    counters: normalizeCounters(counters),
    startedAt: startedAt || new Date().toISOString(),
  };

  localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(shift));
  writeLegacyKeys(shift);
  emitShiftChange();
  return shift;
}

export function updateShiftCounters(counters) {
  const currentShift = getActiveShift();

  if (!currentShift) {
    return null;
  }

  return saveActiveShift({
    ...currentShift,
    counters: {
      ...currentShift.counters,
      ...normalizeCounters(counters),
    },
  });
}

export function clearActiveShift() {
  localStorage.removeItem(SHIFT_STORAGE_KEY);
  writeLegacyKeys(null);
  emitShiftChange();
}

export function subscribeToActiveShift(listener) {
  const handleChange = () => listener(getActiveShift());

  window.addEventListener("storage", handleChange);
  window.addEventListener(SHIFT_EVENT_NAME, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SHIFT_EVENT_NAME, handleChange);
  };
}