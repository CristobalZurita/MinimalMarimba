# Despliegue de Minimal Marimba en VPS

Este documento explica cómo publicar el sitio en un VPS una vez que esté disponible.

## Requisitos del VPS

- Ubuntu 22.04 LTS o similar
- nginx instalado
- Acceso SSH con clave pública o usuario/contraseña
- Dominio apuntando al VPS (opcional, pero recomendado)

## Preparación del VPS

### 1. Instalar nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Crear directorio del sitio

```bash
sudo mkdir -p /var/www/minimalmarimba
sudo chown -R $USER:$USER /var/www/minimalmarimba
```

### 3. Configurar firewall (opcional)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Despliegue automático

Desde tu computadora local, dentro del repositorio:

```bash
./deploy.sh usuario@IP_DEL_VPS
```

Este script:
1. Sube todos los archivos estáticos por `rsync`.
2. Copia la configuración de nginx.
3. Activa el sitio y recarga nginx.

## Despliegue manual

Si prefieres no usar el script:

```bash
# Subir archivos
rsync -avz --delete ./ usuario@IP_DEL_VPS:/var/www/minimalmarimba/

# Copiar configuración de nginx
scp nginx/minimalmarimba.conf usuario@IP_DEL_VPS:/tmp/

# En el VPS
sudo mv /tmp/minimalmarimba.conf /etc/nginx/sites-available/minimalmarimba
sudo ln -s /etc/nginx/sites-available/minimalmarimba /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Configuración de SSL (HTTPS)

Recomendado para producción:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d minimalmarimba.cl -d www.minimalmarimba.cl
```

Certbot modificará la configuración de nginx automáticamente.

## Actualizaciones futuras

Cada vez que actualices el sitio localmente:

```bash
./deploy.sh usuario@IP_DEL_VPS
```

O, si el repositorio está clonado en el VPS:

```bash
ssh usuario@IP_DEL_VPS
cd /var/www/minimalmarimba
git pull
```

## Estructura en el VPS

```
/var/www/minimalmarimba/
├── index.html
├── home.html
├── el-proyecto.html
├── el-artista.html
├── trayectoria.html
├── evidencia/
├── archivo-digital.html
├── escenarios.html
├── obras-interpretadas.html
├── meng-amok.html
├── ficha-tecnica.html
├── contacto.html
├── assets/
├── FOTOS/
├── MM_LOGOS/
├── PDF/
└── ...
```

## Notas

- El sitio es 100% estático. No requiere base de datos ni backend.
- Los componentes (`components/header.html`, `components/footer.html`) se cargan por JavaScript vía `fetch()`, por lo que el servidor debe permitir peticiones del mismo origen.
- Si se publica en un subdirectorio (por ejemplo, `https://dominio.com/MinimalMarimba/`), es necesario ajustar `window.MM_BASE_PATH` en cada página.
