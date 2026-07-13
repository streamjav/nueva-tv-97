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

La señal segura configurada es:

`https://s26.myradiostream.com/22416/listen.mp3`

El reproductor está preparado para funcionar dentro de GitHub Pages y en dominios publicados mediante HTTPS. El visitante debe pulsar **Escuchar ahora**, ya que los navegadores normalmente bloquean el inicio automático de audio.
