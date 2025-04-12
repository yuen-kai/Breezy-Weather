export function convertTemperature(temp: number): number {
  return (temp - 32) * (5 / 9);
}

export function convertWindSpeed(speed: number): number {
  return speed * 1.60934;
}

export function convertPrecip(precip: number): number {
  return precip * 2.54;
}

export function convertVisibility(vis: number): number {
  return vis * 1.60934;
}
