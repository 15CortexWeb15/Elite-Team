export const TIMEZONES = [
  // Americas
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "America/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  // Europe
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Zurich",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Prague",
  "Europe/Vienna",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Moscow",
  // Asia / Pacific
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Pacific/Auckland",
  "Pacific/Honolulu",
  // Africa
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Nairobi",
  // UTC
  "UTC",
];

export function detectTimezone(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return TIMEZONES.includes(tz) ? tz : "UTC";
}
