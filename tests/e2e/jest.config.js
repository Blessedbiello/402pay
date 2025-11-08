/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@402pay/shared$': '<rootDir>/../../packages/shared/src',
    '^@402pay/sdk$': '<rootDir>/../../packages/sdk/src',
  },
  testTimeout: 30000, // 30 seconds for blockchain operations
};
