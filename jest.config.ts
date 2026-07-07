import nextJest from 'next/jest.js';

import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const {
  default: { compilerOptions },
} = await import('./tsconfig.json', {
  with: {
    type: 'json',
  },
});

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig: Config = {
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx}'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  resetMocks: true,
};

export default createJestConfig(customJestConfig);
