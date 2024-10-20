#!/bin/bash

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port)
    if [ -n "$pids" ]; then
        echo "Killing processes on port $port:"
        echo $pids
        kill -9 $pids
        echo "Processes on port $port have been terminated."
    else
        echo "No processes found on port $port."
    fi
}

# Kill processes on port 3000
kill_port 3000

# Kill processes on port 7071
kill_port 7071

echo "Script execution completed."
