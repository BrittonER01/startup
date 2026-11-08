// Shared date and health-entry formatting utilities.

export function todayISO() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 10);
}

export const TYPE_LABELS = {
  sleep: {
    label: 'Sleep',
    unit: 'hours',
    shortUnit: 'h',
    placeholder: 'e.g. 7.5',
  },

  exercise: {
    label: 'Exercise',
    unit: 'minutes',
    shortUnit: 'min',
    placeholder: 'e.g. 30',
  },

  nutrition: {
    label: 'Nutrition',
    unit: 'kcal',
    shortUnit: 'kcal',
    placeholder: 'e.g. 2100',
  },
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
  const config =
    TYPE_LABELS[entry.type] ?? TYPE_LABELS.sleep;

  return `${formatEntryAmount(entry.amount)} ${config.unit}`;
}