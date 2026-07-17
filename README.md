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


## Reproducción directa desde la portada

Los botones **Escuchar radio** y **Ver televisión** de la portada inician la señal correspondiente con un solo clic y desplazan suavemente al reproductor. Los controles internos siguen disponibles para pausar, cambiar volumen o reiniciar la señal.


## Mejora de reproducción en celulares

La radio y la señal HLS se preparan al cargar la página, sin iniciar audio ni video. Al tocar **Escuchar radio** o **Ver televisión**, la llamada a `play()` ocurre directamente dentro del evento del usuario y el desplazamiento se ejecuta después. Esto mejora la compatibilidad con Chrome para Android y Safari en iPhone/iPad.

Los navegadores móviles todavía pueden exigir un segundo toque si el usuario bloqueó el sonido del sitio, activó ahorro extremo de datos o el sistema interrumpe la conexión del stream. En ese caso permanecen disponibles los controles internos.


## Reproducción exclusiva de radio y televisión

Esta versión impide que ambos reproductores suenen simultáneamente. Al iniciar la radio, la televisión se pausa automáticamente. Al iniciar la televisión, la radio se pausa automáticamente. La protección también se aplica cuando el visitante utiliza los controles nativos de los reproductores.


## Segunda señal de televisión

La página incluye ahora dos reproductores HLS:

- Señal principal: `https://183.bozztv.com/ssh101/ssh101/radiolanueva97/playlist.m3u8`
- Señal 2: `https://video2.lhdserver.es/uranio/live.m3u8`

Radio, TV principal y TV 2 son mutuamente excluyentes: al iniciar uno, los otros se pausan automáticamente.
