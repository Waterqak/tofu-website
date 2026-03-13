/* ═══════════════════════════════════════
   MOON — script.js  (complete)
   ═══════════════════════════════════════ */

(function () {
    'use strict';

    // ── Helpers ──────────────────────────────────────────────────────────
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const rand  = (a, b) => Math.random() * (b - a) + a;
    const randInt = (a, b) => Math.floor(rand(a, b + 1));
    const lerp  = (a, b, t) => a + (b - a) * t;

    // ═══════════════════════════════════════════════════════
    // 1. NEBULA BACKGROUND
    // Slow drifting aurora blobs painted on a canvas below stars
    // ═══════════════════════════════════════════════════════
    (function initNebula() {
        const canvas = $('#nebula-canvas');
        const ctx    = canvas.getContext('2d');
        let W, H, blobs = [], raf;

        const BLOB_DEFS = [
            { cx: 0.15, cy: 0.25, rx: 0.50, ry: 0.38, r:  60, g: 80,  b: 220, a: 0.055, sx: 0.00012, sy: 0.00008 },
            { cx: 0.80, cy: 0.70, rx: 0.45, ry: 0.36, r:  80, g: 50,  b: 200, a: 0.048, sx:-0.00009, sy: 0.00011 },
            { cx: 0.50, cy: 0.50, rx: 0.60, ry: 0.45, r:  30, g: 100, b: 180, a: 0.035, sx: 0.00008, sy:-0.00012 },
            { cx: 0.85, cy: 0.20, rx: 0.38, ry: 0.30, r: 180, g: 140, b:  50, a: 0.038, sx:-0.00011, sy: 0.00007 },
            { cx: 0.20, cy: 0.80, rx: 0.40, ry: 0.32, r:  50, g:  80, b: 210, a: 0.042, sx: 0.00010, sy:-0.00008 },
            { cx: 0.65, cy: 0.35, rx: 0.35, ry: 0.28, r: 100, g: 160, b: 220, a: 0.030, sx:-0.00008, sy: 0.00013 },
        ];

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            // Reset blob positions to proportional coords
            blobs = BLOB_DEFS.map(d => ({ ...d, px: d.cx * W, py: d.cy * H, t: rand(0, Math.PI * 2) }));
        }

        function draw(ts) {
            ctx.clearRect(0, 0, W, H);
            blobs.forEach(b => {
                b.t += 0.004;
                // Gentle sinusoidal drift
                b.px = b.cx * W + Math.sin(b.t * 0.7  + 1.0) * W * 0.06;
                b.py = b.cy * H + Math.cos(b.t * 0.55 + 0.5) * H * 0.05;

                const gx = b.px, gy = b.py;
                const rx = b.rx * W * 0.5;
                const ry = b.ry * H * 0.5;
                const pulse = 1 + 0.08 * Math.sin(b.t * 1.4);

                // Ellipse via scale
                ctx.save();
                ctx.translate(gx, gy);
                ctx.scale(1, ry / rx);
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * pulse);
                grad.addColorStop(0,   `rgba(${b.r},${b.g},${b.b},${b.a * 1.6})`);
                grad.addColorStop(0.5, `rgba(${b.r},${b.g},${b.b},${b.a * 0.7})`);
                grad.addColorStop(1,   `rgba(${b.r},${b.g},${b.b},0)`);
                ctx.beginPath();
                ctx.arc(0, 0, rx * pulse, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });
            raf = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(draw);
        });
        resize();
        raf = requestAnimationFrame(draw);
    })();

    // ═══════════════════════════════════════════════════════
    // 2. STAR FIELD + SHOOTING STARS
    // ═══════════════════════════════════════════════════════
    (function initStars() {
        const canvas = $('#star-canvas');
        const ctx    = canvas.getContext('2d');
        let W, H, stars = [], shots = [], raf;

        // A few larger "special" stars with a cross twinkle
        const SPECIALS = 12;

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            stars = Array.from({ length: 280 }, (_, i) => ({
                x: rand(0, W), y: rand(0, H),
                r:       i < SPECIALS ? rand(1.2, 2.2) : rand(0.18, 1.1),
                base:    rand(0.1, 0.72),
                speed:   rand(0.0007, 0.0038),
                phase:   rand(0, Math.PI * 2),
                special: i < SPECIALS,
            }));
        }

        function shoot() {
            if (document.hidden) return;
            const angle = rand(18, 42) * (Math.PI / 180);
            shots.push({
                x: rand(W * .04, W * .72), y: rand(H * .01, H * .32),
                vx: Math.cos(angle) * rand(9, 19),
                vy: Math.sin(angle) * rand(9, 19),
                life: 1, len: rand(65, 170),
            });
        }
        window._shootStar = () => { shoot(); shoot(); shoot(); shoot(); };

        function drawCross(x, y, size, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha * 0.55;
            ctx.strokeStyle = `rgba(220,235,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(x - size * 3, y); ctx.lineTo(x + size * 3, y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y - size * 3); ctx.lineTo(x, y + size * 3); ctx.stroke();
            ctx.restore();
        }

        function draw(t) {
            ctx.clearRect(0, 0, W, H);

            stars.forEach(s => {
                const tw    = .5 + .5 * Math.sin(t * s.speed * 1000 + s.phase);
                const alpha = s.base * (.3 + .7 * tw);
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220,235,255,${alpha})`;
                ctx.fill();
                if (s.special && tw > 0.7) drawCross(s.x, s.y, s.r, alpha * 0.6);
            });

            for (let i = shots.length - 1; i >= 0; i--) {
                const s  = shots[i];
                const tx = s.x - s.vx * (s.len / 14);
                const ty = s.y - s.vy * (s.len / 14);
                const g  = ctx.createLinearGradient(s.x, s.y, tx, ty);
                g.addColorStop(0,   `rgba(255,255,255,${s.life})`);
                g.addColorStop(.28, `rgba(232,201,106,${s.life * .52})`);
                g.addColorStop(1,   'rgba(255,255,255,0)');
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty);
                ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
                // Head glow
                ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.life * 0.9})`; ctx.fill();
                s.x += s.vx; s.y += s.vy; s.life -= 0.021;
                if (s.life <= 0) shots.splice(i, 1);
            }
            raf = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(draw);
        });
        resize();
        raf = requestAnimationFrame(draw);
        setInterval(() => { if (!document.hidden && Math.random() < .42) shoot(); }, 3400);
    })();

    // ═══════════════════════════════════════════════════════
    // 3. ORBITING MOON
    // ═══════════════════════════════════════════════════════
    (function initOrbitMoon() {
        const moon = $('#orbit-moon');
        if (!moon) return;

        let angle = -Math.PI / 2;   // start at top
        let W = window.innerWidth, H = window.innerHeight;
        window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; }, { passive: true });

        (function loop() {
            if (!document.hidden) {
                angle += 0.0052;   // ~21s per revolution
                const rx = W * 0.43, ry = H * 0.38;
                moon.style.left = (W * .5 + Math.cos(angle) * rx) + 'px';
                moon.style.top  = (H * .5 + Math.sin(angle) * ry) + 'px';
                // Scale slightly to simulate depth (closer at bottom)
                const depth = .85 + .15 * ((Math.sin(angle) + 1) / 2);
                moon.style.transform = `translate(-50%,-50%) scale(${depth})`;
            }
            requestAnimationFrame(loop);
        })();
    })();

    // ═══════════════════════════════════════════════════════
    // 4. DUST PARTICLES
    // ═══════════════════════════════════════════════════════
    (function initDust() {
        const container = $('#dust-container');
        function spawn() {
            if (document.hidden) return;
            const d = document.createElement('div');
            d.className = 'dust';
            const size = rand(1.5, 4.5), dur = rand(15, 24);
            d.style.cssText = `left:${rand(0,100)}%;top:-${size}px;width:${size}px;height:${size}px;animation-duration:${dur}s;`;
            container.appendChild(d);
            setTimeout(() => d.remove(), dur * 1000);
        }
        setInterval(spawn, 1900);
    })();

    // ═══════════════════════════════════════════════════════
    // 5. MUSIC VISUALIZER  (Web Audio API)
    //    Ring visualizer around the music button +
    //    Horizon wave bar at the bottom
    // ═══════════════════════════════════════════════════════
    let audioCtx = null, analyser = null, dataArray = null;
    let vizActive = false;

    function setupAudio(audioEl) {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaElementSource(audioEl);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.82;
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            vizActive = true;
            // Activate canvases
            $('#viz-canvas').classList.add('active');
            $('#music-ring-canvas').classList.add('active');
        } catch (e) {
            console.warn('Web Audio not available:', e);
        }
    }

    // ── Ring visualizer (around music button) ───────────
    (function initRingViz() {
        const ringCanvas = $('#music-ring-canvas');
        const ctx = ringCanvas.getContext('2d');
        const SIZE = 110;
        ringCanvas.width  = SIZE;
        ringCanvas.height = SIZE;

        function draw() {
            requestAnimationFrame(draw);
            ctx.clearRect(0, 0, SIZE, SIZE);
            if (!vizActive || !analyser) return;

            analyser.getByteFrequencyData(dataArray);

            const cx = SIZE / 2, cy = SIZE / 2;
            const baseR = 34, barMax = 22;
            const total = 48;   // bars around ring

            for (let i = 0; i < total; i++) {
                // Map bar index to a freq bucket
                const bucketIdx = Math.floor((i / total) * (dataArray.length * 0.55));
                const value = dataArray[bucketIdx] / 255;
                const barH = value * barMax + 1.5;

                const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
                const x1 = cx + Math.cos(angle) * baseR;
                const y1 = cy + Math.sin(angle) * baseR;
                const x2 = cx + Math.cos(angle) * (baseR + barH);
                const y2 = cy + Math.sin(angle) * (baseR + barH);

                // Gold → silver gradient per bar
                const alpha = 0.35 + value * 0.65;
                const g = ctx.createLinearGradient(x1, y1, x2, y2);
                g.addColorStop(0,   `rgba(232,201,106,${alpha * 0.7})`);
                g.addColorStop(1,   `rgba(196,216,245,${alpha})`);

                ctx.beginPath();
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.strokeStyle = g;
                ctx.lineWidth = 2.2;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
        draw();
    })();

    // ── Horizon wave visualizer (bottom of screen) ──────
    (function initHorizonViz() {
        const canvas = $('#viz-canvas');
        const ctx    = canvas.getContext('2d');
        let W, H;

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = 90;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Smoothed bar heights for interpolation
        let smooth = [];

        function draw() {
            requestAnimationFrame(draw);
            ctx.clearRect(0, 0, W, H);
            if (!vizActive || !analyser) return;

            analyser.getByteFrequencyData(dataArray);

            const bars = 80;
            if (smooth.length !== bars) smooth = new Array(bars).fill(0);

            const barW  = W / bars;
            const usable = Math.floor(dataArray.length * 0.6);

            for (let i = 0; i < bars; i++) {
                const bucketIdx = Math.floor((i / bars) * usable);
                const raw   = dataArray[bucketIdx] / 255;
                smooth[i]   = lerp(smooth[i], raw, 0.14);  // smooth follow
                const barH  = smooth[i] * (H * 0.85) + 1;
                const x     = i * barW;
                const y     = H - barH;

                // Gradient bar: gold base → silver tip
                const g = ctx.createLinearGradient(x, H, x, y);
                g.addColorStop(0,   `rgba(232,201,106,${0.18 + smooth[i] * 0.38})`);
                g.addColorStop(0.6, `rgba(196,216,245,${0.14 + smooth[i] * 0.4})`);
                g.addColorStop(1,   `rgba(196,216,245,${0.06 + smooth[i] * 0.28})`);

                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.roundRect(x + 1, y, barW - 2, barH, [2, 2, 0, 0]);
                ctx.fill();
            }

            // Soft gradient overlay at top of the viz to blend into page
            const fade = ctx.createLinearGradient(0, 0, 0, H * 0.55);
            fade.addColorStop(0,   'rgba(3,8,16,0)');
            fade.addColorStop(1,   'rgba(3,8,16,0)');
            ctx.fillStyle = fade;
            ctx.fillRect(0, 0, W, H);
        }
        draw();
    })();

    // ═══════════════════════════════════════════════════════
    // 6. CUSTOM CURSOR (lerp follow)
    // ═══════════════════════════════════════════════════════
    (function initCursor() {
        const cursor = $('.custom-cursor');
        if (!cursor) return;
        let mx = -200, my = -200, cx = -200, cy = -200;

        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

        (function loop() {
            cx += (mx - cx) * 0.11;
            cy += (my - cy) * 0.11;
            cursor.style.left = cx + 'px';
            cursor.style.top  = cy + 'px';
            requestAnimationFrame(loop);
        })();

        const hoverTargets = $$('button, .gallery-item, #close-lightbox, .phase');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    })();

    // ═══════════════════════════════════════════════════════
    // 7. SCROLL PROGRESS
    // ═══════════════════════════════════════════════════════
    (function initScrollProgress() {
        const bar = $('#scroll-progress');
        window.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            const pct = scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100;
            bar.style.width = clamp(pct, 0, 100) + '%';
        }, { passive: true });
    })();

    // ═══════════════════════════════════════════════════════
    // 8. WELCOME SCREEN + AUDIO
    // ═══════════════════════════════════════════════════════
    (function initWelcome() {
        const screen    = $('#welcome-screen');
        const enterBtn  = $('#enter-btn');
        const music     = $('#bg-music');
        const musicBtn  = $('#music-btn');
        const musicIcon = $('#music-icon');
        const musicLbl  = $('#music-label');
        let playing = false;

        function fade(audio, to, ms) {
            const steps = 28, stepMs = ms / steps, delta = (to - audio.volume) / steps;
            let n = 0;
            const iv = setInterval(() => {
                audio.volume = clamp(audio.volume + delta, 0, 1);
                if (++n >= steps) { clearInterval(iv); if (to === 0) audio.pause(); }
            }, stepMs);
        }

        enterBtn.addEventListener('click', () => {
            screen.classList.add('fade-out');
            setupAudio(music);
            music.volume = 0;
            music.play().then(() => {
                fade(music, 0.52, 2800);
                playing = true;
                musicIcon.textContent = '⏸️';
                if (musicLbl) musicLbl.textContent = 'Pause';
            }).catch(() => {});
        });

        musicBtn.addEventListener('click', () => {
            setupAudio(music);
            if (playing) {
                fade(music, 0, 1000);
                musicIcon.textContent = '🎵';
                if (musicLbl) musicLbl.textContent = 'Our Song';
            } else {
                music.play().catch(() => {});
                fade(music, 0.52, 1000);
                musicIcon.textContent = '⏸️';
                if (musicLbl) musicLbl.textContent = 'Pause';
            }
            playing = !playing;
        });
    })();

    // ═══════════════════════════════════════════════════════
    // 9. CARD REVEAL (IntersectionObserver)
    // ═══════════════════════════════════════════════════════
    (function initReveal() {
        // Stagger the love list items once their card is visible
        function revealListItems(card) {
            const items = $$('.list-item', card);
            items.forEach((item, i) => {
                setTimeout(() => item.classList.add('visible'), i * 130 + 200);
            });
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    if (entry.target.id === 'love-card')   revealListItems(entry.target);
                    if (entry.target.id === 'letter-card') setTimeout(startTypewriter, 700);
                }, 60);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        $$('.tilt-card').forEach(c => obs.observe(c));
    })();

    // ═══════════════════════════════════════════════════════
    // 10. 3D TILT
    // ═══════════════════════════════════════════════════════
    (function initTilt() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        $$('.tilt-card').forEach(card => {
            let traf;
            card.addEventListener('mousemove', e => {
                cancelAnimationFrame(traf);
                traf = requestAnimationFrame(() => {
                    const r  = card.getBoundingClientRect();
                    const nx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
                    const ny = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
                    card.style.transform = `perspective(1400px) rotateX(${ny * -4}deg) rotateY(${nx * 4}deg) translateY(-5px)`;
                });
            }, { passive: true });
            card.addEventListener('mouseleave', () => {
                cancelAnimationFrame(traf);
                card.style.transform = 'perspective(1400px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    })();

    // ═══════════════════════════════════════════════════════
    // 11. SVG TREE GROWTH
    // ═══════════════════════════════════════════════════════
    (function initBloom() {
        const treeSvg   = $('#tree-svg');
        const treeParts = $$('.tp', treeSvg);
        const fill      = $('#water-fill');
        const levelText = $('#water-count-text');
        const complText = $('#compliment-text');
        const btn       = $('#compliment-btn');
        const secret    = $('#secret-message');
        const MAX       = 10;
        let count       = 0;

        const compliments = [
            "You've always been more than enough, you know.",
            "There's no version of my day that isn't better with you in it.",
            "The way you love things is one of my favourite things about you.",
            "I don't know how you do it, but you always say exactly the right thing.",
            "Genuinely — you are the funniest person I've ever met.",
            "You make even the quiet moments feel like something worth keeping.",
            "I'm just really, really glad I get to know you.",
        ];

        function updateTree(n) {
            treeParts
                .filter(el => parseInt(el.dataset.s, 10) <= n && !el.classList.contains('show'))
                .forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 50));
        }

        btn.addEventListener('click', () => {
            // Swap compliment with fade
            complText.style.opacity = '0';
            setTimeout(() => {
                complText.textContent  = compliments[randInt(0, compliments.length - 1)];
                complText.style.opacity = '1';
            }, 350);

            if (count >= MAX) return;
            count++;

            fill.style.width = (count / MAX * 100) + '%';
            fill.classList.add('active');

            levelText.textContent = count < MAX
                ? `Moonlight Level  ${count} / ${MAX}`
                : 'The Moon Tree is in Full Bloom ✦ 🌕';

            updateTree(count);

            if (count === MAX) {
                treeSvg.classList.add('full-bloom');
                secret.classList.add('revealed');
                btn.disabled = true;
                if (window._shootStar) window._shootStar();
            }
        });
    })();

    // ═══════════════════════════════════════════════════════
    // 12. LIGHTBOX
    // ═══════════════════════════════════════════════════════
    (function initLightbox() {
        const box      = $('#lightbox');
        const img      = $('#lightbox-img');
        const backdrop = $('#lightbox-backdrop');
        const closeBtn = $('#close-lightbox');

        function open(src) {
            img.src = src;
            box.classList.add('open');
            box.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            box.classList.remove('open');
            box.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(() => { img.src = ''; }, 600);
        }

        $$('.enlargeable').forEach(el => el.addEventListener('click', () => open(el.src)));
        backdrop.addEventListener('click', close);
        closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    })();

    // ═══════════════════════════════════════════════════════
    // 13. TYPEWRITER
    // ═══════════════════════════════════════════════════════
    let typingDone = false;

    function startTypewriter() {
        if (typingDone) return;
        typingDone = true;

        const lines = [
            { id: 'line-1',   text: 'Dear Moon,' },
            { id: 'line-2',   text: "I made this because you deserve to know — really know — how much you mean to me. Not in a passing way. In the kind of way I think about when I'm trying to explain to myself why everything feels lighter when I'm talking to you." },
            { id: 'line-3',   text: "You're the kind of person that makes being alive feel like a good deal. I'm really lucky I get to say that." },
            { id: 'line-sig', text: '— Yours ❤️' },
        ];

        let li = 0, ci = 0;
        function tick() {
            if (li >= lines.length) return;
            const el   = document.getElementById(lines[li].id);
            const text = lines[li].text;
            if (!el.classList.contains('typing-cursor')) el.classList.add('typing-cursor');
            if (ci < text.length) {
                el.textContent += text[ci++];
                setTimeout(tick, 34);
            } else {
                el.classList.remove('typing-cursor');
                li++; ci = 0;
                setTimeout(tick, li < lines.length ? 520 : 0);
            }
        }
        tick();
    }

    // ═══════════════════════════════════════════════════════
    // 14. CLICK SPARKS
    // ═══════════════════════════════════════════════════════
    (function initSparks() {
        const symbols = ['✦', '✶', '·', '⋆', '˚', '🌙', '°'];
        const colors  = ['#e8c96a', '#c4d8f5', '#a0b8e8', '#f0dfa0', '#b0cce8'];

        document.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.closest('.gallery-item')) return;
            for (let i = 0; i < 8; i++) {
                const el    = document.createElement('div');
                el.className = 'click-spark';
                el.textContent = symbols[randInt(0, symbols.length - 1)];
                el.style.color    = colors[randInt(0, colors.length - 1)];
                el.style.fontSize = rand(0.6, 1.15) + 'rem';
                const angle = rand(0, Math.PI * 2);
                const vel   = rand(26, 68);
                el.style.setProperty('--tx', Math.cos(angle) * vel + 'px');
                el.style.setProperty('--ty', Math.sin(angle) * vel - 22 + 'px');
                el.style.setProperty('--rot', rand(-65, 65) + 'deg');
                el.style.left = e.clientX + 'px';
                el.style.top  = e.clientY + 'px';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 950);
            }
        }, { passive: true });
    })();

})();