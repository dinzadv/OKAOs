/* ============================================================
   OKAOs · settings.js
   Pantalla de ajustes (PC). Guarda en localStorage["okaos_settings"].
   ============================================================ */
(function () {
    "use strict";

    const STYLE_NAMES = { arrows: "Flechas", circles: "Círculos", bars: "Barras" };
    const LANE_KEYS = ["key1", "key2", "key3", "key4"];

    let cfg = OKUI.settings.read();
    let waiting = null;

    const $ = function (sel, root) { return (root || document).querySelector(sel); };
    const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    /* ---------- guardado ---------- */
    function save() {
        if (cfg.toggles.btnStorage) OKUI.settings.write(cfg);
        else {
            try { localStorage.removeItem(OKUI.settings.key); } catch (e) {}
        }
        paintPreview();
    }

    /* ---------- formato de valores ---------- */
    const FMT = {
        x1: function (v) { return Number(v).toFixed(1) + "x"; },
        x2: function (v) { return Number(v).toFixed(2) + "x"; },
        ms: function (v) { return (v > 0 ? "+" : "") + v + " ms"; },
        pct: function (v) { return Math.round(v) + "%"; }
    };

    /* ---------- atajos: filas generadas ---------- */
    const SC_DEFAULTS = OKUI.settings.defaults.shortcuts;
    function scLabel(v) { return v === "ESCAPE" ? "Esc" : v === "ENTER" ? "Enter" : v === "SPACE" ? "Espacio" : OKUI.keyLabel(v); }
    (function buildShortcuts() {
        $("#shortcutList").innerHTML = OKUI.SHORTCUT_DEFS.map(function (d) {
            return '<div class="row"><div class="row-text"><span class="row-label">' + OKUI.esc(d.label) + '</span><span class="row-desc">' + OKUI.esc(d.desc) + '</span></div>' +
                '<button type="button" class="keycap keycap-sc" data-sc="' + d.id + '"><span class="keycap-lane">Tecla</span><span class="keycap-val" id="sc-' + d.id + '"></span></button></div>';
        }).join("");
    })();
    function paintShortcuts() {
        OKUI.SHORTCUT_DEFS.forEach(function (d) { $("#sc-" + d.id).innerHTML = scLabel(cfg.shortcuts[d.id]); });
    }

    /* ---------- sliders ---------- */
    $$("input.range").forEach(function (input) {
        const g = input.dataset.g, k = input.dataset.k;
        const out = input.parentNode.querySelector("output");
        const fmt = FMT[input.dataset.fmt] || String;
        input.value = cfg[g][k];
        const paintFill = OKUI.enhanceRange(input);
        function show() { out.textContent = fmt(input.value); paintFill(); }
        show();
        input.addEventListener("input", function () {
            cfg[g][k] = parseFloat(input.value);
            show();
            paintPreview();
        });
        input.addEventListener("change", function () { OKUI.click(); save(); });
    });

    /* ---------- interruptores ---------- */
    $$(".switch").forEach(function (sw) {
        const g = sw.dataset.g, k = sw.dataset.k;
        function paint() {
            sw.classList.toggle("on", !!cfg[g][k]);
            sw.setAttribute("aria-checked", cfg[g][k] ? "true" : "false");
        }
        paint();
        sw.addEventListener("click", function () {
            cfg[g][k] = !cfg[g][k];
            paint();
            OKUI.click();
            refreshDependent();
            save();
        });
    });

    /* ---------- segmentados (booleanos) ---------- */
    $$(".seg").forEach(function (seg) {
        const g = seg.dataset.g, k = seg.dataset.k;
        function paint() {
            $$("button", seg).forEach(function (b) { b.classList.toggle("on", (b.dataset.val === "true") === !!cfg[g][k]); });
        }
        paint();
        $$("button", seg).forEach(function (b) {
            b.addEventListener("click", function () {
                cfg[g][k] = b.dataset.val === "true";
                paint();
                OKUI.click();
                save();
            });
        });
    });

    function refreshDependent() {
        const custom = !!cfg.toggles.btnCustomSpeed;
        const input = $('input[data-k="arrowSpeed"]');
        input.disabled = !custom;
        $("#rowSpeed").classList.toggle("disabled", !custom);
    }

    /* ---------- estilo de notas ---------- */
    function paintStyleCards() {
        $$(".style-card").forEach(function (card) {
            const on = card.dataset.style === cfg.options.noteStyle;
            card.classList.toggle("on", on);
            card.setAttribute("aria-checked", on ? "true" : "false");
        });
    }
    $$(".style-card").forEach(function (card) {
        card.addEventListener("click", function () {
            cfg.options.noteStyle = card.dataset.style;
            paintStyleCards();
            OKUI.click();
            save();
        });
    });

    /* ---------- teclas ---------- */
    function keyHTML(value) { return OKUI.keyLabel(value); }
    function paintKeys() {
        LANE_KEYS.forEach(function (id) { $("#" + id).innerHTML = keyHTML(cfg.keys[id]); });
    }
    function normalizeKey(e) { return OKUI.normalizeKey(e); }
    function stopWaiting() {
        if (waiting) waiting.classList.remove("waiting");
        waiting = null;
        delete document.body.dataset.capturing;
    }
    $$(".keycap").forEach(function (cap) {
        cap.addEventListener("click", function (e) {
            e.stopPropagation();
            OKUI.click();
            const was = waiting === cap;
            stopWaiting();
            if (was) return;
            waiting = cap;
            cap.classList.add("waiting");
            cap.querySelector(".keycap-val").textContent = "…";
            document.body.dataset.capturing = "1";
        });
    });
    document.addEventListener("click", function () { if (waiting) { stopWaiting(); paintKeys(); paintShortcuts(); } });

    window.addEventListener("keydown", function (e) {
        if (waiting && waiting.dataset.sc) {
            e.preventDefault();
            if (e.repeat || ["SHIFT", "CONTROL", "ALT", "META", "TAB", "CAPSLOCK"].indexOf(e.key.toUpperCase()) > -1) return;
            const id = waiting.dataset.sc;
            const cap = waiting;
            let key = e.key === "Backspace" ? SC_DEFAULTS[id] : normalizeKey(e);
            if (key.length > 6 && key !== "SPACE" && key !== "ESCAPE" && key !== "ENTER") return;
            const laneClash = LANE_KEYS.filter(function (l) { return cfg.keys[l] === key; })[0];
            if (id === "pause" && laneClash) {
                OKUI.toast("Esa tecla ya es la pista " + laneClash.slice(3) + ". Elige otra para pausar.", "error", 2800);
                return;
            }
            const dup = OKUI.SHORTCUT_DEFS.filter(function (d) {
                return d.id !== id && cfg.shortcuts[d.id] === key && d.id !== "pause" && id !== "pause";
            })[0];
            if (dup) {
                OKUI.toast("La tecla ya se usa para: " + dup.label, "error", 2600);
                return;
            }
            cfg.shortcuts[id] = key;
            stopWaiting();
            paintShortcuts();
            cap.blur();
            OKUI.click();
            save();
            return;
        }
        if (waiting) {
            e.preventDefault();
            if (e.key === "Escape") { stopWaiting(); paintKeys(); return; }
            if (e.repeat || ["SHIFT", "CONTROL", "ALT", "META", "TAB", "CAPSLOCK"].indexOf(e.key.toUpperCase()) > -1) return;
            const key = normalizeKey(e);
            if (key.length > 5 && key !== "SPACE") return;
            const id = "key" + waiting.dataset.lane;
            if (key === cfg.shortcuts.pause) {
                OKUI.toast("Esa tecla está asignada a pausar la partida", "error", 2600);
                return;
            }
            const clash = LANE_KEYS.filter(function (other) { return other !== id && cfg.keys[other] === key; })[0];
            if (clash) {
                const box = $('.keycap[data-lane="' + clash.slice(3) + '"]');
                box.classList.remove("clash");
                void box.offsetWidth;
                box.classList.add("clash");
                OKUI.toast("La tecla " + key + " ya está en la pista " + clash.slice(3), "error", 2400);
                return;
            }
            cfg.keys[id] = key;
            const cap = waiting;
            stopWaiting();
            paintKeys();
            cap.blur();
            OKUI.click();
            save();
            return;
        }
        // probar teclas en la vista previa
        const idx = LANE_KEYS.map(function (id) { return cfg.keys[id]; }).indexOf(normalizeKey(e));
        if (idx > -1 && !e.repeat) {
            const rec = $('.pv-rec[data-lane="' + idx + '"]');
            if (rec) rec.classList.add("hit");
        }
    });
    window.addEventListener("keyup", function (e) {
        const idx = LANE_KEYS.map(function (id) { return cfg.keys[id]; }).indexOf(normalizeKey(e));
        if (idx > -1) {
            const rec = $('.pv-rec[data-lane="' + idx + '"]');
            if (rec) rec.classList.remove("hit");
        }
    });

    /* ---------- vista previa ---------- */
    function paintPreview() {
        const pv = $("#preview");
        const lanes = $("#pvLanes");
        pv.dataset.style = cfg.options.noteStyle;
        $("#previewStyleName").textContent = STYLE_NAMES[cfg.options.noteStyle] || "Flechas";
        lanes.classList.toggle("bottom", !!cfg.toggles.btnArrowPos);
        lanes.classList.toggle("no-lines", !cfg.toggles.btnLines);
        lanes.classList.toggle("no-fx", !cfg.toggles.btnFX);
        lanes.style.setProperty("--pv-scale", (cfg.sliders.noteSize / 100).toFixed(2));
        lanes.style.setProperty("--pv-dark", ((cfg.sliders.laneOpacity / 100) * 0.65).toFixed(2));
        const speed = cfg.toggles.btnCustomSpeed ? cfg.sliders.arrowSpeed : 4.5;
        lanes.style.setProperty("--travel", Math.max(1.1, Math.min(4.2, 2.6 * (4.5 / speed))).toFixed(2) + "s");
    }

    /* ---------- pestañas ---------- */
    $$("#tabs [data-tab]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            OKUI.click();
            $$("#tabs [data-tab]").forEach(function (b) { b.classList.toggle("active", b === btn); });
            $$(".pane").forEach(function (p) { p.classList.toggle("active", p.id === "pane-" + btn.dataset.tab); });
            $("#settingsCol").scrollTop = 0;
        });
    });

    /* ---------- restablecer ---------- */
    const modal = $("#resetModal");
    $("#btnReset").addEventListener("click", function () { OKUI.click(); modal.classList.add("active"); });
    $("#resetCancel").addEventListener("click", function () { modal.classList.remove("active"); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.classList.remove("active"); });
    $("#resetConfirm").addEventListener("click", function () {
        try { localStorage.removeItem(OKUI.settings.key); } catch (e) {}
        location.reload();
    });

    $("#btnResetShortcuts").addEventListener("click", function () {
        cfg.shortcuts = Object.assign({}, SC_DEFAULTS);
        paintShortcuts();
        OKUI.click();
        save();
        OKUI.toast("Atajos restablecidos", "ok", 1800);
    });

    /* ---------- enlace de vuelta ---------- */
    (function () {
        const params = new URLSearchParams(location.search);
        if (params.get("embed") === "1" && window.parent !== window) {
            // Modo incrustado: se abre sobre la pausa de la partida y vuelve a ella
            document.body.classList.add("embed");
            $("#homeText").textContent = "Volver a la canción";
            const home = $("#homeLink");
            home.setAttribute("href", "#");
            function closeEmbed() { window.parent.postMessage({ okaos: "settings-close" }, window.location.origin); }
            home.addEventListener("click", function (e) { e.preventDefault(); OKUI.click(); closeEmbed(); });
            window.addEventListener("keydown", function (e) {
                if (e.key === "Escape" && !waiting && !modal.classList.contains("active")) closeEmbed();
            });
            return;
        }
        const from = params.get("from");
        if (from === "play") {
            $("#homeLink").setAttribute("href", OKAOS.route("jugar"));
            $("#homeText").textContent = "Canciones";
        }
    })();

    /* ---------- init ---------- */
    paintKeys();
    paintShortcuts();
    paintStyleCards();
    refreshDependent();
    paintPreview();
})();
