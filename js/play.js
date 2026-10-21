const rightPanel = document.getElementById('rightPanel');
const bgArt = document.getElementById('bgArt');
const bgVideo = document.getElementById('bgVideo');
const disc = document.getElementById('disc');
const discArt = document.getElementById('discArt');
const artDifficultyTag = document.getElementById('artDifficultyTag');
const headName = document.getElementById('headName');
const headAuthor = document.getElementById('headAuthor');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingContent = document.getElementById('loadingContent');
const loadingText = document.getElementById('loadingText');
const diffMenu = document.getElementById('diffMenu');
const btnPlay = document.getElementById('btnPlay');
const quickDiff = document.getElementById('quickDiff');
const quickDuration = document.getElementById('quickDuration');
const btnSongInfo = document.getElementById('btnSongInfo');

(function ensureDifficultyTabs() {
    const have = new Set(Array.from(diffMenu.querySelectorAll('[data-diff]')).map(b => b.getAttribute('data-diff').toLowerCase()));
    OKAOS.difficulties().forEach(name => {
        if (have.has(name.toLowerCase())) return;
        const tab = document.createElement('span');
        tab.className = 'menu-btn';
        tab.setAttribute('data-diff', name);
        tab.textContent = name;
        diffMenu.appendChild(tab);
        have.add(name.toLowerCase());
    });
})();

const audioPlayer = new Audio();
const clickAudio = new Audio(OKAOS.asset('sounds/click2.ogg'));

function playClickSound() {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
}

document.addEventListener('click', playClickSound);

const rawLibrary = JSON.parse(localStorage.getItem('mySongs') || '[]');
let library = rawLibrary;
let fadeInterval = null;
let currentDifficulty = 'All';
const modParam = new URLSearchParams(location.search).get('mod');
const playMech = document.getElementById('playMech');
const modFilterEl = document.getElementById('modFilter');
let selectedSongData = null;

let audioCtx = null;
let lastScrollTop = 0;
let lastScrollTime = 0;

function playBassSound(freq = 110, duration = 0.12) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function updateCurveLayout() {
    const containerRect = rightPanel.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    const tracks = rightPanel.querySelectorAll('.track');

    tracks.forEach(track => {
        const rect = track.getBoundingClientRect();
        const trackCenterY = rect.top + rect.height / 2;
        const distFromCenter = (trackCenterY - centerY) / (containerRect.height / 2);
        const clampedDist = Math.max(-1, Math.min(1, distFromCenter));
        
        const offsetX = (Math.pow(clampedDist, 2)) * 70;
        const isSelected = track.classList.contains('selected');
        const extraX = isSelected ? 15 : 0;
        const scale = isSelected ? 1.02 : 1;

        track.style.transform = `skewX(-9deg) translateX(${offsetX + extraX}px) scale(${scale})`;
    });
}

const STATS_KEY = 'okaosStats';
const MODE_LABELS = { normal: 'Normal', recovery: 'Recuperación', nolives: 'Sin Vidas' };
const MODE_ICONS = { normal: '../img/icons/ic5.png', recovery: '../img/icons/ic6.png', nolives: '../img/icons/ic7.png' };
const RANK_IMAGES = {
    F: '../img/assets/ranks/f.png',
    D: '../img/assets/ranks/d.png',
    C: '../img/assets/ranks/c.png',
    B: '../img/assets/ranks/b.png',
    A: '../img/assets/ranks/a.png',
    S: '../img/assets/ranks/s.png',
    SS: '../img/assets/ranks/ss.png',
    SSS: '../img/assets/ranks/sss.png'
};

const btnFullStats = document.getElementById('btnFullStats');
const btnCloseFullStats = document.getElementById('btnCloseFullStats');
const fullStatsOverlay = document.getElementById('fullStatsOverlay');
const fullStatsArt = document.getElementById('fullStatsArt');
const fullStatsTitle = document.getElementById('fullStatsTitle');
const fullStatsPlays = document.getElementById('fullStatsPlays');
const fullStatsModes = document.getElementById('fullStatsModes');

const songInfoOverlay = document.getElementById('songInfoOverlay');
const btnCloseSongInfo = document.getElementById('btnCloseSongInfo');
const infoModalArt = document.getElementById('infoModalArt');
const infoModalTitle = document.getElementById('infoModalTitle');
const infoModalAuthor = document.getElementById('infoModalAuthor');
const infoModalDiff = document.getElementById('infoModalDiff');
const infoModalStars = document.getElementById('infoModalStars');
const infoModalDuration = document.getElementById('infoModalDuration');
const infoModalPoints = document.getElementById('infoModalPoints');

function loadAllStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); }
    catch (err) { return {}; }
}

function getSongStats(songId) {
    const all = loadAllStats();
    return all[songId] || { plays: 0, modes: {} };
}

function registerSongPlay(songId) {
    const all = loadAllStats();
    if (!all[songId]) all[songId] = { plays: 0, modes: {} };
    all[songId].plays = (all[songId].plays || 0) + 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(all));
}

function buildModeStarsHTML(count) {
    if (count === null || count === undefined) return '';
    let html = '';
    for (let i = 1; i <= 3; i++) html += `<img class="${i <= count ? 'on' : ''}" src="../img/assets/star.png" alt="star">`;
    return `<div class="mode-star-row">${html}</div>`;
}

function buildModeCardHTML(mode, result) {
    const label = MODE_LABELS[mode];
    const icon = MODE_ICONS[mode];
    if (!result) {
        return `<div class="mode-stat-card">
            <div class="mode-stat-name"><img src="${icon}" alt="${label}">${label}</div>
            <div class="mode-stat-empty">Sin registro</div>
        </div>`;
    }
    return `<div class="mode-stat-card">
        <div class="mode-stat-name"><img src="${icon}" alt="${label}">${label}</div>
        <img class="mode-rank-img" src="${RANK_IMAGES[result.rank] || RANK_IMAGES.F}" alt="${result.rank}">
        <div class="mode-stat-row"><span>Puntaje</span><span>${String(result.score).padStart(6, '0')}</span></div>
        <div class="mode-stat-row"><span>Combo Máx.</span><span>${result.maxCombo}</span></div>
        ${buildModeStarsHTML(result.stars)}
    </div>`;
}

function openFullStats(song) {
    const stats = getSongStats(song.id);
    fullStatsTitle.textContent = song.nombre;
    fullStatsArt.src = song.portada || song.fondo || '../img/logo.jpg';
    fullStatsPlays.textContent = `Veces jugada: ${stats.plays || 0}`;
    fullStatsModes.innerHTML = ['normal', 'recovery', 'nolives']
        .map(mode => buildModeCardHTML(mode, stats.modes ? stats.modes[mode] : null))
        .join('');
    fullStatsOverlay.classList.add('active');
}

function openSongInfo(song) {
    infoModalTitle.textContent = song.nombre;
    infoModalAuthor.textContent = song.autor;
    infoModalArt.src = song.portada || song.fondo || '../img/logo.jpg';
    infoModalDiff.textContent = song.dificultad;
    infoModalStars.innerHTML = generateStarsHTML(song.star);
    infoModalDuration.textContent = song.duracion;
    infoModalPoints.textContent = song.puntos;
    songInfoOverlay.classList.add('active');
}

btnSongInfo.addEventListener('click', () => { if (selectedSongData) openSongInfo(selectedSongData); });
btnCloseSongInfo.addEventListener('click', () => songInfoOverlay.classList.remove('active'));

btnFullStats.addEventListener('click', () => { if (selectedSongData) openFullStats(selectedSongData); });
btnCloseFullStats.addEventListener('click', () => fullStatsOverlay.classList.remove('active'));

function playWithFade(src) {
    if (fadeInterval) clearInterval(fadeInterval);
    if (!audioPlayer.paused && audioPlayer.src) {
        let currentVolume = audioPlayer.volume;
        fadeInterval = setInterval(() => {
            if (currentVolume > 0.08) {
                currentVolume -= 0.08;
                audioPlayer.volume = currentVolume;
            } else {
                clearInterval(fadeInterval);
                audioPlayer.pause();
                startNewTrack(src);
            }
        }, 18);
    } else {
        startNewTrack(src);
    }
}

function startNewTrack(src) {
    audioPlayer.src = src;
    audioPlayer.volume = 0;
    audioPlayer.play().then(() => {
        let currentVolume = 0;
        fadeInterval = setInterval(() => {
            if (currentVolume < 0.92) {
                currentVolume += 0.08;
                audioPlayer.volume = currentVolume;
            } else {
                audioPlayer.volume = 1;
                clearInterval(fadeInterval);
            }
        }, 18);
    }).catch(() => {});
}

