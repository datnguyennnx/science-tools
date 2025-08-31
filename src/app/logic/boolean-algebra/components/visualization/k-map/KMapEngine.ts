import { CellPosition, KMapConfig, KMapGroup } from './types'
import {
  createMintermSet,
  generateReducedExpressionSet,
  getOptimalVariableOrder,
} from '../utils/ExpressionUtils'
import { BooleanExpression } from '../../../engine'

// Utility functions are now available from the main engine

// Cache for K-Map configurations to avoid recalculation
const KMAP_CONFIG_CACHE = new Map<string, KMapConfig>()
const KMAP_CONFIG_CACHE_SIZE = 50
const kmapConfigCacheKeys: string[] = []

/**
 * Add to K-Map config cache with LRU eviction
 */
function addToKMapConfigCache(key: string, config: KMapConfig): void {
  if (KMAP_CONFIG_CACHE.size >= KMAP_CONFIG_CACHE_SIZE) {
    const oldestKey = kmapConfigCacheKeys.shift()
    if (oldestKey) {
      KMAP_CONFIG_CACHE.delete(oldestKey)
    }
  }
  KMAP_CONFIG_CACHE.set(key, config)
  kmapConfigCacheKeys.push(key)
}

/**
 * Creates the K-Map configuration based on the number of variables
 * Supports configurations for 2-6 variables with caching
 */
