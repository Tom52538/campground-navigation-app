#!/bin/bash
set -e

echo "Starting production server..."
NODE_ENV=production tsx server/index.ts