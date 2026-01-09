const config = {
  '*.{js,jsx,ts,tsx,mjs}': ['eslint --fix --max-warnings=-1', 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
  '*.{ts,tsx}': () => 'pnpm typecheck',
};

export default config;
