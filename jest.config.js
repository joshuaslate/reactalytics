/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@reactalytics/(.*)$': '<rootDir>/packages/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['node_modules'],
};
