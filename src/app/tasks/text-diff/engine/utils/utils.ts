import { STATUS_MESSAGES, SECTION_LABELS } from '../constants/constants'

export function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function generateLineNumbers(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1)
}

export { STATUS_MESSAGES, SECTION_LABELS }
