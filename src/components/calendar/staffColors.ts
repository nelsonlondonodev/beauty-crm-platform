// ── Palette (deterministic per-staff color) ─────────────────────────────────

const STAFF_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-400', dot: 'bg-blue-500' },
  { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-400', dot: 'bg-purple-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-400', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-400', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-400', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-400', dot: 'bg-cyan-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-400', dot: 'bg-indigo-500' },
  { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-400', dot: 'bg-pink-500' },
] as const;

/**
 * Returns a deterministic color palette for a staff member based on index.
 */
export const getStaffColor = (index: number) =>
  STAFF_COLORS[index % STAFF_COLORS.length];

/**
 * Returns the hex color code for a staff member (used by FullCalendar events).
 */
const STAFF_HEX_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#f43f5e', '#06b6d4', '#6366f1', '#ec4899',
];

export const getStaffHexColor = (index: number): string =>
  STAFF_HEX_COLORS[index % STAFF_HEX_COLORS.length];
