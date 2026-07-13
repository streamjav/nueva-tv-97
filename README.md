# Nueva TV Chanchamayo — sitio web

Proyecto estático listo para GitHub Pages o para subir a `public_html`.

## Archivos principales

- `index.html`: estructura completa de la página.
- `styles.css`: diseño responsive y animaciones.
- `script.js`: menú, reloj, programación y reproductor HLS.
- `assets/`: logotipos e imágenes optimizadas.

## Ajuste de esta versión

El logotipo Nueva TV Chanchamayo fue integrado dentro del círculo animado de la tarjeta principal mediante HTML y CSS. El recurso específico utilizado es:

`assets/logo-nueva-tv-chanchamayo-circle.webp`

No es una captura estática: el aro, las órbitas, el reloj y los puntos continúan funcionando como elementos de la página.

## Probar localmente

Puedes abrir `index.html` directamente o iniciar un servidor local:

```bash
python -m http.server 8000
```

Luego visita `http://localhost:8000`.

## GitHub Pages

Sube todo el contenido de esta carpeta a la raíz del repositorio y activa GitHub Pages desde la rama principal.

## Ajuste de integración del encabezado
La franja superior utiliza ahora el mismo azul marino del fondo del logotipo (`#01071d`). Los bordes del archivo del logotipo se difuminan mediante CSS para que no se perciba su forma rectangular y parezca integrado naturalmente en toda la cabecera.


## Reproductor de Radio La Nueva 97 FM

La señal configurada es:

`http://s26.myradiostream.com:22416/`

El reproductor funciona de forma directa cuando la web se sirve mediante HTTP. GitHub Pages y la mayoría de dominios modernos usan HTTPS; en ese caso el navegador exige una señal TLS/HTTPS. Solicita en el panel de MyRadioStream la URL segura y pégala en `script.js`, dentro de:

```js
const RADIO_STREAM_TLS_URL = "AQUI_TU_URL_HTTPS";
```

Hasta colocar esa URL segura, el diseño muestra un aviso y conserva el botón para abrir la señal directa en otra pestaña.
