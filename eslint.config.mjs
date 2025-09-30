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
    ignores: [
      '**/src/components/ui/**',
      '**/src/components/magicui/**',
      '**/src/components/shadcn-io/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/public/**',
    ],
  },
  {
    name: 'react-19-optimizations',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-array-index-key': 'warn',
      'react/jsx-no-constructed-context-values': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    settings: {
      react: {
        version: '19.0.0',
      },
    },
  },
]

export default eslintConfig
