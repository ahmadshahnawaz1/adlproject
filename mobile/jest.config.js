/** Jest configuration — lightweight ts-jest for the pure logic engines. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__tests__/mocks/asyncStorage.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};