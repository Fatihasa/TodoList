module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-picker|@react-native-community|@react-native-async-storage|react-native-reanimated|react-native-gesture-handler|react-native-draggable-flatlist|@react-native/virtualized-lists)/)',
  ],
  testPathIgnorePatterns: ['<rootDir>/helpers.js'], // helpers.js hariç tutuldu
};
