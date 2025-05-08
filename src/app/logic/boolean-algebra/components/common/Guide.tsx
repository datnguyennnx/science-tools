'use client'

import { booleanLaws } from '../../engine'
import { KatexFormula, booleanToLatex } from '@/components/KatexFormula'

export function Guide() {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Boolean Operators:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <code className="font-mono">!</code> - NOT (negation) - <KatexFormula formula="\lnot A" />
        </li>
        <li>
          <code className="font-mono">*</code> - AND (conjunction) -{' '}
          <KatexFormula formula="A \land B" />
        </li>
        <li>
          <code className="font-mono">+</code> - OR (disjunction) -{' '}
          <KatexFormula formula="A \lor B" />
        </li>
      </ul>

      <h3 className="font-medium">Boolean Laws:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Identity law: <KatexFormula formula={booleanToLatex(booleanLaws.identity[0].formula)} />{' '}
          <KatexFormula formula={booleanToLatex(booleanLaws.identity[1].formula)} />
        </li>
        <li>
          Domination law:{' '}
          <KatexFormula formula={booleanToLatex(booleanLaws.domination[0].formula)} />{' '}
          <KatexFormula formula={booleanToLatex(booleanLaws.domination[1].formula)} />
        </li>
        <li>
          Idempotent law:{' '}
          <KatexFormula formula={booleanToLatex(booleanLaws.idempotent[0].formula)} />{' '}
          <KatexFormula formula={booleanToLatex(booleanLaws.idempotent[1].formula)} />
        </li>
        <li>
          Double negation:{' '}
          <KatexFormula formula={booleanToLatex(booleanLaws.doubleNegation.formula)} />
        </li>
      </ul>

      <h3 className="font-medium">Additional Laws:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Commutative: <KatexFormula formula="A \land B = B \land A" />{' '}
          <KatexFormula formula="A \lor B = B \lor A" />
        </li>
        <li>
          Associative: <KatexFormula formula="(A \land B) \land C = A \land (B \land C)" />{' '}
          <KatexFormula formula="(A \lor B) \lor C = A \lor (B \lor C)" />
        </li>
        <li>
          Distributive: <KatexFormula formula="A \land (B \lor C) = (A \land B) \lor (A \land C)" />{' '}
          <KatexFormula formula="A \lor (B \land C) = (A \lor B) \land (A \lor C)" />
        </li>
        <li>
          De Morgan&apos;s Laws: <KatexFormula formula="\lnot(A \land B) = \lnot A \lor \lnot B" />{' '}
          <KatexFormula formula="\lnot(A \lor B) = \lnot A \land \lnot B" />
        </li>
      </ul>
    </div>
  )
}
