export const HUE_COUNT = 8;

export function colorFromHueIndex(
  hueIndex: number,
  opacity: number = 0.5,
): string {
  const hueStep = Math.trunc(360 / HUE_COUNT);

  return `hsla(${hueIndex * hueStep}deg, 80%, 50%, ${opacity})`;
}
