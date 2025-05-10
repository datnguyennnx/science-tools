/**
 * Law Converter Module
 *
 * This module handles converting the Boolean laws defined in laws.ts
 * to SimplificationRule objects that can be used by the simplifier.
 */

import { BooleanExpression } from '../ast'
import { SimplificationRule } from '../ast/rule-types'
import { parseExpression, expressionToBooleanString } from '../parser'
import { booleanLaws, type BooleanLaw, type BooleanLaws } from '../simplifier/constants'

// Type for accessing booleanLaws with string index
type LawsRecord = BooleanLaws & {
  [key: string]: BooleanLaw | BooleanLaw[]
}

/**
 * Convert Boolean laws from laws.ts to SimplificationRule objects
 */
export function convertLawsToRules(): SimplificationRule[] {
  const convertedRules: SimplificationRule[] = []
  const lawsObj = booleanLaws as LawsRecord

  // Helper function to convert a law to a rule
  const convertLaw = (name: string, formula: string): SimplificationRule => {
    return {
      info: {
        name,
        description: formula,
        formula,
      },
      canApply: (expr: BooleanExpression): boolean => {
        // Convert the expression to a string
        const exprString = expressionToBooleanString(expr)

        // Find the matching law in booleanLaws
        for (const category in lawsObj) {
          if (Array.isArray(lawsObj[category])) {
            for (const law of lawsObj[category]) {
              if (law.name === name && law.regex) {
                // Check if the regex matches the expression
                return law.regex.test(exprString)
              }
            }
          } else if (lawsObj[category]?.name === name && lawsObj[category]?.regex) {
            return lawsObj[category].regex.test(exprString)
          }
        }
        return false
      },
      apply: (expr: BooleanExpression): BooleanExpression => {
        // Convert expression to string
        const exprString = expressionToBooleanString(expr)
        let newExprString = exprString

        // Find the matching law in booleanLaws and apply replacement
        for (const category in lawsObj) {
          if (Array.isArray(lawsObj[category])) {
            for (const law of lawsObj[category]) {
              if (law.name === name && law.regex && law.replacement) {
                // Apply the replacement
                if (typeof law.replacement === 'string') {
                  newExprString = exprString.replace(law.regex, law.replacement)
                } else if (typeof law.replacement === 'function') {
                  newExprString = exprString.replace(law.regex, match => {
                    const matches = match.match(law.regex!)
                    if (matches && typeof law.replacement === 'function') {
                      return law.replacement(matches)
                    }
                    return match
                  })
                }
                break
              }
            }
          } else if (
            lawsObj[category]?.name === name &&
            lawsObj[category]?.regex &&
            lawsObj[category]?.replacement
          ) {
            const law = lawsObj[category]
            // Apply the replacement
            if (typeof law.replacement === 'string' && law.regex) {
              newExprString = exprString.replace(law.regex, law.replacement)
            } else if (typeof law.replacement === 'function' && law.regex) {
              newExprString = exprString.replace(law.regex, match => {
                const matches = match.match(law.regex!)
                if (matches && typeof law.replacement === 'function') {
                  return law.replacement(matches)
                }
                return match
              })
            }
          }
        }

        // Parse the new expression string back to a tree
        if (newExprString !== exprString) {
          // Pass false for isInitialParse because the string is already processed by expressionToBooleanString
          return parseExpression(newExprString, false)
        }

        // Return the original expression if no change
        return expr
      },
    }
  }

  // Add rules for each law in booleanLaws
  for (const category in lawsObj) {
    if (Array.isArray(lawsObj[category])) {
      for (const law of lawsObj[category]) {
        if (law.name && law.formula) {
          convertedRules.push(convertLaw(law.name, law.formula))
        }
      }
    } else if (lawsObj[category]?.name && lawsObj[category]?.formula) {
      convertedRules.push(convertLaw(lawsObj[category].name, lawsObj[category].formula))
    }
  }

  return convertedRules
}
