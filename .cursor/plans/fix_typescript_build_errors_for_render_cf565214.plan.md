---
name: Fix TypeScript Build Errors for Render
overview: Fix TypeScript compilation errors by ensuring type definitions are installed during build and fixing code issues like unused variables and null checks.
todos:
  - id: move-types-to-dependencies
    content: Move @types/* packages from devDependencies to dependencies in server/package.json
    status: completed
  - id: fix-coupons-controller
    content: Fix null checks and unused imports in coupons.controller.ts
    status: completed
    dependencies:
      - move-types-to-dependencies
  - id: fix-images-controller
    content: Fix ICouponImage type issue in images.controller.ts
    status: completed
    dependencies:
      - move-types-to-dependencies
  - id: fix-unused-parameters
    content: Fix unused parameters in controllers, middlewares, and index.ts
    status: completed
    dependencies:
      - move-types-to-dependencies
  - id: fix-unused-imports
    content: Remove unused imports from all affected files
    status: completed
    dependencies:
      - move-types-to-dependencies
  - id: verify-build
    content: Verify TypeScript build passes without errors
    status: in_progress
    dependencies:
      - fix-coupons-controller
      - fix-images-controller
      - fix-unused-parameters
      - fix-unused-imports
---

# Fi

x TypeScript Build Errors for Render

## Problem Analysis

The build is failing with two main categories of TypeScript errors:

1. **Missing Type Definitions**: TypeScript cannot find declaration files for `express`, `cors`, `jsonwebtoken`, and `bcrypt`, even though `@types/*` packages are in `devDependencies`
2. **TypeScript Code Issues**: Unused variables, possibly null errors, and type mismatches

## Root Cause

Render's build process may not be installing `devDependencies` properly, or the type definitions need to be in `dependencies` for the build to work. Additionally, the TypeScript configuration has strict checks enabled that catch unused variables and null safety issues.

## Solution

### 1. Move Type Definitions to Dependencies

Move `@types/*` packages from `devDependencies` to `dependencies` in [server/package.json](server/package.json) to ensure they're available during Render's build process.

### 2. Fix TypeScript Code Issues

Fix the following issues in the codebase:

- **Unused variables**: Remove or prefix with `_` unused parameters (e.g., `req`, `res`, `next`)
- **Possibly null errors**: Add null checks in [server/src/controllers/coupons.controller.ts](server/src/controllers/coupons.controller.ts) around line 276-279
- **Missing properties**: Fix the `ICouponImage` type issue in [server/src/controllers/images.controller.ts](server/src/controllers/images.controller.ts) around line 64
- **Unused imports**: Remove unused imports like `Coupon`, `User`, `Types`, `calculateStatus`, `IRefreshToken`

### 3. Update Build Command (Optional)

If needed, ensure the build command explicitly installs devDependencies, though moving types to dependencies should resolve this.

## Files to Modify

1. [server/package.json](server/package.json) - Move type definitions to dependencies
2. [server/src/controllers/coupons.controller.ts](server/src/controllers/coupons.controller.ts) - Fix null checks and unused imports
3. [server/src/controllers/images.controller.ts](server/src/controllers/images.controller.ts) - Fix ICouponImage type issue