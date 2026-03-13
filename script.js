/* ═══════════════════════════════════════
   MOON — script.js  (optimized)
   ═══════════════════════════════════════ */

(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const rand  = (a, b) => Math.random() * (b - a) + a;
    const randInt = (a, b) => Math.floor(rand(a, b + 1));
    const lerp  = (a, b, t) => a + (b - a) * t;

    // ═══════════════════════════════════════════════════════
    // 1. BIRTHDAY COUNTDOWN
    // ═══════════════════════════════════════════════════════
    (function initCountdown() {
        const dEl = $('#cd-d'), hEl = $('#cd-h'), mEl = $('#cd-m'), sEl = $('#cd-s');
        const msgEl = $('#bday-msg');
        if (!dEl) return;

        let prev = { d: -1, h: -1, m: -1, s: -1 };

        function getTarget() {
            const now  = new Date();
            const year = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() > 21)
                       ? now.getFullYear() + 1
                       : now.getFullYear();
            return new Date(year, 3, 21, 0, 0, 0, 0);
        }

        function pad(n) { return String(n).padStart(2, '0'); }

        function bump(el, val, key) {
            if (prev[key] !== val) {
                el.classList.remove('bump');
                void el.offsetWidth;
                el.classList.add('bump');
                prev[key] = val;
            }
            el.textContent = pad(val);
        }

        const birthdayLines = [
            "Today's the day. Happy birthday, Moon. 🎂",
            "21 years of you and the world is better for it. 🌙",
            "You made it to 21. That deserves a whole celebration.",
            "Happy birthday. I hope today feels as good as you make me feel. 🌕",
        ];
        let bdayMsgIdx = 0;

        function tick() {
            const now  = new Date();
            const tgt  = getTarget();
            const diff = tgt - now;

            if (diff <= 0) {
                dEl.textContent = '00';
                hEl.textContent = '00';
                mEl.textContent = '00';
                sEl.textContent = '00';
                msgEl.textContent = birthdayLines[bdayMsgIdx % birthdayLines.length];
                if (diff > -86400000) {
                    spawnConfettiBurst();
                    bdayMsgIdx = (bdayMsgIdx + 1) % birthdayLines.length;
                }
                return;
            }

            const totalSecs = Math.floor(diff / 1000);
            const d = Math.floor(totalSecs / 86400);
            const h = Math.floor((totalSecs % 86400) / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;

            bump(dEl, d, 'd');
            bump(hEl, h, 'h');
            bump(mEl, m, 'm');
            bump(sEl, s, 's');

            if (d === 0 && h === 0) {
                msgEl.textContent = "Any minute now. 🌙";
            } else if (d === 0) {
                msgEl.textContent = "It's today! Just a few hours left. 🎂";
            } else if (d === 1) {
                msgEl.textContent = "Tomorrow. I'm already excited for you.";
            } else if (d <= 7) {
                msgEl.textContent = `Only ${d} more days. I can't wait.`;
            } else if (d <= 30) {
                msgEl.textContent = `${d} days to go. It's coming up fast.`;
            } else {
                msgEl.textContent = "Counting down every single day. 🌕";
            }
        }

        tick();
        setInterval(tick, 1000);
    })();

    // ═══════════════════════════════════════════════════════
    // 2. CONFETTI
    // ═══════════════════════════════════════════════════════
    function spawnConfettiBurst(count = 60) {
        const container = $('#confetti-container');
        if (!container) return;
        const colors = ['#e8c96a', '#c4d8f5', '#f5a0c0', '#a0e0d0', '#ffffff', '#ffd700'];
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const c   = document.createElement('div');
            c.className = 'confetti-piece';
            const size = rand(5, 11);
            const dur  = rand(2, 4.5);
            const spin = rand(-720, 720);
            c.style.cssText = `
                left:${rand(10,90)}%;
                top:-${size * 2}px;
                width:${size}px;
                height:${size * rand(0.4, 1.2)}px;
                background:${colors[randInt(0, colors.length-1)]};
                border-radius:${rand(0,4)}px;
                animation-duration:${dur}s;
                animation-delay:${rand(0, 1.5)}s;
                --spin:${spin}deg;
                transform:rotate(${rand(0,360)}deg);
            `;
            frag.appendChild(c);
            setTimeout(() => c.remove(), (dur + 2) * 1000);
        }
        container.appendChild(frag);
    }

    // ═══════════════════════════════════════════════════════
    // 3. NEBULA BACKGROUND
    // ═══════════════════════════════════════════════════════
    (function initNebula() {
        const canvas = $('#nebula-canvas');
        const ctx    = canvas.getContext('2d', { alpha: false });
        let W, H, blobs = [], raf;

        const BLOBS = [
            { cx:.15, cy:.25, rx:.50, ry:.38, r:60,  g:80,  b:220, a:.055 },
            { cx:.80, cy:.70, rx:.45, ry:.36, r:80,  g:50,  b:200, a:.048 },
            { cx:.50, cy:.50, rx:.60, ry:.45, r:30,  g:100, b:180, a:.035 },
            { cx:.85, cy:.20, rx:.38, ry:.30, r:180, g:140, b:50,  a:.038 },
            { cx:.20, cy:.80, rx:.40, ry:.32, r:50,  g:80,  b:210, a:.042 },
            { cx:.65, cy:.35, rx:.35, ry:.28, r:100, g:160, b:220, a:.030 },
        ];

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            blobs = BLOBS.map(d => ({ ...d, t: rand(0, Math.PI * 2) }));
        }

        function draw() {
            // Fill with base color instead of clearRect (alpha:false canvas)
            ctx.fillStyle = '#030810';
            ctx.fillRect(0, 0, W, H);
            blobs.forEach(b => {
                b.t += 0.004;
                const px = b.cx * W + Math.sin(b.t * 0.7  + 1.0) * W * 0.06;
                const py = b.cy * H + Math.cos(b.t * 0.55 + 0.5) * H * 0.05;
                const rx = b.rx * W * 0.5;
                const ry = b.ry * H * 0.5;
                const pulse = 1 + 0.08 * Math.sin(b.t * 1.4);
                ctx.save();
                ctx.translate(px, py);
                ctx.scale(1, ry / rx);
                const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * pulse);
                g.addColorStop(0,   `rgba(${b.r},${b.g},${b.b},${b.a * 1.6})`);
                g.addColorStop(0.5, `rgba(${b.r},${b.g},${b.b},${b.a * 0.7})`);
                g.addColorStop(1,   `rgba(${b.r},${b.g},${b.b},0)`);
                ctx.beginPath(); ctx.arc(0, 0, rx * pulse, 0, Math.PI * 2);
                ctx.fillStyle = g; ctx.fill();
                ctx.restore();
            });
            raf = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else { raf = requestAnimationFrame(draw); }
        });
        resize(); raf = requestAnimationFrame(draw);
    })();

    // ═══════════════════════════════════════════════════════
    // 4. STAR FIELD + SHOOTING STARS
    // ═══════════════════════════════════════════════════════
    (function initStars() {
        const canvas = $('#star-canvas');
        const ctx    = canvas.getContext('2d');
        let W, H, stars = [], shots = [], raf;
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
                vx: Math.cos(angle) * rand(9, 19), vy: Math.sin(angle) * rand(9, 19),
                life: 1, len: rand(65, 170),
            });
        }
        window._shootStar = () => { shoot(); shoot(); shoot(); shoot(); };

        function drawCross(x, y, size, alpha) {
            ctx.save(); ctx.globalAlpha = alpha * 0.55;
            ctx.strokeStyle = `rgba(220,235,255,${alpha})`; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(x - size * 3, y); ctx.lineTo(x + size * 3, y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y - size * 3); ctx.lineTo(x, y + size * 3); ctx.stroke();
            ctx.restore();
        }

        function draw(t) {
            ctx.clearRect(0, 0, W, H);
            stars.forEach(s => {
                const tw = .5 + .5 * Math.sin(t * s.speed * 1000 + s.phase);
                const alpha = s.base * (.3 + .7 * tw);
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220,235,255,${alpha})`; ctx.fill();
                if (s.special && tw > 0.7) drawCross(s.x, s.y, s.r, alpha * 0.6);
            });
            for (let i = shots.length - 1; i >= 0; i--) {
                const s  = shots[i];
                const tx = s.x - s.vx * (s.len / 14);
                const ty = s.y - s.vy * (s.len / 14);
                const g  = ctx.createLinearGradient(s.x, s.y, tx, ty);
                g.addColorStop(0, `rgba(255,255,255,${s.life})`);
                g.addColorStop(.28, `rgba(232,201,106,${s.life * .52})`);
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty);
                ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
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
            else { raf = requestAnimationFrame(draw); }
        });
        resize(); raf = requestAnimationFrame(draw);
        setInterval(() => { if (!document.hidden && Math.random() < .42) shoot(); }, 3400);
    })();

    // ═══════════════════════════════════════════════════════
    // 5. ORBITING MOON
    // ═══════════════════════════════════════════════════════
    (function initOrbitMoon() {
        const moon = $('#orbit-moon');
        if (!moon) return;
        let angle = -Math.PI / 2;
        let W = window.innerWidth, H = window.innerHeight;
        window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; }, { passive: true });
        (function loop() {
            if (!document.hidden) {
                angle += 0.0052;
                const rx = W * 0.43, ry = H * 0.38;
                const x = W * .5 + Math.cos(angle) * rx;
                const y = H * .5 + Math.sin(angle) * ry;
                const depth = .85 + .15 * ((Math.sin(angle) + 1) / 2);
                // Use transform for GPU-composited movement — avoids left/top reflow
                moon.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${depth})`;
            }
            requestAnimationFrame(loop);
        })();
    })();

    // ═══════════════════════════════════════════════════════
    // 6. DUST PARTICLES
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
    // 7. MUSIC VISUALIZER
    // ═══════════════════════════════════════════════════════
    let audioCtx = null, analyser = null, dataArray = null, vizActive = false;

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
            $('#viz-canvas').classList.add('active');
            $('#music-ring-canvas').classList.add('active');
        } catch(e) { console.warn('Web Audio unavailable'); }
    }

    // Ring visualizer
    (function initRingViz() {
        const ringCanvas = $('#music-ring-canvas');
        const ctx = ringCanvas.getContext('2d');
        const S = 110;
        ringCanvas.width = ringCanvas.height = S;

        (function draw() {
            requestAnimationFrame(draw);
            ctx.clearRect(0, 0, S, S);
            if (!vizActive || !analyser) return;
            analyser.getByteFrequencyData(dataArray);
            const cx = S/2, cy = S/2, base = 34, barMax = 22, total = 48;
            for (let i = 0; i < total; i++) {
                const bucket = Math.floor((i / total) * dataArray.length * 0.55);
                const val = dataArray[bucket] / 255;
                const barH = val * barMax + 1.5;
                const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
                const x1 = cx + Math.cos(angle) * base,     y1 = cy + Math.sin(angle) * base;
                const x2 = cx + Math.cos(angle) * (base+barH), y2 = cy + Math.sin(angle) * (base+barH);
                const alpha = 0.35 + val * 0.65;
                const g = ctx.createLinearGradient(x1, y1, x2, y2);
                g.addColorStop(0, `rgba(232,201,106,${alpha * 0.7})`);
                g.addColorStop(1, `rgba(196,216,245,${alpha})`);
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.strokeStyle = g; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.stroke();
            }
        })();
    })();

    // Horizon wave
    (function initHorizonViz() {
        const canvas = $('#viz-canvas');
        const ctx    = canvas.getContext('2d');
        let W = window.innerWidth;
        canvas.width = W; canvas.height = 90;
        window.addEventListener('resize', () => { W = window.innerWidth; canvas.width = W; }, { passive: true });
        let smooth = [];

        (function draw() {
            requestAnimationFrame(draw);
            ctx.clearRect(0, 0, W, 90);
            if (!vizActive || !analyser) return;
            analyser.getByteFrequencyData(dataArray);
            const bars = 80, usable = Math.floor(dataArray.length * 0.6);
            if (smooth.length !== bars) smooth = new Array(bars).fill(0);
            const barW = W / bars;
            for (let i = 0; i < bars; i++) {
                const bucket = Math.floor((i / bars) * usable);
                const raw = dataArray[bucket] / 255;
                smooth[i] = lerp(smooth[i], raw, 0.14);
                const barH = smooth[i] * 76 + 1;
                const x = i * barW, y = 90 - barH;
                const g = ctx.createLinearGradient(x, 90, x, y);
                g.addColorStop(0, `rgba(232,201,106,${0.18 + smooth[i] * 0.38})`);
                g.addColorStop(0.6, `rgba(196,216,245,${0.14 + smooth[i] * 0.4})`);
                g.addColorStop(1, `rgba(196,216,245,${0.06 + smooth[i] * 0.28})`);
                ctx.fillStyle = g;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x + 1, y, barW - 2, barH, [2, 2, 0, 0]);
                else ctx.rect(x + 1, y, barW - 2, barH);
                ctx.fill();
            }
        })();
    })();

    // ═══════════════════════════════════════════════════════
    // 8. CURSOR — fully rewritten for smoothness & no jitter
    // ═══════════════════════════════════════════════════════
    (function initCursor() {
        const cursor = $('.custom-cursor');
        if (!cursor) return;

        let mx = -200, my = -200;
        let cx = -200, cy = -200;
        let hovering = false;

        // Track raw mouse — no rAF here, just store coords
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
        }, { passive: true });

        // Single rAF loop — lerp toward target each frame
        (function loop() {
            // Faster lerp factor = feels more responsive, less laggy
            cx = lerp(cx, mx, 0.18);
            cy = lerp(cy, my, 0.18);

            // Use transform only — no left/top (avoids layout thrashing)
            cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

            requestAnimationFrame(loop);
        })();

        // Hover state
        function addHover(el) {
            el.addEventListener('mouseenter', () => {
                if (!hovering) { cursor.classList.add('hovering'); hovering = true; }
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering'); hovering = false;
            });
        }

        $$('button, .gallery-item, #close-lightbox, .phase, .list-item').forEach(addHover);

        // Hide cursor when it leaves window
        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    })();

    // ═══════════════════════════════════════════════════════
    // 9. SCROLL PROGRESS
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
    // 10. WELCOME + AUDIO
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
    // 11. CARD REVEAL
    // ═══════════════════════════════════════════════════════
    (function initReveal() {
        function revealList(card) {
            $$('.list-item', card).forEach((item, i) => {
                setTimeout(() => item.classList.add('visible'), i * 120 + 180);
            });
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    if (entry.target.id === 'love-card')   revealList(entry.target);
                    if (entry.target.id === 'letter-card') setTimeout(startTypewriter, 700);
                }, 60);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        $$('.tilt-card').forEach(c => obs.observe(c));
    })();

    // ═══════════════════════════════════════════════════════
    // 12. 3D TILT
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
    // 13. SVG TREE GROWTH
    // ═══════════════════════════════════════════════════════
    (function initBloom() {
        const treeSvg   = $('#tree-svg');
        const treeParts = $$('.tp', treeSvg);
        const fill      = $('#water-fill');
        const levelText = $('#water-count-text');
        const complText = $('#compliment-text');
        const btn       = $('#compliment-btn');
        const secret    = $('#secret-message');
        let count = 0;
        const MAX = 10;

        const compliments = [
            "You've always been more than enough — I hope you know that.",
            "There's no version of my day that doesn't get better when you're in it.",
            "The way you care about things is one of my favourite things about you.",
            "You have no idea how good it is talking to you. Like genuinely.",
            "You are, without question, the funniest person I know.",
            "Even the boring moments feel good with you in them.",
            "I'm really glad I get to know you. Like actually really glad.",
        ];

        function updateTree(n) {
            treeParts
                .filter(el => parseInt(el.dataset.s, 10) <= n && !el.classList.contains('show'))
                .forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 50));
        }

        btn.addEventListener('click', () => {
            complText.style.opacity = '0';
            setTimeout(() => {
                complText.textContent  = compliments[randInt(0, compliments.length - 1)];
                complText.style.opacity = '1';
            }, 340);
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
    // 14. LIGHTBOX — fixed image zoom + keyboard + scroll lock
    // ═══════════════════════════════════════════════════════
    (function initLightbox() {
        const box      = $('#lightbox');
        const imgEl    = $('#lightbox-img');
        const backdrop = $('#lightbox-backdrop');
        const closeBtn = $('#close-lightbox');

        // Preload image before showing so it doesn't flash/resize
        function open(src) {
            // Load image first, then show
            imgEl.style.opacity = '0';
            imgEl.src = src;

            const preload = new Image();
            preload.onload = () => {
                box.classList.add('open');
                box.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                // Small delay so the open transition fires cleanly
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        imgEl.style.opacity = '1';
                    });
                });
            };
            preload.onerror = () => {
                // Even if error, still open box
                box.classList.add('open');
                box.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                imgEl.style.opacity = '1';
            };
            preload.src = src;
        }

        function close() {
            box.classList.remove('open');
            box.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(() => {
                imgEl.src = '';
                imgEl.style.opacity = '0';
            }, 600);
        }

        // Delegate to all .enlargeable images (including dynamically added ones)
        document.addEventListener('click', e => {
            const target = e.target.closest('.enlargeable');
            if (target) {
                e.stopPropagation();
                // Use data-src if available, fallback to src
                const src = target.dataset.src || target.src || target.getAttribute('href');
                if (src) open(src);
            }
        });

        backdrop.addEventListener('click', close);
        closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('open')) close(); });

        // Prevent scroll/zoom inside lightbox leaking
        box.addEventListener('wheel', e => e.stopPropagation(), { passive: false });
    })();

    // ═══════════════════════════════════════════════════════
    // 15. TYPEWRITER
    // ═══════════════════════════════════════════════════════
    let typingDone = false;

    function startTypewriter() {
        if (typingDone) return;
        typingDone = true;

        const lines = [
            { id: 'line-1',   text: 'Dear Moon,' },
            { id: 'line-2',   text: "I made this for you because I wanted you to have something real — not a text, not a voice note. Something you can come back to. Something that just says: I see you, and I think you're incredible." },
            { id: 'line-3',   text: "You make things feel lighter just by being around. That's not nothing. That's actually everything." },
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
                setTimeout(tick, li < lines.length ? 500 : 0);
            }
        }
        tick();
    }

    // ═══════════════════════════════════════════════════════
    // 16. CLICK SPARKS
    // ═══════════════════════════════════════════════════════
    (function initSparks() {
        const symbols = ['✦', '✶', '·', '⋆', '˚', '🌙', '°', '*'];
        const colors  = ['#e8c96a', '#c4d8f5', '#a0b8e8', '#f0dfa0', '#b0cce8'];

        document.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.closest('.gallery-item')) return;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < 8; i++) {
                const el = document.createElement('div');
                el.className = 'click-spark';
                el.textContent = symbols[randInt(0, symbols.length - 1)];
                el.style.color    = colors[randInt(0, colors.length - 1)];
                el.style.fontSize = rand(0.6, 1.15) + 'rem';
                const angle = rand(0, Math.PI * 2), vel = rand(26, 68);
                el.style.setProperty('--tx', Math.cos(angle) * vel + 'px');
                el.style.setProperty('--ty', Math.sin(angle) * vel - 22 + 'px');
                el.style.setProperty('--rot', rand(-65, 65) + 'deg');
                // Use fixed position based on click coords — no left/top reflow
                el.style.left = e.clientX + 'px';
                el.style.top  = e.clientY + 'px';
                frag.appendChild(el);
                setTimeout(() => el.remove(), 950);
            }
            document.body.appendChild(frag);
        }, { passive: true });
    })();

})();