export const INITIAL_FRIENDS = [
  { id: 'friend-david', username: 'davidk', name: 'David Kim', status: 'friend' },
  { id: 'friend-nancy', username: 'nancylee', name: 'Nancy Lee', status: 'friend' },
];

export const INITIAL_ACTIVITY = [
  { id: 'activity-1', from: 'David Kim', message: 'logged 8 hours of sleep', time: 'Earlier today' },
  { id: 'activity-2', from: 'Nancy Lee', message: 'finished a 5k run', time: '12 minutes ago' },
];

// Deterministic sample data stands in for the future PubMed E-utilities integration.
export const SAMPLE_ARTICLES = [
  {
    id: 'sleep-exercise',
    title: 'Sleep, physical activity, and overall health',
    journal: 'Sample research topic',
    year: 2026,
    summary: 'Research on sleep duration and regular movement can help explain how daily routines relate to recovery, energy, and long-term health.',
    terms: 'sleep physical activity recovery',
    query: 'sleep physical activity health review',
  },
  {
    id: 'nutrition-habits',
    title: 'Everyday nutrition habits and health outcomes',
    journal: 'Sample research topic',
    year: 2026,
    summary: 'Nutrition studies often examine dietary patterns over time instead of treating a single meal or nutrient as the whole picture.',
    terms: 'nutrition diet dietary patterns',
    query: 'dietary patterns nutrition health review',
  },
  {
    id: 'habit-tracking',
    title: 'Behavior change and self-monitoring of health habits',
    journal: 'Sample research topic',
    year: 2025,
    summary: 'Self-monitoring tools may help people reflect on their routines, identify patterns, and set realistic personal goals.',
    terms: 'behavior change self monitoring habits',
    query: 'self monitoring behavior change physical activity',
  },
];

export const MOCK_ACTIVITY_EVENTS = [
  { from: 'David Kim', message: 'logged 7.5 hours of sleep' },
  { from: 'Nancy Lee', message: 'completed a 30 minute walk' },
  { from: 'David Kim', message: 'added a hydration goal' },
  { from: 'Nancy Lee', message: 'logged a balanced lunch' },
];
