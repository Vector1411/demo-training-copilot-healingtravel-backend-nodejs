#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}" # expected format: username/repo
FORCE_REMOVE=false
PRIVATE=false

SECRET_FILE="fir-github-copilot-training-firebase-adminsdk-fbsvc-c97b2d5b63.json"

usage() {
  cat <<EOF
Usage: $0 <owner/repo> [--private] [--force-remove]

Creates the GitHub repo (using gh if available) and safely pushes this project to the remote
on branch "main". It will refuse to push if the Firebase service account JSON is tracked,
unless you pass --force-remove which will untrack the file and commit the change.

Examples:
  $0 your-username/demo-training-copilot-healingtravel-backend-nodejs
  $0 your-username/demo-training-copilot-healingtravel-backend-nodejs --force-remove

Requirements:
  - git installed and configured
  - optional: gh (GitHub CLI) installed and authenticated (recommended)

NOTE: This script cannot create the GitHub repo without credentials. If you don't have `gh`,
      create the empty repo on GitHub first and then run this script.
EOF
  exit 1
}

if [[ -z "$REPO" ]]; then
  usage
fi

for arg in "$@"; do
  if [[ "$arg" == "--force-remove" ]]; then
    FORCE_REMOVE=true
  fi
  if [[ "$arg" == "--private" ]]; then
    PRIVATE=true
  fi
done

# Ensure .gitignore contains secret (best-effort)
if ! grep -qF "$SECRET_FILE" .gitignore 2>/dev/null; then
  echo "Adding $SECRET_FILE to .gitignore"
  printf "%s\n" "$SECRET_FILE" >> .gitignore
  git add .gitignore || true
  # Do not auto-commit .gitignore change; will be included in next commit
fi

# Init git if needed
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Initializing git repository"
  git init
fi

# Check if secret file is tracked
if git ls-files --error-unmatch "$SECRET_FILE" >/dev/null 2>&1; then
  echo "WARNING: $SECRET_FILE is tracked in git history (this is a secret)."
  if [[ "$FORCE_REMOVE" == true ]]; then
    echo "Removing $SECRET_FILE from index and committing the change..."
    git rm --cached "$SECRET_FILE"
    git commit -m "chore: remove firebase service account from tracking" || true
  else
    echo "Refusing to push while the secret is tracked. Rerun with --force-remove to untrack and continue, or remove the file manually."
    exit 2
  fi
fi

# Make initial commit if no commits exist
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Creating initial commit"
  git add .
  git commit -m "chore: initial commit - import project for demo training"
else
  echo "Repository already has commits"
fi

# Ensure branch is main
git branch -M main

# Remote setup: try gh first
if command -v gh >/dev/null 2>&1; then
  echo "gh CLI found. Attempting to create repo $REPO (if it doesn't exist) and set remote..."
  if [[ "$PRIVATE" == true ]]; then
    gh repo create "$REPO" --private --source=. --remote=origin --confirm || true
  else
    gh repo create "$REPO" --public --source=. --remote=origin --confirm || true
  fi
else
  echo "gh CLI not found. Ensure repository '$REPO' exists on GitHub and set the remote manually."
  REMOTE_URL="https://github.com/$REPO.git"
  if git remote get-url origin >/dev/null 2>&1; then
    echo "Remote 'origin' already exists: $(git remote get-url origin)"
  else
    git remote add origin "$REMOTE_URL"
    echo "Added remote origin -> $REMOTE_URL"
  fi
fi

# Push to main
echo "Pushing to origin main..."
git push -u origin main

echo "Done. Repository pushed to origin/main."

echo "Reminder: If the secret was ever pushed to a public remote, rotate the service account keys immediately."
