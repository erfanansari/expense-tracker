/** @type {import("prettier").Config} */
const config = {
  // Basic formatting
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  // Plugins
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],

  // Import sorting - respects path alias structure
  importOrder: [
    '^(node:)',
    '^react$',
    '^react-dom',
    '^next',
    '<THIRD_PARTY_MODULES>',
    '^@types$',
    '^@types/(.*)$',
    '^@schemas$',
    '^@schemas/(.*)$',
    '^@configs$',
    '^@constants$',
    '^@core/(.*)$',
    '^@actions/(.*)$',
    '^@features/(.*)$',
    '^@components/(.*)$',
    '^@hooks/(.*)$',
    '^@storages/(.*)$',
    '^@stores/(.*)$',
    '^@utils$',
    '^@utils/(.*)$',
    '^@styles/(.*)$',
    '^@/(.*)$',
    '^[.][.]/(.*)$',
    '^[.]/(.*)$',
    '^.+\\.css$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
};

export default config;
