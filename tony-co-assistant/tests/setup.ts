import { jest } from '@jest/globals';

// Test setup configuration
Object.defineProperty(process.env, 'TEST_MODE', { value: 'true', writable: true });
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test cleanup
afterEach(async () => {
  // Clear any remaining timers
  jest.clearAllTimers();
  
  // Clear any remaining intervals
  const intervals = (global as any).__INTERVALS__ || [];
  intervals.forEach((interval: NodeJS.Timeout) => clearInterval(interval));
  (global as any).__INTERVALS__ = [];
  
  // Clear any remaining timeouts
  const timeouts = (global as any).__TIMEOUTS__ || [];
  timeouts.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout));
  (global as any).__TIMEOUTS__ = [];
});

// Global test teardown
afterAll(async () => {
  // Clean up any remaining resources
  jest.clearAllTimers();
});

// Mock console methods in tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Only show console output for errors in tests
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = originalConsoleError; // Keep error logging
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}); 