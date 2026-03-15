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

    function fmtNum(n) {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    }

    /* ═════════════════════════════════════════════════════════
       1. BIRTHDAY COUNTDOWN
       ═════════════════════════════════════════════════════════ */
    (function initCountdown() {
        const dEl = $('#cd-d'), hEl = $('#cd-h'), mEl = $('#cd-m'), sEl = $('#cd-s');
        const msgEl = $('#bday-msg');
        if (!dEl) return;
        let prev = { d:-1, h:-1, m:-1, s:-1 };

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
        let bdayIdx = 0;

        function tick() {
            const diff = getTarget() - new Date();
            if (diff <= 0) {
                ['d','h','m','s'].forEach(k => { const el = document.getElementById('cd-'+k); if(el) el.textContent='00'; });
                if (msgEl) msgEl.textContent = bdayLines[bdayIdx % bdayLines.length];
                if (diff > -86400000) { spawnConfettiBurst(); bdayIdx++; }
                return;
            }
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
        document.addEventListener('visibilitychange', () => {
            document.hidden ? cancelAnimationFrame(raf) : (raf = requestAnimationFrame(draw));
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
        document.addEventListener('visibilitychange', () => {
            document.hidden ? cancelAnimationFrame(raf) : (raf = requestAnimationFrame(draw));
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
        musicBtn.addEventListener('click',()=>{
            setupAudio(music);
            if (playing) { fade(music,0,1200); musicIcon.textContent='🎵'; if(musicLbl) musicLbl.textContent='Our Song'; }
            else {
                if (!music.src||music.src===location.href) { buildOrder(); loadAndPlay(0); return; }
                music.play().catch(()=>{}); fade(music,0.5,1200); musicIcon.textContent='⏸️'; if(musicLbl) musicLbl.textContent='Pause';
            }
            playing=!playing;
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
                const alpha=.32+val*.68;
                const g=ctx.createLinearGradient(x1,y1,x2,y2);
                g.addColorStop(0,`rgba(232,201,106,${alpha*.7})`);
                g.addColorStop(1,`rgba(196,216,245,${alpha})`);
                ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
                ctx.strokeStyle=g; ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.stroke();
            }
        })();
    })();

    /* ─── Horizon Visualizer ──────────────────────────────── */
    (function initHorizonViz() {
        const canvas=$('#viz-canvas'); if (!canvas) return;
        const ctx=canvas.getContext('2d');
        let W=window.innerWidth; canvas.width=W; canvas.height=90;
        window.addEventListener('resize',()=>{ W=window.innerWidth; canvas.width=W; },{ passive:true });
        let smooth=[];
        (function draw() {
            requestAnimationFrame(draw); ctx.clearRect(0,0,W,90);
            if (!vizActive||!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            const bars=80, usable=Math.floor(dataArray.length*.6), barW=W/bars;
            if (smooth.length!==bars) smooth=new Array(bars).fill(0);
            for (let i=0;i<bars;i++) {
                const raw=dataArray[Math.floor(i/bars*usable)]/255;
                smooth[i]=lerp(smooth[i],raw,0.12);
                const h=smooth[i]*76+1,x=i*barW,y=90-h;
                const g=ctx.createLinearGradient(x,90,x,y);
                g.addColorStop(0,`rgba(232,201,106,${.16+smooth[i]*.36})`);
                g.addColorStop(.6,`rgba(196,216,245,${.12+smooth[i]*.38})`);
                g.addColorStop(1,`rgba(196,216,245,${.05+smooth[i]*.26})`);
                ctx.fillStyle=g; ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x+1,y,barW-2,h,[2,2,0,0]);
                else ctx.rect(x+1,y,barW-2,h);
                ctx.fill();
            }
        })();
    })();

    /* ═════════════════════════════════════════════════════════
       8. CURSOR
       ═════════════════════════════════════════════════════════ */
    (function initCursor() {
        const cursor=$('.custom-cursor'); if (!cursor) return;
        let mx=-200, my=-200, cx=-200, cy=-200;
        document.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; },{ passive:true });
        (function loop() {
            cx=lerp(cx,mx,.12); cy=lerp(cy,my,.12);
            cursor.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;
            requestAnimationFrame(loop);
        })();
        document.addEventListener('mouseover',e=>{
            if (e.target.closest('button,.gallery-item,#close-lightbox,.phase,.list-item,a,.drop-zone,.lb-thumb,#gallery-spotlight'))
                cursor.classList.add('hovering');
        });
        document.addEventListener('mouseout',e=>{
            if (e.target.closest('button,.gallery-item,#close-lightbox,.phase,.list-item,a,.drop-zone,.lb-thumb,#gallery-spotlight'))
                cursor.classList.remove('hovering');
        });
        document.addEventListener('mouseleave',()=>{ cursor.style.opacity='0'; });
        document.addEventListener('mouseenter',()=>{ cursor.style.opacity='1'; });
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
        const screen   = $('#welcome-screen');
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
                    if (entry.target.id === 'love-card')   revealList(entry.target);
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
                tx=((e.clientY-r.top  -r.height/2)/(r.height/2))*-4.5;
                ty=((e.clientX-r.left -r.width /2)/(r.width /2))* 4.5;
            },{ passive:true });
            card.addEventListener('mouseleave', ()=>{ inside=false; tx=0; ty=0; });
            (function loop() {
                rx=lerp(rx,tx,.08); ry=lerp(ry,ty,.08);
                const settled = Math.abs(rx)<.02 && Math.abs(ry)<.02 && !inside;
                card.style.transform = settled ? '' :
                    `perspective(1600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${inside?-6:0}px)`;
                requestAnimationFrame(loop);
            })();
        });
    })();

    /* ═════════════════════════════════════════════════════════
       13. GALLERY  (drag-and-drop + file picker + CONFIG + persist)
       ═════════════════════════════════════════════════════════ */
    const galleryImages = [];
    const GALLERY_KEY   = 'moonGallery_v2';

    /* ── localStorage helpers ─────────────────────────────── */
    function saveGallery() {
        try {
            localStorage.setItem(GALLERY_KEY, JSON.stringify(
                galleryImages.map(({ src, caption }) => ({ src, caption, isBlob: false }))
            ));
        } catch (e) { console.warn('Gallery save failed (storage may be full):', e); }
    }

    function loadSavedGallery() {
        try {
            const raw = localStorage.getItem(GALLERY_KEY);
            if (!raw) return;
            JSON.parse(raw).forEach(item => galleryImages.push({ ...item, isBlob: false }));
        } catch (e) { console.warn('Gallery load failed:', e); }
    }

    /* ── Spotlight ────────────────────────────────────────── */
    let spotlightEl    = null;
    let spotlightIdx   = 0;
    let spotlightTimer = null;

    function createSpotlight() {
        if (spotlightEl) return;
        spotlightEl = document.createElement('div');
        spotlightEl.id = 'gallery-spotlight';
        spotlightEl.style.display = 'none';
        spotlightEl.innerHTML = `
            <img class="spotlight-img" alt="Featured memory">
            <div class="spotlight-overlay"></div>
            <div class="spotlight-info">
                <span class="spotlight-caption"></span>
                <span class="spotlight-counter"></span>
            </div>
            <div class="spotlight-dots"></div>
            <button class="spotlight-btn spotlight-prev" aria-label="Previous">&#8249;</button>
            <button class="spotlight-btn spotlight-next" aria-label="Next">&#8250;</button>
        `;
        const dz = $('#drop-zone');
        if (dz) dz.after(spotlightEl);

        spotlightEl.addEventListener('click', e => {
            if (e.target.closest('.spotlight-btn,.spotlight-dots')) return;
            openLightboxAt(spotlightIdx);
        });
        spotlightEl.querySelector('.spotlight-prev').addEventListener('click', e => {
            e.stopPropagation();
            goSpotlight(spotlightIdx - 1);
            resetSpotlightTimer();
        });
        spotlightEl.querySelector('.spotlight-next').addEventListener('click', e => {
            e.stopPropagation();
            goSpotlight(spotlightIdx + 1);
            resetSpotlightTimer();
        });
        spotlightEl.addEventListener('mouseenter', () => clearInterval(spotlightTimer));
        spotlightEl.addEventListener('mouseleave', startSpotlightTimer);
    }

    function openLightboxAt(idx) {
        // Creates a temporary gallery-item element that the existing lightbox click handler picks up
        const tmp = document.createElement('div');
        tmp.className = 'gallery-item';
        tmp.dataset.index = idx;
        tmp.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(tmp);
        tmp.click();
        setTimeout(() => tmp.remove(), 100);
    }

    function goSpotlight(idx) {
        if (!spotlightEl || !galleryImages.length) return;
        spotlightIdx = ((idx % galleryImages.length) + galleryImages.length) % galleryImages.length;
        const item = galleryImages[spotlightIdx];
        const img  = spotlightEl.querySelector('.spotlight-img');

        img.style.opacity   = '0';
        img.style.transform = 'scale(1.05)';

        const show = () => { img.style.opacity = '1'; img.style.transform = 'scale(1)'; };
        setTimeout(() => {
            img.src = item.src;
            if (img.complete && img.naturalWidth) show();
            else img.onload = show;
        }, 320);

        const capEl = spotlightEl.querySelector('.spotlight-caption');
        const numEl = spotlightEl.querySelector('.spotlight-counter');
        if (capEl) capEl.textContent = item.caption || '';
        if (numEl) numEl.textContent = galleryImages.length > 1 ? `${spotlightIdx + 1} / ${galleryImages.length}` : '';

        $$('.spotlight-dot', spotlightEl).forEach((d, i) =>
            d.classList.toggle('active', i === spotlightIdx));
    }

    function buildSpotlightDots() {
        const dotsEl = spotlightEl ? spotlightEl.querySelector('.spotlight-dots') : null;
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        // Only show dots for ≤ 18 photos
        if (galleryImages.length <= 1 || galleryImages.length > 18) return;
        galleryImages.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'spotlight-dot' + (i === spotlightIdx ? ' active' : '');
            dot.setAttribute('aria-label', `Photo ${i + 1}`);
            dot.addEventListener('click', e => { e.stopPropagation(); goSpotlight(i); resetSpotlightTimer(); });
            dotsEl.appendChild(dot);
        });
    }

    function startSpotlightTimer() {
        clearInterval(spotlightTimer);
        if (galleryImages.length <= 1) return;
        spotlightTimer = setInterval(() => goSpotlight(spotlightIdx + 1), 5000);
    }

    function resetSpotlightTimer() { clearInterval(spotlightTimer); startSpotlightTimer(); }

    function updateSpotlight() {
        if (!spotlightEl) return;
        if (!galleryImages.length) {
            spotlightEl.style.display = 'none';
            clearInterval(spotlightTimer);
            return;
        }
        spotlightEl.style.display = '';
        if (spotlightIdx >= galleryImages.length) spotlightIdx = 0;
        goSpotlight(spotlightIdx);
        buildSpotlightDots();
        startSpotlightTimer();
    }

    /* ── Init ─────────────────────────────────────────────── */
    (function initGallery() {
        const grid      = $('#gallery-grid');
        const dropZone  = $('#drop-zone');
        const fileInput = $('#file-input');
        const hintEl    = $('#gallery-hint');
        const metaEl    = $('#gallery-meta');
        const countEl   = $('#gallery-count');
        const clearBtn  = $('#gallery-clear');
        if (!grid || !dropZone) return;

        // Spotlight container
        createSpotlight();

        // Load persisted images first
        loadSavedGallery();

        // Load auto-generated or CONFIG images only if nothing is saved
        if (!galleryImages.length) {
            const source = window.GALLERY_DATA || CONFIG.gallery || [];
            source.forEach(item =>
                galleryImages.push({ src: item.src, caption: item.caption || '', isBlob: false })
            );
        }
        if (galleryImages.length) renderGallery();

        // Click to open picker
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

        // Drag events
        let dragDepth = 0;
        dropZone.addEventListener('dragenter', e => { e.preventDefault(); dragDepth++; dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => { dragDepth--; if (dragDepth <= 0) { dragDepth = 0; dropZone.classList.remove('drag-over'); } });
        dropZone.addEventListener('dragover',  e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
        dropZone.addEventListener('drop',      e => { e.preventDefault(); dragDepth = 0; dropZone.classList.remove('drag-over'); processFiles(e.dataTransfer.files); });

        // Page-wide drop
        document.addEventListener('dragover', e => {
            const ws = $('#welcome-screen');
            if (!ws || !ws.classList.contains('fade-out')) return;
            e.preventDefault();
        });
        document.addEventListener('drop', e => {
            const ws = $('#welcome-screen');
            if (!ws || !ws.classList.contains('fade-out')) return;
            if (e.target.closest('#drop-zone')) return;
            e.preventDefault();
            processFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', () => { processFiles(fileInput.files); fileInput.value = ''; });

        if (clearBtn) clearBtn.addEventListener('click', () => {
            galleryImages.forEach(img => { if (img.isBlob) URL.revokeObjectURL(img.src); });
            galleryImages.length = 0;
            spotlightIdx = 0;
            try { localStorage.removeItem(GALLERY_KEY); } catch (e) {}
            renderGallery();
        });

        // Async processFiles — converts to base64 for persistence
        async function processFiles(files) {
            const imgs = [...files].filter(f => f.type.startsWith('image/'));
            if (!imgs.length) return;
            dropZone.classList.add('loading');
            for (const file of imgs) {
                const src = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload  = e => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                galleryImages.push({ src, caption: captionFromFilename(file.name), isBlob: false });
            }
            dropZone.classList.remove('loading');
            saveGallery();
            renderGallery();
        }

        function renderGallery() {
            while (grid.firstChild) grid.removeChild(grid.firstChild);
            const count = galleryImages.length;

            // Update spotlight
            updateSpotlight();

            if (count === 0) {
                grid.style.display = 'none';
                if (hintEl) hintEl.style.display = 'none';
                if (metaEl) metaEl.style.display = 'none';
                buildLightboxThumbs();
                return;
            }

            grid.style.display = '';
            grid.style.gridTemplateColumns = ''; // masonry handled by CSS

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
                setTimeout(() => fig.classList.add('gallery-item-visible'), 40 + i * 45);
            });
            grid.appendChild(frag);

            if (hintEl) hintEl.style.display = '';
            if (metaEl) metaEl.style.display = 'flex';
            if (countEl) countEl.textContent = `${count} photo${count !== 1 ? 's' : ''}`;

            buildLightboxThumbs();
        }

        window._galleryImages = galleryImages;
        window._renderGallery = renderGallery;
    })();

    /* ═════════════════════════════════════════════════════════
       14. LIGHTBOX
       ═════════════════════════════════════════════════════════ */
    (function initLightbox() {
        const box      = $('#lightbox');
        const imgEl    = $('#lightbox-img');
        const caption  = $('#lightbox-caption');
        const backdrop = $('#lightbox-backdrop');
        const closeBtn = $('#close-lightbox');
        const btnPrev  = $('#lb-prev');
        const btnNext  = $('#lb-next');
        const thumbsEl = $('#lb-thumbs');
        if (!box) return;

        let currentIdx = 0;

        function setImg(idx) {
            if (!galleryImages.length) return;
            currentIdx = ((idx % galleryImages.length) + galleryImages.length) % galleryImages.length;
            const item = galleryImages[currentIdx];
            imgEl.style.opacity = '0';
            const pre = new Image();
            pre.onload = () => { imgEl.src = item.src; requestAnimationFrame(() => requestAnimationFrame(() => { imgEl.style.opacity = '1'; })); };
            pre.onerror = () => { imgEl.src = item.src; imgEl.style.opacity = '1'; };
            pre.src = item.src;
            if (caption) caption.textContent = item.caption || '';
            const showNav = galleryImages.length > 1;
            if (btnPrev) btnPrev.style.display = showNav ? '' : 'none';
            if (btnNext) btnNext.style.display = showNav ? '' : 'none';
            if (thumbsEl) {
                $$('.lb-thumb', thumbsEl).forEach((t,i) => t.classList.toggle('active', i===currentIdx));
                const active = thumbsEl.querySelector('.lb-thumb.active');
                if (active) active.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
            }
        }

        function open(idx) {
            setImg(idx);
            box.classList.add('open'); box.setAttribute('aria-hidden','false');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            box.classList.remove('open'); box.setAttribute('aria-hidden','true');
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
                btn.className = 'lb-thumb'; btn.setAttribute('aria-label', `Photo ${i+1}`);
                const img = document.createElement('img'); img.src = item.src; img.alt = ''; img.loading = 'lazy';
                btn.appendChild(img);
                btn.addEventListener('click', e => { e.stopPropagation(); setImg(i); });
                thumbsEl.appendChild(btn);
            });
        };

        document.addEventListener('click', e => {
            const item = e.target.closest('.gallery-item');
            if (item) { e.preventDefault(); e.stopPropagation(); const idx = parseInt(item.dataset.index,10); open(isNaN(idx)?0:idx); }
        });
        if (btnPrev) btnPrev.addEventListener('click', e => { e.stopPropagation(); setImg(currentIdx-1); });
        if (btnNext) btnNext.addEventListener('click', e => { e.stopPropagation(); setImg(currentIdx+1); });
        backdrop.addEventListener('click', close);
        closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
        document.addEventListener('keydown', e => {
            if (!box.classList.contains('open')) return;
            if (e.key==='Escape')      close();
            if (e.key==='ArrowLeft')   setImg(currentIdx-1);
            if (e.key==='ArrowRight')  setImg(currentIdx+1);
        });
        let touchX = null;
        box.addEventListener('touchstart', e => { touchX=e.touches[0].clientX; },{ passive:true });
        box.addEventListener('touchend',   e => {
            if (touchX===null) return;
            const dx = e.changedTouches[0].clientX - touchX; touchX = null;
            if (Math.abs(dx) > 50) setImg(currentIdx + (dx<0?1:-1));
        });
    })();

    /* ═════════════════════════════════════════════════════════
       15. BLOOM TREE
       ═════════════════════════════════════════════════════════ */
    (function initBloom() {
        const treeSvg  = $('#tree-svg');
        const treeParts= $$('.tp', treeSvg);
        const fill     = $('#water-fill');
        const levelText= $('#water-count-text');
        const complText= $('#compliment-text');
        const btn      = $('#compliment-btn');
        const secret   = $('#secret-message');
        if (!btn) return;

        let count = 0; const MAX = 10;
        const compliments = [
            "You've always been more than enough — I hope you know that.",
            "There's no version of my day that doesn't get better when you're in it.",
            "The way you care about things is one of my favourite things about you.",
            "You have no idea how good it is talking to you. Like genuinely.",
            "You are, without question, the funniest person I know.",
            "Even the boring moments feel good with you in them.",
            "I'm really glad I get to know you. Like actually really glad.",
            "You make everything feel lighter. Even without trying.",
            "There's nobody quite like you, and I mean that completely.",
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

    /* ═════════════════════════════════════════════════════════
       16. TYPEWRITER
       ═════════════════════════════════════════════════════════ */
    let typingDone = false;
    function startTypewriter() {
        if (typingDone) return; typingDone = true;
        const lines = [
            { id:'line-1',   text:'Dear Moon,' },
            { id:'line-2',   text:"I made this for you because I wanted you to have something real — not a text, not a voice note. Something you can come back to. Something that just says: I see you, and I think you're incredible." },
            { id:'line-3',   text:"You make things feel lighter just by being around. That's not nothing. That's actually everything." },
            { id:'line-4',   text:"No matter what, you will always be my cutest person. Even when things are hard, I'll be there." },
            { id:'line-sig', text:'— Water ❤️' },
        ];
        let li = 0, ci = 0;
        function tick() {
            if (li >= lines.length) return;
            const el = document.getElementById(lines[li].id);
            if (!el) { li++; ci=0; setTimeout(tick,10); return; }
            const text = lines[li].text;
            if (!el.classList.contains('typing-cursor')) el.classList.add('typing-cursor');
            if (ci < text.length) { el.textContent += text[ci++]; setTimeout(tick, 28); }
            else {
                el.classList.remove('typing-cursor'); li++; ci=0;
                setTimeout(tick, li < lines.length ? 500 : 0);
            }
        }
        tick();
    }

    /* ═════════════════════════════════════════════════════════
       17. CLICK SPARKS
       ═════════════════════════════════════════════════════════ */
    (function initSparks() {
        const syms = ['✦','✶','·','⋆','˚','🌙','°','*','♡'];
        const cols = ['#e8c96a','#c4d8f5','#a0b8e8','#f0dfa0','#b0cce8','#f5c0d0'];
        document.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.closest('.gallery-item') || e.target.closest('#drop-zone') || e.target.closest('#gallery-spotlight')) return;
            const f = document.createDocumentFragment();
            for (let i=0; i<9; i++) {
                const el = document.createElement('div'); el.className = 'click-spark';
                el.textContent = syms[randInt(0,syms.length-1)];
                el.style.color = cols[randInt(0,cols.length-1)];
                el.style.fontSize = rand(.6,1.15) + 'rem';
                const angle=rand(0,Math.PI*2), vel=rand(28,72);
                el.style.setProperty('--tx', Math.cos(angle)*vel+'px');
                el.style.setProperty('--ty', Math.sin(angle)*vel-24+'px');
                el.style.setProperty('--rot', rand(-70,70)+'deg');
                el.style.left = e.clientX+'px'; el.style.top = e.clientY+'px';
                f.appendChild(el); setTimeout(()=>el.remove(), 1000);
            }
            document.body.appendChild(f);
        },{ passive:true });
    })();

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