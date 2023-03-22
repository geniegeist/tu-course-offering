export function formatRawDate(raw: string) {
  const index = raw.indexOf(',');
  const good = raw.substring(0, index + 5).split(', ');
  return `${good[1]}, ${good[0]}`;
}

export function isValidRawDate(raw: string) {
  if (!raw || raw.length === 0) {
    return false;
  }

  if (raw && raw[0]) {
    if (!isNaN(parseInt(raw[0]))) {
      return false;
    }
  }

  return true;
}