audioPlayer.addEventListener('play', () => disc.classList.add('spinning'));
audioPlayer.addEventListener('pause', () => disc.classList.remove('spinning'));
audioPlayer.addEventListener('ended', () => disc.classList.remove('spinning'));

function starFilter(rating) {
    const t = Math.min(Math.max(rating, 0), 5) / 5;
    const hueRotate = -t * 50;
    const saturate = 1 + t * 0.8;
    const brightness = 1 + t * 0.15;
    return `hue-rotate(${hueRotate.toFixed(0)}deg) saturate(${saturate.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
}

function generateStarsHTML(starValue) {
    const rating = (starValue === undefined || starValue === null || isNaN(parseFloat(starValue))) ? 0 : Math.min(Math.max(parseFloat(starValue), 0), 5);
    const filter = starFilter(rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const on = rating >= i - 0.4;
        html += on
            ? `<img src="../img/assets/star.png" style="filter:${filter}" alt="star">`
            : `<img class="off" src="../img/assets/star.png" alt="star">`;
    }
    return `<div class="track-stars">${html}</div>`;
}

let bgToken = 0;

function setBackground(url) {
    document.body.classList.remove('has-video');
    bgVideo.classList.remove('show');
    bgVideo.pause();
    bgVideo.removeAttribute('src');
    bgVideo.load();
    if (!url) { bgArt.classList.remove('show'); return; }
    bgArt.onerror = () => bgArt.classList.remove('show');
    bgArt.src = url;
    requestAnimationFrame(() => bgArt.classList.add('show'));
}

function setVideoBackground(url, fallbackImage) {
    bgVideo.onerror = () => setBackground(fallbackImage);
    bgVideo.onloadeddata = () => {
        bgArt.classList.remove('show');
        bgVideo.classList.add('show');
        document.body.classList.add('has-video');
        bgVideo.play().catch(() => {});
    };
    bgVideo.muted = true;
    bgVideo.loop = true;
    bgVideo.src = url;
    bgVideo.load();
}

/* Igual que run.html: pide el video real de la canción; si no existe usa la imagen */
async function applySongBackground(song) {
    const token = ++bgToken;
    setBackground(song.fondo || '');
    let videoUrl = null;
    try { videoUrl = await SONGS.getVideoUrl(song.id); } catch (err) { videoUrl = null; }
    if (token !== bgToken || !videoUrl) return;
    setVideoBackground(videoUrl, song.fondo || '');
}

let scrollTimeout = null;
rightPanel.addEventListener('scroll', () => {
    rightPanel.classList.add('scrolling');
    updateCurveLayout();

    const now = Date.now();
    if (now - lastScrollTime > 120 && Math.abs(rightPanel.scrollTop - lastScrollTop) > 15) {
        playBassSound(95, 0.08);
        lastScrollTime = now;
        lastScrollTop = rightPanel.scrollTop;
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => rightPanel.classList.remove('scrolling'), 180);
});

function selectSong(song, item) {
    playBassSound(70, 0.2);
    rightPanel.querySelectorAll('.track').forEach(t => t.classList.remove('selected'));
    item.classList.add('selected');
    updateCurveLayout();
    selectedSongData = song;
    btnPlay.disabled = false;
    btnSongInfo.disabled = false;
    btnFullStats.disabled = false;

    SONGS.getAudioUrl(song.id).then(playWithFade).catch(() => {});

    applySongBackground(song);

    discArt.src = song.portada || song.fondo || '../img/logo.jpg';
    headName.textContent = song.nombre;
    headAuthor.textContent = song.autor;
    artDifficultyTag.textContent = song.dificultad;
    quickDiff.textContent = song.dificultad;
    quickDuration.textContent = song.duracion;
    showMechanics(song);
}

btnPlay.addEventListener('click', () => {
    if (!selectedSongData) return;
    playBassSound(130, 0.25);
    const song = selectedSongData;
    localStorage.setItem('selectedSong', JSON.stringify({ id: song.id, nombre: song.nombre }));
    localStorage.setItem('selectedSongId', song.id);
    registerSongPlay(song.id);

    if (fadeInterval) clearInterval(fadeInterval);
    audioPlayer.pause();

    loadingOverlay.style.display = 'flex';
    setTimeout(() => loadingOverlay.classList.add('active'), 10);
    setTimeout(() => { loadingOverlay.style.clipPath = 'none'; loadingContent.classList.add('show'); }, 600);
    let dotCount = 0;
    const interval = setInterval(() => { dotCount = (dotCount + 1) % 4; loadingText.textContent = "Cargando" + ".".repeat(dotCount); }, 400);
    setTimeout(() => { clearInterval(interval); window.location.href = OKAOS.route("partida"); }, 3000);
});

const esc = OKUI.esc;

function mechIcons(list) {
    const items = (list || []).map(id => OKAOS.mechanicInfo(id)).filter(Boolean);
    if (!items.length) return '';
    return '<div class="track-mech">' + items.slice(0, 4).map(m => `<img src="${m.icono}" alt="${esc(m.nombre)}" title="${esc(m.nombre)}">`).join('') + '</div>';
}

function showMechanics(song) {
    const items = (song.mecanicas || []).map(id => OKAOS.mechanicInfo(id)).filter(Boolean);
    playMech.innerHTML = items.map(m => `<img src="${m.icono}" alt="${esc(m.nombre)}" title="${esc(m.nombre)}: ${esc(m.descripcion)}">`).join('');
}

function renderSongs(difficulty) {
    rightPanel.innerHTML = '';

    const filteredSongs = library.filter(song => {
        if (modParam && song.mod !== modParam) return false;
        if (difficulty.trim().toLowerCase() === 'all') return true;
        return String(song.dificultad).trim().toLowerCase() === difficulty.trim().toLowerCase();
    });

    filteredSongs.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'track';
        item.style.animationDelay = `${0.1 + (index * 0.05)}s`;

        item.innerHTML = `
            <div class="track-inner">
                <div class="track-cover"><img src="${song.portada || song.fondo || '../img/logo.jpg'}"></div>
                <div class="track-body">
                    <div class="track-name">${esc(song.nombre)}</div>
                    <div class="track-author">${esc(song.autor)}</div>
                    ${song.source === 'mod' ? `<div class="track-badge">${esc(song.modNombre || 'Mod')}</div>` : ''}
                </div>
                ${mechIcons(song.mecanicas)}
                ${generateStarsHTML(song.star)}
            </div>`;

        item.onclick = () => selectSong(song, item);
        rightPanel.appendChild(item);
    });

    if (!filteredSongs.length) {
        rightPanel.innerHTML = `<div class="empty-play"><h2>${modParam ? 'Este mod no tiene canciones aquí' : 'Tu biblioteca está vacía'}</h2><p>${modParam ? 'Añádelas desde Canciones.' : 'Añade canciones para empezar a jugar.'}</p><a href="${OKAOS.route('canciones')}">Ir a Canciones</a></div>`;
    }
    requestAnimationFrame(updateCurveLayout);
}

diffMenu.querySelectorAll('.menu-btn[data-diff]').forEach(btn => {
    btn.onclick = () => {
        diffMenu.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        renderSongs(currentDifficulty);
    };
});

async function initLibrary() {
    const all = await SONGS.list();
    const have = new Set(rawLibrary.map(x => x.id));
    const modSongs = all.filter(e => e.source === 'mod' && !have.has(e.id)).map(e => ({ id: e.id, nombre: e.nombre, autor: e.autor, dificultad: e.dificultad, star: e.star, bpm: e.bpm, duracion: e.duracion, puntos: e.puntos, hasVideo: e.hasVideo }));
    const resolved = await Promise.all(rawLibrary.concat(modSongs).map(async song => {
        const entry = await SONGS.entryFor(song.id);
        if (!entry) return null;
        const fondo = await SONGS.getThumbUrl(song.id);
        return { ...song, fondo, portada: fondo, source: entry.source, mod: entry.mod || null, modNombre: entry.modNombre || '', mecanicas: entry.mecanicas || [] };
    }));
    library = resolved.filter(Boolean);
    renderSongs(currentDifficulty);
}

if (modParam && modFilterEl) {
    modFilterEl.hidden = false;
    const m = OKAOS.mod(modParam);
    modFilterEl.innerHTML = `<span>Mod: ${esc(m ? m.nombre : modParam)}</span><button type="button" aria-label="Quitar filtro">${OKUI.icon('close')}</button>`;
    modFilterEl.querySelector('button').onclick = () => { location.href = OKAOS.route('jugar'); };
}

initLibrary();

window.addEventListener('keydown', (e) => { if (e.ctrlKey && (e.key === 's' || e.key === 'u')) e.preventDefault(); });
