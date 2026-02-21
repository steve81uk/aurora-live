import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Treat _-prefixed identifiers as intentionally unused (standard TS convention)
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Large codebase - treat explicit any as a warning rather than error
      '@typescript-eslint/no-explicit-any': 'warn',
      // react-refresh - warn only for non-component exports
      'react-refresh/only-export-components': 'warn',
      // New react-hooks v7 strict rules - warn level for existing Three.js/WebGL code
      // These rules flag common Three.js mutation patterns as errors, which is too strict
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
      // Standard JS rules - warn only
      'prefer-const': 'warn',
      'no-empty': 'warn',
    },
  },
])
