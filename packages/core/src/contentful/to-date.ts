export default function toDate(raw?: string): Date | undefined {
  if (!raw) {
    return undefined;
  }

  return new Date(raw);
}
