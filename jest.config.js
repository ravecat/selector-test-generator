module.exports = {
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  testMatch: [
    '<rootDir>/**/__test__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/?(*.)(spec|test).{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'node',
  testURL: 'http://localhost',
  moduleDirectories: ['node_modules'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  moduleFileExtensions: ['web.js', 'js', 'json', 'web.jsx', 'jsx', 'node', 'mjs'],
  modulePaths: ['<rootDir>/src'],
};
