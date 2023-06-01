export default {
    testEnvironment: 'node', // Specifies that the test environment is Node.js
    transform: {
      '^.+\\.tsx?$': 'ts-jest', // Uses the 'ts-jest' transformer for TypeScript files
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Specifies the file extensions to be used for modules
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$', // Specifies the pattern used to find test files
    coverageDirectory: 'coverage', // Specifies the directory where coverage reports will be saved
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'], // Specifies the files for which coverage reports will be collected, excluding declaration files
  };
  