# Set up paths
LIVE_DIR="/var/www/off-market.lu"
BUILD_DIR="$LIVE_DIR/tmp"

# Step 1: Delete the temporary build directory to avoid conflicts
echo "[deploy2prod] Deleting the temporary build directory..."
rm -rf $BUILD_DIR/* || { echo "[deploy2prod] Failed to delete temporary build directory (1)"; exit 1; }
rm -rf $BUILD_DIR || { echo "[deploy2prod] Failed to delete temporary build directory (2)"; exit 1; }

# Step 2: Create the temporary build directory if it doesn't exist
if [ ! -d "$BUILD_DIR" ]; then
  echo "[deploy2prod] Creating temporary build directory..."
  mkdir -p $BUILD_DIR
else
  echo "[deploy2prod] Temporary build directory already exists."
fi

# Step 3: Pull the latest code into the live directory (to update the latest version)
echo "[deploy2stage] Pulling latest code into the live directory..."
cd $LIVE_DIR || { echo "[deploy2stage] Failed to switch to live directory"; exit 1; }
git fetch --all || { echo "[deploy2stage] Failed to fetch from repository"; exit 1; }
git checkout develop || { echo "[deploy2stage] Failed to checkout develop"; exit 1; }
git pull origin develop || { echo "[deploy2stage] Failed to pull latest changes"; exit 1; }

# Step 4: Copy the current codebase to the temporary build directory (excluding .git, tmp, and other unnecessary files)
echo "[deploy2stage] Copying files from live directory to temporary build directory..."
rsync -a --exclude='.git' --exclude='tmp' --exclude='.next' $LIVE_DIR/ $BUILD_DIR/ || { echo "[deploy2stage] rsync failed"; exit 1; }

# Step 5: Build the project in the temporary build directory
echo "[deploy2stage] Starting the build process in the temporary build directory..."
cd $BUILD_DIR || { echo "[deploy2stage] Failed to switch to build directory"; exit 1; }
npm ci || { echo "[deploy2stage] Failed to install dependencies"; exit 1; }
npm run build || { echo "[deploy2stage] Build failed"; exit 1; }

# Step 6: Verify the build directory is not empty before syncing
if [ "$(ls -A $BUILD_DIR)" ]; then
  echo "[deploy2stage] Build directory is populated, syncing files to live directory..."

  # Sync the new build files to the live directory, excluding tmp and .git
  rsync -a --exclude='tmp' --exclude='.git' $BUILD_DIR/ $LIVE_DIR/ || { echo "[deploy2stage] rsync failed"; exit 1; }

  echo "[deploy2stage] Reloading PM2 to apply the new release..."
  pm2 reload off-market-lu --cwd $LIVE_DIR --silent --wait-ready --listen-timeout 3000 || { echo "[deploy2stage] Failed to reload PM2"; exit 1; }

  echo "[deploy2stage] Deleting the temporary build directory..."
  rm -rf $BUILD_DIR/* || { echo "[deploy2stage] Failed to delete temporary build directory (1)"; exit 1; }
  rm -rf $BUILD_DIR || { echo "[deploy2stage] Failed to delete temporary build directory (2)"; exit 1; }

else
  echo "[deploy2stage] Error: Build directory is empty. Aborting deployment."
  exit 1
fi

echo "[deploy2stage] Deployment successful!"
