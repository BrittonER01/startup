import { createInitialEntries } from '../data/demoData.js';

// Browser storage is a temporary substitute for a future backend/data service.
export const STORAGE_KEYS = {
  user: 'vitallog.user.v1',
  accounts: 'vitallog.accounts.v1',
  entries: 'vitallog.entries.v1',
  friends: 'vitallog.friends.v1',
  activity: 'vitallog.activity.v1',
};

export function readStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.warn(`Could not read ${key} from localStorage.`, error);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage.`, error);
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Could not remove ${key} from localStorage.`, error);
    return false;
  }
}

export function todayISO() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

// This client-side hash is only a classroom mock. Real authentication belongs on a server.
export async function hashDemoPassword(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure browser cryptography is unavailable. Open this app on localhost or HTTPS.');
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function loadEntries() {
  const saved = readStorage(STORAGE_KEYS.entries, null);

  // Use saved browser data when it is already available.
  if (Array.isArray(saved)) return saved;

  // Otherwise, create sample entries for today.
  return createInitialEntries(todayISO());
}

export const TYPE_LABELS = {
  sleep: { label: 'Sleep', unit: 'hours', shortUnit: 'h', placeholder: 'e.g. 7.5' },
  exercise: { label: 'Exercise', unit: 'minutes', shortUnit: 'min', placeholder: 'e.g. 30' },
  nutrition: { label: 'Nutrition', unit: 'kcal', shortUnit: 'kcal', placeholder: 'e.g. 2100' },
};

export function formatEntryAmount(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return '0';
  }

  return Number.isInteger(numericAmount)
    ? String(numericAmount)
    : String(Number(numericAmount.toFixed(2)));
}

export function formatEntryValue(entry) {
  const config = TYPE_LABELS[entry.type] ?? TYPE_LABELS.sleep;

  return `${formatEntryAmount(entry.amount)} ${config.unit}`;
}