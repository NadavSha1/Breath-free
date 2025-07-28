import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.2' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Relaxed rules for better development experience
      'react/prop-types': 'off', // Disable prop-types validation
      'react/no-unescaped-entities': 'off', // Allow unescaped entities
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn instead of error for unused vars
      'no-undef': 'off', // Disable undefined variable errors for build tools
      'no-case-declarations': 'off', // Allow case declarations
      'react/no-unknown-property': 'off', // Allow unknown properties for custom components
    },
  },
]
