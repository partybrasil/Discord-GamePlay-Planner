# Manual de Integración y Publicación en Discord

Este documento te guiará paso a paso para llevar tu **Discord GamePlay Planner** desde tu ordenador hasta el App Directory (Marketplace) de Discord, y cómo mantenerlo actualizado.

## Parte 1: Registro en Discord Developer Portal

### 1. Crear la Aplicación
1.  Ve al [Discord Developer Portal](https://discord.com/developers/applications).
2.  Haz clic en **"New Application"** (arriba a la derecha).
3.  **Nombre**: `GamePlay Planner` (Este nombre será público).
4.  Acepta los términos y crea la app.

![App Icon](file:///C:/Users/Party/.gemini/antigravity/brain/75a3a59c-5588-4c3f-8095-974e44cb2c8f/app_icon_v2_1767732206864.png)

### 2. Configurar la Actividad (Embedded App)
1.  En el menú lateral izquierdo, busca la sección **"Activities"**.
2.  **URL Mappings**:
    *   Root Mapping: `/` -> `https://tu-dominio.com`
3.  Guarda los cambios.

### 3. OAuth2 (Autenticación)
Para que el SDK funcione y puedas obtener el nombre del usuario:
1.  Ve a **"OAuth2"**.
2.  En **"Redirects"**, añade la URL completa de tu app.

## Parte 2: Despliegue y Actualizaciones (Deployment)

### Flujo de Trabajo (Vercel)
1.  Sube tu código a **GitHub**.
2.  Conecta tu repositorio a **Vercel**.
3.  Configura el Build (`npm run build`).
4.  Define `VITE_DISCORD_CLIENT_ID`.

**¡Listo!** Cada vez que hagas `git push`, Vercel actualizará la web automáticamente.

## Parte 3: Gestión de Sesiones (Nuevo)
La app ahora incluye un sistema de salas dinámicas.
- **Pantalla de Inicio**: Permite CREAR una nueva sala o UNIRSE a una existente.
- **Código de Sesión**: Un código de 6 caracteres (ej. `X7K9P`) para compartir.

![Landing Screen](file:///C:/Users/Party/.gemini/antigravity/brain/75a3a59c-5588-4c3f-8095-974e44cb2c8f/landing_screen_v2_1767732245058.png)

![Join Session](file:///C:/Users/Party/.gemini/antigravity/brain/75a3a59c-5588-4c3f-8095-974e44cb2c8f/session_join_mockup_1767731954742.png)

## Parte 3: Publicación en el App Directory (Marketplace)

Cuando tu app esté pulida y quieras que cualquiera la instale:

1.  Ve a **"App Directory"** en el menú lateral.
2.  Completa el perfil:
    *   **Breve Descripción**: "Pizarra táctica colaborativa para planear raids en tiempo real."
    *   **Descripción Detallada**: Usa Markdown. Explica el sistema de Host, Bloqueo y Levantar la Mano.
    *   **Imágenes**:
        *   **Icono**: 512x512 (Ya lo generamos).
        *   **Banner**: 1920x1080 (Clave para destacar).
        *   **Capturas (Carousel)**: 3-5 imágenes de la app en uso (usa las que generamos en el walkthrough).
3.  **Policy URLs**:
    *   Debes tener alojados los archivos `privacy.md` y `terms.md` (o convertidos a HTML) en tu web.
    *   Enlace Política Privacidad: `https://tu-dominio.com/privacy.md` (o `.html`)
    *   Enlace Términos: `https://tu-dominio.com/terms.md`
4.  **Verificación**:
    *   Si tu app crece (+75 servidores), Discord pedirá verificar tu identidad (DNI/Pasaporte). Prepárate para ello si tienes éxito.

## Resumen de Pasos para Lanzar
1.  `npm run build` -> Asegura que no hay errores.
2.  `git push` -> Sube código a GitHub.
3.  Vercel detecta cambio -> Despliega nueva versión.
4.  (Solo setup inicial) Discord Portal -> URL Mapping apunta a Vercel.
5.  ¡A disfrutar!
