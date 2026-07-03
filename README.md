# Nueva TV - Web rediseñada para GitHub Pages

Este paquete contiene la versión rediseñada de la web de **Nueva TV**, alineada al logotipo mejorado y configurada con los datos reales proporcionados.

## Cambios aplicados

- Rediseño visual basado en los colores del logotipo:
  - púrpura intenso
  - turquesa / aqua
  - blanco
- Integración de la señal HLS/M3U8:
  - `https://183.bozztv.com/ssh101/ssh101/radiolanueva97/playlist.m3u8`
- Facebook oficial:
  - `https://www.facebook.com/nuevatvchanchamayo`
- WhatsApp oficial:
  - `+51 901 996 052`
- Compatibilidad con **GitHub Pages**.
- Reproductor preparado con **Hls.js** para navegadores sin soporte nativo de M3U8.

## Archivos incluidos

- `index.html` - estructura principal.
- `styles.css` - diseño visual.
- `script.js` - interacción, programación y reproductor HLS.
- `assets/logo.svg` - logotipo horizontal.
- `assets/favicon.svg` - ícono del sitio.
- `assets/og-image.svg` - imagen de vista previa.

## Cómo probar en tu computadora

1. Descomprime el ZIP.
2. Abre la carpeta `nueva-tv-97`.
3. Haz doble clic en `index.html`.

## Cómo subir a GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo: `nueva-tv`.
2. Sube todos los archivos de la carpeta al repositorio.
3. Ve a:
   - `Settings` → `Pages`
4. En `Build and deployment` selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guarda los cambios.
6. GitHub te generará una URL similar a:
   - `https://tuusuario.github.io/nueva-tv/`

## Personalizaciones futuras recomendadas

- Reemplazar la programación de muestra por la programación oficial.
- Agregar fotos reales del equipo.
- Enlazar videos reales del canal.
- Añadir dominio personalizado cuando el cliente lo apruebe.

## Nota técnica

La señal HLS ya está configurada en `script.js`, por lo que no necesitas volver a pegar la URL, salvo que la cambies más adelante.
