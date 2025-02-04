#!/bin/bash
set -e  # Exit on error

# Configuration
CONTAINER_USER="bun"
DATA_DIR="src/data"
REQUIRED_FILES=("users.jsonl" "events.jsonl")

echo "Pulling latest changes..."
git pull

# Generate a secure random string for SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32)

# Get container user UID from Dockerfile
CONTAINER_UID=$(grep -r "USER ${CONTAINER_USER}" Dockerfile >/dev/null && \
                id -u ${CONTAINER_USER} 2>/dev/null || echo "1000")

echo "Checking data directory permissions..."
# Ensure data directory exists and has correct permissions
if [ ! -d "${DATA_DIR}" ]; then
    echo "Error: ${DATA_DIR} directory does not exist"
    exit 1
fi

# Check and fix permissions if running with sufficient privileges
if [ "$(id -u)" -eq 0 ] || command -v sudo >/dev/null 2>&1; then
    SUDO_CMD=""
    if [ "$(id -u)" -ne 0 ]; then
        SUDO_CMD="sudo"
    fi
    
    if [ "$(stat -c '%u' ${DATA_DIR})" != "${CONTAINER_UID}" ]; then
        echo "Fixing directory ownership..."
        $SUDO_CMD chown -R "${CONTAINER_UID}:${CONTAINER_UID}" "${DATA_DIR}"
        $SUDO_CMD chmod 755 "${DATA_DIR}"
    fi

    # Check and fix file permissions
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "${DATA_DIR}/${file}" ] && [ "$(stat -c '%u' ${DATA_DIR}/${file})" != "${CONTAINER_UID}" ]; then
            echo "Fixing ${file} permissions..."
            $SUDO_CMD chown "${CONTAINER_UID}:${CONTAINER_UID}" "${DATA_DIR}/${file}"
            $SUDO_CMD chmod 644 "${DATA_DIR}/${file}"
        fi
    done
else
    echo "Warning: Running without root privileges. Permission fixes may fail."
fi

echo "Building and deploying application..."
SESSION_SECRET=$SESSION_SECRET docker-compose up -d --build