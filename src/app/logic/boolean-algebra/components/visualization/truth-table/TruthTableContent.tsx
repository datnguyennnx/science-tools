'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KatexFormula, booleanToLatex } from '@/components/KatexFormula'
import type {
  TruthTableResult,
  TruthTableResultWaiting,
  TruthTableResultError,
  TruthTableResultSuccess,
  SubExpressionStep,
} from './types'

interface TruthTableContentProps {
  tableData: TruthTableResult
  isFullscreen: boolean
}

export function TruthTableContent({ tableData, isFullscreen }: TruthTableContentProps) {
  if (tableData.status === 'waiting') {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[10rem]`}
      >
        <p className={`text-sm mt-2 ${isFullscreen ? 'ba-text-foreground' : 'ba-text-muted'}`}>
          {(tableData as TruthTableResultWaiting).message}
        </p>
      </div>
    )
  }

  if (tableData.status === 'error') {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-md min-h-[10rem] `}
      >
        <p className={`text-sm mt-2 ${isFullscreen ? 'ba-text-foreground' : 'ba-text-muted'}`}>
          {(tableData as TruthTableResultError).message.includes('LaTeX conversion')
            ? 'Please check the LaTeX syntax in your expression.'
            : (tableData as TruthTableResultError).message.includes('parse the expression')
              ? 'Please check the expression syntax (operators, parentheses, etc.).'
              : 'Could not generate the truth table. Please check your expression.'}
        </p>
      </div>
    )
  }

  // status === 'success'
  const { variables, subExpressionSteps, rows, rawInput } = tableData as TruthTableResultSuccess

  if (variables.length === 0 && subExpressionSteps.length === 1 && rows.length === 1) {
    // This is a constant expression case (e.g. "1", "0", "A*!A")
    // Display a simplified version or just the result.
    const constantStep = subExpressionSteps[0]
    const constantValue = rows[0].stepResults[constantStep.str]
    return (
      <div className="space-y-2 ">
        {!isFullscreen && (
          <div>
            <h3 className="font-medium text-sm">Truth Table for:</h3>
            <div className="ba-expression-preview p-2 rounded my-1 overflow-x-auto no-scrollbar">
              <KatexFormula formula={booleanToLatex(rawInput)} block={true} />
            </div>
          </div>
        )}
        <div className="overflow-x-auto w-full no-scrollbar">
          <Table className="w-full min-w-max table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center px-1 py-2 text-xs sm:text-sm">
                  <div className="overflow-x-auto max-w-[150px] sm:max-w-none mx-auto no-scrollbar">
                    <KatexFormula formula={booleanToLatex(constantStep.str)} />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-center p-1 text-xs sm:text-sm">
                  <KatexFormula formula={constantValue ? '\\text{T}' : '\\text{F}'} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="text-xs ba-text-muted text-center mt-2">
          The expression evaluates to a constant value.
        </p>
      </div>
    )
  }

  if (rows.length === 0) {
    // Should be caught by error states, but as a fallback:
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md min-h-[10rem]">
        <h2 className={`text-xl font-semibold ${isFullscreen ? 'ba-text-foreground' : ''}`}>
          Truth Table Status
        </h2>
        <p className={`mt-1 ${isFullscreen ? 'ba-text-foreground' : 'ba-text-muted'}`}>
          Could not generate truth table rows.
        </p>
        {rawInput && (
          <div className="mt-3 text-xs ba-expression-preview p-2 rounded w-full max-w-md overflow-x-auto no-scrollbar">
            <span className={`${isFullscreen ? 'ba-text-foreground' : 'ba-text-muted'} mr-1`}>
              Input:
            </span>
            <KatexFormula formula={booleanToLatex(rawInput)} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2 ">
      {!isFullscreen && (
        <div className="mb-2">
          <h3 className="font-medium text-sm">Truth Table for:</h3>
          <div className="ba-expression-preview p-2 rounded my-1 overflow-x-auto no-scrollbar">
            <KatexFormula formula={booleanToLatex(rawInput)} block={true} />
          </div>
        </div>
      )}
      <div className="overflow-x-auto w-full no-scrollbar">
        <Table className="w-full min-w-max table-auto">
          <TableHeader>
            <TableRow>
              {variables.map((variable: string) => (
                <TableHead
                  key={`var-${variable}`}
                  className="text-center px-1 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <KatexFormula formula={variable} />
                </TableHead>
              ))}
              {subExpressionSteps.map((step: SubExpressionStep) => (
                <TableHead
                  key={`step-${step.str}`}
                  className="text-center px-1 py-2 text-xs sm:text-sm"
                >
                  <div className="overflow-x-auto max-w-[150px] sm:max-w-none mx-auto no-scrollbar">
                    <KatexFormula formula={booleanToLatex(step.str)} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => {
              const rowKeyPart = variables
                .map((v: string) => (row.variableValues[v] ? '1' : '0'))
                .join('')
              const stableRowKey = `row-${rowKeyPart}`
              return (
                <TableRow key={stableRowKey}>
                  {variables.map((variable: string) => (
                    <TableCell
                      key={`cell-${stableRowKey}-var-${variable}`}
                      className="text-center p-1 text-xs sm:text-sm"
                    >
                      <KatexFormula
                        formula={row.variableValues[variable] ? '\\text{T}' : '\\text{F}'}
                      />
                    </TableCell>
                  ))}
                  {subExpressionSteps.map((step: SubExpressionStep) => (
                    <TableCell
                      key={`cell-${stableRowKey}-step-${step.str}`}
                      className="text-center p-1 text-xs sm:text-sm"
                    >
                      <KatexFormula
                        formula={row.stepResults[step.str] ? '\\text{T}' : '\\text{F}'}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
