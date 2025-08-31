// src/app/logic/boolean-algebra/components/common/guide-content.ts
interface DisplayLaw {
  name: string
  katexFormula: string
  description?: string
}

interface LawCategory {
  id: string
  title: string
  description?: string
  laws: DisplayLaw[]
}

interface TabGroup {
  name: string
  categories: LawCategory[]
}

/**
 * ENGINE ARCHITECTURE OVERVIEW
 *
 * The Boolean Algebra Engine operates through 7 interconnected levels:
 *
 * 1. PARSER LEVEL - Converts string expressions to AST
 *    - Auto-detects format (standard/LaTeX)
 *    - Preprocesses input for correct precedence
 *    - Caches results for performance
 *    - Handles multiple input formats
 *
 * 2. AST LEVEL - Abstract Syntax Tree representation
 *    - Strongly typed expression tree
 *    - Supports all boolean operators (AND, OR, XOR, NAND, NOR, XNOR, NOT)
 *    - Enables efficient traversal and transformation
 *    - Foundation for all engine operations
 *
 * 3. TRANSFORMER LEVEL - Expression preprocessing
 *    - Expands complex operators (XNOR → AND/OR, NOR → NOT/OR)
 *    - Eliminates double negations (¬¬A → A)
 *    - Prepares expressions for rule application
 *    - Ensures consistent representation
 *
 * 4. RULE ENGINE LEVEL - Individual simplification rules
 *    - 35+ specialized rules for different transformations
 *    - Identity, domination, absorption, distribution laws
 *    - Contradiction and tautology detection
 *    - Derived operator rules (XOR, NAND, NOR, XNOR)
 *
 * 5. SIMPLIFIER LEVEL - Orchestrates rule application
 *    - Applies rules in optimal order
 *    - Prevents infinite loops with iteration limits
 *    - Tracks rule application counts
 *    - Manages transformation state
 *
 * 6. PIPELINE LEVEL - Multi-stage processing
 *    - 7-stage transformation pipeline
 *    - Each stage has specific purpose
 *    - Error handling and recovery
 *    - Performance optimization with yielding
 *
 * 7. VERIFICATION LEVEL - Ensures correctness
 *    - Truth table verification for small expressions
 *    - Algebraic verification methods
 *    - Equivalence checking
 *    - Confidence scoring
 */