export function createKMapConfig(variables: string[]): KMapConfig {
  // Create cache key based on variables
  const cacheKey = variables.sort().join(',')

  // Check cache first
  const cached = KMAP_CONFIG_CACHE.get(cacheKey)
  if (cached) {
    return cached
  }
  const numVars = variables.length
  let rowHeaders: string[] = []
  let colHeaders: string[] = []
  let rowVarLabel = ''
  let colVarLabel = ''
  let kMapOrder: CellPosition[][] = []

  // Basic 2-variable K-Map (2x2)
  if (numVars === 2) {
    rowVarLabel = variables[0]
    colVarLabel = variables[1]
    rowHeaders = ['0', '1']
    colHeaders = ['0', '1']
    kMapOrder = [
      [
        { row: 0, col: 0, minterm: 0 },
        { row: 0, col: 1, minterm: 1 },
      ],
      [
        { row: 1, col: 0, minterm: 2 },
        { row: 1, col: 1, minterm: 3 },
      ],
    ]
  }
  // 3-variable K-Map (2x4)
  else if (numVars === 3) {
    rowVarLabel = variables[0]
    colVarLabel = variables.slice(1).join('')
    rowHeaders = ['0', '1']
    colHeaders = ['00', '01', '11', '10'] // Gray code for BC
    kMapOrder = [
      [
        { row: 0, col: 0, minterm: 0 },
        { row: 0, col: 1, minterm: 1 },
        { row: 0, col: 2, minterm: 3 },
        { row: 0, col: 3, minterm: 2 },
      ],
      [
        { row: 1, col: 0, minterm: 4 },
        { row: 1, col: 1, minterm: 5 },
        { row: 1, col: 2, minterm: 7 },
        { row: 1, col: 3, minterm: 6 },
      ],
    ]
  }
  // 4-variable K-Map (4x4)
  else if (numVars === 4) {
    rowVarLabel = variables.slice(0, 2).join('')
    colVarLabel = variables.slice(2).join('')
    rowHeaders = ['00', '01', '11', '10'] // Gray code for AB
    colHeaders = ['00', '01', '11', '10'] // Gray code for CD
    kMapOrder = [
      [
        { row: 0, col: 0, minterm: 0 },
        { row: 0, col: 1, minterm: 1 },
        { row: 0, col: 2, minterm: 3 },
        { row: 0, col: 3, minterm: 2 },
      ],
      [
        { row: 1, col: 0, minterm: 4 },
        { row: 1, col: 1, minterm: 5 },
        { row: 1, col: 2, minterm: 7 },
        { row: 1, col: 3, minterm: 6 },
      ],
      [
        { row: 2, col: 0, minterm: 12 },
        { row: 2, col: 1, minterm: 13 },
        { row: 2, col: 2, minterm: 15 },
        { row: 2, col: 3, minterm: 14 },
      ],
      [
        { row: 3, col: 0, minterm: 8 },
        { row: 3, col: 1, minterm: 9 },
        { row: 3, col: 2, minterm: 11 },
        { row: 3, col: 3, minterm: 10 },
      ],
    ]
  }
  // 5-variable K-Map (4x8) - split into 2 planes (shown as two 4x4 grids)
  else if (numVars === 5) {
    rowVarLabel = variables.slice(0, 2).join('')
    colVarLabel = variables.slice(2, 4).join('')
    const lastVar = variables[4]

    // Adjust headers to indicate this is a split view
    rowHeaders = ['00', '01', '11', '10'] // Gray code for AB
    colHeaders = [
      '00',
      '01',
      '11',
      '10',
      `00(${lastVar}=1)`,
      `01(${lastVar}=1)`,
      `11(${lastVar}=1)`,
      `10(${lastVar}=1)`,
    ] // CD with E indicator

    // This is a 4x8 layout (which can be viewed as two 4x4 grids side-by-side)
    kMapOrder = [
      // First plane (E=0): minterms 0-15
      [
        { row: 0, col: 0, minterm: 0 }, // ABCDE = 00000
        { row: 0, col: 1, minterm: 1 }, // ABCDE = 00001
        { row: 0, col: 2, minterm: 3 }, // ABCDE = 00011
        { row: 0, col: 3, minterm: 2 }, // ABCDE = 00010
        // Second plane (E=1): minterms 16-31
        { row: 0, col: 4, minterm: 16 }, // ABCDE = 10000
        { row: 0, col: 5, minterm: 17 }, // ABCDE = 10001
        { row: 0, col: 6, minterm: 19 }, // ABCDE = 10011
        { row: 0, col: 7, minterm: 18 }, // ABCDE = 10010
      ],
      [
        { row: 1, col: 0, minterm: 4 }, // ABCDE = 00100
        { row: 1, col: 1, minterm: 5 }, // ABCDE = 00101
        { row: 1, col: 2, minterm: 7 }, // ABCDE = 00111
        { row: 1, col: 3, minterm: 6 }, // ABCDE = 00110
        { row: 1, col: 4, minterm: 20 }, // ABCDE = 10100
        { row: 1, col: 5, minterm: 21 }, // ABCDE = 10101
        { row: 1, col: 6, minterm: 23 }, // ABCDE = 10111
        { row: 1, col: 7, minterm: 22 }, // ABCDE = 10110
      ],
      [
        { row: 2, col: 0, minterm: 12 }, // ABCDE = 01100
        { row: 2, col: 1, minterm: 13 }, // ABCDE = 01101
        { row: 2, col: 2, minterm: 15 }, // ABCDE = 01111
        { row: 2, col: 3, minterm: 14 }, // ABCDE = 01110
        { row: 2, col: 4, minterm: 28 }, // ABCDE = 11100
        { row: 2, col: 5, minterm: 29 }, // ABCDE = 11101
        { row: 2, col: 6, minterm: 31 }, // ABCDE = 11111
        { row: 2, col: 7, minterm: 30 }, // ABCDE = 11110
      ],
      [
        { row: 3, col: 0, minterm: 8 }, // ABCDE = 01000
        { row: 3, col: 1, minterm: 9 }, // ABCDE = 01001
        { row: 3, col: 2, minterm: 11 }, // ABCDE = 01011
        { row: 3, col: 3, minterm: 10 }, // ABCDE = 01010
        { row: 3, col: 4, minterm: 24 }, // ABCDE = 11000
        { row: 3, col: 5, minterm: 25 }, // ABCDE = 11001
        { row: 3, col: 6, minterm: 27 }, // ABCDE = 11011
        { row: 3, col: 7, minterm: 26 }, // ABCDE = 11010
      ],
    ]
  }
  // 6-variable K-Map (8x8) - split into 4 planes (shown as a 2x2 grid of 4x4 K-Maps)
  else if (numVars === 6) {
    // Groups for the variables
    const firstTwoVars = variables.slice(0, 2).join('') // AB
    const secondTwoVars = variables.slice(2, 4).join('') // CD
    const lastTwoVars = variables.slice(4).join('') // EF

    // Use compound labels to indicate the 4-plane structure
    rowVarLabel = `${firstTwoVars}-${lastTwoVars[0]}` // AB-E
    colVarLabel = `${secondTwoVars}-${lastTwoVars[1]}` // CD-F

    // Headers for row and column (graycodes)
    rowHeaders = ['000', '001', '011', '010', '110', '111', '101', '100'] // Split into 4 rows per plane
    colHeaders = ['000', '001', '011', '010', '110', '111', '101', '100'] // Split into 4 cols per plane

    // Create the 8x8 grid, which can be viewed as a 2x2 grid of 4x4 K-Maps
    // This is complex but can be represented by properly calculating the minterm indices
    kMapOrder = []

    // Initialize the 8x8 grid
    for (let i = 0; i < 8; i++) {
      kMapOrder.push([])
      for (let j = 0; j < 8; j++) {
        // Calculate the minterm index based on position
        // This needs to follow gray code ordering for variables A-F
        const rowBinaryGrayCode = [
          [0, 0, 0], // 000
          [0, 0, 1], // 001
          [0, 1, 1], // 011
          [0, 1, 0], // 010
          [1, 1, 0], // 110
          [1, 1, 1], // 111
          [1, 0, 1], // 101
          [1, 0, 0], // 100
        ]

        const colBinaryGrayCode = [
          [0, 0, 0], // 000
          [0, 0, 1], // 001
          [0, 1, 1], // 011
          [0, 1, 0], // 010
          [1, 1, 0], // 110
          [1, 1, 1], // 111
          [1, 0, 1], // 101
          [1, 0, 0], // 100
        ]

        // Extract the binary values for each variable from the gray code
        const a = rowBinaryGrayCode[i][0]
        const b = rowBinaryGrayCode[i][1]
        const e = rowBinaryGrayCode[i][2]
        const c = colBinaryGrayCode[j][0]
        const d = colBinaryGrayCode[j][1]
        const f = colBinaryGrayCode[j][2]

        // Calculate the minterm index
        // The formula is A*32 + B*16 + C*8 + D*4 + E*2 + F*1
        const minterm = a * 32 + b * 16 + c * 8 + d * 4 + e * 2 + f * 1

        kMapOrder[i].push({ row: i, col: j, minterm })
      }
    }
  }
  // For more than 6 variables, provide a fallback (though the UI should use generateMultiKMaps)
  else {
    // Fallback to 4-variable K-Map with a warning
    console.warn(
      `K-Map with ${numVars} variables is not directly supported. Using 4-variable layout.`
    )

    // Use the first 4 variables
    const limitedVars = variables.slice(0, 4)
    return createKMapConfig(limitedVars)
  }

  const config = { rowHeaders, colHeaders, rowVarLabel, colVarLabel, kMapOrder }
  addToKMapConfigCache(cacheKey, config)
  return config
}

