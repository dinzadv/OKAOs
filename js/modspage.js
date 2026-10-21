/* ============================================================
   OKAOs · modspage.js
   Pantalla sc/mods.html: lista de mods, fondo (video/imagen) y
   música del mod, mecánicas y activar / desactivar.
   ============================================================ */
(function () {
    "use strict";

    const $ = function (id) { return document.getElementById(id); };
    const panel = $("rightPanel");
    const bgArt = $("modBgArt");
    const bgVideo = $("modBgVideo");
    const disc = $("disc");
    const discArt = $("discArt");
    const DEFAULT_COVER = OKAOS.asset("img/assets/mechanics/mod.svg");
    const DEFAULT_BG = OKAOS.asset("img/fn/f2.jpg");

    let filter = "all";
    let selected = null;
    let songs = [];
    const mediaCache = {};
    const bgm = new Audio();
    bgm.loop = true;
    let fadeTimer = null;
    let selectToken = 0;

    /* ---------- datos ---------- */
    function modSongs(mod) {
        return songs.filter(function (s) { return s.source === "mod" && s.mod === mod.id; });
    }

    function modMechanics(mod) {
        const ids = [];
        mod.mecanicas.forEach(function (m) { if (ids.indexOf(m.id) === -1) ids.push(m.id); });
        modSongs(mod).forEach(function (s) {
            (s.mecanicas || []).forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); });
        });
        return ids.map(function (id) { return OKAOS.mechanicInfo(id); }).filter(Boolean);
    }

    async function mediaOf(mod) {
        if (!mediaCache[mod.id]) mediaCache[mod.id] = await mod.media();
        return mediaCache[mod.id];
    }

    function setImg(img, url) {
        img.classList.toggle("is-svg", !url);
        img.src = url || DEFAULT_COVER;
    }

    /* ---------- audio de fondo ---------- */
    function bgmVolume() {
        const s = OKUI.settings.read().sliders;
        return Math.max(0, Math.min(1, (s.masterVol / 100) * (s.bgmVol / 100)));
    }
    function fadeTo(target, done) {
        clearInterval(fadeTimer);
        fadeTimer = setInterval(function () {
            const diff = target - bgm.volume;
            if (Math.abs(diff) < 0.05) {
                bgm.volume = target;
                clearInterval(fadeTimer);
                if (done) done();
            } else {
                bgm.volume = Math.max(0, Math.min(1, bgm.volume + Math.sign(diff) * 0.05));
            }
        }, 24);
    }
    function playBgm(url) {
        const vol = bgmVolume();
        function start() {
            if (!url) { bgm.pause(); disc.classList.remove("spinning"); return; }
            bgm.src = url;
            bgm.volume = 0;
            bgm.play().then(function () { fadeTo(vol); }).catch(function () {});
        }
        if (!bgm.paused && bgm.src) fadeTo(0, function () { bgm.pause(); start(); });
        else start();
    }
    bgm.addEventListener("play", function () { disc.classList.add("spinning"); });
    bgm.addEventListener("pause", function () { disc.classList.remove("spinning"); });

    /* ---------- fondo ---------- */
    function setBackground(media) {
        if (media.video) {
            bgArt.classList.remove("show");
            if (bgVideo.getAttribute("src") !== media.video) bgVideo.src = media.video;
            bgVideo.play().catch(function () {});
            bgVideo.classList.add("show");
        } else {
            bgVideo.classList.remove("show");
            bgVideo.pause();
            bgVideo.removeAttribute("src");
            bgVideo.load();
            bgArt.onerror = function () { bgArt.classList.remove("show"); };
            bgArt.src = media.fondo || DEFAULT_BG;
            requestAnimationFrame(function () { bgArt.classList.add("show"); });
        }
    }

    /* ---------- lista curva (igual que play.html) ---------- */
    function updateCurveLayout() {
        const rect = panel.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        panel.querySelectorAll(".track").forEach(function (track) {
            const r = track.getBoundingClientRect();
            const dist = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - centerY) / (rect.height / 2)));
            const x = dist * dist * 70 + (track.classList.contains("selected") ? 15 : 0);
            track.style.transform = "skewX(-9deg) translateX(" + x + "px) scale(" + (track.classList.contains("selected") ? 1.02 : 1) + ")";
        });
    }
    panel.addEventListener("scroll", updateCurveLayout);
    window.addEventListener("resize", updateCurveLayout);

    function renderList() {
        panel.innerHTML = "";
        const list = OKAOS.allMods.filter(function (m) {
            return filter === "all" || (filter === "on" ? m.enabled : !m.enabled);
        });

        if (!list.length) {
            const empty = document.createElement("div");
            empty.className = "mods-empty";
            const none = !OKAOS.allMods.length;
            empty.innerHTML = OKUI.icon("puzzle") +
                "<h2>" + (none ? "No hay mods instalados" : "Nada por aquí") + "</h2>" +
                "<p>" + (none ? "Copia la carpeta de un mod dentro de mods/ y recarga esta pantalla." : "Ningún mod coincide con este filtro.") + "</p>" +
                (none ? '<button type="button" class="btn btn-gold" id="emptyHow">' + OKUI.icon("info") + "Cómo instalar</button>" : "");
            panel.appendChild(empty);
            const b = $("emptyHow");
            if (b) b.addEventListener("click", function () { $("howModal").classList.add("active"); });
            return;
        }

        list.forEach(function (mod, i) {
            const item = document.createElement("div");
            item.className = "track " + (mod.enabled ? "is-on" : "is-off");
            item.tabIndex = 0;
            item.dataset.id = mod.id;
            item.style.animationDelay = (0.1 + i * 0.05) + "s";
            const mech = modMechanics(mod).slice(0, 4);
            item.innerHTML =
                '<div class="track-inner">' +
                '<div class="track-cover"><img src="' + DEFAULT_COVER + '" class="is-svg" alt=""></div>' +
                '<div class="track-body"><div class="track-name">' + OKUI.esc(mod.nombre) + '</div>' +
                '<div class="track-author">' + OKUI.esc(mod.creador || "Sin autor") + (mod.version ? " · v" + OKUI.esc(mod.version) : "") + "</div></div>" +
                '<div class="track-mech">' + mech.map(function (m) { return '<img src="' + m.icono + '" alt="' + OKUI.esc(m.nombre) + '" title="' + OKUI.esc(m.nombre) + '">'; }).join("") + "</div>" +
                '<span class="track-state" title="' + (mod.enabled ? "Activo" : "Desactivado") + '"></span>' +
                "</div>";
            item.addEventListener("click", function () { select(mod, item); });
            item.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(mod, item); } });
            panel.appendChild(item);
            mediaOf(mod).then(function (media) {
                if (media.portada) setImg(item.querySelector(".track-cover img"), media.portada);
            });
            if (selected && selected.id === mod.id) item.classList.add("selected");
        });
        requestAnimationFrame(updateCurveLayout);
    }

    /* ---------- selección ---------- */
    function renderMechanics(mod) {
        const list = modMechanics(mod);
        const box = $("mechBox");
        const wrap = $("mechList");
        const desc = $("mechDesc");
        wrap.innerHTML = "";
        desc.textContent = "";
        box.hidden = !list.length;
        list.forEach(function (m) {
            const pill = document.createElement("button");
            pill.type = "button";
            pill.className = "mech-pill";
            pill.innerHTML = '<img src="' + m.icono + '" alt=""><span>' + OKUI.esc(m.nombre) + "</span>";
            function show() {
                wrap.querySelectorAll(".mech-pill").forEach(function (p) { p.classList.remove("on"); });
                pill.classList.add("on");
                desc.textContent = m.descripcion;
            }
            pill.addEventListener("mouseenter", show);
            pill.addEventListener("focus", show);
            pill.addEventListener("click", show);
            wrap.appendChild(pill);
        });
        if (list.length) wrap.firstChild.classList.add("on"), desc.textContent = list[0].descripcion;
    }

    async function select(mod, item) {
        const token = ++selectToken;
        selected = mod;
        panel.querySelectorAll(".track").forEach(function (t) { t.classList.remove("selected"); });
        if (item) item.classList.add("selected");
        updateCurveLayout();

        $("headName").textContent = mod.nombre;
        $("headAuthor").textContent = mod.creador || "Sin autor";
        const tag = $("statusTag");
        tag.textContent = mod.enabled ? "Activo" : "Desactivado";
        tag.className = "art-tag " + (mod.enabled ? "on" : "off");
        const n = modSongs(mod).length;
        $("quickSongs").textContent = mod.enabled ? String(n) : "--";
        $("quickVersion").textContent = mod.version || "--";
        renderMechanics(mod);

        const toggle = $("btnToggle");
        toggle.disabled = false;
        toggle.classList.toggle("is-off", mod.enabled);
        $("toggleText").textContent = mod.enabled ? "Desactivar" : "Activar";
        $("btnModInfo").disabled = false;
        $("btnModSongs").disabled = !(mod.enabled && n > 0);

        const media = await mediaOf(mod);
        if (token !== selectToken) return;
        setImg(discArt, media.portada);
        setBackground(media);
        playBgm(media.bgm);
    }

    /* ---------- activar / desactivar ---------- */
    $("btnToggle").addEventListener("click", function () {
        if (!selected) return;
        OKUI.click();
        const turnOn = !selected.enabled;
        OKAOS.setEnabled(selected.id, turnOn);
        OKUI.toast((turnOn ? "Activando " : "Desactivando ") + selected.nombre + "...", "ok", 1400);
        try { sessionStorage.setItem("okaos_mods_select", selected.id); } catch (e) {}
        fadeTo(0, function () { bgm.pause(); });
        setTimeout(function () { location.reload(); }, 650);
    });

    $("btnModSongs").addEventListener("click", function () {
        if (!selected) return;
        OKUI.click();
        fadeTo(0, function () { bgm.pause(); location.href = OKAOS.route("jugar", { mod: selected.id }); });
    });

    /* ---------- información ---------- */
    function fact(label, value) {
        return '<div class="mod-fact"><span>' + OKUI.esc(label) + "</span><b>" + OKUI.esc(value) + "</b></div>";
    }

    async function openInfo(mod) {
        const media = await mediaOf(mod);
        setImg($("infoCover"), media.portada);
        $("infoName").textContent = mod.nombre;
        $("infoAuthor").textContent = mod.creador ? "por " + mod.creador : "Autor desconocido";
        $("infoDesc").textContent = mod.descripcion || "Este mod no incluye descripción.";
        $("infoTags").innerHTML = (mod.etiquetas || []).map(function (t) { return '<span class="chip">' + OKUI.esc(t) + "</span>"; }).join("") +
            '<span class="chip ' + (mod.enabled ? "gold" : "") + '">' + (mod.enabled ? "Activo" : "Desactivado") + "</span>";

        const sg = modSongs(mod);
        $("infoFacts").innerHTML =
            fact("Versión", mod.version || "—") +
            fact("Carpeta", "mods/" + mod.id + "/") +
            fact("Canciones", mod.enabled ? String(sg.length) : "—") +
            fact("Archivos reemplazados", mod.enabled ? String(mod.files.length) : "—") +
            fact("Scripts", mod.enabled ? String(mod.scripts.length) : "—") +
            fact("Estilos extra", mod.enabled ? String(mod.estilos.length) : "—") +
            fact("Dificultades nuevas", mod.dificultades.length ? mod.dificultades.join(", ") : "—");

        const mech = modMechanics(mod);
        $("infoMech").innerHTML = mech.length ? mech.map(function (m) {
            return '<div class="mech-card"><img src="' + m.icono + '" alt=""><div><b>' + OKUI.esc(m.nombre) + "</b><span>" + OKUI.esc(m.descripcion) + "</span></div></div>";
        }).join("") : '<div class="mod-empty-line">Este mod no añade mecánicas especiales.</div>';

        $("infoSongs").innerHTML = sg.length ? sg.map(function (s) {
            return '<div class="mod-song"><b>' + OKUI.esc(s.nombre) + '</b><span class="chip">' + OKUI.esc(s.dificultad) + "</span>" +
                (s.mecanicas || []).map(function (id) { const m = OKAOS.mechanicInfo(id); return m ? '<img src="' + m.icono + '" title="' + OKUI.esc(m.nombre) + '" alt="">' : ""; }).join("") + "</div>";
        }).join("") : '<div class="mod-empty-line">' + (mod.enabled ? "Este mod no trae canciones." : "Activa el mod para ver sus canciones.") + "</div>";

        const notes = $("infoNotes");
        notes.innerHTML = (mod.notas || []).map(function (n) { return "<li>" + OKUI.esc(n) + "</li>"; }).join("");
        $("infoNotesWrap").hidden = !(mod.notas && mod.notas.length);
        $("infoModal").classList.add("active");
    }

    $("btnModInfo").addEventListener("click", function () { if (selected) { OKUI.click(); openInfo(selected); } });
    $("infoClose").addEventListener("click", function () { $("infoModal").classList.remove("active"); });
    $("btnHowTo").addEventListener("click", function () { OKUI.click(); $("howModal").classList.add("active"); });
    $("howClose").addEventListener("click", function () { $("howModal").classList.remove("active"); });
    ["infoModal", "howModal"].forEach(function (id) {
        $(id).addEventListener("click", function (e) { if (e.target === $(id)) $(id).classList.remove("active"); });
    });
    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape") document.querySelectorAll(".modal-backdrop.active").forEach(function (m) { m.classList.remove("active"); });
    });

    /* ---------- filtros ---------- */
    document.querySelectorAll("#filterMenu [data-filter]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.querySelectorAll("#filterMenu [data-filter]").forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            filter = btn.dataset.filter;
            renderList();
        });
    });

    /* ---------- salir con fundido ---------- */
    $("homeBtn").addEventListener("click", function (e) {
        e.preventDefault();
        const url = this.getAttribute("href");
        if (!bgm.paused) fadeTo(0, function () { bgm.pause(); location.href = url; });
        else location.href = url;
    });

    /* ---------- arranque ---------- */
    (async function init() {
        try { songs = await SONGS.list(); } catch (e) { songs = []; }
        renderList();
        let wanted = null;
        try { wanted = sessionStorage.getItem("okaos_mods_select"); sessionStorage.removeItem("okaos_mods_select"); } catch (e) {}
        const target = wanted && OKAOS.allMods.filter(function (m) { return m.id === wanted; })[0];
        if (target) select(target, panel.querySelector('.track[data-id="' + CSS.escape(target.id) + '"]'));
        else setBackground({ fondo: DEFAULT_BG });
    })();
})();
