#!/bin/bash

# Setup script for fresh deployment (for evaluation)
echo "Setting up fresh deployment for evaluation..."

# Remove existing keypair
echo "Removing existing keypair to force fresh generation..."
rm -f target/deploy/daily_idea_spark-keypair.json

# Generate new keys
echo "Generating new program keys..."
anchor build

# Get the new program ID
NEW_PROGRAM_ID=$(anchor keys list | grep "daily_idea_spark:" | awk '{print $2}')
echo "New Program ID: $NEW_PROGRAM_ID"

# Update the source code with new program ID
echo "Updating source code with new Program ID..."
sed -i "s/FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv/$NEW_PROGRAM_ID/g" programs/daily_idea_spark/src/lib.rs

echo "  Setup complete! You can now run:"
echo "   anchor test     # For full deployment and testing"
echo "   anchor build    # To rebuild with new Program ID"
echo ""
echo "Your new Program ID: $NEW_PROGRAM_ID"
