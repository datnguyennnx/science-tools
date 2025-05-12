/**
 * Centralized Color Definitions for Boolean Algebra Visualizations
 */

// --- Venn Diagram Colors ---
export const VENN_SET_COLORS = {
  A: 'var(--venn-set-a)',
  B: 'var(--venn-set-b)',
  C: 'var(--venn-set-c)',
  D: 'var(--venn-set-d)',
  INTERSECTION: 'var(--venn-intersection)',
  NEITHER_TRUE: 'var(--venn-bg)', // Background when Neither region is TRUE
  NEITHER_FALSE: 'var(--muted)', // Background when Neither region is FALSE
}

export const VENN_STROKE_COLORS = {
  DEFAULT: 'var(--venn-border)',
  INSIDE: 'var(--venn-border-inside)',
  UNIVERSAL_SET: 'var(--venn-border)', // Can be same as default
}

// Styles specific to the 4-variable Venn representation
export const FOUR_VAR_VENN_REGION_STYLES = {
  ACTIVE_FILL_OPACITY: 0.6, // Opacity when a region is TRUE
  INACTIVE_FILL_OPACITY: 0.0, // Opacity when a region is FALSE
  ACTIVE_STROKE_OPACITY: 0.8,
  INACTIVE_STROKE_OPACITY: 0.1,
}

// --- K-Map Colors ---

// Colors for K-Map groups based on size
export const KMAP_GROUP_COLORS = {
  8: 'var(--kmap-group-octet)', // Octet
  4: 'var(--kmap-group-quad)', // Quad
  2: 'var(--kmap-group-pair)', // Pair
  1: 'var(--kmap-group-single)', // Single
}

// Display names for K-Map group sizes (for legends, etc.)
export const KMAP_GROUP_COLOR_NAMES: Record<number, string> = {
  8: 'Octet',
  4: 'Quad',
  2: 'Pair',
  1: 'Single',
}

// Opacity for K-Map cell backgrounds when grouped
export const KMAP_CELL_BG_OPACITY = '25' // Hexadecimal for 25% alpha

// Border styles for K-Map groups
export const KMAP_GROUP_BORDER_STYLE = 'dashed'
export const KMAP_GROUP_BORDER_WIDTH = '2px'

// --- Common Colors ---

// General label color (used in both Venn and K-Map)
export const LABEL_COLOR = 'hsl(var(--foreground))'
