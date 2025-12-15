import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

/**
 * Vitest Configuration
 * 
 * MAANG-Level: Comprehensive test configuration aligned with industry best practices.
 * Supports unit tests, integration tests, and coverage analysis.
 * 
 * **Features:**
 * - TypeScript path alias support (matches tsconfig.json)
 * - React Testing Library integration
 * - Coverage reporting with v8 provider
 * - jsdom environment for DOM testing
 * - MSW (Mock Service Worker) support
 * 
 * **Coverage Targets:**
 * - Cart Store: 95%+
 * - Quote Submission: 95%+
 * - HTTP Service: 90%+
 * - Validation Schemas: 98%+
 */
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Automatically resolves tsconfig.json path aliases
  ],
  
  test: {
    // Test environment
    environment: 'jsdom',
    globals: true,
    
    // Setup file runs before all tests
    setupFiles: ['./vitest.setup.ts'],
    
    // Test file patterns
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      '**/*.e2e.test.{ts,tsx}', // E2E tests handled by Playwright
      '**/e2e/**',
    ],
    
    // Test timeout (30 seconds for integration tests)
    testTimeout: 30000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Include patterns (source code only)
      include: [
        'app/_features/**/*.{ts,tsx}',
        'app/_shared/**/*.{ts,tsx}',
        'app/_core/**/*.{ts,tsx}',
        'app/_lib/**/*.{ts,tsx}',
      ],
      
      // Exclude patterns (tests, mocks, config files)
      exclude: [
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/test-utils/**',
        '**/__mocks__/**',
        '**/mocks/**',
        '**/index.ts', // Barrel exports
        '**/*.d.ts', // Type definitions
        '**/*.config.{ts,js}', // Config files
        '**/types/**', // Type-only files
      ],
      
      // Coverage thresholds (business-aligned targets)
      thresholds: {
        // Overall thresholds (lower bar)
        lines: 80,
        functions: 75,
        branches: 70,
        statements: 80,
        
        // Per-file thresholds (higher bar for critical paths)
        // These are warnings only, not failures
        // Critical paths should target 95%+ (enforced in CI/CD)
      },
      
      // Per-file coverage thresholds
      // Note: These are soft warnings, not hard failures
      // Hard failures would be too strict during development
    },
    
    // Watch mode configuration
    watch: false, // Disable watch mode by default (use --watch flag)
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    
    // Reporter configuration
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html',
    },
  },
  
  // Path alias resolution (matches tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@_features': path.resolve(__dirname, './app/_features'),
      '@_core': path.resolve(__dirname, './app/_core'),
      '@_lib': path.resolve(__dirname, './app/_lib'),
      '@_shared': path.resolve(__dirname, './app/_shared'),
      '@_classes': path.resolve(__dirname, './app/_classes'),
      '@_components': path.resolve(__dirname, './app/_components'),
      '@_types': path.resolve(__dirname, './app/_types'),
      '@_helpers': path.resolve(__dirname, './app/_helpers'),
      '@_scripts': path.resolve(__dirname, './app/_scripts'),
    },
  },
})
