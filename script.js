// ─── 1. Star Field Canvas ───────────────────────────────────────────
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
let stars = [], shootingStars = [], W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initStars(); });

function initStars() {
    stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.8 + 0.1,
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2
    }));
}
initStars();

function spawnShootingStar() {
    const angle = (Math.random() * 20 + 20) * Math.PI / 180;
    const x = Math.random() * W * 0.7;
    const y = Math.random() * H * 0.4;
    shootingStars.push({ x, y, vx: Math.cos(angle) * 14, vy: Math.sin(angle) * 14, life: 1, len: Math.random() * 120 + 60 });
}

function drawFrame(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 240, 255, ${s.alpha * (0.4 + 0.6 * tw)})`;
        ctx.fill();
    });
    shootingStars.forEach((ss, i) => {
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * (ss.len / 14), ss.y - ss.vy * (ss.len / 14));
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        grad.addColorStop(0, `rgba(255,255,255,${ss.life})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.025;
        if (ss.life <= 0) shootingStars.splice(i, 1);
    });
    requestAnimationFrame(drawFrame);
}
requestAnimationFrame(drawFrame);
setInterval(() => { if (Math.random() < 0.35) spawnShootingStar(); }, 3000);

// ─── 2. Custom Cursor ───────────────────────────────────────────────
const cursor = document.querySelector('.custom-cursor');
let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
(function animateCursor() {
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
})();
document.querySelectorAll('button, .gallery-item img, #close-lightbox').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

// ─── 3. Scroll Progress ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('scroll-progress').style.width = ((document.documentElement.scrollTop / h) * 100) + '%';
});

// ─── 4. Audio & Entrance ────────────────────────────────────────────
const welcomeScreen = document.getElementById('welcome-screen');
const enterBtn      = document.getElementById('enter-btn');
const bgMusic       = document.getElementById('bg-music');
const musicBtn      = document.getElementById('music-btn');
let isPlaying = false;

function fadeAudio(audio, target, dur) {
    const steps = 20, stepT = dur / steps, volStep = (target - audio.volume) / steps;
    let n = 0;
    const iv = setInterval(() => {
        n++; audio.volume = Math.max(0, Math.min(1, audio.volume + volStep));
        if (n >= steps) { clearInterval(iv); if (target === 0) audio.pause(); }
    }, stepT);
}

enterBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden-screen');
    bgMusic.volume = 0;
    bgMusic.play().then(() => fadeAudio(bgMusic, 0.55, 2500)).catch(() => {});
    isPlaying = true; musicBtn.textContent = '⏸️ Pause Song';
});
musicBtn.addEventListener('click', () => {
    if (isPlaying) { fadeAudio(bgMusic, 0, 1000); musicBtn.textContent = '🎵 Our Song'; }
    else { bgMusic.play(); fadeAudio(bgMusic, 0.55, 1000); musicBtn.textContent = '⏸️ Pause Song'; }
    isPlaying = !isPlaying;
});

// ─── 5. Moon Bloom Garden ───────────────────────────────────────────
let waterCount = 0;
const maxWater = 10;
const compliments = [
    "You are the moon — beautiful even in your darkest phases.",
    "Your presence brightens every room you enter.",
    "I love how passionately you care about everything.",
    "Your sense of humor is my absolute favourite thing.",
    "You make me feel safe, even in the quiet.",
    "You are my favourite person in every universe.",
    "Gravity works differently when you're around — I always pull toward you.",
];
const flowerStages = ['🌱','🌿','🎍','🪴','🎋','🍃','🌸','🌷','🌹','🌕'];

const flowerEl  = document.getElementById('flower-stage');
const waterFill = document.getElementById('water-fill');
const waterText = document.getElementById('water-count-text');
const secretMsg = document.getElementById('secret-message');
const complBtn  = document.getElementById('compliment-btn');
const textDisp  = document.getElementById('compliment-text');

