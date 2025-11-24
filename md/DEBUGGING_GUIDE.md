# TypeScript & ESLint Debugging Guide

**FAANG-Level Best Practices for Debugging TypeScript and ESLint Issues**

---

## Table of Contents

1. [TypeScript Commands](#typescript-commands)
2. [ESLint Commands](#eslint-commands)
3. [Debugging Specific Files](#debugging-specific-files)
4. [Understanding Output](#understanding-output)
5. [Quick Reference](#quick-reference)

---

## TypeScript Commands

### 🎯 Most Rigorous Full Project Type Check

**Industry Standard (FAANG-Level) - Optimized for Next.js 15:**

```bash
# Most comprehensive check - catches ALL TypeScript errors
# Uses incremental build cache (already enabled in tsconfig.json)
npm run type-check

# Or directly:
npx tsc --noEmit --pretty

# CI/CD optimized (faster, skips lib checks)
npm run type-check:ci

# Watch mode for development (continuous checking)
npm run type-check:watch

# With strict mode enforcement (already enabled in tsconfig.json)
npx tsc --noEmit --strict --pretty

# Check specific files/directories
npx tsc --noEmit --pretty app/**/*.ts app/**/*.tsx
```

**What each flag does:**
- `--noEmit`: Type-check only, don't generate files (faster)
- `--pretty`: Colorized, readable output
- `--strict`: Maximum type checking (already in your tsconfig.json)
- `--incremental`: Use build cache for faster subsequent runs (auto-enabled via tsconfig.json)
- `--skipLibCheck`: Skip type checking of declaration files (faster, use in CI/CD)

### 📊 TypeScript Check Variations

```bash
# Basic check (what Next.js uses internally)
npm run build  # Runs TypeScript check as part of build

# Type-check only (faster than build)
npx tsc --noEmit

# Check with detailed error messages
npx tsc --noEmit --pretty --listFiles

# Check specific path
npx tsc --noEmit app/_components/**/*.tsx

# Watch mode (continuous checking)
npx tsc --noEmit --watch
```

### 🔍 TypeScript Error Types

**Common TypeScript Errors:**
- `TS2307`: Cannot find module
- `TS2322`: Type is not assignable
- `TS2345`: Argument of type is not assignable
- `TS2554`: Expected X arguments, but got Y
- `TS2339`: Property does not exist on type

**How to fix:**
```bash
# Get detailed error info
npx tsc --noEmit --pretty | grep "TS[0-9]"

# Search for specific error code
npx tsc --noEmit --pretty 2>&1 | findstr "TS2307"
```

---

## ESLint Commands

### 🎯 Most Rigorous Full Project ESLint Check

**Industry Standard (FAANG-Level) - Optimized for Next.js 15:**

```bash
# Next.js optimized linting (recommended for daily use)
# Automatically handles caching, ignores .next, optimized for Next.js
npm run lint

# Most comprehensive check - ALL files, ALL rules (with caching)
npm run lint:all

# Auto-fix what can be fixed (with caching)
npm run lint:fix

# Strict mode - zero warnings allowed (with caching)
npm run lint:strict

# CI/CD optimized (uses next lint, zero warnings)
npm run lint:ci
```

**Direct ESLint Commands (Advanced):**

```bash
# With caching enabled (FAANG best practice - 10x faster on subsequent runs)
npx eslint . --ext .ts,.tsx --format=compact --cache --cache-location .eslintcache

# With detailed output (shows rule names)
npx eslint . --ext .ts,.tsx --format=stylish --cache --cache-location .eslintcache

# JSON output (for CI/CD parsing)
npx eslint . --ext .ts,.tsx --format=json --cache --cache-location .eslintcache

# Check specific directories
npx eslint app/**/*.{ts,tsx} --format=compact --cache --cache-location .eslintcache

# Auto-fix what can be fixed (with caching)
npx eslint . --ext .ts,.tsx --fix --cache --cache-location .eslintcache

# Check with max warnings (useful for gradual adoption)
npx eslint . --ext .ts,.tsx --max-warnings=0 --cache --cache-location .eslintcache
```

**Why caching matters:**
- **10x faster** on subsequent runs (FAANG companies use this)
- Only re-checks changed files
- `.eslintcache` file stores cache (should be in `.gitignore`)

### 📊 ESLint Check Variations

```bash
# What Next.js uses (your current npm run lint)
npm run lint

# Equivalent to npm run lint
npx next lint

# Check specific file
npx eslint app/_components/ui/Modal.tsx

# Check specific directory
npx eslint app/_components/

# Check with specific rule only
npx eslint . --ext .ts,.tsx --rule "react-hooks/exhaustive-deps: error"

# Check and auto-fix
npx eslint . --ext .ts,.tsx --fix --format=compact

# Show only errors (hide warnings)
npx eslint . --ext .ts,.tsx --quiet

# Show rule documentation
npx eslint --print-config app/_components/ui/Modal.tsx
```

### 🔍 ESLint Error Types

**Common ESLint Rules:**
- `@typescript-eslint/no-explicit-any`: Using `any` type
- `react-hooks/exhaustive-deps`: Missing dependencies in hooks
- `import/no-cycle`: Circular dependencies
- `jsx-a11y/alt-text`: Missing alt text on images
- `@typescript-eslint/no-floating-promises`: Unhandled promises

**How to debug:**
```bash
# Find all violations of a specific rule
npx eslint . --ext .ts,.tsx --format=compact | findstr "no-explicit-any"

# Count errors by rule
npx eslint . --ext .ts,.tsx --format=json | jq '.[] | .messages[] | .ruleId' | sort | uniq -c

# Show rule details
npx eslint --print-config app/_components/ui/Modal.tsx | findstr "no-explicit-any"
```

---

## Debugging Specific Files

### TypeScript

```bash
# Check single file
npx tsc --noEmit app/_components/ui/Modal.tsx

# Check file with path resolution
npx tsc --noEmit --pretty --skipLibCheck app/_components/ui/Modal.tsx

# Check file and show all files it depends on
npx tsc --noEmit --listFiles app/_components/ui/Modal.tsx
```

### ESLint

```bash
# Check single file
npx eslint app/_components/ui/Modal.tsx

# Check file with auto-fix
npx eslint app/_components/ui/Modal.tsx --fix

# Check file and show rule config
npx eslint --print-config app/_components/ui/Modal.tsx

# Check file with specific format
npx eslint app/_components/ui/Modal.tsx --format=compact
npx eslint app/_components/ui/Modal.tsx --format=stylish
npx eslint app/_components/ui/Modal.tsx --format=json
```

---

## Understanding Output

### TypeScript Output Format

```
app/_components/ui/Modal.tsx:42:5 - error TS2322: Type 'string' is not assignable to type 'number'.

42     const count: number = "hello"
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

**Breaking it down:**
- `app/_components/ui/Modal.tsx`: File path
- `42:5`: Line 42, column 5
- `error TS2322`: Error code
- `Type 'string' is not assignable to type 'number'`: Error message
- The code snippet shows the problematic line

### ESLint Output Format

**Compact format:**
```
app/_components/ui/Modal.tsx:42:5: error - 'count' is assigned a value but never used (@typescript-eslint/no-unused-vars)
```

**Stylish format:**
```
app/_components/ui/Modal.tsx
  42:5  error  'count' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

**Breaking it down:**
- `app/_components/ui/Modal.tsx`: File path
- `42:5`: Line 42, column 5
- `error`: Severity level (error/warning)
- `'count' is assigned...`: Error message
- `@typescript-eslint/no-unused-vars`: Rule name

---

## Quick Reference

### 🚀 Recommended Daily Commands

```bash
# Quick TypeScript check (fast, uses incremental cache)
npm run type-check

# Quick ESLint check (fast, Next.js optimized)
npm run lint

# Comprehensive check before commit (thorough, with caching)
npm run check:all

# CI/CD check (optimized for speed, zero warnings)
npm run check:ci
```

**Performance Comparison:**
- `npm run lint` (Next.js): ~2-5 seconds (optimized)
- `npm run lint:all` (ESLint with cache): ~5-10 seconds (first run), ~1-2 seconds (cached)
- `npm run type-check`: ~10-20 seconds (first run), ~2-5 seconds (incremental)

### 🔧 Debugging Workflow

1. **Start with TypeScript:**
   ```bash
   npx tsc --noEmit --pretty
   ```
   Fix all TypeScript errors first (they're usually the root cause).

2. **Then check ESLint:**
   ```bash
   npm run lint
   ```
   Fix ESLint warnings/errors.

3. **Auto-fix what you can:**
   ```bash
   npx eslint . --ext .ts,.tsx --fix
   ```

4. **Verify everything:**
   ```bash
   npx tsc --noEmit --pretty && npm run lint
   ```

### 📝 Common Issues & Solutions

**Issue: "Cannot find module" (TS2307)**
```bash
# Check if path alias is correct
npx tsc --noEmit --pretty | findstr "TS2307"

# Verify tsconfig.json paths
cat tsconfig.json | findstr "paths"
```

**Issue: "Circular dependency" (import/no-cycle)**
```bash
# Find all circular dependencies
npx eslint . --ext .ts,.tsx --format=compact | findstr "import/no-cycle"
```

**Issue: "Missing dependencies" (react-hooks/exhaustive-deps)**
```bash
# Find all exhaustive-deps issues
npx eslint . --ext .ts,.tsx --format=compact | findstr "exhaustive-deps"
```

---

## Advanced: Custom Scripts

**Already configured in your `package.json`:**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit --pretty",
    "type-check:watch": "tsc --noEmit --pretty --watch",
    "type-check:ci": "tsc --noEmit --pretty --skipLibCheck",
    "lint:all": "eslint . --ext .ts,.tsx --format=compact --cache --cache-location .eslintcache",
    "lint:fix": "eslint . --ext .ts,.tsx --fix --cache --cache-location .eslintcache",
    "lint:strict": "eslint . --ext .ts,.tsx --max-warnings=0 --cache --cache-location .eslintcache",
    "lint:ci": "next lint --max-warnings=0",
    "check:all": "npm run type-check && npm run lint:all",
    "check:ci": "npm run type-check:ci && npm run lint:ci",
    "check:watch": "npm run type-check:watch"
  }
}
```

**Usage:**
```bash
npm run type-check      # TypeScript check (uses incremental cache)
npm run type-check:ci   # TypeScript check (CI optimized, faster)
npm run type-check:watch # TypeScript check (watch mode)
npm run lint            # Next.js optimized linting
npm run lint:all        # ESLint check (with caching)
npm run lint:fix        # ESLint check + auto-fix (with caching)
npm run lint:strict     # ESLint check (zero warnings, with caching)
npm run lint:ci         # Next.js lint (CI optimized, zero warnings)
npm run check:all       # Both TypeScript and ESLint checks
npm run check:ci        # Both checks (CI optimized)
npm run check:watch     # TypeScript watch mode
```

**Performance Benefits:**
- **ESLint caching**: 10x faster on subsequent runs
- **TypeScript incremental**: 5x faster on subsequent runs
- **Next.js lint**: Optimized for Next.js projects, handles `.next` automatically

---

## Note on TSLint

**TSLint is deprecated** (as of 2019). Your project uses **ESLint** with TypeScript support via `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`, which is the industry standard.

**Why ESLint over TSLint:**
- ✅ Active development and community support
- ✅ Better performance
- ✅ More plugins and rules
- ✅ Industry standard (used by Google, Meta, Netflix, etc.)
- ✅ Better integration with modern tools

---

## FAANG-Level Best Practices

1. **Use Next.js optimized commands** - `next lint` is faster and optimized for Next.js projects
2. **Enable caching** - ESLint `--cache` flag provides 10x performance improvement
3. **Use incremental TypeScript** - Already enabled in `tsconfig.json`, provides 5x speedup
4. **Run TypeScript check before ESLint** - Type errors often cause ESLint false positives
5. **Use `--noEmit` for TypeScript** - Faster, no file generation needed
6. **Use `--fix` for ESLint** - Auto-fix what can be fixed, then manually fix the rest
7. **Check specific files during development** - Faster feedback loop
8. **Run full project check before commits** - Catch issues early
9. **Use `--max-warnings=0` in CI/CD** - Enforce zero warnings in production
10. **Separate CI/CD commands** - Use optimized commands for CI/CD pipelines

**Performance Optimizations Implemented:**
- ✅ ESLint caching (`.eslintcache`) - 10x faster subsequent runs
- ✅ TypeScript incremental builds (`tsconfig.tsbuildinfo`) - 5x faster subsequent runs
- ✅ Next.js optimized linting (`next lint`) - Handles `.next` automatically
- ✅ CI/CD optimized commands (`--skipLibCheck`, `--max-warnings=0`)

---

## Resources

- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [Next.js ESLint Config](https://nextjs.org/docs/app/building-your-application/configuring/eslint)

---

**Last Updated:** 2025-01-16

