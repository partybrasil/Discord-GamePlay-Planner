# Manual: Versión Web en GitHub Pages 🌐

**GamePlay Planner** no está limitado a Discord. También incluye una versión web completa que puedes hospedar gratuitamente en **GitHub Pages**.

Esta versión permite a usuarios fuera de Discord unirse a las sesiones de estrategia simplemente entrando a una URL y escribiendo su nombre.

## 🚀 Cómo Desplegar en GitHub Pages

### 1. Preparar el Repositorio
Asegúrate de que tu código está subido a un repositorio en GitHub (ej. `tu-usuario/Discord-GamePlay-Planner`).

### 2. Configurar el Base Path (Automático)
El sistema ahora detecta **automáticamente** el nombre del repositorio.
*   En `vite.config.ts`, la lógica `base` es dinámica.
*   En `.github/workflows/deploy.yml`, el script inyecta el nombre del repositorio automáticamente. **No necesitas editar nada**.

### 3. Deploy Automático (GitHub Actions)
La forma más fácil de desplegar es usar una GitHub Action. Crea un archivo `.github/workflows/deploy.yml` con este contenido:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: |
          export VITE_BASE_PATH="/${{ github.event.repository.name }}/"
          npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 4. Activar Pages
1.  Ve a tu repositorio en GitHub -> **Settings** -> **Pages**.
2.  En **Source**, selecciona **GitHub Actions**.
3.  Una vez corra el Action, tu web estará lista en `https://tu-usuario.github.io/Discord-GamePlay-Planner/`.

## 🖥️ Experiencia de Usuario Web

Al entrar en la versión web, la app detectará que no estás en Discord y te mostrará una pantalla de bienvenida especial.

### Paso 1: Identificación
Como no tenemos tu usuario de Discord, te pediremos un **"Commander Name"**.
*(Screenshot de la pantalla de ingreso de nombre)*

### Paso 2: Unirse o Crear
Una vez identificado, verás la pantalla estándar para crear una sala o unirte a una existente.
*(Screenshot de la pantalla Landing)*

## ⚠️ Notas Importantes
*   **Audio**: La versión web no tiene chat de voz integrado (eso es nativo de Discord). Usad Discord en segundo plano o cualquier otra app de voz.
*   **Sincronización**: Las salas creadas en Web y en Discord son compatibles entre sí si usan el mismo servidor de WebSocket.
