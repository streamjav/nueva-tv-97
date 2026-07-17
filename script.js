const HLS_STREAM_URL = "https://183.bozztv.com/ssh101/ssh101/radiolanueva97/playlist.m3u8";
const HLS_STREAM_URL_2 = "https://video2.lhdserver.es/uranio/live.m3u8";

// Señal segura MP3 de Radio La Nueva 97 FM.
// Funciona en GitHub Pages y en dominios publicados mediante HTTPS.
const RADIO_STREAM_URL = "https://s26.myradiostream.com/22416/listen.mp3";
const RADIO_STREAM_TLS_URL = RADIO_STREAM_URL;

const scheduleData = {
  lunes: [
    ["06:00", "Primera Edición", "Noticias, agenda local y titulares", "Noticias"],
    ["09:00", "Magazine Nueva TV", "Entrevistas, comunidad y servicios", "En vivo"],
    ["13:00", "Central del Mediodía", "Resumen informativo y actualidad", "Actualidad"],
    ["19:00", "Nueva TV Noche", "Reportajes y contenido especial", "Especial"]
  ],
  martes: [
    ["06:00", "Primera Edición", "Noticias y servicio ciudadano", "Noticias"],
    ["10:00", "Conexión Chanchamayo", "Historias, visitas y emprendimientos", "Comunidad"],
    ["15:00", "Zona Digital", "Juventud, redes y tendencias", "Juvenil"],
    ["20:00", "Entrevista Central", "Conversaciones y análisis", "Entrevistas"]
  ],
  miercoles: [
    ["07:00", "Buenos Días Nueva TV", "Información y participación", "Magazine"],
    ["11:00", "Reporte Regional", "Cobertura local y regional", "Noticias"],
    ["16:00", "Música y Cultura", "Artistas, clips y agenda cultural", "Cultura"],
    ["21:00", "Especial en Vivo", "Transmisión y eventos", "Live"]
  ],
  jueves: [
    ["06:30", "Al Día", "Titulares, clima y entrevistas", "Noticias"],
    ["12:00", "Voces de la Comunidad", "Participación ciudadana", "Comunidad"],
    ["17:00", "Agenda TV", "Cultura, espectáculos y anuncios", "Agenda"],
    ["20:30", "Cierre Informativo", "Resumen y comentarios", "Noticias"]
  ],
  viernes: [
    ["06:00", "Primera Edición", "Noticias para cerrar la semana", "Noticias"],
    ["10:00", "Empresas al Aire", "Publicidad, negocios y difusión", "Comercial"],
    ["16:00", "Weekend Show", "Entretenimiento, videos y comunidad", "Show"],
    ["21:00", "Cobertura Especial", "Eventos y transmisiones", "Live"]
  ]
};

const WHATSAPP_NUMBER = "51901996052";
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

// Garantiza que la radio y las dos señales de televisión nunca reproduzcan
// sonido al mismo tiempo. El último medio elegido por el usuario tiene prioridad,
// incluso si otro reproductor estaba terminando una conexión asíncrona.
const MEDIA_SELECTORS = {
  radio: "#radioPlayer",
  tv1: "#hlsPlayer",
  tv2: "#hlsPlayer2"
};

let activeMediaIntent = null;

function getMediaElement(media) {
  const selector = MEDIA_SELECTORS[media];
  return selector ? $(selector) : null;
}

function releaseMediaIntent(media) {
  if (activeMediaIntent === media) activeMediaIntent = null;
}

function claimExclusivePlayback(media) {
  activeMediaIntent = media;

  Object.entries(MEDIA_SELECTORS).forEach(([key, selector]) => {
    if (key === media) return;
    const element = $(selector);
    if (element && !element.paused) element.pause();
  });
}

