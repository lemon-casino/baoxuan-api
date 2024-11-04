#!/bin/bash

# Check if the mode parameter is supplied
if [ -z "$1" ]; then
    echo "Usage: $0 [prod|start]"
    exit 1
fi

# Get the run mode (prod or start)
MODE=$1

# Specify the port number
PORT=9999

# Find the ID of the process occupying the specified port
PIDS=$(lsof -t -i :$PORT)

# Check if any processes are found
if [ -z "$PIDS" ]; then
    echo "No process is using port $PORT."
else
    echo "Terminating processes using port $PORT: $PIDS"
    # Terminate processes
    kill -9 $PIDS
    echo "Processes terminated."
fi

# Make sure the logs directory exists
mkdir -p logs

# Backup previous nohup.out files
if [ -f logs/nohup.out ]; then
    # Find the highest suffix number
    for file in logs/nohup*.out; do
        if [[ $file =~ nohup([0-9]+)\.out ]]; then
            num=${BASH_REMATCH[1]}
            if (( num >= max )); then
                max=$num
            fi
        fi
    done
    # Increment the max number for the new backup
    new_num=$((max + 1))
    mv logs/nohup.out logs/nohup$new_num.out
    echo "Backup created: logs/nohup$new_num.out"
fi

# Select the startup command based on mode
if [ "$MODE" = "prod" ]; then
    echo "Starting in production mode..."
    nohup npm run prod > logs/nohup.out 2>&1 &
else
    echo "Starting in development mode..."
    nohup npm run start > logs/nohup.out 2>&1 &
fi

echo "Process started with nohup. Check logs/nohup.out for output."
