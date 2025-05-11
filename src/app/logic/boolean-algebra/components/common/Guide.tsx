'use client'

import { KatexFormula } from '@/components/KatexFormula'

// Define laws for display directly here or import from a new Guide-specific constant file
const guideDisplayLaws = {
  identity: [
    { name: 'AND Identity', formula: 'A \\land 1 = A' },
    { name: 'OR Identity', formula: 'A \\lor 0 = A' },
  ],
  domination: [
    { name: 'AND Domination', formula: 'A \\land 0 = 0' },
    { name: 'OR Domination', formula: 'A \\lor 1 = 1' },
  ],
  idempotent: [
    { name: 'AND Idempotent', formula: 'A \\land A = A' }, // Added based on new AST rules
    { name: 'OR Idempotent', formula: 'A \\lor A = A' }, // Added based on new AST rules
  ],
  doubleNegation: {
    name: 'Double Negation',
    formula: '\\lnot\\lnot A = A',
  },
  // Add other laws as needed for the guide, for example:
  complement: [
    { name: 'AND Complement', formula: 'A \\land \\lnot A = 0' },
    { name: 'OR Complement', formula: 'A \\lor \\lnot A = 1' },
  ],
  absorption: [
    { name: 'Absorption (A + AB)', formula: 'A \\lor (A \\land B) = A' },
    { name: 'Absorption (A(A+B))', formula: 'A \\land (A \\lor B) = A' },
  ],
  // Note: Commutative, Associative, Distributive, De Morgan's are hardcoded below
  // in the JSX, so no changes needed there unless we want to source them from here too.
}

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
          Identity law: <KatexFormula formula={guideDisplayLaws.identity[0].formula} />{' '}
          <KatexFormula formula={guideDisplayLaws.identity[1].formula} />
        </li>
        <li>
          Domination law: <KatexFormula formula={guideDisplayLaws.domination[0].formula} />{' '}
          <KatexFormula formula={guideDisplayLaws.domination[1].formula} />
        </li>
        <li>
          Idempotent law: <KatexFormula formula={guideDisplayLaws.idempotent[0].formula} />{' '}
          <KatexFormula formula={guideDisplayLaws.idempotent[1].formula} />
        </li>
        <li>
          Double negation: <KatexFormula formula={guideDisplayLaws.doubleNegation.formula} />
        </li>
        <li>
          Complement law: <KatexFormula formula={guideDisplayLaws.complement[0].formula} />{' '}
          <KatexFormula formula={guideDisplayLaws.complement[1].formula} />
        </li>
        <li>
          Absorption law: <KatexFormula formula={guideDisplayLaws.absorption[0].formula} />{' '}
          <KatexFormula formula={guideDisplayLaws.absorption[1].formula} />
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
