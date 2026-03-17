import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@schemas$': '<rootDir>/src/@schemas/index.ts',
    '^@types$': '<rootDir>/src/@types/index.ts',
    '^@actions/(.*)$': '<rootDir>/src/actions/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@configs$': '<rootDir>/src/configs/index.ts',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@constants$': '<rootDir>/src/constants/index.ts',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@storages/(.*)$': '<rootDir>/src/storages/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@utils$': '<rootDir>/src/utils/index.ts',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};

export default config;
