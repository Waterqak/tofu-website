/* ═══════════════════════════════════════
   MOON — script.js
   ═══════════════════════════════════════ */

(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const rand = (a, b) => Math.random() * (b - a) + a;
    const randInt = (a, b) => Math.floor(rand(a, b + 1));

    // ─── 1. Star Field ──────────────────────────────────────────────────
    (function initStars() {
        const canvas = $('#star-canvas');
        const ctx    = canvas.getContext('2d');
        let W, H, stars = [], shots = [], raf;

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            stars = Array.from({ length: 260 }, () => ({
                x: rand(0, W), y: rand(0, H),
                r: rand(0.2, 1.3), base: rand(0.1, 0.7),
                speed: rand(0.0008, 0.004), phase: rand(0, Math.PI * 2),
            }));
        }

        function shoot() {
            if (document.hidden) return;
            const angle = rand(22, 38) * (Math.PI / 180);
            shots.push({
                x: rand(W * .05, W * .75), y: rand(H * .02, H * .35),
                vx: Math.cos(angle) * rand(10, 18),
                vy: Math.sin(angle) * rand(10, 18),
                life: 1, len: rand(70, 160),
            });
        }
        window._shootStar = () => { shoot(); shoot(); shoot(); };

        function draw(t) {
            ctx.clearRect(0, 0, W, H);
            stars.forEach(s => {
                const tw = .5 + .5 * Math.sin(t * s.speed * 1000 + s.phase);
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220,235,255,${s.base * (.35 + .65 * tw)})`;
                ctx.fill();
            });
            for (let i = shots.length - 1; i >= 0; i--) {
                const s = shots[i];
                const tx = s.x - s.vx * (s.len / 14);
                const ty = s.y - s.vy * (s.len / 14);
                const g  = ctx.createLinearGradient(s.x, s.y, tx, ty);
                g.addColorStop(0,   `rgba(255,255,255,${s.life})`);
                g.addColorStop(0.3, `rgba(232,201,106,${s.life * .5})`);
                g.addColorStop(1,   'rgba(255,255,255,0)');
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty);
                ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.stroke();
                ctx.beginPath(); ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.life})`; ctx.fill();
                s.x += s.vx; s.y += s.vy; s.life -= 0.022;
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
        setInterval(() => { if (!document.hidden && Math.random() < .45) shoot(); }, 3200);
    })();

    // ─── 2. Orbiting Moon ───────────────────────────────────────────────
    (function initOrbitMoon() {
        const moon = $('#orbit-moon');
        if (!moon) return;

        // Start at the top of the ellipse
        let angle = -Math.PI / 2;
        let W = window.innerWidth;
        let H = window.innerHeight;

        window.addEventListener('resize', () => {
            W = window.innerWidth;
            H = window.innerHeight;
        }, { passive: true });

        function loop() {
            if (!document.hidden) {
                // Slow, serene orbit — full rotation every ~20s at 60fps
                angle += 0.0055;

                // Ellipse: wider horizontally so it hugs the viewport shape
                const rx = W * 0.43;
                const ry = H * 0.37;
                const cx = W * 0.5;
                const cy = H * 0.5;

                moon.style.left = (cx + Math.cos(angle) * rx) + 'px';
                moon.style.top  = (cy + Math.sin(angle) * ry) + 'px';
            }
            requestAnimationFrame(loop);
        }
        loop();
    })();

    // ─── 3. Dust Particles ──────────────────────────────────────────────
    (function initDust() {
        const container = $('#dust-container');
        function spawn() {
            if (document.hidden) return;
            const d = document.createElement('div');
            d.className = 'dust';
            const size = rand(2, 5);
            const dur  = rand(14, 22);
            d.style.cssText = `left:${rand(0,100)}%;top:-${size}px;width:${size}px;height:${size}px;animation-duration:${dur}s;`;
            container.appendChild(d);
            setTimeout(() => d.remove(), dur * 1000);
        }
        setInterval(spawn, 1800);
    })();

    // ─── 4. Custom Cursor (lerp) ─────────────────────────────────────────
    (function initCursor() {
        const cursor = $('.custom-cursor');
        if (!cursor) return;
        let mx = -200, my = -200, cx = -200, cy = -200, raf;

        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

        (function loop() {
            cx += (mx - cx) * 0.11;
            cy += (my - cy) * 0.11;
            cursor.style.left = cx + 'px';
            cursor.style.top  = cy + 'px';
            raf = requestAnimationFrame(loop);
        })();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
        });

        $$('button, .gallery-item, #close-lightbox, .phase').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    })();

    // ─── 5. Scroll Progress ─────────────────────────────────────────────
    (function initScrollProgress() {
        const bar = $('#scroll-progress');
        window.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            bar.style.width = clamp(scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100, 0, 100) + '%';
        }, { passive: true });
    })();

    // ─── 6. Welcome & Audio ─────────────────────────────────────────────
    (function initWelcome() {
        const screen    = $('#welcome-screen');
        const enterBtn  = $('#enter-btn');
        const music     = $('#bg-music');
        const musicBtn  = $('#music-btn');
        const musicIcon = $('#music-icon');
        const musicLbl  = $('#music-label');
        let playing = false;

        function fade(audio, to, ms) {
            const steps = 25, stepMs = ms / steps, delta = (to - audio.volume) / steps;
            let n = 0;
            const iv = setInterval(() => {
                audio.volume = clamp(audio.volume + delta, 0, 1);
                if (++n >= steps) { clearInterval(iv); if (to === 0) audio.pause(); }
            }, stepMs);
        }

        enterBtn.addEventListener('click', () => {
            screen.classList.add('fade-out');
            music.volume = 0;
            music.play().then(() => {
                fade(music, 0.55, 2500);
                playing = true;
                musicIcon.textContent = '⏸️';
                musicLbl.textContent  = 'Pause';
            }).catch(() => {});
        });

        musicBtn.addEventListener('click', () => {
            if (playing) {
                fade(music, 0, 900);
                musicIcon.textContent = '🎵';
                musicLbl.textContent  = 'Our Song';
            } else {
                music.play().catch(() => {});
                fade(music, 0.55, 900);
                musicIcon.textContent = '⏸️';
                musicLbl.textContent  = 'Pause';
            }
            playing = !playing;
        });
    })();

    // ─── 7. Card Reveal ─────────────────────────────────────────────────
    (function initReveal() {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                setTimeout(() => entry.target.classList.add('visible'), 60);
                if (entry.target.id === 'letter-card') setTimeout(startTypewriter, 760);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        $$('.tilt-card').forEach(c => obs.observe(c));
    })();

    // ─── 8. 3D Tilt ─────────────────────────────────────────────────────
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

    // ─── 9. SVG Tree Growth ──────────────────────────────────────────────
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

        // Reveal all tree parts whose data-s <= count, with a tiny stagger
        function updateTree(n) {
            // Collect parts that should now be visible but aren't yet
            const toReveal = treeParts.filter(el => {
                return parseInt(el.dataset.s, 10) <= n && !el.classList.contains('show');
            });
            toReveal.forEach((el, i) => {
                setTimeout(() => el.classList.add('show'), i * 55);
            });
        }

        btn.addEventListener('click', () => {
            // Rotate compliment text
            complText.style.opacity = '0';
            setTimeout(() => {
                complText.textContent = compliments[randInt(0, compliments.length - 1)];
                complText.style.opacity = '1';
            }, 360);

            if (count >= MAX) return;
            count++;

            // Progress bar
            fill.style.width = (count / MAX * 100) + '%';
            fill.classList.toggle('active', true);

            // Level label
            levelText.textContent = count < MAX
                ? `Moonlight Level  ${count} / ${MAX}`
                : 'The Moon Tree is in Bloom ✦ 🌕';

            // Grow the SVG tree
            updateTree(count);

            // Final bloom
            if (count === MAX) {
                treeSvg.classList.add('full-bloom');
                secret.classList.add('revealed');
                btn.disabled = true;
                if (window._shootStar) window._shootStar();
            }
        });
    })();

    // ─── 10. Lightbox ───────────────────────────────────────────────────
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

    // ─── 11. Typewriter ─────────────────────────────────────────────────
    let typingDone = false;

    function startTypewriter() {
        if (typingDone) return;
        typingDone = true;

        const lines = [
            { id: 'line-1',   text: 'Dear Moon,' },
            { id: 'line-2',   text: 'I made this because you deserve to know — really know — how much you mean to me. Not in a passing way. In the kind of way I think about when I\'m trying to explain to myself why everything feels lighter when I\'m talking to you.' },
            { id: 'line-3',   text: 'You\'re the kind of person that makes being alive feel like a good deal. I\'m really lucky I get to say that.' },
            { id: 'line-sig', text: '— Yours ❤️' },
        ];

        let li = 0, ci = 0;
        function tick() {
            if (li >= lines.length) return;
            const el = document.getElementById(lines[li].id);
            const text = lines[li].text;
            if (!el.classList.contains('typing-cursor')) el.classList.add('typing-cursor');
            if (ci < text.length) {
                el.textContent += text[ci++];
                setTimeout(tick, 36);
            } else {
                el.classList.remove('typing-cursor');
                li++; ci = 0;
                setTimeout(tick, li < lines.length ? 520 : 0);
            }
        }
        tick();
    }

    // ─── 12. Click Sparks ───────────────────────────────────────────────
    (function initSparks() {
        const symbols = ['✦', '✶', '·', '⋆', '˚', '🌙'];
        const colors  = ['#e8c96a', '#c4d8f5', '#a0b8e8', '#f0dfa0'];

        document.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.closest('.gallery-item')) return;
            for (let i = 0; i < 7; i++) {
                const el = document.createElement('div');
                el.className = 'click-spark';
                el.textContent = symbols[randInt(0, symbols.length - 1)];
                el.style.color    = colors[randInt(0, colors.length - 1)];
                el.style.fontSize = rand(0.65, 1.1) + 'rem';
                const angle = rand(0, Math.PI * 2);
                const vel   = rand(28, 65);
                el.style.setProperty('--tx', Math.cos(angle) * vel + 'px');
                el.style.setProperty('--ty', Math.sin(angle) * vel - 20 + 'px');
                el.style.setProperty('--rot', rand(-60, 60) + 'deg');
                el.style.left = e.clientX + 'px';
                el.style.top  = e.clientY + 'px';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 950);
            }
        }, { passive: true });
    })();

})();