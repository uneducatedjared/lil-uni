export function formatToDatetimeLocal(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(+d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
}

export function toISOStringFromLocal(localValue: string) {
  try {
    if (!localValue) return '';
    const d = new Date(localValue);
    return d.toISOString();
  } catch (e) {
    return '';
  }
}
