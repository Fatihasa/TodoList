import { jest } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)), // Default değer olarak null döndür
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Expo Font Mock
//jest.mock('expo-font', () => ({
//  loadAsync: jest.fn().mockResolvedValue(true),
//}));

// Expo App Loading Mock
jest.mock('expo-app-loading', () => 'AppLoading');

// Gesture Handler Mock
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  Swipeable: jest.fn(),
  Directions: {
    RIGHT: 'RIGHT',
    LEFT: 'LEFT',
  },
}));

// Reanimated Mock
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn().mockReturnValue({ value: 0 }),
  useAnimatedStyle: jest.fn().mockReturnValue({}),
  withSpring: jest.fn(),
  withTiming: jest.fn(),
  Easing: {
    linear: jest.fn(),
  },
}));

// Draggable FlatList Mock
jest.mock('react-native-draggable-flatlist', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ renderItem, data }) => {
    return data.map((item, index) => renderItem({ item, index }));
  }),
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn();
});

//jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => {
//  return jest.fn();
//});



