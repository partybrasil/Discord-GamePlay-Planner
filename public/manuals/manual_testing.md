# Manual de Testing: Discord GamePlay Planner

Testear una Discord Activity tiene trucos porque depende de estar "dentro" de Discord. Aquí tienes 3 estrategias, desde la más fácil (Local) hasta la más real (Integrada).

## Nivel 1: Testing Local (Standalone)
Ideal para: Desarrollo rápido de UI, probar herramientas de dibujo, probar lógica de Host/Viewer sin abrir Discord.

**Cómo funciona:**
La app detecta que no está en Discord y usa un "Mock User" (Soldier) y un ID de sesión falso.

**Pasos:**
1.  **Backend (Sincronización):**
    Abre una terminal y ejecuta el servidor de WebSockets local (necesario para que funcionen los dibujos y el cursor):
    ```bash
    npx y-websocket
    ```
    *Déjala abierta.*

2.  **Frontend (App):**
    Abre otra terminal y lanza la app:
    ```bash
    npm run dev
    ```

3.  **Probar:**
    *   Abre `http://localhost:5173` en tu navegador.
    *   **Landing Screen**: Verás la nueva pantalla de bienvenida.
    *   **Crear**: Haz clic en "Create" en una ventana. Copia el código.
    *   **Unirse**: Abre otra ventana -> "Join". Pega el código.
    *   ¡Verás que ambos entran a la MISMA sala!
    
    ![Landing Visual](file:///C:/Users/Party/.gemini/antigravity/brain/75a3a59c-5588-4c3f-8095-974e44cb2c8f/landing_screen_v2_1767732245058.png)

    *   **Multiples Salas**: Abre una tercera ventana, crea una **nueva** sala. Verifica que lo que dibujas ahí NO aparece en las otras dos.

---

## Nivel 2: Testing Integrado en Discord (Tunneling)
Ideal para: Probar la integración real con el SDK de Discord, autenticación, y cómo se ve en el cliente oscuro de Discord.

**Requisito**: [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/) (Gratis y rápido).

**Pasos:**
1.  **Inicia tu App y WebSocket** (como en Nivel 1). Asegúrate de que ambas terminales corren.

2.  **Crear Túnel:**
    En una tercera terminal, expón tu puerto 5173 a internet:
    ```bash
    # Si tienes cloudflared instalado
    cloudflared tunnel --url http://localhost:5173
    ```
    *Si no tienes cloudflared, puedes usar `localtunnel` (`npx localtunnel --port 5173`), pero Cloudflare es más estable.*
    
    Copia la URL que te dan (ej. `https://rotten-bananas-leap.trycloudflare.com`).

3.  **Configurar Discord:**
    *   Ve al [Discord Developer Portal](https://discord.com/developers/applications).
    *   Ve a tu App > **Activities** > **URL Mappings**.
    *   Pega tu URL del túnel en la raíz (`/`). Guarda.

4.  **Ejecutar en Discord:**
    *   Entra a cualquier Canal de Voz en tu servidor de pruebas.
    *   Haz clic en el botón **"Actividades"** (el cohete o las formas geométricas).
    *   Busca tu App (si no sale, asegúrate de haber añadido tu cuenta como "Tester" o invitar a la app al servidor).
    *   **¡Magia!** Tu localhost ahora se ve dentro de Discord. Los cambios en código (HMR) se reflejarán casi al instante (a veces requiere cerrar y abrir la actividad).

---

## Nivel 3: Staging vs Producción (Pro Mode)
Ideal para: No romper la app que usan tus usuarios mientras desarrollas nuevas features.

**El Problema**: Si cambias la URL en el Developer Portal para poner tu túnel de desarrollo, ¡los usuarios reales dejarán de poder entrar a la versión estable!

**La Solución**: Crea **DOS Aplicaciones** en el Developer Portal.

1.  **App Principal ("Discord GamePlay Planner")**:
    *   URL Mapping: `https://tu-app-produccion.vercel.app`
    *   Esta es la que publicas en el Market.

2.  **App de Desarrollo ("Planner DEV")**:
    *   URL Mapping: `https://tu-tunel-temporal.trycloudflare.com` (o tu localhost).
    *   Solo tú y tu equipo la usáis para testear cambios locos.

**En tu Código (.env):**
Usa variables de entorno para saber qué Client ID usar.
*   `.env.development`: `VITE_DISCORD_CLIENT_ID=ID_DE_LA_APP_DEV`
*   `.env.production`: `VITE_DISCORD_CLIENT_ID=ID_DE_LA_APP_REAL`

Así, cuando haces `npm run dev`, usas la ID de pruebas. Cuando Vercel hace el build, usa la ID real.

---

## Resumen Rápido
*   **Testing Rápido de UI**: Localhost (`npm run dev` + `npx y-websocket`). Abre dos pestañas.
*   **Testing Real**: Localhost + Cloudflare Tunnel -> Discord Portal.
*   **Evitar Desastres**: Usa una segunda App en Discord solo para Dev.
