/**
 * Mock budget tool — swap for Numbeo, currency APIs, etc.
 */
const BUDGET_MULTIPLIERS = { budget: 1, moderate: 2.2, luxury: 4.5 };

export async function getCostEstimates(destination, days, budgetLevel) {
  const multiplier = BUDGET_MULTIPLIERS[budgetLevel] || BUDGET_MULTIPLIERS.moderate;
  const baseDaily = 80;

  const perDay = Math.round(baseDaily * multiplier);
  const breakdown = {
    accommodation: Math.round(perDay * 0.4 * days),
    food: Math.round(perDay * 0.25 * days),
    activities: Math.round(perDay * 0.2 * days),
    transport: Math.round(perDay * 0.1 * days),
    misc: Math.round(perDay * 0.05 * days),
  };

  return {
    destination,
    days,
    budgetLevel,
    source: 'mock',
    currency: 'USD',
    total: Object.values(breakdown).reduce((a, b) => a + b, 0),
    breakdown,
    perDayAverage: perDay,
  };
}

export async function getExchangeRate(from = 'USD', to = 'EUR') {
  return { from, to, rate: 0.92, source: 'mock', updated: new Date().toISOString() };
}
