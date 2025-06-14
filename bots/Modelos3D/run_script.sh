#!/bin/bash

# Caminho absoluto dentro do container
SCRIPT_PATH="$(dirname "$0")/script.py"

# Executa o script diretamente (sem venv)
python "$SCRIPT_PATH"
