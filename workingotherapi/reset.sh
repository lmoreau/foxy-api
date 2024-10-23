#!/bin/bash

# Kill the process running on port 7071
kill -9 $(lsof -ti:7071)

# Start the Azure Functions CLI
func start
