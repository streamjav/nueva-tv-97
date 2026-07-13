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
  if (!video) return;

  const playStream = async () => {
    try {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = HLS_STREAM_URL;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(HLS_STREAM_URL);
        hls.attachMedia(video);
      } else {
        overlay.innerHTML = `
          <img src="assets/logo-nueva-tv-chanchamayo.webp" alt="Nueva TV" />
          <h3>Navegador no compatible</h3>
          <p>Prueba en un navegador moderno o abre la señal desde un dispositivo compatible con HLS.</p>
        `;
        return;
      }

      hideOverlay();
      await video.play().catch(() => {
        hideOverlay();
      });
    } catch (error) {
      console.error("Error al cargar la señal:", error);
      overlay.innerHTML = `
        <img src="assets/logo-nueva-tv-chanchamayo.webp" alt="Nueva TV" />
        <h3>No se pudo cargar la señal</h3>
        <p>Verifica la conectividad o la URL del streaming.</p>
      `;
    }
  };

  startBtn?.addEventListener("click", playStream);
  video.addEventListener("play", hideOverlay);
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

  if (requiresSecureStream) {
    notice.hidden = false;
    toggleText.textContent = "Abrir señal de radio";
    setState("error", "Se necesita la URL HTTPS", "La señal HTTP no puede integrarse dentro de GitHub Pages");

    toggle.addEventListener("click", () => {
      window.open(RADIO_STREAM_URL, "_blank", "noopener");
    });
  } else {
    audio.src = streamUrl;

    toggle.addEventListener("click", async () => {
      if (!audio.paused) {
        audio.pause();
        return;
      }

      toggle.disabled = true;
      setState("connecting", "Conectando…", "Buscando la señal de Radio La Nueva 97 FM");

      try {
        await audio.play();
      } catch (error) {
        console.error("No se pudo reproducir la radio:", error);
        setState("error", "No se pudo conectar", "Comprueba que la señal esté al aire o abre el enlace directo");
        setButtonPlaying(false);
      } finally {
        toggle.disabled = false;
      }
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
