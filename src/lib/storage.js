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

export function todayISO() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export const TYPE_LABELS = {
  sleep: { label: 'Sleep', unit: 'hours', shortUnit: 'h', placeholder: 'e.g. 7.5' },
  exercise: { label: 'Exercise', unit: 'minutes', shortUnit: 'min', placeholder: 'e.g. 30' },
  nutrition: { label: 'Nutrition', unit: 'kcal', shortUnit: 'kcal', placeholder: 'e.g. 2100' },
};