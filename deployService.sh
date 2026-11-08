#!/bin/bash

# VitalLog CS 260 deployment script
# Deploys the Vite frontend and Express backend to AWS.

set -euo pipefail

# ----------------------------------------
# Step 1: Read deployment arguments
# ----------------------------------------

key=""
hostname=""
service=""

while getopts "k:h:s:" flag; do
    case "$flag" in
        k) key="$OPTARG" ;;
        h) hostname="$OPTARG" ;;
        s) service="$OPTARG" ;;
        *)
            echo "Usage: ./deployService.sh -k <pem-key> -h <hostname> -s <service>"
            exit 1
            ;;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    echo "ERROR: Missing required deployment arguments."
    echo "Usage: ./deployService.sh -k <pem-key> -h <hostname> -s <service>"
    exit 1
fi

if [[ ! -f "$key" ]]; then
    echo "ERROR: SSH key not found: $key"
    exit 1
fi

# Prevent unexpected paths in remote commands.
if [[ ! "$service" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "ERROR: Invalid service name."
    exit 1
fi

if [[ ! "$hostname" =~ ^[a-zA-Z0-9.-]+$ ]]; then
    echo "ERROR: Invalid hostname."
    exit 1
fi

# ----------------------------------------
# Step 2: Verify required project files
# ----------------------------------------

required_files=(
    "service/index.js"
    "service/package.json"
    "service/package-lock.json"
    "service/routes/auth.js"
    "service/routes/entries.js"
    "service/routes/friends.js"
    "service/routes/favorites.js"
    "service/routes/research.js"
    "service/middleware/auth.js"
    "service/data/store.js"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "ERROR: Missing required file: $file"
        exit 1
    fi
done

echo ""
echo "========================================"
echo " Deploying VitalLog: $service"
echo " Host: $hostname"
echo "========================================"

# ----------------------------------------
# Step 3: Build React frontend
# ----------------------------------------

echo ""
echo "----> Building React frontend"

npm ci
npm run build

# ----------------------------------------
# Step 4: Prepare deployment package
# ----------------------------------------

echo ""
echo "----> Preparing deployment package"

rm -rf build
mkdir -p build/public

# Copy compiled Vite frontend.
cp -r dist/. build/public/

# Copy backend entry point and configuration.
cp service/index.js build/
cp service/package.json build/
cp service/package-lock.json build/

# Copy Express route modules and shared files.
cp -r service/routes build/
cp -r service/middleware build/
cp -r service/data build/

echo "Deployment package prepared."

# ----------------------------------------
# Step 5: Prepare staging directory on AWS
# ----------------------------------------

echo ""
echo "----> Preparing remote staging directory"

ssh -i "$key" "ubuntu@$hostname" \
    "mkdir -p 'services/$service.staging' && rm -rf 'services/$service.staging' && mkdir -p 'services/$service.staging'"

# ----------------------------------------
# Step 6: Transfer application files
# ----------------------------------------

echo ""
echo "----> Transferring application files"

scp -r -i "$key" \
    build/. \
    "ubuntu@$hostname:services/$service.staging/"

echo "File transfer completed."

# ----------------------------------------
# Step 7: Install backend dependencies
# ----------------------------------------

echo ""
echo "----> Installing backend dependencies on AWS"

ssh -i "$key" "ubuntu@$hostname" << ENDSSH
set -e

# Load NVM (Node Version Manager).
# Required because non-interactive SSH sessions
# do not automatically initialize NVM.

export NVM_DIR="\$HOME/.nvm"

if [ -s "\$NVM_DIR/nvm.sh" ]; then
    . "\$NVM_DIR/nvm.sh"
fi

# Use the installed Node.js version.
nvm use v22.12.0

echo "Node version:"
node --version

echo "npm version:"
npm --version

cd "services/$service.staging"

# Install only production dependencies.
npm ci --omit=dev

# Verify required backend files.
test -f index.js
test -f package.json
test -f routes/auth.js
test -f routes/entries.js
test -f routes/friends.js
test -f routes/favorites.js
test -f routes/research.js
test -f middleware/auth.js
test -f data/store.js

echo "Backend dependencies installed successfully."
ENDSSH

# ----------------------------------------
# Step 8: Activate the new deployment
# ----------------------------------------

echo ""
echo "----> Activating new deployment"

ssh -i "$key" "ubuntu@$hostname" << ENDSSH
set -e

# Load NVM for PM2.
export NVM_DIR="\$HOME/.nvm"

if [ -s "\$NVM_DIR/nvm.sh" ]; then
    . "\$NVM_DIR/nvm.sh"
fi

nvm use v22.12.0

# Preserve previous deployment for rollback.
rm -rf "services/$service.previous"

if [ -d "services/$service" ]; then
    mv "services/$service" "services/$service.previous"
fi

# Activate new deployment.
mv "services/$service.staging" "services/$service"

cd "services/$service"

# Restart existing PM2 application.
NODE_ENV=production pm2 restart "$service" --update-env

echo ""
echo "PM2 status:"
pm2 status

ENDSSH

# ----------------------------------------
# Step 9: Verify backend health
# ----------------------------------------

echo ""
echo "----> Verifying backend response"

ssh -i "$key" "ubuntu@$hostname" << ENDSSH
set -e

# Load NVM for PM2 diagnostics.
export NVM_DIR="\$HOME/.nvm"

if [ -s "\$NVM_DIR/nvm.sh" ]; then
    . "\$NVM_DIR/nvm.sh"
fi

nvm use v22.12.0

success=0

# Retry to allow Node.js time to start.
for attempt in 1 2 3 4 5; do

    if curl --silent --show-error --fail \
        http://localhost:4000/ \
        > /dev/null; then

        success=1
        break
    fi

    echo "Waiting for backend (attempt \$attempt)..."
    sleep 2
done

if [ "\$success" -ne 1 ]; then
    echo ""
    echo "ERROR: Backend did not respond."
    echo "Recent PM2 logs:"
    pm2 logs "$service" --lines 30 --nostream
    exit 1
fi

echo "Backend is responding successfully."

ENDSSH

# ----------------------------------------
# Step 10: Clean up local build files
# ----------------------------------------

echo ""
echo "----> Cleaning up temporary build files"

rm -rf build dist

echo ""
echo "========================================"
echo " VitalLog deployment completed!"
echo " Website: https://$service.$hostname"
echo "========================================"
