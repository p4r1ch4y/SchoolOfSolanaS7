#!/bin/bash

# Script to run tests on local validator to avoid rate limiting

echo "🚀 Starting local Solana validator..."

# Kill any existing validator
pkill -f solana-test-validator

# Start fresh validator in background
solana-test-validator --reset --quiet &
VALIDATOR_PID=$!

# Wait for validator to be ready
echo "⏳ Waiting for validator to start..."
sleep 10

# Check if validator is running
if ! pgrep -f solana-test-validator > /dev/null; then
    echo "❌ Failed to start validator"
    exit 1
fi

echo "✅ Validator started successfully"

# Set Solana config to use localhost
solana config set --url localhost

# Run the tests
echo "🧪 Running tests..."
anchor test --skip-deploy --provider.cluster localnet

# Capture test result
TEST_RESULT=$?

# Cleanup: kill the validator
echo "🧹 Cleaning up..."
kill $VALIDATOR_PID 2>/dev/null
pkill -f solana-test-validator 2>/dev/null

# Reset Solana config back to devnet
solana config set --url devnet

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed"
fi

exit $TEST_RESULT
