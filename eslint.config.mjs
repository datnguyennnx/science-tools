import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  ...compat.config({
    extends: ['prettier'],
  }),
  {
    ignores: ['/src/components/ui/*.tsx', '.next', 'node_modules', 'public'],
  },
  // Add custom rules for React 19 optimizations
  {
    name: 'react-19-optimizations',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // React 19 specific optimizations
      'react/react-in-jsx-scope': 'off', // React 19 doesn't require React import for JSX
      'react/jsx-uses-react': 'off', // Optimize for the new JSX transform
      'react/prop-types': 'off', // Use TypeScript instead of PropTypes
      // Add modern React rules to encourage best practices
      'react-hooks/exhaustive-deps': 'warn', // Prevent stale closures in hooks
      // Performance-related rules
      'react/no-array-index-key': 'warn', // Avoid using array indexes as keys
      'react/jsx-no-constructed-context-values': 'warn', // Prevent inline objects in context providers
    },
    settings: {
      react: {
        version: '19.0.0', // Set React version to 19
      },
    },
  },
]

export default eslintConfig