function setupExclusivePlaybackGuard() {
  Object.entries(MEDIA_SELECTORS).forEach(([media, selector]) => {
    const element = $(selector);
    if (!element) return;

    // Si el usuario toca los controles nativos de un video, ese toque reclama
    // prioridad antes de que el navegador emita el evento play.
    const claimFromNativeControl = () => {
      if (element.paused) claimExclusivePlayback(media);
    };

    if (media !== "radio") {
      element.addEventListener("pointerdown", claimFromNativeControl, { passive: true });
      element.addEventListener("touchstart", claimFromNativeControl, { passive: true });
    }

    element.addEventListener("play", () => {
      // Evita que una reproducción antigua y tardía recupere el audio después
      // de que el usuario ya eligió otro medio.
      if (activeMediaIntent && activeMediaIntent !== media) {
        element.pause();
        return;
      }

      claimExclusivePlayback(media);
    });

    element.addEventListener("pause", () => {
      if (activeMediaIntent === media) activeMediaIntent = null;
    });
  });
}

function setCurrentTime() {
  const el = $("#current-time");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function setupMenu() {
  const toggle = $(".menu-toggle");
  const menu = $("#site-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$("a", menu).forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function renderSchedule(day = "lunes") {
  const grid = $("#scheduleGrid");
  if (!grid) return;

  grid.innerHTML = "";
  scheduleData[day].forEach(([time, title, desc, tag]) => {
    const item = document.createElement("article");
    item.className = "schedule-item";
    item.innerHTML = `
      <time>${time}</time>
      <div>
        <strong>${title}</strong>
        <span>${desc}</span>
      </div>
      <span class="tag">${tag}</span>
    `;
    grid.appendChild(item);
  });
}

function setupScheduleTabs() {
  const tabs = $$(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderSchedule(tab.dataset.day);
    });
  });
  renderSchedule("lunes");
}

