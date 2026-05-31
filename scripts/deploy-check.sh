#!/bin/bash
# ============================================================
# Khibra Platform Pre-Deployment Verification Script
# ============================================================

echo "===================================================="
echo "🛡️ Starting pre-deployment verification check..."
echo "===================================================="

# 1. TypeScript Type Verification (npx tsc --noEmit)
echo "🔍 [1/2] Running TypeScript compiler verification (npx tsc --noEmit)..."
npx tsc --noEmit
TSC_STATUS=$?

if [ $TSC_STATUS -ne 0 ]; then
  echo "===================================================="
  echo "❌ Error: TypeScript compilation check failed!"
  echo "Please resolve compilation errors before pushing."
  echo "===================================================="
  exit 1
fi
echo "✅ TypeScript check passed (zero compilation errors)."
echo ""

# 2. Production Bundle Verification (npm run build)
echo "📦 [2/2] Compiling production build bundle (npm run build)..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo "===================================================="
  echo "❌ Error: Production build packaging failed!"
  echo "Please check bundle compiler logs for details."
  echo "===================================================="
  exit 1
fi
echo "✅ Production build compiled successfully."
echo ""

echo "===================================================="
echo "🎉 SUCCESS: All pre-deployment quality checks passed!"
echo "Your copy is verified and ready for production launch."
echo "===================================================="
exit 0
