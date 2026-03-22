export const PLAYER_NAME_PATTERN = /^[A-Z]{1,3}$/;

export function normalizePlayerName(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function isValidPlayerName(value: string) {
  return PLAYER_NAME_PATTERN.test(normalizePlayerName(value));
}
