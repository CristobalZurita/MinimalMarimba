#!/usr/bin/env bash
#
# deploy.sh — Despliegue de Minimal Marimba en un VPS
#
# Uso:
#   ./deploy.sh usuario@IP_DEL_VPS
#
# Requisitos en el VPS:
#   - nginx instalado
#   - /var/www/minimalmarimba/ creado y con permisos para el usuario
#   - acceso SSH con clave o agente configurado
#

set -euo pipefail

REMOTE_HOST="${1:-}"
REMOTE_DIR="/var/www/minimalmarimba"
NGINX_AVAILABLE="/etc/nginx/sites-available/minimalmarimba"
NGINX_ENABLED="/etc/nginx/sites-enabled/minimalmarimba"

if [ -z "$REMOTE_HOST" ]; then
  echo "Uso: $0 usuario@IP_DEL_VPS"
  exit 1
fi

echo "==> Desplegando Minimal Marimba en $REMOTE_HOST:$REMOTE_DIR"

# Subir archivos estáticos (excluye .git, archivos de desarrollo y backups)
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='deploy.sh' \
  --exclude='nginx/' \
  --exclude='README-DEPLOY.md' \
  --exclude='*.md' \
  --exclude='*.sh' \
  --exclude='a.out' \
  ./ "$REMOTE_HOST:$REMOTE_DIR/"

echo "==> Subiendo configuración de nginx"
scp nginx/minimalmarimba.conf "$REMOTE_HOST:/tmp/minimalmarimba.conf"

ssh "$REMOTE_HOST" << EOF
  set -e
  echo "==> Instalando configuración de nginx"
  sudo mv /tmp/minimalmarimba.conf "$NGINX_AVAILABLE"

  if [ ! -L "$NGINX_ENABLED" ]; then
    sudo ln -s "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  fi

  echo "==> Verificando configuración"
  sudo nginx -t

  echo "==> Recargando nginx"
  sudo systemctl reload nginx || sudo service nginx reload

  echo "==> Despliegue completado"
EOF

echo "==> Listo. El sitio debería estar disponible en http://$REMOTE_HOST"
