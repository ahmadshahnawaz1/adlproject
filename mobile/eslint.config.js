// Flat config. Expo's rules, with Prettier last so formatting never fights lint.
const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expo,
  prettier,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'content/quran/data/**'],
  },
  {
    rules: {
      // Silently swallowing a failure has bitten this codebase before.
      'no-empty': ['warn', { allowEmptyCatch: false }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      // Tests legitimately assert on values the compiler cannot narrow.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
