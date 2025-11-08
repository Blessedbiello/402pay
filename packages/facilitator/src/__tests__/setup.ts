/**
 * Jest setup file
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SOLANA_NETWORK = 'devnet';
process.env.VALID_API_KEYS = 'test_key_1,test_key_2';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

// Mock external dependencies if needed
jest.setTimeout(30000); // 30 second timeout for blockchain calls