/**
 * Generates multiple K-Maps for expressions with many variables
 * Each K-Map fixes some variables to specific values
 *
 * @param expr The boolean expression tree
 * @param variables All variables in the expression
 * @param maxMapVars Maximum variables to show in a single K-Map (default: 4)
 * @returns Array of K-Map configurations and data for each sub-expression
 */
export function generateMultiKMaps(
  expr: BooleanExpression,
  variables: string[],
  maxMapVars: number = 4
): Array<{
  config: KMapConfig
  mintermSet: Set<number>
  variables: string[]
  title: string
  fixedVariables: Record<string, boolean>
}> {
  // Limit maxMapVars to reasonable values (2-6)
  maxMapVars = Math.min(Math.max(maxMapVars, 2), 6)

  // If we have few enough variables, just return a single K-Map
  if (variables.length <= maxMapVars) {
    return [
      {
        config: createKMapConfig(variables),
        mintermSet: createMintermSet(expr, variables),
        variables,
        title: 'Complete K-Map',
        fixedVariables: {},
      },
    ]
  }

  // Optimization: First, reorder variables by importance for better visualization
  // This prioritizes variables with the most impact on the output
  const orderedVars = getOptimalVariableOrder(expr, variables)

  // Generate reduced expressions
  const reducedExpressions = generateReducedExpressionSet(expr, orderedVars, maxMapVars)

  // Calculate minterm sets for all reduced expressions in one batch if possible
  const batchedMintermSets = new Map<string, Set<number>>()

  // Create a K-Map for each reduced expression with optimized minterm calculation
  return reducedExpressions.map(reduced => {
    // Unique key for this reduced expression's fixed variable configuration
    const fixedVarsKey = Object.entries(reduced.fixedVariables)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([v, val]) => `${v}:${val ? 1 : 0}`)
      .join(',')

    // Use the existing minterm set if we've already calculated it
    let mintermSet: Set<number>
    if (batchedMintermSets.has(fixedVarsKey)) {
      mintermSet = batchedMintermSets.get(fixedVarsKey)!
    } else {
      mintermSet = reduced.mintermSet
      batchedMintermSets.set(fixedVarsKey, mintermSet)
    }

    return {
      config: createKMapConfig(reduced.freeVariables),
      mintermSet,
      variables: reduced.freeVariables,
      title: reduced.title,
      fixedVariables: reduced.fixedVariables,
    }
  })
}

/**
 * Calculates the optimal groupings of minterms for K-Map simplification
 *
 * @param mintermSet The set of minterms to group
 * @param kMapConfig The K-Map configuration
 * @returns Array of K-Map groups
 */
export function calculateOptimalGroups(
  mintermSet: Set<number>,
  kMapConfig: KMapConfig
): KMapGroup[] {
  // This is a placeholder for the implementation
  // A proper implementation would detect adjacent cells with 1s and group them
  // in powers of 2 (1, 2, 4, 8, 16, etc.)

  // For now, we'll return a simple group for each minterm
  const groups: KMapGroup[] = []
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899']

  // Flatten the kMapOrder to find all cells
  const allCells = kMapConfig.kMapOrder.flat()

  // Create a group for each minterm
  for (const cell of allCells) {
    if (mintermSet.has(cell.minterm)) {
      const colorIndex = groups.length % colors.length
      groups.push({
        cells: [cell],
        color: colors[colorIndex],
        size: 1,
      })
    }
  }

  return groups
}
