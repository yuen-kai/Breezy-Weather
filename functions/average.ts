export function getAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((a, b) => a + b) / values.length;
}

export function weightVisibility(vis: number[]): number {
  if (!vis || vis.length === 0) return 0;
  // Sort values from lowest to highest (favor lower visibility)
  const sorted = [...vis].sort((a, b) => a - b);
  // Apply weighted average with more weight to lower values
  let totalWeight = 0;
  let weightedSum = 0;
  sorted.forEach((value, index) => {
    const weight = 2 ** (sorted.length - index);
    weightedSum += value * weight;
    totalWeight += weight;
  });
  return weightedSum / totalWeight;
}

export function weightWind(winds: number[]): number {
  if (!winds || winds.length === 0) return 0;
  // Sort values from highest to lowest (favor higher wind)
  const sorted = [...winds].sort((a, b) => b - a);
  // Apply weighted average with more weight to higher values
  let totalWeight = 0;
  let weightedSum = 0;
  sorted.forEach((value, index) => {
    const weight = 2 ** (sorted.length - index);
    weightedSum += value * weight;
    totalWeight += weight;
  });
  return weightedSum / totalWeight;
}

export function weightPrecipProb(precips: number[]): number {
  if (!precips || precips.length === 0) return 0;
  // Sort values from highest to lowest (favor higher precipitation)
  const sorted = [...precips].sort((a, b) => b - a);
  // Apply weighted average with more weight to higher values
  let totalWeight = 0;
  let weightedSum = 0;
  sorted.forEach((value, index) => {
    const weight = 1.5 ** (sorted.length - index);
    weightedSum += value * weight;
    totalWeight += weight;
  });
  return weightedSum / totalWeight;
}

export function weightPrecip(precips: number[]): number {
  if (!precips || precips.length === 0) return 0;
  // Sort values from highest to lowest (favor higher precipitation)
  const sorted = [...precips].sort((a, b) => b - a);
  // Apply weighted average with more weight to higher values
  let totalWeight = 0;
  let weightedSum = 0;
  sorted.forEach((value, index) => {
    const weight = 1.05 ** (sorted.length - index);
    weightedSum += value * weight;
    totalWeight += weight;
  });
  return weightedSum / totalWeight;
}