complBtn.addEventListener('click', () => {
    textDisp.style.opacity = 0;
    setTimeout(() => {
        textDisp.textContent = compliments[Math.floor(Math.random() * compliments.length)];
        textDisp.style.opacity = 1;
    }, 350);
    if (waterCount < maxWater) {
        waterCount++;
        waterFill.style.width = (waterCount / maxWater * 100) + '%';
        waterText.textContent = `Moonlight Level: ${waterCount} / 10`;
        flowerEl.textContent = flowerStages[waterCount - 1];
        flowerEl.classList.remove('flower-bounce');
        void flowerEl.offsetWidth;
        flowerEl.classList.add('flower-bounce');
        if (waterCount === maxWater) {
            flowerEl.style.filter = 'drop-shadow(0 0 30px rgba(240,208,128,0.9))';
            flowerEl.style.fontSize = '4.5rem';
            secretMsg.classList.add('show-message');
            waterText.textContent = 'Fully Bloomed ✦ Full Moon 🌕';
            spawnShootingStar(); spawnShootingStar(); spawnShootingStar();
        }
    }
});

// ─── 6. Lightbox ────────────────────────────────────────────────────
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.enlargeable').forEach(img => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.remove('hidden-screen');
        requestAnimationFrame(() => lightbox.classList.add('active-lightbox'));
    });
});
lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active-lightbox');
    setTimeout(() => lightbox.classList.add('hidden-screen'), 500);
});

// ─── 7. 3D Tilt ─────────────────────────────────────────────────────
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return;
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -4;
        const ry = ((e.clientX - r.left - r.width/2)  / (r.width/2))  *  4;
        card.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1400px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ─── 8. Typewriter ──────────────────────────────────────────────────
const letterParagraphs = [
    { id: 'typewriter-text1', text: 'Dear Moon,' },
    { id: 'typewriter-text2', text: 'I made this because I want you to know how much light you bring into my life. You are the kind of person I find myself wanting to tell every good thing to — and some of the bad things too, because you make those feel smaller.' },
    { id: 'typewriter-text3', text: 'Thank you for being my moon — constant, beautiful, and worth every sleepless night spent looking up at you.' },
    { id: 'signature-text',   text: '— Yours ❤️' }
];
let isTyping = false;

function typeWriter() {
    if (isTyping) return; isTyping = true;
    let p = 0, c = 0;
    function next() {
        if (p >= letterParagraphs.length) return;
        const { id, text } = letterParagraphs[p];
        const el = document.getElementById(id);
        el.classList.add('typing-cursor');
        if (c < text.length) {
            el.textContent += text[c++];
            setTimeout(next, 34);
        } else {
            el.classList.remove('typing-cursor');
            p++; c = 0; setTimeout(next, 480);
        }
    }
    next();
}

// ─── 9. Intersection Observer ───────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            if (entry.target.classList.contains('letter-wrapper')) setTimeout(typeWriter, 600);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.tilt-card').forEach(c => observer.observe(c));

// ─── 10. Click Hearts / Stars ───────────────────────────────────────
document.addEventListener('click', (e) => {
    if (['BUTTON','IMG'].includes(e.target.tagName)) return;
    const symbols = ['✦','🌙','✶','⋆','☽'];
    for (let i = 0; i < 6; i++) {
        const h = document.createElement('div');
        h.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
        h.classList.add('click-heart');
        h.style.color = i % 2 === 0 ? '#f0d080' : '#c8d8f0';
        h.style.fontSize = (0.9 + Math.random() * 0.8) + 'rem';
        const angle = Math.random() * Math.PI * 2;
        const v = 30 + Math.random() * 50;
        h.style.setProperty('--tx', Math.cos(angle) * v + 'px');
        h.style.setProperty('--ty', Math.sin(angle) * v - 25 + 'px');
        h.style.setProperty('--rot', (Math.random() * 80 - 40) + 'deg');
        h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1000);
    }
});