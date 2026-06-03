/**
 * Date utilities with Mexico City timezone (America/Mexico_City).
 * All dates are stored as UTC in the database; this module handles
 * the conversion to local Mexico time for display and SQL comparisons.
 */

const TZ = 'America/Mexico_City';

/**
 * Formats a date as "dd/mm/yyyy" in Mexico City timezone.
 * Works in both server and client environments.
 */
export function formatMexicoDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formats a date as "dd/mm/yyyy HH:mm" in Mexico City timezone.
 */
export function formatMexicoDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

/**
 * Formats a date with long month name, e.g. "29 de abril de 2026".
 */
export function formatMexicoDateLong(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Returns the current date in Mexico City as a "YYYY-MM-DD" string.
 * Use this to build SQL date comparisons instead of CURRENT_DATE (which is UTC).
 */
export function mexicoTodayString(): string {
  // en-CA gives ISO-style YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Returns "hace N minutos/horas/días" relative to now, with Mexico City fallback date.
 */
export function formatTimeAgoMexico(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

  return formatMexicoDateLong(d);
}
