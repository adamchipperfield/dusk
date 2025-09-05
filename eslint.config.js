const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    files: ['assets/*.js'],
    plugins: {
      import: importPlugin,
      js,
    },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        theme: 'writable',
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@theme', './assets']],
          extensions: ['.js'],
        },
      },
    },
  },
]);
