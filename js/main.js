// WhatsApp oficial de Zeta Gym: número internacional sin + ni espacios.
const WHATSAPP_NUMBER = '5492284535056';
const WHATSAPP_MESSAGE = 'Hola Ezequiel, quiero consultar por los entrenamientos de Zeta Gym.';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.whatsapp-link').forEach(link => {
  link.href = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}&type=phone_number&app_absent=0`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});
document.getElementById('year').textContent = new Date().getFullYear();


// Feed de Instagram servido por una Netlify Function (el token nunca se expone al navegador).
const instagramFeed = document.getElementById('instagram-feed');
const instagramNote = document.getElementById('instagram-feed-note');
const INSTAGRAM_REFRESH_MS = 5 * 60 * 1000;
const INSTAGRAM_PROFILE = 'https://www.instagram.com/zetagym.arg/';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function formatInstagramDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
function renderInstagramMedia(items) {
  if (!instagramFeed) return;
  if (!Array.isArray(items) || items.length === 0) {
    instagramFeed.innerHTML = `<p class="feed-status">Todavía no hay publicaciones para mostrar. <a href="${INSTAGRAM_PROFILE}" target="_blank" rel="noopener noreferrer">Ver @zetagym.arg en Instagram</a>.</p>`;
    return;
  }
  instagramFeed.innerHTML = items.slice(0, 8).map(item => {
    const url = typeof item.permalink === 'string' && item.permalink.startsWith('https://www.instagram.com/') ? item.permalink : INSTAGRAM_PROFILE;
    const caption = escapeHTML(item.caption || 'Mirá esta publicación de Zeta Gym.');
    const date = escapeHTML(formatInstagramDate(item.timestamp));
    const mediaUrl = typeof item.media_url === 'string' && /^https:\/\//i.test(item.media_url) ? item.media_url : '';
    const isVideo = item.media_type === 'VIDEO';
    const visual = mediaUrl
      ? (isVideo
        ? `<video src="${escapeHTML(mediaUrl)}" poster="${escapeHTML(item.thumbnail_url || '')}" controls muted playsinline preload="none" aria-label="Video de Zeta Gym"></video>`
        : `<img src="${escapeHTML(mediaUrl)}" alt="Publicación de Zeta Gym" loading="lazy">`)
      : `<div class="feed-status">Abrir publicación en Instagram</div>`;
    return `<article class="ig-card"><div class="ig-post-head"><img class="ig-avatar" src="assets/logo-zeta.png" alt=""><div><div class="ig-account">zetagym.arg</div><div class="ig-location">Olavarría · Zeta Gym</div></div></div><a class="ig-media" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir publicación de Instagram">${visual}<span class="ig-type">${isVideo ? '▶ Reel / video' : item.media_type === 'CAROUSEL_ALBUM' ? '▦ Álbum' : 'Instagram'}</span></a><div class="ig-card-copy"><div class="ig-social-actions" aria-hidden="true"><span>♡</span><span>◯</span><span>➤</span><span class="ig-action-spacer"></span><span>▱</span></div><p class="ig-date">${date}</p><p class="ig-caption"><strong>zetagym.arg</strong> ${caption}</p><a class="ig-open" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Ver publicación ↗</a></div></article>`;
  }).join('');
}
async function loadInstagramFeed() {
  if (!instagramFeed) return;
  try {
    const response = await fetch('/.netlify/functions/instagram-feed', { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`Feed no disponible (${response.status})`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error);
    renderInstagramMedia(payload.data || []);
    if (instagramNote) instagramNote.textContent = 'Feed de Instagram actualizado automáticamente; puede tardar unos minutos en reflejar una publicación nueva.';
  } catch (error) {
    instagramFeed.innerHTML = `<p class="feed-error">No se pudo cargar el feed automáticamente. Mientras tanto, podés ver las publicaciones en <a href="${INSTAGRAM_PROFILE}" target="_blank" rel="noopener noreferrer">@zetagym.arg</a>.</p>`;
    if (instagramNote) instagramNote.textContent = 'La integración necesita configurar las variables de Instagram en Netlify.';
    console.warn('Instagram feed:', error);
  }
}
loadInstagramFeed();
window.setInterval(loadInstagramFeed, INSTAGRAM_REFRESH_MS);

// Música ambiental: una sola reproducción por carga, sin loop ni reproductor visible.
// Los navegadores pueden bloquear autoplay con sonido; en ese caso el botón permite iniciarla.
const rockAudio = document.getElementById('rock-audio');
const rockToggle = document.getElementById('rock-toggle');
const rockToggleLabel = document.getElementById('rock-toggle-label');
const rockToggleIcon = document.getElementById('rock-toggle-icon');
let musicStartedByUser = false;

function updateMusicButton(isPlaying) {
  if (!rockToggle) return;
  rockToggle.setAttribute('aria-pressed', String(isPlaying));
  rockToggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
  rockToggle.title = isPlaying ? 'Pausar música' : 'Reproducir música';
  if (rockToggleIcon) rockToggleIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
  if (rockToggleLabel) rockToggleLabel.textContent = isPlaying ? 'Pausar' : 'Reproducir';
}

if (rockAudio && rockToggle) {
  rockAudio.loop = false;
  rockAudio.volume = 0.38;
  rockAudio.addEventListener('play', () => updateMusicButton(true));
  rockAudio.addEventListener('pause', () => updateMusicButton(false));
  rockAudio.addEventListener('ended', () => updateMusicButton(false));

  // Intentar iniciar al entrar. Si el navegador lo bloquea, queda el control discreto para iniciar.
  const tryAutoplay = async () => {
    try {
      await rockAudio.play();
      updateMusicButton(true);
    } catch (error) {
      updateMusicButton(false);
      rockToggle.classList.add('music-needs-click');
      rockToggle.setAttribute('aria-label', 'Iniciar música (el navegador bloqueó la reproducción automática)');
      rockToggle.title = 'El navegador bloqueó la reproducción automática. Tocá para iniciar.';
    }
  };
  if (document.readyState === 'complete') tryAutoplay();
  else window.addEventListener('load', tryAutoplay, { once: true });

  rockToggle.addEventListener('click', async () => {
    if (!rockAudio.paused) {
      rockAudio.pause();
      return;
    }
    // Una vez que terminó, no reiniciar la canción desde el principio.
    if (rockAudio.ended) return;
    try {
      musicStartedByUser = true;
      await rockAudio.play();
      rockToggle.classList.remove('music-needs-click');
      updateMusicButton(true);
    } catch (error) {
      updateMusicButton(false);
    }
  });
}
