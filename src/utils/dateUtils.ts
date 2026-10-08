/**
 * Date and Time Utilities for SkyBus Luxe
 * Ensures perfect Day, Date, Month, Year formatting and strict future-only validation
 */

/**
 * Returns today's ISO date string (YYYY-MM-DD) for HTML5 <input type="date" min={...} />
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string (YYYY-MM-DD or ISO timestamp) into:
 * "Monday, 05 October 2026"
 */
export const formatFullDateWithDay = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    let d: Date;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, day] = dateInput.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    if (isNaN(d.getTime())) return String(dateInput);

    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();

    return `${weekday}, ${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats a date string into:
 * "Mon, 05 Oct 2026"
 */
export const formatShortDateWithDay = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    let d: Date;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, day] = dateInput.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    if (isNaN(d.getTime())) return String(dateInput);

    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();

    return `${weekday}, ${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats a full departure timestamp into:
 * "Mon, 05 Oct 2026 • 07:30 PM"
 */
export const formatDateTimeFull = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const dateStr = formatShortDateWithDay(d);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${dateStr} • ${timeStr}`;
  } catch {
    return String(dateInput);
  }
};

/**
 * Validates whether a date (YYYY-MM-DD or full timestamp) is in the past.
 * Returns true if the date is strictly before today (for date-only) or before right now (for timestamp).
 */
export const isPastDate = (dateInput?: string | Date | null): boolean => {
  if (!dateInput) return false;
  try {
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const today = getTodayDateString();
      return dateInput < today;
    }
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
};

/**
 * Validates whether a departure timestamp has already passed right now.
 */
export const isDepartedTime = (departureTime?: string | Date | null): boolean => {
  if (!departureTime) return false;
  try {
    const d = typeof departureTime === 'string' ? new Date(departureTime) : departureTime;
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
};