// Group the tabs into logical sections
export const groupedGuideContent: TabGroup[] = [
  {
    name: 'Engine Architecture',
    categories: [
      {
        id: 'engine-overview',
        title: 'How the Engine Works',
        description:
          'Understanding the 7-level architecture that powers boolean algebra simplification',
        laws: [
          {
            name: 'Level 1: Parser',
            katexFormula: '\\text{String} \\rightarrow \\text{AST Tree}',
            description:
              'Converts input expressions to internal tree representation with auto-format detection and caching',
          },
          {
            name: 'Level 2: AST Structure',
            katexFormula: '\\text{Tree} \\rightarrow \\text{Typed Nodes}',
            description:
              'Strongly typed expression trees supporting all boolean operators with efficient traversal',
          },
          {
            name: 'Level 3: Transformers',
            katexFormula: '\\text{Complex Ops} \\rightarrow \\text{Simple Ops}',
            description:
              'Preprocesses expressions by expanding XNOR/NOR and eliminating double negations',
          },
          {
            name: 'Level 4: Rule Engine',
            katexFormula: '\\text{35+ Rules} \\rightarrow \\text{Transformations}',
            description:
              'Applies identity, absorption, distribution, and other boolean algebra laws systematically',
          },
          {
            name: 'Level 5: Simplifier',
            katexFormula: '\\text{Rules} \\rightarrow \\text{Optimized Order}',
            description:
              'Orchestrates rule application with iteration limits and performance optimization',
          },
          {
            name: 'Level 6: Pipeline',
            katexFormula: '\\text{7 Stages} \\rightarrow \\text{Final Result}',
            description:
              'Multi-stage processing with error handling and step-by-step transformation tracking',
          },
          {
            name: 'Level 7: Verification',
            katexFormula: '\\text{Result} \\rightarrow \\text{Confidence Score}',
            description:
              'Ensures correctness through truth table and algebraic verification methods',
          },
        ],
      },
      {
        id: 'data-flow',
        title: 'Data Flow Through Levels',
        description: 'How expressions flow through the engine architecture',
        laws: [
          {
            name: 'Input Processing',
            katexFormula: '\\text{A \\land B} \\rightarrow \\text{Parser} \\rightarrow \\text{AST}',
            description: 'User input gets parsed and converted to internal representation',
          },
          {
            name: 'Preprocessing',
            katexFormula:
              '\\text{AST} \\rightarrow \\text{Transformers} \\rightarrow \\text{Normalized}',
            description: 'Complex operators expanded, double negations removed',
          },
          {
            name: 'Rule Application',
            katexFormula:
              '\\text{Normalized} \\rightarrow \\text{Rules} \\rightarrow \\text{Simplified}',
            description: 'Boolean algebra laws applied systematically to reduce complexity',
          },
          {
            name: 'Optimization',
            katexFormula:
              '\\text{Simplified} \\rightarrow \\text{Pipeline} \\rightarrow \\text{Optimal}',
            description: 'Multi-stage optimization with canonical form conversion and minimization',
          },
          {
            name: 'Verification',
            katexFormula:
              '\\text{Optimal} \\rightarrow \\text{Verifier} \\rightarrow \\text{Verified}',
            description: 'Truth table verification ensures mathematical correctness',
          },
          {
            name: 'Output Generation',
            katexFormula:
              '\\text{Verified} \\rightarrow \\text{Formatter} \\rightarrow \\text{Display}',
            description: 'Results formatted for display with LaTeX rendering and step explanations',
          },
        ],
      },
      {
        id: 'pipeline-stages',
        title: '7-Stage Processing Pipeline',
        description: 'Each stage serves a specific purpose in the simplification process',
        laws: [
          {
            name: 'Stage 1: XNOR Expansion',
            katexFormula:
              'A \\leftrightarrow B \\rightarrow (A \\land B) \\lor (\\lnot A \\land \\lnot B)',
            description: 'Convert biconditional operations to AND/OR form for easier manipulation',
          },
          {
            name: 'Stage 2: Double Negation',
            katexFormula: '\\lnot \\lnot A \\rightarrow A',
            description: 'Eliminate redundant double negations using double negation elimination',
          },
          {
            name: 'Stage 3: NOR Expansion',
            katexFormula: 'A \\downarrow B \\rightarrow \\lnot (A \\lor B)',
            description:
              'Convert NOR operations to NOT/OR form to prepare for further simplification',
          },
          {
            name: 'Stage 4: Boolean Rules',
            katexFormula: '\\text{35+ Laws} \\rightarrow \\text{Applied Systematically}',
            description:
              "Apply identity, absorption, distribution, De Morgan's and other fundamental laws",
          },
          {
            name: 'Stage 5: Canonical Form',
            katexFormula: '\\text{Expression} \\rightarrow \\text{SoP/PoS}',
            description:
              'Convert to Sum of Products or Product of Sums canonical form for analysis',
          },
          {
            name: 'Stage 6: Advanced Minimization',
            katexFormula: '\\text{SoP/PoS} \\rightarrow \\text{Minimal Form}',
            description:
              'Use Karnaugh maps or Quine-McCluskey algorithm for optimal simplification',
          },
          {
            name: 'Stage 7: Verification',
            katexFormula: '\\text{Minimal} \\rightarrow \\text{Equivalent?}',
            description:
              'Verify that simplified expression is mathematically equivalent to original',
          },
        ],
      },
      {
        id: 'rule-categories',
        title: 'Rule Engine Categories',
        description: 'How the 35+ simplification rules are organized and applied',
        laws: [
          {
            name: 'Constant Rules (Level 4)',
            katexFormula: 'X \\land 1 = X,\\ X \\lor 0 = X,\\ X \\land 0 = 0,\\ X \\lor 1 = 1',
            description:
              'Identity and domination laws for constants - foundation of boolean algebra',
          },
          {
            name: 'Contradiction/Tautology (Level 4)',
            katexFormula: 'A \\land \\lnot A = 0,\\ A \\lor \\lnot A = 1',
            description:
              'Detect and simplify expressions that are always false (contradictions) or always true (tautologies)',
          },
          {
            name: 'Absorption Laws (Level 4)',
            katexFormula: 'A \\land (A \\lor B) = A,\\ A \\lor (A \\land B) = A',
            description: 'Remove redundant terms when a variable absorbs combinations with itself',
          },
          {
            name: "De Morgan's Laws (Level 4)",
            katexFormula: '\\lnot(A \\land B) = \\lnot A \\lor \\lnot B',
            description: 'Fundamental laws for distributing negation over AND/OR operations',
          },
          {
            name: 'Distributive Laws (Level 4)',
            katexFormula: 'A \\land (B \\lor C) = (A \\land B) \\lor (A \\land C)',
            description: 'Expand AND over OR and OR over AND to create factorable expressions',
          },
          {
            name: 'Consensus Theorem (Level 4)',
            katexFormula:
              '(A \\land B) \\lor (\\lnot A \\land C) \\lor (B \\land C) = (A \\land B) \\lor (\\lnot A \\land C)',
            description:
              'Remove redundant terms in complex expressions using consensus elimination',
          },
          {
            name: 'Derived Operators (Level 4)',
            katexFormula: 'A \\oplus B = (A \\land \\lnot B) \\lor (\\lnot A \\land B)',
            description: 'Rules for XOR, NAND, NOR, XNOR operations and their relationships',
          },
          {
            name: 'Canonical Forms (Level 6)',
            katexFormula: '\\text{Expression} \\rightarrow \\text{SoP/PoS}',
            description: 'Convert to standard forms for systematic analysis and minimization',
          },
          {
            name: 'Minimization (Level 6)',
            katexFormula: '\\text{SoP} \\rightarrow \\text{Minimal SoP}',
            description: 'Apply Karnaugh maps or Quine-McCluskey for optimal simplification',
          },
        ],
      },
      {
        id: 'performance-features',
        title: 'Performance & Optimization',
        description: 'How the engine maintains high performance even with complex expressions',
        laws: [
          {
            name: 'LRU Caching',
            katexFormula: '\\text{Parser Cache} + \\text{Eval Cache} = \\text{5000+ entries}',
            description:
              'LRU caches for parsed expressions and evaluations prevent redundant computation',
          },
          {
            name: 'Timeout Protection',
            katexFormula: '\\text{3s Parse} + \\text{8s Simplify} + \\text{2s LaTeX}',
            description:
              'Automatic timeouts prevent infinite loops and ensure responsive user experience',
          },
          {
            name: 'Async Yielding',
            katexFormula: '\\text{1-3ms yields} \\rightarrow \\text{UI responsive}',
            description: 'Strategic yielding prevents browser blocking during complex computations',
          },
          {
            name: 'Batch Processing',
            katexFormula: '\\text{5 rules/batch} \\times \\text{50 iterations}',
            description: 'Rules applied in optimized batches with iteration limits for efficiency',
          },
          {
            name: 'Memory Management',
            katexFormula: '\\text{GC-friendly} + \\text{Immutable trees}',
            description: 'Immutable expression trees and efficient memory usage patterns',
          },
          {
            name: 'Complexity Analysis',
            katexFormula: '\\text{Node count} + \\text{Depth} + \\text{Variables}',
            description: 'Automatic complexity metrics help choose optimal verification methods',
          },
          {
            name: 'Error Recovery',
            katexFormula: '\\text{Graceful fallback} \\rightarrow \\text{Partial results}',
            description:
              'Comprehensive error handling ensures partial results even when some stages fail',
          },
          {
            name: 'Format Auto-Detection',
            katexFormula: '\\text{Auto-detect} \\rightarrow \\text{Standard/LaTeX}',
            description: 'Intelligent format detection eliminates manual format specification',
          },
        ],
      },
    ],
  },
  {
    name: 'Basic Operations',
    categories: [
      {
        id: 'operators',
        title: 'Operators',
        description: 'Core operators and their notation used in the simplifier.',
        laws: [
          { name: 'NOT (Negation)', katexFormula: '\\lnot A', description: 'Standard: !A, ¬A' },
          {
            name: 'AND (Conjunction)',
            katexFormula: 'A \\land B',
            description: 'Standard: A*B, A&B, A∧B',
          },
          {
            name: 'OR (Disjunction)',
            katexFormula: 'A \\lor B',
            description: 'Standard: A+B, A|B, A∨B',
          },
          {
            name: 'XOR (Exclusive OR)',
            katexFormula: 'A \\oplus B',
            description: 'Standard: A^B, A⊕B. Equivalent to (A ∧ ¬B) ∨ (¬A ∧ B)',
          },
          {
            name: 'NAND',
            katexFormula: 'A \\uparrow B',
            description: 'Standard: A@B, A↑B. Equivalent to ¬(A ∧ B)',
          },
          {
            name: 'NOR',
            katexFormula: 'A \\downarrow B',
            description: 'Standard: A#B, A↓B. Equivalent to ¬(A ∨ B)',
          },
          {
            name: 'XNOR (Equivalence)',
            katexFormula: 'A \\leftrightarrow B',
            description: 'Standard: A<=>B, A↔B. Equivalent to (A ∧ B) ∨ (¬A ∧ ¬B)',
          },
          {
            name: 'Constants',
            katexFormula: '1(\\text{True}), 0(\\text{False})',
            description: 'Logical constants.',
          },
        ],
      },
      {
        id: 'derivedOperators',
        title: 'Derived Operators',
        description: 'Key properties and simplifications for XOR, XNOR, NAND, and NOR.',
        laws: [
          { name: 'XOR with 0 (Identity)', katexFormula: 'A \\oplus 0 = A' },
          { name: 'XOR with 1', katexFormula: 'A \\oplus 1 = \\lnot A' },
          { name: 'XOR with Self', katexFormula: 'A \\oplus A = 0' },
          { name: 'XOR with Complement', katexFormula: 'A \\oplus \\lnot A = 1' },
          { name: 'NAND with 0', katexFormula: 'A \\uparrow 0 = 1' },
          { name: 'NAND with 1', katexFormula: 'A \\uparrow 1 = \\lnot A' },
          { name: 'NAND with Self', katexFormula: 'A \\uparrow A = \\lnot A' },
          {
            name: 'Double NAND (¬(A ↑ B))',
            katexFormula: '\\lnot(A \\uparrow B) = A \\land B',
          },
          { name: 'NOR with 0', katexFormula: 'A \\downarrow 0 = \\lnot A' },
          { name: 'NOR with 1', katexFormula: 'A \\downarrow 1 = 0' },
          { name: 'NOR with Self', katexFormula: 'A \\downarrow A = \\lnot A' },
          {
            name: 'Double NOR (¬(A ↓ B))',
            katexFormula: '\\lnot(A \\downarrow B) = A \\lor B',
          },
          { name: 'XNOR with 1 (Identity)', katexFormula: 'A \\leftrightarrow 1 = A' },
          { name: 'XNOR with 0', katexFormula: 'A \\leftrightarrow 0 = \\lnot A' },
          { name: 'XNOR with Self', katexFormula: 'A \\leftrightarrow A = 1' },
          { name: 'XNOR with Complement', katexFormula: 'A \\leftrightarrow \\lnot A = 0' },
        ],
      },
      {
        id: 'fundamental',
        title: 'Fundamental',
        description: 'Basic properties underpinning Boolean algebra.',
        laws: [
          {
            name: 'Identity (AND)',
            katexFormula: 'A \\land 1 = A',
            description: 'A variable ANDed with true remains unchanged.',
          },
          {
            name: 'Identity (OR)',
            katexFormula: 'A \\lor 0 = A',
            description: 'A variable ORed with false remains unchanged.',
          },
          {
            name: 'Domination (AND)',
            katexFormula: 'A \\land 0 = 0',
            description: 'Anything ANDed with false is false.',
          },
          {
            name: 'Domination (OR)',
            katexFormula: 'A \\lor 1 = 1',
            description: 'Anything ORed with true is true.',
          },
          {
            name: 'Idempotence (AND)',
            katexFormula: 'A \\land A = A',
            description: 'ANDing a variable with itself yields the variable.',
          },
          {
            name: 'Idempotence (OR)',
            katexFormula: 'A \\lor A = A',
            description: 'ORing a variable with itself yields the variable.',
          },
          {
            name: 'Complementation (AND)',
            katexFormula: 'A \\land \\lnot A = 0',
            description: 'A variable ANDed with its negation is false (Contradiction).',
          },
          {
            name: 'Complementation (OR)',
            katexFormula: 'A \\lor \\lnot A = 1',
            description: 'A variable ORed with its negation is true (Tautology).',
          },
          {
            name: 'Double Negation',
            katexFormula: '\\lnot (\\lnot A) = A',
            description: 'Negating a negation returns the original variable.',
          },
        ],
      },
    ],
  },
  {
    name: 'Advanced Operations',
    categories: [
      {
        id: 'commutativeAssociative',
        title: 'Order & Grouping',
        description:
          'Laws governing the order and grouping of operations (Commutative & Associative).',
        laws: [
          { name: 'Commutative (AND)', katexFormula: 'A \\land B = B \\land A' },
          { name: 'Commutative (OR)', katexFormula: 'A \\lor B = B \\lor A' },
          {
            name: 'Associative (AND)',
            katexFormula: '(A \\land B) \\land C = A \\land (B \\land C)',
          },
          {
            name: 'Associative (OR)',
            katexFormula: '(A \\lor B) \\lor C = A \\lor (B \\lor C)',
          },
        ],
      },
      {
        id: 'distributiveAbsorption',
        title: 'Distribution & Absorption',
        description: 'Expanding, factoring, and simplifying expressions.',
        laws: [
          {
            name: 'Distributive (AND over OR)',
            katexFormula: 'A \\land (B \\lor C) = (A \\land B) \\lor (A \\land C)',
          },
          {
            name: 'Distributive (OR over AND)',
            katexFormula: 'A \\lor (B \\land C) = (A \\lor B) \\land (A \\lor C)',
          },
          { name: 'Absorption (OR)', katexFormula: 'A \\lor (A \\land B) = A' },
          { name: 'Absorption (AND)', katexFormula: 'A \\land (A \\lor B) = A' },
        ],
      },
      {
        id: 'factorization',
        title: 'Factorization',
        description: 'Factoring common terms (reverse of distribution).',
        laws: [
          {
            name: 'Factorization (AND from OR)',
            katexFormula: '(A \\land B) \\lor (A \\land C) = A \\land (B \\lor C)',
          },
          {
            name: 'Factorization (OR from AND)',
            katexFormula: '(A \\lor B) \\land (A \\lor C) = A \\lor (B \\land C)',
          },
        ],
      },
    ],
  },
  {
    name: 'Simplification Techniques',
    categories: [
      {
        id: 'redundancy',
        title: 'Redundancy',
        description: 'Laws for removing redundant terms.',
        laws: [
          {
            name: 'Redundancy (Form 1)',
            katexFormula: '(A \\land B) \\lor (A \\land \\lnot B) = A',
          },
          {
            name: 'Redundancy (Form 2)',
            katexFormula: '(A \\lor B) \\land (A \\lor \\lnot B) = A',
          },
        ],
      },
      {
        id: 'deMorganConsensus',
        title: 'De Morgan & Consensus',
        description: 'Advanced simplification techniques.',
        laws: [
          {
            name: "De Morgan's (AND)",
            katexFormula: '\\lnot (A \\land B) = \\lnot A \\lor \\lnot B',
          },
          {
            name: "De Morgan's (OR)",
            katexFormula: '\\lnot (A \\lor B) = \\lnot A \\land \\lnot B',
          },
          {
            name: 'Consensus (OR form)',
            katexFormula:
              '(A \\land B) \\lor (\\lnot A \\land C) \\lor (B \\land C) = (A \\land B) \\lor (\\lnot A \\land C)',
          },
          {
            name: 'Consensus (AND form)',
            katexFormula:
              '(A \\lor B) \\land (\\lnot A \\lor C) \\land (B \\lor C) = (A \\lor B) \\land (\\lnot A \\lor C)',
          },
        ],
      },
    ],
  },
]

// Flatten all categories for content lookup
export const allCategories = groupedGuideContent.flatMap(group => group.categories)