function setupHlsPlayer({
  mediaKey,
  streamUrl,
  videoSelector,
  overlaySelector,
  startButtonSelector,
  triggerSelector,
  sectionSelector,
  signalLabel
}) {
  const video = $(videoSelector);
  const overlay = $(overlaySelector);
  const startBtn = $(startButtonSelector);
  const directPlayButtons = $$(triggerSelector);
  const tvSection = $(sectionSelector);
  if (!video) return;

  let hls = null;
  let streamPrepared = false;
  let playRequested = false;
  let networkRetries = 0;

  const hideOverlay = () => overlay?.classList.add("is-hidden");

  const setOverlay = (title, message, buttonLabel = null, handler = null) => {
    if (!overlay) return;
    overlay.classList.remove("is-hidden");
    overlay.innerHTML = `
      <img src="assets/logo-nueva-tv-chanchamayo.webp" alt="Nueva TV" />
      <h3>${title}</h3>
      <p>${message}</p>
      ${buttonLabel ? '<button class="btn btn--primary" type="button" data-overlay-retry>' + buttonLabel + '</button>' : ''}
    `;

    if (buttonLabel && handler) {
      $("[data-overlay-retry]", overlay)?.addEventListener("click", handler, { once: true });
    }
  };

  const showUnsupportedMessage = () => {
    setOverlay(
      "Navegador no compatible",
      "Prueba en un navegador moderno o abre la señal desde un dispositivo compatible con HLS."
    );
  };

  const showPlaybackPermissionMessage = () => {
    setOverlay(
      "Presiona reproducir",
      "El navegador necesita una interacción directa para iniciar la transmisión con sonido.",
      `▶ Iniciar ${signalLabel}`,
      requestTvPlayback
    );
  };

  const showStreamErrorMessage = () => {
    setOverlay(
      "Señal temporalmente no disponible",
      "El servidor no respondió o la transmisión todavía no está al aire. Puedes volver a intentarlo.",
      "↻ Reintentar señal",
      () => {
        networkRetries = 0;
        if (hls) hls.startLoad(-1);
        void requestTvPlayback();
      }
    );
  };

  const prepareStream = () => {
    if (streamPrepared) return true;

    video.preload = "metadata";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.load();
      streamPrepared = true;
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        autoStartLoad: false,
        startPosition: -1
      });

      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(streamUrl);
        if (playRequested) hls.startLoad(-1);
      });

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        networkRetries = 0;
      });

      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (!data?.fatal) return;

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          networkRetries += 1;
          if (networkRetries <= 3) {
            window.setTimeout(() => hls?.startLoad(-1), 1200 * networkRetries);
          } else {
            releaseMediaIntent(mediaKey);
            showStreamErrorMessage();
          }
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        console.error(`Error fatal en ${signalLabel}:`, data);
        releaseMediaIntent(mediaKey);
        showStreamErrorMessage();
      });

      streamPrepared = true;
      return true;
    }

    showUnsupportedMessage();
    return false;
  };

  // Se adjunta el reproductor al cargar la página, pero Hls.js no descarga
  // segmentos hasta que el usuario elige esta señal. Así se conserva el toque
  // directo en móvil sin consumir las dos transmisiones simultáneamente.
  prepareStream();

  function requestTvPlayback() {
    claimExclusivePlayback(mediaKey);
    playRequested = true;

    if (!streamPrepared && !prepareStream()) {
      releaseMediaIntent(mediaKey);
      return Promise.resolve(false);
    }

    if (hls) {
      try {
        hls.startLoad(-1);
      } catch (_error) {
        // MEDIA_ATTACHED iniciará la carga cuando el elemento esté listo.
      }
    }

    video.muted = false;

    let playAttempt;
    try {
      // La llamada play() sucede dentro del gesto del usuario.
      playAttempt = video.play();
    } catch (error) {
      console.error(`Error al iniciar ${signalLabel}:`, error);
      releaseMediaIntent(mediaKey);
      showPlaybackPermissionMessage();
      return Promise.resolve(false);
    }

    if (!playAttempt || typeof playAttempt.then !== "function") {
      hideOverlay();
      return Promise.resolve();
    }

    playAttempt
      .then(hideOverlay)
      .catch((error) => {
        console.error(`El navegador bloqueó o interrumpió ${signalLabel}:`, error);
        releaseMediaIntent(mediaKey);
        showPlaybackPermissionMessage();
      });

    return playAttempt;
  }

  startBtn?.addEventListener("click", () => {
    void requestTvPlayback();
  });

  directPlayButtons.forEach((button) => {
    button.addEventListener("pointerdown", prepareStream, { passive: true });
    button.addEventListener("touchstart", prepareStream, { passive: true });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      void requestTvPlayback();
      window.requestAnimationFrame(() => {
        tvSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  video.addEventListener("play", () => {
    try {
      hls?.startLoad(-1);
    } catch (_error) {
      // La carga ya puede estar activa.
    }
    hideOverlay();
  });
  video.addEventListener("playing", hideOverlay);
  video.addEventListener("pause", () => {
    // Al cambiar de señal, además de pausar el audio/video se detiene la
    // descarga de segmentos HLS para no consumir dos transmisiones a la vez.
    try {
      hls?.stopLoad();
    } catch (_error) {
      // Los navegadores con HLS nativo administran la carga internamente.
    }
  });
  window.addEventListener("beforeunload", () => hls?.destroy(), { once: true });
}

function setupVideoPlayers() {
  setupHlsPlayer({
    mediaKey: "tv1",
    streamUrl: HLS_STREAM_URL,
    videoSelector: "#hlsPlayer",
    overlaySelector: "#videoOverlay",
    startButtonSelector: "#startPlaybackBtn",
    triggerSelector: "[data-play-tv]",
    sectionSelector: "#en-vivo",
    signalLabel: "la señal principal"
  });

  setupHlsPlayer({
    mediaKey: "tv2",
    streamUrl: HLS_STREAM_URL_2,
    videoSelector: "#hlsPlayer2",
    overlaySelector: "#videoOverlay2",
    startButtonSelector: "#startPlaybackBtn2",
    triggerSelector: "[data-play-tv2]",
    sectionSelector: "#senal-2",
    signalLabel: "la señal 2"
  });
}

function setupRadioPlayer() {
  const audio = $("#radioPlayer");
  const toggle = $("#radioToggle");
  const toggleIcon = $("#radioToggleIcon");
  const toggleText = $("#radioToggleText");
  const status = $("#radioStatus");
  const detail = $("#radioDetail");
  const statusDot = $("#radioStatusDot");
  const equalizer = $("#radioEqualizer");
  const volume = $("#radioVolume");
  const volumeValue = $("#radioVolumeValue");
  const mute = $("#radioMute");
  const notice = $("#radioSecureNotice");
  const directLink = $("#radioDirectLink");

  if (!audio || !toggle) return;

  directLink?.setAttribute("href", RADIO_STREAM_URL);
  audio.volume = Number(volume?.value ?? 0.82);
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");

  const securePage = window.location.protocol === "https:";
  const secureStream = RADIO_STREAM_TLS_URL.trim();
  const streamUrl = securePage ? secureStream : RADIO_STREAM_URL;
  const requiresSecureStream = securePage && !secureStream;

  function setState(state, title, subtitle) {
    status.textContent = title;
    detail.textContent = subtitle;
    statusDot.className = "radio-status-dot";
    statusDot.classList.toggle("is-connecting", state === "connecting");
    statusDot.classList.toggle("is-playing", state === "playing");
    statusDot.classList.toggle("is-error", state === "error");
    equalizer?.classList.toggle("is-playing", state === "playing");
  }

  function setButtonPlaying(isPlaying) {
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggleIcon.textContent = isPlaying ? "❚❚" : "▶";
    toggleText.textContent = isPlaying ? "Pausar radio" : "Escuchar ahora";
  }

  let requestRadioPlayback;

  if (requiresSecureStream) {
    notice.hidden = false;
    toggleText.textContent = "Abrir señal de radio";
    setState("error", "Se necesita la URL HTTPS", "La señal HTTP no puede integrarse dentro de una página segura");

    requestRadioPlayback = () => {
      claimExclusivePlayback("radio");
      window.open(RADIO_STREAM_URL, "_blank", "noopener");
      releaseMediaIntent("radio");
      return Promise.resolve();
    };

    toggle.addEventListener("click", requestRadioPlayback);
  } else {
    if (audio.src !== streamUrl) audio.src = streamUrl;

    // Inicia la conexión de red sin reproducir sonido. Algunos móviles pueden
    // ignorar preload, pero mantener el src listo evita trabajo extra al tocar.
    try {
      audio.load();
    } catch (error) {
      console.debug("El navegador aplazó la precarga de la radio:", error);
    }

    requestRadioPlayback = () => {
      if (!audio.paused && !audio.ended) return Promise.resolve();

      // La radio toma el control antes de iniciar: si la televisión estaba
      // reproduciéndose, se pausa de inmediato.
      claimExclusivePlayback("radio");
      audio.muted = false;

      let playAttempt;
      try {
        // play() se llama antes de desplazar, esperar o realizar tareas asíncronas.
        playAttempt = audio.play();
      } catch (error) {
        console.error("No se pudo iniciar la radio:", error);
        releaseMediaIntent("radio");
        setState("error", "No se pudo conectar", "Comprueba que la señal esté al aire o abre el enlace directo");
        setButtonPlaying(false);
        return Promise.resolve(false);
      }

      toggle.disabled = true;
      setState("connecting", "Conectando…", "Buscando la señal de Radio La Nueva 97 FM");

      if (!playAttempt || typeof playAttempt.then !== "function") {
        toggle.disabled = false;
        return Promise.resolve();
      }

      playAttempt
        .catch((error) => {
          console.error("El navegador bloqueó o interrumpió la radio:", error);
          releaseMediaIntent("radio");
          setState("error", "No se pudo conectar", "Toca nuevamente el botón del reproductor o abre la señal directa");
          setButtonPlaying(false);
        })
        .finally(() => {
          toggle.disabled = false;
        });

      return playAttempt;
    };

    toggle.addEventListener("click", () => {
      if (!audio.paused) {
        audio.pause();
        return;
      }
      void requestRadioPlayback();
    });

    audio.addEventListener("playing", () => {
      setState("playing", "Transmitiendo en vivo", "Radio La Nueva 97 FM · Chanchamayo");
      setButtonPlaying(true);
    });

    audio.addEventListener("pause", () => {
      setState("idle", "Reproducción pausada", "Presiona escuchar para continuar");
      setButtonPlaying(false);
    });

    audio.addEventListener("waiting", () => {
      setState("connecting", "Cargando señal…", "La conexión puede tardar unos segundos");
    });

    audio.addEventListener("stalled", () => {
      setState("connecting", "Reconectando…", "Esperando respuesta del servidor de radio");
    });

    audio.addEventListener("error", () => {
      releaseMediaIntent("radio");
      setState("error", "Señal no disponible", "Comprueba que la radio esté transmitiendo o abre el enlace directo");
      setButtonPlaying(false);
    });
  }

  const radioSection = $("#radio");
  $$('[data-play-radio]').forEach((button) => {
    const warmRadioConnection = () => {
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
        try {
          audio.load();
        } catch (_error) {
          // La reproducción seguirá intentándose directamente en click.
        }
      }
    };

    button.addEventListener("pointerdown", warmRadioConnection, { passive: true });
    button.addEventListener("touchstart", warmRadioConnection, { passive: true });

    button.addEventListener("click", (event) => {
      event.preventDefault();

      // Primero play(); después el desplazamiento para conservar el gesto móvil.
      void requestRadioPlayback();
      window.requestAnimationFrame(() => {
        radioSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  volume?.addEventListener("input", () => {
    const value = Number(volume.value);
    audio.volume = value;
    audio.muted = false;
    volumeValue.textContent = `${Math.round(value * 100)}%`;
    mute.textContent = value === 0 ? "🔇" : value < 0.5 ? "🔉" : "🔊";
    mute.setAttribute("aria-label", "Silenciar radio");
  });

  mute?.addEventListener("click", () => {
    audio.muted = !audio.muted;
    mute.textContent = audio.muted ? "🔇" : audio.volume < 0.5 ? "🔉" : "🔊";
    mute.setAttribute("aria-label", audio.muted ? "Activar sonido de la radio" : "Silenciar radio");
  });
}

function setupScrollButtons() {
  $$('[data-scroll-to]').forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTo);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupFloatingPlayer() {
  const player = $("#floatingPlayer");
  const radioSection = $("#radio");
  if (!player || !radioSection) return;

  const toggle = () => {
    const scrolled = window.scrollY > 560;
    const radioTop = radioSection.getBoundingClientRect().top;
    const radioBottom = radioSection.getBoundingClientRect().bottom;
    const overRadio = radioTop < window.innerHeight && radioBottom > 120;
    player.classList.toggle("is-visible", scrolled && !overRadio);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

function setupReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((item) => observer.observe(item));
}

function setupContactForm() {
  const form = $(".contact-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get("nombre") || "").toString().trim();
    const message = (formData.get("mensaje") || "").toString().trim();
    const text = encodeURIComponent(`Hola Nueva TV, soy ${name}. ${message}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener");
  });
}

function duplicateTickerContent() {
  const track = $(".ticker__track");
  if (!track) return;
  track.innerHTML = `${track.innerHTML}${track.innerHTML}`;
}

function init() {
  setCurrentTime();
  setInterval(setCurrentTime, 30000);
  $("#year").textContent = new Date().getFullYear();
  setupMenu();
  setupScheduleTabs();
  setupExclusivePlaybackGuard();
  setupVideoPlayers();
  setupRadioPlayer();
  setupScrollButtons();
  setupFloatingPlayer();
  setupReveal();
  setupContactForm();
  duplicateTickerContent();
}

document.addEventListener("DOMContentLoaded", init);
