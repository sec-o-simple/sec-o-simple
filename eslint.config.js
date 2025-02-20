import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierPlugin from 'eslint-plugin-prettier'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import tailwind from 'eslint-plugin-tailwindcss'

export default [
  {
    // Flat config: ignore patterns
    ignores: ['node_modules/', '.DS_Store', 'dist/'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    // Language options (ES Modules, JSX)
    languageOptions: {
      ecmaVersion: 2021, // ES2021 syntax support
      sourceType: 'module',
      globals: {
        window: 'readonly', // For browser-based globals
        document: 'readonly',
        Edit: 'writable',
        console: 'writable',
        _: 'writable',
        $: 'writable',
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },

    // Plugins to be used
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
      '@typescript-eslint': typescriptEslint,
      'react-refresh': reactRefreshPlugin,
      import: importPlugin,
    },

    // ESLint rule configurations (extends equivalent in Flat Config)
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
    },

    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
  ...tailwind.configs['flat/recommended'],
]
