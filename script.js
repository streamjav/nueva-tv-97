const HLS_STREAM_URL = "https://183.bozztv.com/ssh101/ssh101/radiolanueva97/playlist.m3u8";

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

function hideOverlay() {
  const overlay = $("#videoOverlay");
  overlay?.classList.add("is-hidden");
}

function setupPlayer() {
  const video = $("#hlsPlayer");
  const overlay = $("#videoOverlay");
  const startBtn = $("#startPlaybackBtn");
  const directPlayButtons = $$('[data-play-tv]');
  const tvSection = $("#en-vivo");
  if (!video) return;

  let hls = null;
  let streamPrepared = false;

  const showUnsupportedMessage = () => {
    if (!overlay) return;
    overlay.classList.remove("is-hidden");
    overlay.innerHTML = `
      <img src="assets/logo-nueva-tv-chanchamayo.webp" alt="Nueva TV" />
      <h3>Navegador no compatible</h3>
      <p>Prueba en un navegador moderno o abre la señal desde un dispositivo compatible con HLS.</p>
    `;
  };

  const showPlaybackPermissionMessage = () => {
    if (!overlay) return;
    overlay.classList.remove("is-hidden");
    overlay.innerHTML = `
      <img src="assets/logo-nueva-tv-chanchamayo.webp" alt="Nueva TV" />
      <h3>Presiona reproducir</h3>
      <p>El navegador necesita una interacción directa para iniciar la transmisión con sonido.</p>
      <button class="btn btn--primary" type="button" id="retryPlaybackBtn">▶ Iniciar señal</button>
    `;
    $("#retryPlaybackBtn")?.addEventListener("click", requestTvPlayback, { once: true });
  };

  const prepareStream = () => {
    if (streamPrepared) return true;

    video.preload = "auto";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_STREAM_URL;
      video.load();
      streamPrepared = true;
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        autoStartLoad: true,
        startPosition: -1
      });

      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(HLS_STREAM_URL);
        hls.startLoad(-1);
      });

      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (!data?.fatal) return;

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad(-1);
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        console.error("Error fatal en la señal HLS:", data);
      });

      streamPrepared = true;
      return true;
    }

    showUnsupportedMessage();
    return false;
  };

  // La señal se conecta al cargar la página, pero no se reproduce todavía.
  // Esto permite que el primer toque en móvil se use directamente para play().
  prepareStream();

  function requestTvPlayback() {
    if (!streamPrepared && !prepareStream()) return Promise.resolve(false);

    if (hls) {
      try {
        hls.startLoad(-1);
      } catch (_error) {
        // MEDIA_ATTACHED iniciará la carga en cuanto el elemento esté listo.
      }
    }
    video.muted = false;

    let playAttempt;
    try {
      // Debe ejecutarse directamente dentro del evento click/touch.
      playAttempt = video.play();
    } catch (error) {
      console.error("Error al iniciar la señal:", error);
      showPlaybackPermissionMessage();
      return Promise.resolve(false);
    }

    if (!playAttempt || typeof playAttempt.then !== "function") {
      hideOverlay();
      return Promise.resolve();
    }

    playAttempt
      .then(() => hideOverlay())
      .catch((error) => {
        console.error("El navegador bloqueó o interrumpió la reproducción:", error);
        showPlaybackPermissionMessage();
      });

    return playAttempt;
  }

  startBtn?.addEventListener("click", () => {
    void requestTvPlayback();
  });

  directPlayButtons.forEach((button) => {
    // Un toque temprano ayuda a preparar la conexión antes del evento click.
    button.addEventListener("pointerdown", prepareStream, { passive: true });
    button.addEventListener("touchstart", prepareStream, { passive: true });

    button.addEventListener("click", (event) => {
      event.preventDefault();

      // Primero play(); después el desplazamiento. Este orden es importante en móvil.
      void requestTvPlayback();
      window.requestAnimationFrame(() => {
        tvSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  video.addEventListener("play", hideOverlay);
  video.addEventListener("playing", hideOverlay);
  window.addEventListener("beforeunload", () => hls?.destroy(), { once: true });
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
      window.open(RADIO_STREAM_URL, "_blank", "noopener");
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

      audio.muted = false;

      let playAttempt;
      try {
        // play() se llama antes de desplazar, esperar o realizar tareas asíncronas.
        playAttempt = audio.play();
      } catch (error) {
        console.error("No se pudo iniciar la radio:", error);
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
  setupPlayer();
  setupRadioPlayer();
  setupScrollButtons();
  setupFloatingPlayer();
  setupReveal();
  setupContactForm();
  duplicateTickerContent();
}

document.addEventListener("DOMContentLoaded", init);
