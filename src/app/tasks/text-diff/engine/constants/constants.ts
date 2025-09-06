export const DEFAULT_TEXT_1 = `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log(result);`

export const DEFAULT_TEXT_2 = `function calculateSum(a, b, c) {
  return a + b + c;
}

const result = calculateSum(5, 3, 2);
console.log("Sum:", result);`

export const PLACEHOLDER_TEXT_1 = 'Paste, type, or drag & drop the original text here...'
export const PLACEHOLDER_TEXT_2 = 'Paste, type, or drag & drop the modified text here...'

export const BUTTON_LABELS = {
  loadSample: 'Load Sample',
  clearAll: 'Clear All',
  changesOnly: 'Changes Only',
  split: 'Split',
  unified: 'Unified',
} as const

export const STATUS_MESSAGES = {
  differencesFound: 'Differences found',
  textsMatch: 'Texts match',
  noDifferences: 'No differences found',
  enterTextToCompare: 'Enter text in both panels to compare',
} as const

export const SECTION_LABELS = {
  originalText: 'Original Text',
  modifiedText: 'Modified Text',
  comparisonResults: 'Comparison Results',
  changesDetected: 'Changes Detected',
  original: 'Original',
  modified: 'Modified',
} as const

export const ARIA_LABELS = {
  textDiffTool: 'Text Diff Comparison Tool',
  textDiffToolbar: 'Text Diff Toolbar',
  textDiffActions: 'Text Diff Actions',
  textComparisonWorkspace: 'Text Comparison Workspace',
  originalTextInput: 'Original Text Input',
  modifiedTextInput: 'Modified Text Input',
  textDifferenceResults: 'Text Difference Results',
  loadSampleAria: 'Load sample texts for comparison',
  clearAllAria: 'Clear all text',
} as const
