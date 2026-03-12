#!/bin/sh
set -e

ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to start..."
until ollama list > /dev/null 2>&1; do
  sleep 2
done

echo "Pulling model..."
ollama pull qwen2.5:3b

echo "Model is ready."
wait $OLLAMA_PID
