export const HUE_COUNT = 8;

const HUE_START = 120;

export function colorFromHueIndex(
  hueIndex: number,
  opacity: number = 0.5,
): string {
  const hueStep = Math.trunc(360 / HUE_COUNT);
  const hue = (HUE_START + hueIndex * hueStep) % 360;

  return `hsla(${hue}deg, 80%, 50%, ${opacity})`;
}
