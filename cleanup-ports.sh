
#!/bin/bash

# Kill any processes using port 5000
echo "🧹 Cleaning up port 5000..."

# Try multiple approaches to kill processes on port 5000
fuser -k 5000/tcp 2>/dev/null || true
pkill -f "tsx.*server" 2>/dev/null || true  
pkill -f "node.*server" 2>/dev/null || true
pkill -f "node.*5000" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 1

echo "✅ Port cleanup complete"
