export const HUE_COUNT = 8;

const HUE_START = 120;

// Matches the editor's planted green rather than the brighter first hue.
const PLANTED_GREEN = { hue: 113, lightness: 26, saturation: 55 };

export function colorFromHueIndex(
  hueIndex: number,
  opacity: number = 0.5,
): string {
  if (hueIndex === 0) {
    return `hsla(${PLANTED_GREEN.hue}deg, ${PLANTED_GREEN.saturation}%, ${PLANTED_GREEN.lightness}%, ${opacity})`;
  }

  const hueStep = Math.trunc(360 / HUE_COUNT);
  const hue = (HUE_START + hueIndex * hueStep) % 360;

  return `hsla(${hue}deg, 80%, 50%, ${opacity})`;
}
