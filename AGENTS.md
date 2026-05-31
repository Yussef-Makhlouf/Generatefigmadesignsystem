# Khibra QA Code Quality Guidelines & Commands

Welcome, Agent! This document outlines the standard code quality verification and type checking procedures for the **Khibra** platform. Always run these checks before marking tasks as complete, submitting plans, or initiating deployments.

---

## 1. Quality Control Commands

### ── Typechecking (TypeScript)
Always verify that your changes introduce **zero compilation errors** by running the TypeScript compiler in dry-run mode:
```bash
npx tsc --noEmit
```

### ── Code Style & Linting
Run the ESLint suite to check for style violations, unused imports, or potential bugs:
```bash
npm run lint
```
*Note: If the `lint` command is not explicitly declared as an npm script, run the raw linter command directly, or review code patterns in the changes before staging.*

---

## 2. Pre-Deployment Automation
To enforce quality checks before pushing to Vercel/Netlify or checking in, always invoke the pre-flight verification script:
```bash
./scripts/deploy-check.sh
```

This script will run:
1. `npx tsc --noEmit` - to verify type integrity.
2. `npm run build` - to verify successful bundle packaging.
