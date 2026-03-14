/* ═══════════════════════════════════════════════════════════════
   MOON — script.js  ✦  Polish Edition

   ┌─────────────────────────────────────────────────────────────┐
   │  ✦  EDIT THIS CONFIG BLOCK — everything else is automatic  │
   └─────────────────────────────────────────────────────────────┘

   MUSIC  →  drop MP3s into  music/  and list them below
   GALLERY → list permanent photos here, OR just drag & drop in browser
   START DATE → set when you two started talking

   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {

    /* ── Date you started talking (YYYY-MM-DD) ─────────────── */
    startDate: '2024-06-01',

    /* ── Playlist ───────────────────────────────────────────── */
    playlist: [
        { title: 'Our Song',      src: 'music/our-song.mp3'     },
        { title: 'Another Song',  src: 'music/another-song.mp3' },
        { title: 'Late Nights',   src: 'music/late-nights.mp3'  },
    ],

    /* ── Optional starting gallery photos ──────────────────── */
    gallery: [
        // { src: 'images/gallery/photo1.jpg', caption: 'our game nights' },
        // { src: 'images/gallery/photo2.jpg', caption: 'that one message' },
    ],

};

/* ═══════════════════════════════════════════════════════════════
   INTERNALS — do not edit below
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const $   = (s, r = document) => r.querySelector(s);
    const $$  = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp   = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const rand    = (a, b)       => Math.random() * (b - a) + a;
    const randInt = (a, b)       => Math.floor(rand(a, b + 1));
    const lerp    = (a, b, t)    => a + (b - a) * t;

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = randInt(0, i); [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function captionFromFilename(name) {
        return name
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();
    }

    // [FIX APPLIED] - Replaced custom number formatting with native Intl.NumberFormat for exact relationship days/hours display
    function fmtNum(n) {
        return new Intl.NumberFormat('en-US').format(n);
    }

    /* ═════════════════════════════════════════════════════════
       1. BIRTHDAY COUNTDOWN
       ═════════════════════════════════════════════════════════ */
    (function initCountdown() {
        const dEl = $('#cd-d'), hEl = $('#cd-h'), mEl = $('#cd-m'), sEl = $('#cd-s');
        const msgEl = $('#bday-msg');
        if (!dEl) return;
        let prev = { d:-1, h:-1, m:-1, s:-1 };
        let bdayTriggered = false; // [FIX APPLIED] Prevents infinite loop

        function getTarget() {
            const now = new Date();
            const y = (now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() > 21))
                ? now.getFullYear() + 1 : now.getFullYear();
            return new Date(y, 3, 21, 0, 0, 0, 0);
        }
        const pad = n => String(n).padStart(2, '0');

        function bump(el, val, key) {
            if (prev[key] !== val) {
                el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
                prev[key] = val;
            }
            el.textContent = pad(val);
        }

        const bdayLines = [
            "Today's the day. Happy birthday, Moon. 🎂",
            "21 years of you and the world is better for it. 🌙",
            "You made it to 21. That deserves a whole celebration.",
            "Happy birthday. I hope today feels as good as you make me feel. 🌕",
        ];

        function tick() {
            const diff = getTarget() - new Date();
            
            // [FIX APPLIED] - Solves the wild flickering and infinite confetti lag
            if (diff <= 0) {
                ['d','h','m','s'].forEach(k => { 
                    const el = document.getElementById('cd-'+k); 
                    if(el) el.textContent='00'; 
                });
                
                // Check if within the 24-hour birthday window
                if (diff > -86400000) { 
                    if (!bdayTriggered) {
                        spawnConfettiBurst(100); 
                        if (msgEl) msgEl.textContent = bdayLines[randInt(0, bdayLines.length - 1)];
                        bdayTriggered = true; // Locks the event so it only fires once
                    }
                } else if (msgEl) {
                    msgEl.textContent = "Hope you had a wonderful birthday. 🌙";
                }
                return;
            }
            
            bdayTriggered = false; // Reset for next year
            const t = Math.floor(diff / 1000);
            const d = Math.floor(t / 86400);
            bump(dEl, d, 'd');
            bump(hEl, Math.floor((t % 86400) / 3600), 'h');
            bump(mEl, Math.floor((t % 3600) / 60), 'm');
            bump(sEl, t % 60, 's');
            
            if (msgEl) {
                msgEl.textContent =
                    d===0 && Math.floor((t%86400)/3600)===0 ? "Any minute now. 🌙"
                  : d===0  ? "It's today! Just a few hours left. 🎂"
                  : d===1  ? "Tomorrow. I'm already excited for you."
                  : d<=7   ? `Only ${d} more days. I can't wait.`
                  : d<=30  ? `${d} days to go. It's coming up fast.`
                           : "Counting down every single day. 🌕";
            }
        }
        tick(); setInterval(tick, 1000);
    })();

    /* ═════════════════════════════════════════════════════════
       1b. TIME TOGETHER
       ═════════════════════════════════════════════════════════ */
    (function initTogether() {
        const daysEl  = $('#tog-days');
        const hoursEl = $('#tog-hours');
        const minsEl  = $('#tog-mins');
        if (!daysEl) return;

        const start = new Date(CONFIG.startDate || '2024-01-01');

        function animateCount(el, target, duration) {
            const t0 = performance.now();
            (function step(now) {
                const p = Math.min((now - t0) / duration, 1);
                const e = 1 - Math.pow(1 - p, 4);
                el.textContent = fmtNum(Math.floor(e * target));
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = fmtNum(target);
            })(performance.now());
        }

        let animated = false;
        function compute() {
            const diff = new Date() - start;
            return {
                days:  Math.floor(diff / 86400000),
                hours: Math.floor(diff / 3600000),
                mins:  Math.floor(diff / 60000),
            };
        }

        const card = $('#together-card');
        if (card) {
            new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting || animated) return;
                animated = true;
                const { days, hours, mins } = compute();
                animateCount(daysEl,  days,  1200);
                animateCount(hoursEl, hours, 1500);
                animateCount(minsEl,  mins,  1800);
            }, { threshold: 0.2 }).observe(card);
        }

        setInterval(() => {
            if (!animated) return;
            const { days, hours, mins } = compute();
            daysEl.textContent  = fmtNum(days);
            hoursEl.textContent = fmtNum(hours);
            minsEl.textContent  = fmtNum(mins);
        }, 60000);
    })();

    /* ═════════════════════════════════════════════════════════
       2. CONFETTI
       ═════════════════════════════════════════════════════════ */
    function spawnConfettiBurst(count = 60) {
        const cont = $('#confetti-container'); if (!cont) return;
        const cols = ['#e8c96a','#c4d8f5','#f5a0c0','#a0e0d0','#ffffff','#ffd700'];
        const f = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const sz = rand(5,11), dur = rand(2.2,4.8), spin = rand(-720,720);
            el.style.cssText = `left:${rand(8,92)}%;top:-${sz*2}px;width:${sz}px;height:${sz*rand(.4,1.2)}px;background:${cols[randInt(0,cols.length-1)]};border-radius:${rand(0,4)}px;animation-duration:${dur}s;animation-delay:${rand(0,1.6)}s;--spin:${spin}deg;transform:rotate(${rand(0,360)}deg);`;
            f.appendChild(el);
            setTimeout(() => el.remove(), (dur + 2.5) * 1000);
        }
        cont.appendChild(f);
    }

    /* ═════════════════════════════════════════════════════════
       3. NEBULA
       ═════════════════════════════════════════════════════════ */
    (function initNebula() {
        const canvas = $('#nebula-canvas');
        const ctx    = canvas.getContext('2d', { alpha: false });
        let W, H, blobs = [], raf;
        const DEFS = [
            { cx:.15, cy:.25, rx:.50, ry:.38, r:60,  g:80,  b:220, a:.055 },
            { cx:.80, cy:.70, rx:.45, ry:.36, r:80,  g:50,  b:200, a:.048 },
            { cx:.50, cy:.50, rx:.60, ry:.45, r:30,  g:100, b:180, a:.035 },
            { cx:.85, cy:.20, rx:.38, ry:.30, r:180, g:140, b:50,  a:.038 },
            { cx:.20, cy:.80, rx:.40, ry:.32, r:50,  g:80,  b:210, a:.042 },
            { cx:.65, cy:.35, rx:.35, ry:.28, r:100, g:160, b:220, a:.030 },
        ];
        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            blobs = DEFS.map(d => ({ ...d, t: rand(0, Math.PI*2) }));
        }
        function draw() {
            ctx.fillStyle = '#030810'; ctx.fillRect(0,0,W,H);
            blobs.forEach(b => {
                b.t += 0.0018;
                const px = b.cx*W + Math.sin(b.t*.65+1.0)*W*.055;
                const py = b.cy*H + Math.cos(b.t*.5+0.5)*H*.048;
                const rx = b.rx*W*.5, ry = b.ry*H*.5;
                const pulse = 1 + .07*Math.sin(b.t*1.3);
                ctx.save(); ctx.translate(px, py); ctx.scale(1, ry/rx);
                const g = ctx.createRadialGradient(0,0,0,0,0,rx*pulse);
                g.addColorStop(0,  `rgba(${b.r},${b.g},${b.b},${b.a*1.55})`);
                g.addColorStop(.5, `rgba(${b.r},${b.g},${b.b},${b.a*.65})`);
                g.addColorStop(1,  `rgba(${b.r},${b.g},${b.b},0)`);
                ctx.beginPath(); ctx.arc(0,0,rx*pulse,0,Math.PI*2);
                ctx.fillStyle = g; ctx.fill(); ctx.restore();
            });
            raf = requestAnimationFrame(draw);
        }
        window.addEventListener('resize', resize, { passive:true });
        
        // [FIX APPLIED] - Cancel the specific animation frame to stop stacking performance leaks
        document.addEventListener('visibilitychange', () => {
            cancelAnimationFrame(raf); 
            if (!document.hidden) {
                raf = requestAnimationFrame(draw);
            }
        });
        
        resize(); raf = requestAnimationFrame(draw);
    })();

    /* ═════════════════════════════════════════════════════════
       4. STARS
       ═════════════════════════════════════════════════════════ */
    (function initStars() {
        const canvas = $('#star-canvas');
        const ctx    = canvas.getContext('2d');
        let W, H, stars = [], shots = [], raf;
        const SPECIALS = 14;
        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            stars = Array.from({ length:310 }, (_,i) => ({
                x:rand(0,W), y:rand(0,H),
                r: i<SPECIALS ? rand(1.2,2.4) : rand(0.15,1.1),
                base:rand(0.08,.75), speed:rand(.0006,.0035),
                phase:rand(0,Math.PI*2), special:i<SPECIALS,
            }));
        }
        function shoot() {
            if (document.hidden) return;
            const a = rand(18,42)*(Math.PI/180);
            shots.push({ x:rand(W*.04,W*.72), y:rand(H*.01,H*.32), vx:Math.cos(a)*rand(9,18), vy:Math.sin(a)*rand(9,18), life:1, len:rand(65,175) });
        }
        window._shootStar = () => { for (let i=0;i<4;i++) shoot(); };
        function drawCross(x,y,sz,alpha) {
            ctx.save(); ctx.globalAlpha=alpha*.5;
            ctx.strokeStyle=`rgba(220,235,255,${alpha})`; ctx.lineWidth=.55;
            ctx.beginPath(); ctx.moveTo(x-sz*3,y); ctx.lineTo(x+sz*3,y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x,y-sz*3); ctx.lineTo(x,y+sz*3); ctx.stroke();
            ctx.restore();
        }
        function draw(t) {
            ctx.clearRect(0,0,W,H);
            stars.forEach(s => {
                const tw=.5+.5*Math.sin(t*s.speed*1000+s.phase);
                const alpha=s.base*(.28+.72*tw);
                ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
                ctx.fillStyle=`rgba(220,235,255,${alpha})`; ctx.fill();
                if (s.special&&tw>.72) drawCross(s.x,s.y,s.r,alpha*.55);
            });
            for (let i=shots.length-1;i>=0;i--) {
                const s=shots[i];
                const tx=s.x-s.vx*(s.len/14), ty=s.y-s.vy*(s.len/14);
                const g=ctx.createLinearGradient(s.x,s.y,tx,ty);
                g.addColorStop(0,`rgba(255,255,255,${s.life})`);
                g.addColorStop(.28,`rgba(232,201,106,${s.life*.5})`);
                g.addColorStop(1,'rgba(255,255,255,0)');
                ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(tx,ty);
                ctx.strokeStyle=g; ctx.lineWidth=1.4; ctx.stroke();
                ctx.beginPath(); ctx.arc(s.x,s.y,2,0,Math.PI*2);
                ctx.fillStyle=`rgba(255,255,255,${s.life*.9})`; ctx.fill();
                s.x+=s.vx; s.y+=s.vy; s.life-=.02;
                if (s.life<=0) shots.splice(i,1);
            }
            raf = requestAnimationFrame(draw);
        }
        window.addEventListener('resize', resize, { passive:true });
        
        // [FIX APPLIED] - Cancel the specific animation frame to stop stacking performance leaks
        document.addEventListener('visibilitychange', () => {
            cancelAnimationFrame(raf); 
            if (!document.hidden) {
                raf = requestAnimationFrame(draw);
            }
        });
        
        resize(); raf = requestAnimationFrame(draw);
        setInterval(() => { if (!document.hidden && Math.random()<.4) shoot(); }, 3500);
    })();

    /* ═════════════════════════════════════════════════════════
       5. ORBIT MOON
       ═════════════════════════════════════════════════════════ */
    (function initOrbitMoon() {
        const moon = $('#orbit-moon'); if (!moon) return;
        let angle = -Math.PI/2;
        let W = window.innerWidth, H = window.innerHeight;
        window.addEventListener('resize', ()=>{ W=window.innerWidth; H=window.innerHeight; }, { passive:true });
        (function loop() {
            if (!document.hidden) {
                angle += 0.0034;
                const rx=W*.43, ry=H*.37;
                const x=W*.5+Math.cos(angle)*rx, y=H*.5+Math.sin(angle)*ry;
                const depth=.82+.18*((Math.sin(angle)+1)/2);
                moon.style.transform=`translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${depth})`;
            }
            requestAnimationFrame(loop);
        })();
    })();

    /* ═════════════════════════════════════════════════════════
       6. DUST
       ═════════════════════════════════════════════════════════ */
    (function initDust() {
        const cont = $('#dust-container');
        function spawn() {
            if (document.hidden) return;
            const d = document.createElement('div'); d.className = 'dust';
            const sz=rand(1.5,4.5), dur=rand(16,26);
            d.style.cssText=`left:${rand(0,100)}%;top:-${sz}px;width:${sz}px;height:${sz}px;animation-duration:${dur}s;`;
            cont.appendChild(d); setTimeout(()=>d.remove(), dur*1000);
        }
        setInterval(spawn, 1900);
    })();

    /* ═════════════════════════════════════════════════════════
       7. MUSIC PLAYER
       ═════════════════════════════════════════════════════════ */
    let audioCtx=null, analyser=null, dataArray=null, vizActive=false;

    function setupAudio(audioEl) {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext||window.webkitAudioContext)();
            const src = audioCtx.createMediaElementSource(audioEl);
            analyser  = audioCtx.createAnalyser();
            analyser.fftSize=256; analyser.smoothingTimeConstant=.84;
            src.connect(analyser); analyser.connect(audioCtx.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            vizActive = true;
            $('#viz-canvas').classList.add('active');
            $('#music-ring-canvas').classList.add('active');
        } catch(e) { console.warn('Web Audio unavailable'); }
    }

    (function initMusicPlayer() {
        const music     = $('#bg-music');
        const musicBtn  = $('#music-btn');
        const musicIcon = $('#music-icon');
        const musicLbl  = $('#music-label');
        const trackName = $('#music-track-name');
        const trackNum  = $('#music-track-num');
        const btnPrev   = $('#btn-prev');
        const btnNext   = $('#btn-next');
        const btnShuffle= $('#btn-shuffle');
        if (!music||!musicBtn) return;

        const songs = CONFIG.playlist||[];
        if (!songs.length) return;

        let order=songs.map((_,i)=>i), cursor=0, playing=false, shuffled=false;

        function buildOrder(fromIndex) {
            order = shuffled ? shuffle(songs.map((_,i)=>i)) : songs.map((_,i)=>i);
            if (fromIndex !== undefined) {
                const pos = order.indexOf(fromIndex);
                cursor = pos !== -1 ? pos : 0;
            }
        }
        function updateUI() {
            const song = songs[order[cursor]];
            if (trackName) trackName.textContent = song ? song.title : '–';
            if (trackNum)  trackNum.textContent  = songs.length > 1 ? `${cursor+1} / ${songs.length}` : '';
            if (btnShuffle) btnShuffle.classList.toggle('active', shuffled);
        }
        function fade(audio, to, ms) {
            const steps=30, stepMs=ms/steps, delta=(to-audio.volume)/steps; let n=0;
            const iv=setInterval(()=>{
                audio.volume=clamp(audio.volume+delta,0,1);
                if (++n>=steps){ clearInterval(iv); if(to===0) audio.pause(); }
            }, stepMs);
        }
        function loadAndPlay(idx) {
            cursor=idx; const song=songs[order[cursor]]; if (!song) return;
            music.src=song.src; music.load(); music.volume=0;
            music.play().then(()=>{ fade(music,0.5,1800); playing=true; musicIcon.textContent='⏸️'; if(musicLbl) musicLbl.textContent='Pause'; }).catch(()=>{});
            updateUI();
        }
        music.addEventListener('ended',()=>{
            cursor=(cursor+1)%order.length;
            if (cursor===0&&shuffled) buildOrder();
            loadAndPlay(cursor);
        });
        
        musicBtn.addEventListener('click', () => {
            setupAudio(music);
            if (playing) {
                fade(music, 0, 1200);
                musicIcon.textContent = '🎵';
                if (musicLbl) musicLbl.textContent = 'Our Song';
            } else {
                // [FIX APPLIED] - Uses robust audio path checking instead of location.href which fails consistently
                if (!music.getAttribute('src')) {
                    buildOrder();
                    loadAndPlay(0);
                    return;
                }
                music.play().catch(() => {});
                fade(music, 0.5, 1200);
                musicIcon.textContent = '⏸️';
                if (musicLbl) musicLbl.textContent = 'Pause';
            }
            playing = !playing;
        });

        if (btnPrev) btnPrev.addEventListener('click',()=>{ setupAudio(music); cursor=(cursor-1+order.length)%order.length; loadAndPlay(cursor); });
        if (btnNext) btnNext.addEventListener('click',()=>{ setupAudio(music); cursor=(cursor+1)%order.length; loadAndPlay(cursor); });
        if (btnShuffle) btnShuffle.addEventListener('click',()=>{
            shuffled=!shuffled; const cur=order[cursor]; buildOrder(cur); updateUI();
        });
        buildOrder(); updateUI();
        window._startMusic = () => { setupAudio(music); loadAndPlay(shuffled ? randInt(0,order.length-1) : 0); };
    })();

    /* ─── Ring Visualizer ─────────────────────────────────── */
    (function initRingViz() {
        const rc=$('#music-ring-canvas'); if (!rc) return;
        const ctx=rc.getContext('2d'); const S=110; rc.width=rc.height=S;
        (function draw() {
            requestAnimationFrame(draw); ctx.clearRect(0,0,S,S);
            if (!vizActive||!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            const cx=S/2,cy=S/2,base=34,barMax=22,total=48;
            for (let i=0;i<total;i++) {
                const val=dataArray[Math.floor(i/total*dataArray.length*.55)]/255;
                const barH=val*barMax+1.5, angle=i/total*Math.PI*2-Math.PI/2;
                const x1=cx+Math.cos(angle)*base, y1=cy+Math.sin(angle)*base;
                const x2=cx+Math.cos(angle)*(base+barH), y2=cy+Math.sin(angle)*(base+barH);
                ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
                ctx.strokeStyle=`rgba(255,255,255,${0.2+val*0.6})`; ctx.lineWidth=2; ctx.stroke();
            }
        })();
    })();

    /* ═════════════════════════════════════════════════════════
       8. CUSTOM CURSOR
       ═════════════════════════════════════════════════════════ */
    (function initCursor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        const cursor = $('.custom-cursor'), core = $('.cursor-core'), ring = $('.cursor-ring');
        if (!cursor) return;
        let mx=window.innerWidth/2, my=window.innerHeight/2, rx=mx, ry=my;
        window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; },{ passive:true });
        (function loop(){
            rx += (mx-rx)*0.2; ry += (my-ry)*0.2;
            core.style.transform=`translate(${mx}px,${my}px)`;
            ring.style.transform=`translate(${rx}px,${ry}px)`;
            requestAnimationFrame(loop);
        })();
        document.addEventListener('mousedown', ()=>cursor.classList.add('active'));
        document.addEventListener('mouseup', ()=>cursor.classList.remove('active'));
        document.addEventListener('mouseleave', ()=>cursor.style.opacity='0');
        document.addEventListener('mouseenter', ()=>cursor.style.opacity='1');
    })();

    /* ═════════════════════════════════════════════════════════
       9. SCROLL PROGRESS
       ═════════════════════════════════════════════════════════ */
    (function() {
        const bar = $('#scroll-progress');
        window.addEventListener('scroll',()=>{
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            bar.style.width = clamp(scrollHeight<=clientHeight ? 100 : scrollTop/(scrollHeight-clientHeight)*100, 0, 100) + '%';
        },{ passive:true });
    })();

    /* ═════════════════════════════════════════════════════════
       10. WELCOME
       ═════════════════════════════════════════════════════════ */
    (function initWelcome() {
        const screen = $('#welcome-screen');
        const enterBtn = $('#enter-btn');
        if (!enterBtn) return;
        enterBtn.addEventListener('click', () => {
            screen.classList.add('fade-out');
            if (window._startMusic) window._startMusic();
        });
    })();

    /* ═════════════════════════════════════════════════════════
       11. CARD REVEAL
       ═════════════════════════════════════════════════════════ */
    (function initReveal() {
        function revealList(card) {
            $$('.list-item', card).forEach((item,i)=>{ setTimeout(()=>item.classList.add('visible'), i*150+260); });
        }
        const allCards = $$('.tilt-card');
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const idx = allCards.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    if (entry.target.id === 'love-card') revealList(entry.target);
                    if (entry.target.id === 'letter-card') setTimeout(startTypewriter, 900);
                }, 60 + idx * 40);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
        allCards.forEach(c => obs.observe(c));
    })();

    /* ═════════════════════════════════════════════════════════
       12. 3D TILT
       ═════════════════════════════════════════════════════════ */
    (function initTilt() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        $$('.tilt-card').forEach(card => {
            let rx=0, ry=0, tx=0, ty=0, inside=false;
            card.addEventListener('mouseenter', ()=>{ inside=true; });
            card.addEventListener('mousemove', e=>{
                const r=card.getBoundingClientRect();
                tx=((e.clientY-r.top -r.height/2)/(r.height/2))*-4.5;
                ty=((e.clientX-r.left -r.width /2)/(r.width /2))* 4.5;
            },{ passive:true });
            card.addEventListener('mouseleave', ()=>{ inside=false; tx=0; ty=0; });
            (function loop(){
                rx += (tx-rx)*0.08; ry += (ty-ry)*0.08;
                card.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
                requestAnimationFrame(loop);
            })();
        });
    })();

    /* ═════════════════════════════════════════════════════════
       13. GALLERY / DRAG & DROP
       ═════════════════════════════════════════════════════════ */
    (function initGallery() {
        const grid = $('#gallery-grid'), hintEl = $('#gallery-hint'), metaEl = $('#gallery-meta');
        const fileInput = $('#gallery-upload'), clearBtn = $('#clear-gallery-btn');
        if (!grid) return;

        let galleryImages = [...(CONFIG.gallery || [])];
        
        // [FIX APPLIED] - Always safely prevent default on drag events to stop the browser from opening image files
        document.addEventListener('dragover', e => {
            e.preventDefault(); 
            const ws = $('#welcome-screen');
            if (!ws || !ws.classList.contains('fade-out')) return;
        });

        document.addEventListener('drop', e => {
            e.preventDefault(); 
            const ws = $('#welcome-screen');
            if (!ws || !ws.classList.contains('fade-out')) return;
            if (e.target.closest('#drop-zone')) return; 
            processFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', () => {
            processFiles(fileInput.files);
            fileInput.value='';
        });

        if (clearBtn) clearBtn.addEventListener('click', () => {
            galleryImages.forEach(img => { if (img.isBlob) URL.revokeObjectURL(img.src); });
            galleryImages.length = 0;
            renderGallery();
        });

        function processFiles(files) {
            const imgs = [...files].filter(f => f.type.startsWith('image/'));
            if (!imgs.length) return;
            imgs.forEach(file => {
                galleryImages.push({ src: URL.createObjectURL(file), caption: captionFromFilename(file.name), isBlob: true });
            });
            renderGallery();
        }

        function renderGallery() {
            while (grid.firstChild) grid.removeChild(grid.firstChild);
            const count = galleryImages.length;
            if (count === 0) {
                grid.style.display = 'none';
                if (hintEl) hintEl.style.display = 'none';
                if (metaEl) metaEl.style.display = 'none';
                buildLightboxThumbs(); return;
            }
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = count === 1 ? '1fr' : count === 2 ? 'repeat(2,1fr)' : '';
            const frag = document.createDocumentFragment();
            galleryImages.forEach((item, i) => {
                const fig = document.createElement('figure');
                fig.className = 'gallery-item';
                fig.dataset.index = i;
                const img = document.createElement('img');
                img.src = item.src; img.alt = item.caption || 'Memory'; img.loading = 'lazy';
                const cap = document.createElement('figcaption');
                cap.textContent = item.caption || '';
                fig.appendChild(img); fig.appendChild(cap); frag.appendChild(fig);
                setTimeout(() => fig.classList.add('gallery-item-visible'), 40 + i * 55);
            });
            grid.appendChild(frag);
            if (hintEl) hintEl.style.display = '';
            if (metaEl) metaEl.style.display = 'flex';
            if (count > 0 && metaEl) metaEl.querySelector('span').textContent = `${count} Memory${count !== 1 ? 's' : ''}`;
            buildLightboxThumbs();
        }

        /* ─── Lightbox ────────────────────────────────────────── */
        const box=$('#lightbox'), backdrop=$('#lightbox-backdrop');
        const imgEl=$('#lightbox-img'), captionEl=$('#lightbox-caption');
        const countEl=$('#lightbox-count'), thumbsEl=$('#lightbox-thumbs');
        const btnPrev=$('#lightbox-prev'), btnNext=$('#lightbox-next'), closeBtn=$('#lightbox-close');
        let currentIdx = 0;

        function setImg(idx) {
            if (galleryImages.length === 0) return;
            currentIdx = (idx + galleryImages.length) % galleryImages.length;
            const item = galleryImages[currentIdx];
            imgEl.style.opacity = '0';
            setTimeout(() => {
                imgEl.src = item.src;
                captionEl.textContent = item.caption || '';
                countEl.textContent = `${currentIdx + 1} / ${galleryImages.length}`;
                imgEl.onload = () => { imgEl.style.opacity = '1'; };
            }, 150);
            if (thumbsEl) {
                $$('.lb-thumb', thumbsEl).forEach((t,i) => t.classList.toggle('active', i===currentIdx));
                const active = thumbsEl.querySelector('.lb-thumb.active');
                if (active) active.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
            }
        }

        function open(idx) {
            setImg(idx);
            box.classList.add('open');
            box.setAttribute('aria-hidden','false');
            document.body.style.overflow = 'hidden';
        }

        function close() {
            box.classList.remove('open');
            box.setAttribute('aria-hidden','true');
            document.body.style.overflow = '';
            setTimeout(() => { imgEl.src = ''; imgEl.style.opacity = '0'; }, 550);
        }

        window.buildLightboxThumbs = function () {
            if (!thumbsEl) return;
            while (thumbsEl.firstChild) thumbsEl.removeChild(thumbsEl.firstChild);
            if (galleryImages.length < 2) { thumbsEl.classList.remove('has-thumbs'); return; }
            thumbsEl.classList.add('has-thumbs');
            galleryImages.forEach((item,i) => {
                const btn = document.createElement('button');
                btn.className = 'lb-thumb';
                btn.setAttribute('aria-label', `Photo ${i+1}`);
                const img = document.createElement('img');
                img.src = item.src; img.alt = ''; img.loading = 'lazy';
                btn.appendChild(img);
                btn.addEventListener('click', e => { e.stopPropagation(); setImg(i); });
                thumbsEl.appendChild(btn);
            });
        };

        document.addEventListener('click', e => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                e.preventDefault(); e.stopPropagation();
                const idx = parseInt(item.dataset.index,10);
                open(isNaN(idx)?0:idx);
            }
        });

        if (btnPrev) btnPrev.addEventListener('click', e => { e.stopPropagation(); setImg(currentIdx-1); });
        if (btnNext) btnNext.addEventListener('click', e => { e.stopPropagation(); setImg(currentIdx+1); });
        backdrop.addEventListener('click', close);
        closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });

        document.addEventListener('keydown', e => {
            if (!box.classList.contains('open')) return;
            if (e.key==='Escape') close();
            if (e.key==='ArrowLeft') setImg(currentIdx-1);
            if (e.key==='ArrowRight') setImg(currentIdx+1);
        });

        let touchX = null;
        box.addEventListener('touchstart', e => { touchX=e.touches[0].clientX; },{ passive:true });
        box.addEventListener('touchend', e => {
            if (touchX===null) return;
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) setImg(currentIdx + (diff > 0 ? 1 : -1));
            touchX = null;
        });

        renderGallery();
    })();

    /* ═════════════════════════════════════════════════════════
       14. DRAG SCROLL
       ═════════════════════════════════════════════════════════ */
    (function initDragScroll() {
        const lists = $$('.drag-scroll');
        lists.forEach(list => {
            let isDown=false, startX, scrollLeft;
            list.addEventListener('mousedown', e=>{ isDown=true; list.classList.add('active'); startX=e.pageX-list.offsetLeft; scrollLeft=list.scrollLeft; });
            list.addEventListener('mouseleave', ()=>{ isDown=false; list.classList.remove('active'); });
            list.addEventListener('mouseup', ()=>{ isDown=false; list.classList.remove('active'); });
            list.addEventListener('mousemove', e=>{
                if (!isDown) return; e.preventDefault();
                list.scrollLeft = scrollLeft - ((e.pageX-list.offsetLeft)-startX)*2;
            });
        });
    })();

    /* ═════════════════════════════════════════════════════════
       15. COMPLIMENT TREE
       ═════════════════════════════════════════════════════════ */
    (function initTree() {
        const btn = $('#tree-btn');
        const fill = $('#tree-btn-fill');
        const levelText = $('#tree-level-text');
        const complText = $('#tree-compliment');
        const treeSvg = $('#tree-svg');
        const secret = $('#tree-secret-msg');
        if (!btn || !treeSvg) return;

        let count = 0; const MAX = 6;
        const treeParts = $$('.tree-part', treeSvg);

        const compliments = [
            "Your smile is honestly my favorite thing to look at.",
            "I love how passionate you get about the things you care about.",
            "You have this way of making everything feel calm when you're around.",
            "I could listen to you talk for hours and never get bored.",
            "There's a warmth to you that makes people want to stay.",
            "You are so much stronger than you give yourself credit for.",
            "The way your eyes light up when you're happy is incredible.",
            "I admire how deeply you care for the people in your life.",
            "You're not just beautiful on the outside; you're beautiful all the way through.",
            "Just being near you makes my day better.",
            "You always know exactly what to say to make me smile.",
            "I feel incredibly lucky just to know you.",
            "There is nobody else quite like you, and I mean that completely.",
            "The world is genuinely better with you in it. I mean that.",
        ];

        function updateTree(n) {
            treeParts.filter(el => parseInt(el.dataset.s,10) <= n && !el.classList.contains('show'))
                .forEach((el,i) => setTimeout(() => el.classList.add('show'), i*55));
        }

        btn.addEventListener('click', () => {
            complText.style.opacity = '0';
            setTimeout(() => {
                complText.textContent = compliments[randInt(0, compliments.length-1)];
                complText.style.opacity = '1';
            }, 400);

            if (count >= MAX) return;
            count++;
            fill.style.width = (count/MAX*100) + '%'; fill.classList.add('active');
            levelText.textContent = count < MAX ? `Moonlight Level ${count} / ${MAX}` : 'The Moon Tree is in Full Bloom ✦ 🌕';
            updateTree(count);

            if (count === MAX) {
                treeSvg.classList.add('full-bloom');
                secret.classList.add('revealed');
                btn.disabled = true;
                if (window._shootStar) window._shootStar();
            }
        });
    })();

    /* ═════════════════════════════════════════════════════════
       16. TYPEWRITER
       ═════════════════════════════════════════════════════════ */
    let typingDone = false;
    function startTypewriter() {
        if (typingDone) return;
        typingDone = true;
        const lines = [
            { id:'line-1', text:'Dear Moon,' },
            { id:'line-2', text:"I made this for you because I wanted you to have something real — not a text, not a voice note. Something you can come back to. Something that just says: I see you, I care about you, and I am so glad you exist." },
            { id:'line-3', text:"Take care of yourself out there. And whenever things get heavy, just know someone is rooting for you." },
            { id:'line-4', text:"Always." },
            { id:'line-sig', text:'— Me' }
        ];

        let delay = 0;
        lines.forEach(line => {
            const el = document.getElementById(line.id);
            if (!el) return;
            setTimeout(() => {
                let charIdx = 0;
                el.style.opacity = '1';
                function typeChar() {
                    if (charIdx < line.text.length) {
                        el.textContent += line.text.charAt(charIdx);
                        charIdx++;
                        setTimeout(typeChar, randInt(25, 45));
                    }
                }
                typeChar();
            }, delay);
            delay += (line.text.length * 40) + 600;
        });
    }

    /* ═════════════════════════════════════════════════════════
       18. MARRIAGE CERTIFICATE
       ═════════════════════════════════════════════════════════ */
    (function initMarriageCert() {
        const signBtn    = $('#cert-sign-btn');
        const sigMoon    = $('#sig-moon-name');
        const moonLine   = $('#moon-sig-line');
        const seal       = $('#cert-seal');
        const prompt     = $('#cert-prompt');
        const signedNote = $('#cert-signed-note');
        if (!signBtn) return;
        const msgs = [
            "It's official. Legally binding under moonlight. 🌙",
            "Signed, sealed, and witnessed by every star up there. ✦",
            "You said yes. Water is keeping this forever. 💍",
            "The moon herself has signed. That's final.",
        ];
        signBtn.addEventListener('click', () => {
            if (signBtn.disabled) return; signBtn.disabled = true;
            const name = 'Moon ♡'; sigMoon.textContent = '';
            sigMoon.classList.add('signed'); moonLine.classList.add('signed');
            let i = 0;
            function typeSig() {
                if (i < name.length) { sigMoon.textContent += name[i++]; setTimeout(typeSig, 82); }
                else {
                    setTimeout(() => { seal.classList.add('stamped'); if(window._shootStar) window._shootStar(); spawnConfettiBurst(50); }, 320);
                    setTimeout(() => { signedNote.textContent = msgs[randInt(0,msgs.length-1)]; signedNote.classList.add('visible'); if(prompt) prompt.style.opacity='0'; signBtn.style.display='none'; }, 650);
                }
            }
            typeSig();
        });
    })();

})();