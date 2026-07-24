#!/bin/bash
# ============================================================================
# Nexora Cloud — GitHub Push Helper
# ============================================================================
# This script prepares your local repository and pushes it to GitHub.
#
# PREREQUISITES:
#   1. Create a new GitHub repository at https://github.com/new
#      - Name: platform (or your preferred name)
#      - Visibility: Private (recommended) or Public
#      - DO NOT initialize with README/license (we have our own)
#
#   2. Authenticate with GitHub:
#      Option A: Use a Personal Access Token (PAT)
#        - Create at https://github.com/settings/tokens (classic) or
#          https://github.com/settings/personal-access-tokens (fine-grained)
#        - Required scopes: repo, workflow, write:packages
#        - Then run: git remote set-url origin https://USERNAME:TOKEN@github.com/USERNAME/REPO.git
#
#      Option B: Use GitHub CLI (recommended)
#        - Install: https://cli.github.com/
#        - Run: gh auth login
#
# USAGE:
#   chmod +x scripts/push-to-github.sh
#   ./scripts/push-to-github.sh
# ============================================================================

set -e

echo "┌──────────────────────────────────────────────────────────────────────────┐"
echo "│           Nexora Cloud — GitHub Push Helper                                │"
echo "└──────────────────────────────────────────────────────────────────────────┘"

# ---- 1. Verify we're in a git repo ----
if [ ! -d .git ]; then
  echo "❌ Not in a git repository. Run from project root."
  exit 1
fi

# ---- 2. Get GitHub username and repo name ----
echo ""
echo "📝 Step 1: Configure your GitHub repository"
echo "   (Find your username at https://github.com/settings/profile)"
read -p "   GitHub username: " GH_USERNAME
read -p "   Repository name (default: platform): " GH_REPO
GH_REPO=${GH_REPO:-platform}

REMOTE_URL="https://github.com/$GH_USERNAME/$GH_REPO.git"
echo ""
echo "   → Repository URL: $REMOTE_URL"

# ---- 3. Update git remote ----
echo ""
echo "📝 Step 2: Updating git remote..."
if git remote get-url origin > /dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
  echo "   ✓ Updated origin to $REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
  echo "   ✓ Added origin: $REMOTE_URL"
fi

# ---- 4. Verify authentication ----
echo ""
echo "📝 Step 3: Verifying GitHub authentication..."
echo "   (You may be prompted for credentials)"

# Try to list branches (this will trigger auth if needed)
if ! git ls-remote --heads origin > /dev/null 2>&1; then
  echo ""
  echo "❌ Authentication failed. Please authenticate first:"
  echo ""
  echo "   Option A: Install GitHub CLI and run 'gh auth login'"
  echo "   Option B: Create a Personal Access Token at:"
  echo "             https://github.com/settings/tokens"
  echo "             Required scopes: repo, workflow, write:packages"
  echo "             Then run:"
  echo "             git remote set-url origin https://$GH_USERNAME:TOKEN@github.com/$GH_USERNAME/$GH_REPO.git"
  echo ""
  exit 1
fi
echo "   ✓ Authentication OK"

# ---- 5. Verify branch ----
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "📝 Step 4: Current branch: $CURRENT_BRANCH"

# ---- 6. Push to GitHub ----
echo ""
echo "📝 Step 5: Pushing to GitHub..."
echo "   (This may take a few minutes for the first push)"
echo ""

if git push -u origin "$CURRENT_BRANCH" 2>&1; then
  echo ""
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│  ✅ Successfully pushed to GitHub!                                        │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo ""
  echo "   Repository: $REMOTE_URL"
  echo ""
  echo "   Next steps:"
  echo "     1. Visit your repo on GitHub"
  echo "     2. Settings → Secrets → Add repository secrets:"
  echo "        - GITHUB_TOKEN (auto-provided, no action needed)"
  echo "     3. Actions tab → verify CI pipeline is running"
  echo "     4. (Optional) Settings → Branches → Add branch protection for 'main'"
  echo "     5. (Optional) Create a release to trigger Docker image publish"
  echo ""
else
  echo ""
  echo "❌ Push failed. Common issues:"
  echo "   - Repository doesn't exist (create at https://github.com/new)"
  echo "   - Authentication expired (re-run 'gh auth login')"
  echo "   - Network connectivity"
  echo ""
fi
