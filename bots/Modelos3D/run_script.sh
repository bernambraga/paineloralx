#!/bin/bash

# Caminho para o ambiente virtual
VENV_PATH="/home/oralx/paineloralx/dev_venv"

# Caminho para o script Python baseado no local do script.sh
SCRIPT_PATH="$(dirname "$BASH_SOURCE")/script.py"

# Ativar o ambiente virtual
source "$VENV_PATH/bin/activate"

# Executar o script Python
python "$SCRIPT_PATH"

# Desativar o ambiente virtual (opcional)
deactivate
