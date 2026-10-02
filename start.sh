#!/bin/bash
# ChronoFlow Quick Launch Script for macOS

echo "Starting ChronoFlow Ultradian Studio..."
cd "$(dirname "$0")"

# Start the node server in background
node server.js &
SERVER_PID=$!

# Wait for server to bind
sleep 1.5

# Open browser to ChronoFlow Studio
echo "Opening ChronoFlow in your default browser..."
open "http://localhost:3333"

# Wait on server process
wait $SERVER_PID
