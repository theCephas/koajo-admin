export const toDisplayText = (
  value: string | Record<string, unknown> | null | undefined,
) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const candidates = Object.values(value).filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim().length > 0,
    );
    if (candidates.length > 0) {
      return candidates[0];
    }
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value);
};
