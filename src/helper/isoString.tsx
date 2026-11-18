// ISO strings from .NET often lack a "Z", which makes JS read them as local time.
// Treat anything without a timezone as UTC.
export const parseUtc = (s: string) =>
  new Date(/([zZ]|[+-]\d\d:?\d\d)$/.test(s) ? s : s + "Z");

const pad = (n: number) => String(n).padStart(2, "0");

export const formatRemaining = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${d > 0 ? `${d}d ` : ""}${pad(h)}:${pad(m)}:${pad(s)}`;
};
