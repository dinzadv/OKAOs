/* ============================================================
   OKAOs · ui.js
   Utilidades compartidas: iconos SVG, sonidos, toasts y ajustes.
   Expone  window.OKUI
   ============================================================ */
(function (global) {
    "use strict";

    /* ---------- iconos (rejilla 24x24, trazo) ---------- */
    const ICONS = {
        play: '<path class="fill" d="M8 5.5v13l11-6.5z"/>',
        pause: '<rect class="fill" x="6" y="5" width="4" height="14" rx="1"/><rect class="fill" x="14" y="5" width="4" height="14" rx="1"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
        trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
        close: '<path d="M6 6l12 12M18 6L6 18"/>',
        check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
        home: '<path d="M4 11l8-7 8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"/>',
        upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
        download: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
        trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
        sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
        volume: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
        keyboard: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
        monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
        gamepad: '<path d="M7 8h10a4 4 0 0 1 4 4.4l-.6 3.6a2.2 2.2 0 0 1-4 .8L14.5 15h-5l-1.9 1.8a2.2 2.2 0 0 1-4-.8L3 12.4A4 4 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3M15.5 11.5h.01M17.5 13.5h.01"/>',
        bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
        'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
        'arrow-up': '<path d="M12 20V5M6 11l6-6 6 6"/>',
        'arrow-down': '<path d="M12 4v15M6 13l6 6 6-6"/>',
        'arrow-left': '<path d="M20 12H5M11 6l-6 6 6 6"/>',
        'note-arrow': '<path class="fill" d="M4 9.5h8V5l8 7-8 7v-4.5H4z"/>',
        'note-circle': '<circle class="fill" cx="12" cy="12" r="8"/>',
        'note-bar': '<rect class="fill" x="2.5" y="8.5" width="19" height="7" rx="3.5"/>',
        refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
        folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
        puzzle: '<path d="M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4H4a2 2 0 1 1 0-4h2V6h4z"/>',
        music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
        user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
        star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
        heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
        edit: '<path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3"/>',
        power: '<path d="M12 3v8M7 6.5a7.5 7.5 0 1 0 10 0"/>',
        eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
        film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
        image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
        file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
        code: '<path d="M9 8l-5 4 5 4M15 8l5 4-5 4"/>',
        palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01"/>',
        alert: '<path d="M12 4l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
        chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
        disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
        tag: '<path d="M3 12V4h8l10 10-8 8z"/><path d="M7.5 8h.01"/>',
        'chevron-down': '<path d="M6 9l6 6 6-6"/>'
    };

    function icon(name, extra) {
        const body = ICONS[name];
        if (!body) return "";
        return '<svg class="ic ic-' + name + (extra ? " " + extra : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + body + "</svg>";
    }

    /* Sustituye <i data-ic="nombre"></i> por el SVG correspondiente */
    function mount(root) {
        (root || document).querySelectorAll("i[data-ic]").forEach(function (el) {
            const html = icon(el.getAttribute("data-ic"), el.getAttribute("class") || "");
            if (!html) return;
            const tpl = document.createElement("template");
            tpl.innerHTML = html;
            el.replaceWith(tpl.content.firstChild);
        });
    }

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* ---------- ajustes ---------- */
    const SETTINGS_KEY = "okaos_settings";
    const DEFAULTS = {
        keys: { key1: "D", key2: "F", key3: "J", key4: "K" },
        sliders: { arrowSpeed: 4.5, offset: 0, touchSize: 100, touchOpacity: 80, laneOpacity: 0, masterVol: 80, bgmVol: 70, sfxVol: 90, musicSpeed: 1.0, noteSize: 100 },
        toggles: { btnCustomSpeed: false, btnArrowPos: false, btnHorizontal: false, btnVibration: true, btnFX: true, btnLines: true, btnStorage: true },
        options: { noteStyle: "arrows" },
        shortcuts: { pause: "ESCAPE", home: "H", play: "ENTER", songs: "C", mods: "M", profile: "P", settings: "S", controls: "T" }
    };
    /* Atajos configurables (Ajustes > Atajos). "pause" se usa dentro de la partida. */
    const SHORTCUT_DEFS = [
        { id: "pause", label: "Pausar / reanudar", desc: "Dentro de una partida." },
        { id: "home", label: "Ir al inicio", desc: "Desde cualquier pantalla." },
        { id: "play", label: "Ir a Jugar", desc: "Lista de canciones para jugar." },
        { id: "songs", label: "Ir a Canciones", desc: "Biblioteca y subida de .okx." },
        { id: "mods", label: "Ir a Mods", desc: "Gestionar mods." },
        { id: "profile", label: "Ir a Perfil", desc: "Tu perfil y estadísticas." },
        { id: "settings", label: "Ir a Ajustes", desc: "Esta pantalla." },
        { id: "controls", label: "Abrir Controles", desc: "En el inicio: prueba tus teclas." }
    ];
    const NOTE_STYLES = ["arrows", "circles", "bars"];

    function readSettings() {
        const out = JSON.parse(JSON.stringify(DEFAULTS));
        try {
            const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
            if (parsed && typeof parsed === "object") {
                ["keys", "sliders", "toggles", "options", "shortcuts"].forEach(function (g) {
                    if (parsed[g] && typeof parsed[g] === "object") Object.assign(out[g], parsed[g]);
                });
            }
        } catch (e) {}
        if (NOTE_STYLES.indexOf(out.options.noteStyle) === -1) out.options.noteStyle = "arrows";
        return out;
    }

    function writeSettings(settings) {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
    }

    /* ---------- sonido de interfaz ---------- */
    let audioCtx = null;
    let clickEl = null;
    function sfxVolume() {
        const s = readSettings().sliders;
        return (Number(s.masterVol) / 100) * (Number(s.sfxVol) / 100);
    }
    function synthTick(vol) {
        try {
            audioCtx = audioCtx || new (global.AudioContext || global.webkitAudioContext)();
            if (audioCtx.state === "suspended") audioCtx.resume();
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(680, t);
            osc.frequency.exponentialRampToValueAtTime(1250, t + 0.07);
            gain.gain.setValueAtTime(0.16 * vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
        } catch (e) {}
    }
    function click() {
        const vol = sfxVolume();
        if (vol <= 0) return;
        try {
            if (!clickEl) {
                const url = global.OKAOS ? global.OKAOS.asset("sounds/click2.ogg") : "../sounds/click2.ogg";
                clickEl = new Audio(url);
                clickEl.addEventListener("error", function () { clickEl = false; });
            }
            if (clickEl === false) { synthTick(vol); return; }
            clickEl.volume = Math.min(1, vol);
            clickEl.currentTime = 0;
            clickEl.play().catch(function () { synthTick(vol); });
        } catch (e) { synthTick(vol); }
    }

    /* ---------- toast ---------- */
    let toastEl = null;
    let toastTimer = null;
    function toast(message, type, ms) {
        if (!toastEl) {
            toastEl = document.getElementById("toast") || document.createElement("div");
            if (!toastEl.parentNode) {
                toastEl.id = "toast";
                document.body.appendChild(toastEl);
            }
            toastEl.classList.add("toast");
        }
        toastEl.className = "toast " + (type || "");
        toastEl.innerHTML = (type === "error" ? icon("alert") : type === "ok" ? icon("check") : icon("info")) + "<span>" + esc(message) + "</span>";
        void toastEl.offsetWidth;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, ms || (type === "error" ? 5200 : 3000));
    }

    /* ---------- teclas ---------- */
    const KEY_ICON = { "←": "arrow-left", "→": "arrow-right", "↑": "arrow-up", "↓": "arrow-down" };
    function normalizeKey(e) {
        let k = String(e.key || "").toUpperCase();
        if (k === " ") k = "SPACE";
        if (k === "ARROWLEFT") k = "←";
        if (k === "ARROWRIGHT") k = "→";
        if (k === "ARROWUP") k = "↑";
        if (k === "ARROWDOWN") k = "↓";
        return k;
    }
    function keyLabel(value) {
        return KEY_ICON[value] ? icon(KEY_ICON[value]) : esc(value);
    }

    /* ---------- atajos de navegación ---------- */
    const NAV_ROUTE = { home: "inicio", play: "jugar", songs: "canciones", mods: "mods", profile: "perfil", settings: "ajustes" };
    const PAGE_ID = { index: "home", play: "play", music: "songs", mods: "mods", profile: "profile", settings: "settings" };

    function initShortcuts() {
        const page = document.documentElement.getAttribute("data-page") || "";
        if (page === "run" || page === "settings") return;
        window.addEventListener("keydown", function (e) {
            if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
            const t = e.target;
            if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
            if (document.querySelector(".modal-overlay.active, .modal-backdrop.active, .full-stats-overlay.active")) return;
            const sc = readSettings().shortcuts;
            const key = normalizeKey(e);
            const id = Object.keys(NAV_ROUTE).concat("controls").filter(function (n) { return sc[n] === key; })[0];
            if (!id) return;
            if (id === "controls") {
                if (page === "index") { e.preventDefault(); window.dispatchEvent(new CustomEvent("okaos:controls")); }
                return;
            }
            if (PAGE_ID[page] === id || !global.OKAOS) return;
            e.preventDefault();
            global.OKAOS.go(NAV_ROUTE[id]);
        });
    }

    /* ---------- varios ---------- */
    function blockDevShortcuts() {
        window.addEventListener("keydown", function (e) {
            if (e.ctrlKey && (e.key === "s" || e.key === "u")) e.preventDefault();
        });
    }

    function fmtBytes(n) {
        if (n < 1024) return n + " B";
        if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
        return (n / 1048576).toFixed(1) + " MB";
    }

    function enhanceRange(input) {
        function paint() {
            const min = parseFloat(input.min || 0), max = parseFloat(input.max || 100), v = parseFloat(input.value);
            input.style.setProperty("--fill", (((v - min) / (max - min)) * 100).toFixed(1) + "%");
        }
        input.addEventListener("input", paint);
        paint();
        return paint;
    }

    const OKUI = {
        icon: icon,
        mount: mount,
        esc: esc,
        toast: toast,
        click: click,
        fmtBytes: fmtBytes,
        normalizeKey: normalizeKey,
        keyLabel: keyLabel,
        enhanceRange: enhanceRange,
        blockDevShortcuts: blockDevShortcuts,
        NOTE_STYLES: NOTE_STYLES,
        SHORTCUT_DEFS: SHORTCUT_DEFS,
        initShortcuts: initShortcuts,
        settings: { key: SETTINGS_KEY, defaults: DEFAULTS, read: readSettings, write: writeSettings }
    };
    global.OKUI = OKUI;

    function ready() { mount(document); blockDevShortcuts(); initShortcuts(); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
    else ready();
})(window);
