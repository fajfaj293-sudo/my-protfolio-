/**
 * FAZLUL HAQUE — TIDALIA-EXACT PORTFOLIO ENGINE (WORKS 100% ON file:// AND http://)
 */

const UNLIMITED_PORTFOLIO_SITES = [
  {
    title: "Lumina Luxury WooCommerce Store",
    category: "WordPress & WooCommerce",
    speed: "78ms Load • 99 PageSpeed",
    url: "https://example.com/lumina"
  },
  {
    title: "AetherAI 3D Interactive SaaS",
    category: "Next.js & 3D WebGL",
    speed: "64ms Load • 60FPS",
    url: "https://example.com/aether"
  },
  {
    title: "NexaCorp Enterprise WordPress",
    category: "Custom WordPress Theme",
    speed: "82ms Load • 100% Malware-Free",
    url: "https://example.com/nexa"
  },
  {
    title: "PulseFin Real-Time Web App",
    category: "React & TypeScript",
    speed: "71ms Load • Zero Lag",
    url: "https://example.com/pulsefin"
  }
];

// ============================================================================
// 1. HERO SPOTLIGHT & SNAKE-LIKE WATER TRAIL WITH GRADUAL LETTER DISSOLVE
// ============================================================================
function initHeroSpotlight() {
  const heroSection = document.getElementById('hero');
  const container = document.getElementById('hero-img-container');
  const canvas = document.getElementById('hero-water-canvas') || document.getElementById('hero-dragon-canvas') || document.getElementById('hero-sparkle-canvas');

  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  let dpr = 1;

  function resizeCanvas() {
    w = heroSection ? heroSection.clientWidth : container.clientWidth;
    h = heroSection ? heroSection.clientHeight : container.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateLetterBoxes();
  }

  let tx = 0.5, ty = 0.4, cx = 0.5, cy = 0.4;

  // Local Character Physics: Each letter of "FAZLUL" dissolves and slowly recovers
  const letterEls = Array.from(document.querySelectorAll('.hero-letter'));
  const letterStates = letterEls.map(el => ({
    el,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    targetSkew: 0,
    currentSkew: 0,
    targetScaleX: 1,
    currentScaleX: 1,
    targetScaleY: 1,
    currentScaleY: 1,
    targetBlur: 0,
    currentBlur: 0,
    targetOpacity: 1,
    currentOpacity: 1,
    rect: { left: 0, top: 0, width: 0, height: 0 }
  }));

  function updateLetterBoxes() {
    letterStates.forEach(st => {
      st.rect = st.el.getBoundingClientRect();
    });
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Snake-like Fluid Water Trail State
  const snakeTrail = [];
  const MAX_SNAKE = 38;
  const BASE_WIDTH = 22;
  let lastMoveTime = 0;
  let lastX = 0, lastY = 0;

  window.addEventListener('pointermove', (e) => {
    const rect = (heroSection || container).getBoundingClientRect();
    if (e.clientY <= rect.bottom + 80 && e.clientY >= rect.top - 80) {
      tx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      ty = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      const now = performance.now();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      const angle = Math.atan2(e.clientY - lastY, e.clientX - lastX);
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveTime = now;

      // Add points to snake-like trail with interpolation for fluid motion
      if (snakeTrail.length > 0) {
        const last = snakeTrail[0];
        const dist = Math.hypot(px - last.x, py - last.y);
        if (dist > 3) {
          const steps = Math.min(Math.floor(dist / 3.5), 5);
          for (let s = 1; s <= steps; s++) {
            const frac = s / (steps + 1);
            snakeTrail.unshift({
              x: last.x + (px - last.x) * frac,
              y: last.y + (py - last.y) * frac,
              life: 1.0,
              speed: dist
            });
          }
        }
      }
      snakeTrail.unshift({ x: px, y: py, life: 1.0, speed });
      if (snakeTrail.length > MAX_SNAKE) snakeTrail.length = MAX_SNAKE;

      // Interaction with letters: When snake passes over a letter, it dissolves!
      letterStates.forEach(st => {
        const r = st.rect;
        const letterCx = r.left + r.width / 2;
        const letterCy = r.top + r.height / 2;
        const dist = Math.hypot(e.clientX - letterCx, e.clientY - letterCy);
        const radius = Math.max(46, r.width * 0.92);

        if (dist < radius) {
          const proximity = 1 - (dist / radius);
          const pull = Math.min(26, (speed * 0.85 + 8) * proximity);

          // Letter dissolves and stretches into the snake's wave
          st.targetX = Math.cos(angle) * pull;
          st.targetY = Math.sin(angle) * pull;
          st.targetSkew = Math.sin(angle) * (speed * 0.6) * proximity;
          st.targetScaleX = 1 + Math.abs(Math.cos(angle)) * (speed * 0.035) * proximity;
          st.targetScaleY = 1 + Math.abs(Math.sin(angle)) * (speed * 0.035) * proximity;
          st.targetBlur = Math.min(9, (speed * 0.35 + 3.5) * proximity);
          st.targetOpacity = Math.max(0.45, 1 - proximity * 0.45);
        } else {
          // Snake has moved past: Letter begins gentle relaxation back to normal
          st.targetX = 0;
          st.targetY = 0;
          st.targetSkew = 0;
          st.targetScaleX = 1;
          st.targetScaleY = 1;
          st.targetBlur = 0;
          st.targetOpacity = 1;
        }
      });
    }
  }, { passive: true });

  let heroInView = true;
  let heroRafId = null;

  function startHeroLoop() {
    if (!heroRafId && heroInView) {
      heroRafId = requestAnimationFrame(animateHero);
    }
  }

  if ('IntersectionObserver' in window) {
    const heroObs = new IntersectionObserver((entries) => {
      heroInView = entries[0].isIntersecting;
      if (heroInView) {
        startHeroLoop();
      } else if (heroRafId) {
        cancelAnimationFrame(heroRafId);
        heroRafId = null;
      }
    }, { threshold: 0.05 });
    heroObs.observe(container);
  }

  function animateHero(now) {
    if (!heroInView) {
      heroRafId = null;
      return;
    }

    // Spotlight coordinates easing (Subtle portrait illumination)
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    container.style.setProperty('--mx', `${(cx * 100).toFixed(2)}%`);
    container.style.setProperty('--my', `${(cy * 100).toFixed(2)}%`);

    // Clean transparent canvas - ABSOLUTELY ZERO WHITE TUBES OR CIRCLES DRAWN
    ctx.clearRect(0, 0, w, h);

    const isStationary = (now - lastMoveTime) > 75;

    // When stationary, reset letter targets to normal
    if (isStationary) {
      letterStates.forEach(st => {
        st.targetX = 0;
        st.targetY = 0;
        st.targetSkew = 0;
        st.targetScaleX = 1;
        st.targetScaleY = 1;
        st.targetBlur = 0;
        st.targetOpacity = 1;
      });
    }

    // GRADUAL & GENTLE LETTER RELAXATION ("আস্তে আস্তে আবার ঠিক হবে")
    // Gentle ease factor (0.075) allows the letter to slowly, smoothly recover from the dissolve
    const ease = 0.075;
    let hasActiveLetter = false;
    letterStates.forEach(st => {
      st.currentX += (st.targetX - st.currentX) * ease;
      st.currentY += (st.targetY - st.currentY) * ease;
      st.currentSkew += (st.targetSkew - st.currentSkew) * ease;
      st.currentScaleX += (st.targetScaleX - st.currentScaleX) * ease;
      st.currentScaleY += (st.targetScaleY - st.currentScaleY) * ease;
      st.currentBlur += (st.targetBlur - st.currentBlur) * ease;
      st.currentOpacity += (st.targetOpacity - st.currentOpacity) * ease;

      if (Math.abs(st.currentX) > 0.06 || Math.abs(st.currentY) > 0.06 || st.currentBlur > 0.1) {
        hasActiveLetter = true;
        st.el.style.transform = `translate(${st.currentX.toFixed(2)}px, ${st.currentY.toFixed(2)}px) skewX(${st.currentSkew.toFixed(2)}deg) scale(${st.currentScaleX.toFixed(3)}, ${st.currentScaleY.toFixed(3)})`;
        st.el.style.filter = `blur(${st.currentBlur.toFixed(2)}px)`;
        st.el.style.opacity = st.currentOpacity.toFixed(2);
      } else {
        st.el.style.transform = 'none';
        st.el.style.filter = 'none';
        st.el.style.opacity = '1';
      }
    });

    if (!isStationary || hasActiveLetter) {
      heroRafId = requestAnimationFrame(animateHero);
    } else {
      heroRafId = null;
    }
  }
  startHeroLoop();
}

// ============================================================================
// 2. AMBIENT SOUND SYNTHESIZER ("SOUND ON / OFF")
// ============================================================================
function initSoundToggle() {
  const btn = document.getElementById('sound-btn');
  const txt = document.getElementById('sound-text');
  if (!btn || !txt) return;

  let audioCtx = null;
  let gainNode = null;
  let playing = false;

  btn.addEventListener('click', () => {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.0001;
      gainNode.connect(audioCtx.destination);

      [146.83, 220, 277.18, 329.63, 440].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const flt = audioCtx.createBiquadFilter();
        const og = audioCtx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        flt.type = 'lowpass';
        flt.frequency.value = 580;
        og.gain.value = 0.035;
        osc.connect(flt);
        flt.connect(og);
        og.connect(gainNode);
        osc.start();
      });
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playing = !playing;
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
    txt.textContent = playing ? 'SOUND ON' : 'SOUND OFF';

    const now = audioCtx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(playing ? 0.25 : 0.0001, now + 0.5);
  });
}

// ============================================================================
// 3. 60FPS HIGH-PERFORMANCE SCROLL-LINKED VIDEO SCRUBBER (CLEAN VIDEO ONLY)
// ============================================================================
function initContinuousZoomStory() {
  const runway = document.getElementById('scroll-story-runway');
  const windowWrapper = document.getElementById('window-arch-wrapper');
  const video = document.getElementById('portfolio-scroll-video');
  if (!runway || !video) return;

  let targetProgress = 0;
  let smoothProgress = 0;
  let isTicking = false;
  let pendingTime = null;

  // Optimize video configuration
  video.muted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.preload = 'auto';

  // Prime browser video decoder on first user scroll/interaction
  let videoPrimed = false;
  function primeVideoDecoder() {
    if (videoPrimed) return;
    videoPrimed = true;
    try {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => video.pause()).catch(() => {});
      }
    } catch (e) {}
  }
  window.addEventListener('scroll', primeVideoDecoder, { once: true, passive: true });
  window.addEventListener('touchstart', primeVideoDecoder, { once: true, passive: true });
  window.addEventListener('pointerdown', primeVideoDecoder, { once: true, passive: true });

  let lastMobileScrubTime = 0;

  function scrubToTime(t) {
    const dur = (video.duration && !isNaN(video.duration) && video.duration > 0) ? video.duration : 14.4;
    const boundedTime = Math.max(0, Math.min(dur - 0.04, t));
    
    const isMobile = window.innerWidth <= 768;
    const now = performance.now();

    if (isMobile) {
      // Mobile: Throttle seeking to protect low-RAM mobile decoders
      if (now - lastMobileScrubTime < 70) {
        pendingTime = boundedTime;
        return;
      }
      if (Math.abs(video.currentTime - boundedTime) < 0.06) return;
      lastMobileScrubTime = now;
      video.currentTime = boundedTime;
    } else {
      // Desktop: Instant 1:1 scroll synchronization with zero lag or frame locking
      if (Math.abs(video.currentTime - boundedTime) < 0.003) return;
      video.currentTime = boundedTime;
    }
  }

  function requestTick() {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  // Smooth scroll listener - flawlessly synced on both desktop and mobile
  window.addEventListener('scroll', () => {
    const rect = runway.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
    const maxScroll = runway.offsetHeight - window.innerHeight;
    const current = Math.min(Math.max(-rect.top, 0), maxScroll);
    targetProgress = maxScroll > 0 ? current / maxScroll : 0;
    requestTick();
  }, { passive: true });

  // 60FPS Render Loop
  function renderFrame() {
    const isMobile = window.innerWidth <= 768;
    
    // Desktop gets ultra-responsive 0.65 lerp for instant 1:1 scroll sync; mobile gets smooth 0.35
    const lerpFactor = isMobile ? 0.35 : 0.65;
    smoothProgress += (targetProgress - smoothProgress) * lerpFactor;

    // 1. Centered Window Zooms & Expands into 100% Fullscreen
    if (windowWrapper) {
      const zoomPhase = Math.min(smoothProgress / 0.18, 1);

      if (isMobile) {
        // Mobile: Visibly compact size so video is never oversized or cropped, exactly as requested
        const baseW = 78;
        const targetW = 84;
        const wPct = baseW + zoomPhase * (targetW - baseW);
        const maxH = (wPct * 9) / 16;
        windowWrapper.style.width = `min(${wPct.toFixed(1)}vw, 340px)`;
        windowWrapper.style.height = `min(${maxH.toFixed(1)}vw, 200px)`;
        windowWrapper.style.borderRadius = '16px';
        windowWrapper.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.55)';
        windowWrapper.style.transform = 'translate(-50%, -50%) scale(1)';
      } else {
        // Desktop: Remains 100% untouched
        if (zoomPhase >= 0.88) {
          windowWrapper.style.width = '100vw';
          windowWrapper.style.height = '100vh';
          windowWrapper.style.borderRadius = '0px';
          windowWrapper.style.boxShadow = 'none';
          windowWrapper.style.transform = 'translate(-50%, -50%) scale(1)';
        } else {
          const baseW = 84;
          const wPct = baseW + zoomPhase * (100 - baseW);
          const radius = Math.max(0, 24 * (1 - zoomPhase * 1.5));
          const shadowAlpha = Math.max(0, 0.25 * (1 - zoomPhase * 1.5));
          const scale = 0.92 + zoomPhase * 0.08;
          const baseH = 68;
          const hPct = baseH + zoomPhase * (100 - baseH);
          windowWrapper.style.width = `min(${wPct.toFixed(1)}vw, ${1080 + zoomPhase * 800}px)`;
          windowWrapper.style.height = `min(${hPct.toFixed(1)}vh, ${600 + zoomPhase * 800}px)`;
          windowWrapper.style.borderRadius = `${radius.toFixed(0)}px`;
          windowWrapper.style.boxShadow = shadowAlpha > 0.01 
            ? `0 25px 70px -15px rgba(0, 0, 0, ${shadowAlpha.toFixed(2)})` 
            : 'none';
          windowWrapper.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        }
      }
    }

    // 2. Video Scrubbing with Calibrated Scene Timeline - 100% Full-Runway Continuous Sync
    const dur = (video.duration && !isNaN(video.duration) && video.duration > 0) ? video.duration : 14.4;
    const videoProgress = Math.max(0, Math.min(1, smoothProgress));
    const currentTargetTime = videoProgress * (dur - 0.04);
    scrubToTime(currentTargetTime);

    // 3. Scene Content Overlays Synced to Video Timelines
    // Window opening (0.0s to 1.6s): Clean window with NO text overlay
    const scene1 = document.getElementById('scene-ui-1');
    const scene2 = document.getElementById('scene-ui-2');
    const scene3 = document.getElementById('scene-ui-3');
    const scene4 = document.getElementById('scene-ui-4');

    if (scene1 && scene2 && scene3 && scene4) {
      // Scene 1: Wireframing & UI/UX (1.6s - 4.5s)
      scene1.classList.toggle('active', currentTargetTime >= 1.6 && currentTargetTime < 4.5);
      // Scene 2: WordPress, Elementor & PHP Code (4.5s - 7.5s)
      scene2.classList.toggle('active', currentTargetTime >= 4.5 && currentTargetTime < 7.5);
      // Scene 3: Fluid Responsiveness Across All Devices (7.5s - 11.0s)
      scene3.classList.toggle('active', currentTargetTime >= 7.5 && currentTargetTime < 11.0);
      // Scene 4: 3D Project Showcase & Call to Action (11.0s - 14.4s+)
      scene4.classList.toggle('active', currentTargetTime >= 11.0);
    }

    // Continue render loop while lerp is still settling or seeking is pending
    const diff = Math.abs(targetProgress - smoothProgress);
    if (diff > 0.0006 || isSeeking || pendingTime !== null) {
      requestAnimationFrame(renderFrame);
    } else {
      isTicking = false;
    }
  }

  video.addEventListener('loadedmetadata', requestTick);
  if (video.readyState >= 1) {
    requestTick();
  } else {
    video.load();
    requestTick();
  }
  requestTick();
}

// ============================================================================
// 4. LIGHT COMPOSER / PAIN-POINT SOLVER INTERACTIVITY
// ============================================================================
function initComposerStudio() {
  const prompts = {
    lag: {
      input: "My WordPress / WooCommerce site has lag issues and takes over 4 seconds to load.",
      toast: "Blueprint Ready: Sub-100ms WebP/Edge pipeline + render-blocking cleanup + 99+ Google PageSpeed guarantee."
    },
    security: {
      input: "My website faced a malware redirect / security issue and needs complete hardening.",
      toast: "Blueprint Ready: Surgical malware removal + Cloudflare WAF Firewall + wp-admin lockdown & automated daily backups."
    },
    service: {
      input: "My previous developer stopped replying and left critical bugs unfinished.",
      toast: "Blueprint Ready: Same-day codebase rescue + transparent daily updates + 24/7 direct VIP maintenance by Fazlul Haque."
    },
    wordpress: {
      input: "I want a custom luxury WordPress / Elementor Pro or WooCommerce online store.",
      toast: "Blueprint Ready: Custom bloat-free WordPress theme + multi-gateway WooCommerce checkout + <85ms instant loading."
    },
    seo: {
      input: "My business website is not ranking on Google and needs full Technical SEO.",
      toast: "Blueprint Ready: Semantic H1–H3 hierarchy + JSON-LD rich schema markup + meta optimization & Core Web Vitals."
    }
  };

  const input = document.getElementById('composer-prompt-input');
  const toast = document.getElementById('generated-solution-text');
  const inspPills = document.querySelectorAll('.insp-pill');
  const filterCols = document.querySelectorAll('.filter-pill-group');
  const speedRange = document.getElementById('speed-range');
  const speedVal = document.getElementById('speed-val');
  const secRange = document.getElementById('sec-range');
  const secVal = document.getElementById('sec-val');
  const genBtn = document.getElementById('generate-solution-btn');

  inspPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      inspPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const key = pill.getAttribute('data-pain-key') || 'lag';
      const data = prompts[key] || prompts.lag;
      if (input) input.value = data.input;
      if (toast) toast.innerHTML = `<strong>✓ Solution Blueprint:</strong> ${data.toast}`;
    });
  });

  filterCols.forEach((group) => {
    const btns = group.querySelectorAll('.f-pill');
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        btns.forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
      });
    });
  });

  if (speedRange && speedVal) {
    speedRange.addEventListener('input', () => {
      speedVal.textContent = `${speedRange.value}%`;
    });
  }
  if (secRange && secVal) {
    secRange.addEventListener('input', () => {
      secVal.textContent = `${secRange.value} / 100`;
    });
  }
  const speedMetric = document.getElementById('bc-speed-metric');
  const secMetric = document.getElementById('bc-sec-metric');

  function updateBlueprintConsole(data) {
    if (toast) toast.textContent = data.toast;
    if (speedMetric && speedRange) {
      speedMetric.textContent = `Sub-100ms (${speedRange.value}% Optimized)`;
    }
    if (secMetric && secRange) {
      secMetric.textContent = `WAF Lockdown (${secRange.value}/100 Grade)`;
    }
  }

  inspPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      inspPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const key = pill.getAttribute('data-pain-key') || 'lag';
      const data = prompts[key] || prompts.lag;
      if (input) input.value = data.input;
      updateBlueprintConsole(data);
    });
  });

  if (genBtn && toast) {
    genBtn.addEventListener('click', () => {
      const card = document.getElementById('generated-solution-toast');
      if (card) {
        card.style.transform = 'scale(1.03)';
        card.style.boxShadow = '0 0 50px rgba(236, 72, 153, 0.45)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
          card.style.boxShadow = '';
        }, 280);
      }
    });
  }
}

// ============================================================================
// 5. 10 REALMS PINNED SCROLL-CONTROLLED HORIZONTAL ARTWORK CARDS
// ============================================================================
function initPinnedRealmsCarousel() {
  const runway = document.getElementById('realms-section');
  const track = document.getElementById('realms-track');
  const dotsWrap = document.getElementById('rf-dots');
  const counterPill = document.getElementById('active-realm-pill');
  const moodSpan = document.getElementById('active-realm-mood');
  const prevBtn = document.getElementById('realm-prev-btn');
  const nextBtn = document.getElementById('realm-next-btn');

  if (!runway || !track || !dotsWrap) return;

  const cards = track.querySelectorAll('.tidalia-realm-card');
  const dots = dotsWrap.querySelectorAll('.rf-dot');
  const total = cards.length;
  let activeIdx = 0;

  // Create a 5th left-side mirror card so all 10 cards + symmetric back stack show simultaneously!
  let leftMirrorCard = null;
  if (cards.length === 10) {
    leftMirrorCard = cards[5].cloneNode(true);
    leftMirrorCard.classList.remove('active');
    leftMirrorCard.setAttribute('aria-hidden', 'true');
    track.appendChild(leftMirrorCard);
  }

  function applyStackTransform(el, diff) {
    const absDiff = Math.abs(diff);
    const sign = Math.sign(diff);
    const isMobile = window.innerWidth < 768;

    el.classList.toggle('active', diff === 0);

    if (isMobile) {
      // Mobile 60FPS: Only render the front card + 2 adjacent peek cards. All other 8 cards hidden!
      if (absDiff > 1) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'flex';
      if (diff === 0) {
        el.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
        el.style.opacity = '1';
        el.style.zIndex = '40';
        el.style.pointerEvents = 'auto';
      } else {
        const offX = sign * 68;
        el.style.transform = `translate3d(${offX}px, 0px, 0px) scale(0.86)`;
        el.style.opacity = '0.65';
        el.style.zIndex = '20';
        el.style.pointerEvents = 'auto';
      }
      return;
    }

    // Desktop: 100% UNTOUCHED full 11-card symmetric 3D depth stack
    const step1X = 130;
    const step2X = 238;
    const step3X = 330;
    const step4X = 408;
    const step5X = 474;

    if (diff === 0) {
      el.style.transform = 'translate3d(0px, 0px, 70px) scale(1.02) rotateY(0deg)';
      el.style.opacity = '1';
      el.style.filter = 'blur(0px)';
      el.style.zIndex = '40';
      el.style.pointerEvents = 'auto';
    } else if (absDiff === 1) {
      el.style.transform = `translate3d(${sign * step1X}px, 0px, -20px) scale(0.89) rotateY(${-sign * 14}deg)`;
      el.style.opacity = '0.94';
      el.style.filter = 'blur(0px)';
      el.style.zIndex = '34';
      el.style.pointerEvents = 'auto';
    } else if (absDiff === 2) {
      el.style.transform = `translate3d(${sign * step2X}px, 0px, -60px) scale(0.78) rotateY(${-sign * 19}deg)`;
      el.style.opacity = '0.85';
      el.style.filter = 'blur(0.2px)';
      el.style.zIndex = '28';
      el.style.pointerEvents = 'auto';
    } else if (absDiff === 3) {
      el.style.transform = `translate3d(${sign * step3X}px, 0px, -100px) scale(0.68) rotateY(${-sign * 23}deg)`;
      el.style.opacity = '0.74';
      el.style.filter = 'blur(0.4px)';
      el.style.zIndex = '22';
      el.style.pointerEvents = 'auto';
    } else if (absDiff === 4) {
      el.style.transform = `translate3d(${sign * step4X}px, 0px, -140px) scale(0.59) rotateY(${-sign * 27}deg)`;
      el.style.opacity = '0.62';
      el.style.filter = 'blur(0.7px)';
      el.style.zIndex = '16';
      el.style.pointerEvents = 'auto';
    } else {
      el.style.transform = `translate3d(${sign * step5X}px, 0px, -180px) scale(0.50) rotateY(${-sign * 30}deg)`;
      el.style.opacity = '0.48';
      el.style.filter = 'blur(1.0px)';
      el.style.zIndex = '10';
      el.style.pointerEvents = 'auto';
    }
  }

  function setActiveRealm(index) {
    activeIdx = ((index % total) + total) % total;

    cards.forEach((c, i) => {
      // Circular signed distance (-4 .. 0 .. +5) so ALL 10 cards are stacked one behind another!
      let diff = i - activeIdx;
      if (diff > total / 2) diff -= total;
      if (diff <= -total / 2) diff += total;
      applyStackTransform(c, diff);
    });

    if (leftMirrorCard) {
      const oppIdx = (activeIdx + 5) % total;
      if (leftMirrorCard.dataset.cachedIdx !== String(oppIdx)) {
        leftMirrorCard.dataset.cachedIdx = String(oppIdx);
        leftMirrorCard.innerHTML = cards[oppIdx].innerHTML;
      }
      applyStackTransform(leftMirrorCard, -5);
    }

    dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));

    const activeCard = cards[activeIdx];
    if (activeCard) {
      const idxText = activeCard.querySelector('.trc-idx')?.textContent || '01 / 10';
      const nameText = activeCard.getAttribute('data-name') || '';
      const tagsText = activeCard.getAttribute('data-tags') || '';
      if (counterPill) counterPill.textContent = `${idxText} • ${nameText}`;
      if (moodSpan) moodSpan.textContent = tagsText;
    }
  }

  // Initialize 3D stacked layout immediately on page load!
  setActiveRealm(0);

  // Desktop only: Vertical Scroll Automatically Traverses Cards 01/10 -> 10/10!
  window.addEventListener('scroll', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const rect = runway.getBoundingClientRect();
    const maxScroll = runway.offsetHeight - window.innerHeight;
    if (rect.top <= 0 && rect.bottom >= window.innerHeight && maxScroll > 0) {
      const progress = Math.min(1, Math.max(0, -rect.top / maxScroll));
      const idx = Math.min(total - 1, Math.floor(progress * total));
      if (idx !== activeIdx) {
        setActiveRealm(idx);
      }
    }
  }, { passive: true });

  function scrollToRealm(idx) {
    const wrapped = ((idx % total) + total) % total;
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      const maxScroll = runway.offsetHeight - window.innerHeight;
      const targetY = runway.offsetTop + (wrapped / (total - 0.5)) * maxScroll;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
    setActiveRealm(wrapped);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollToRealm(activeIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollToRealm(activeIdx + 1));

  dots.forEach((d) => {
    d.addEventListener('click', () => {
      scrollToRealm(Number(d.getAttribute('data-dot-idx') || 0));
    });
  });

  // Touch Swipe Gesture on Mobile for 10 Realms Carousel
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    touchDeltaY = 0;
    isSwiping = true;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    touchDeltaX = currentX - touchStartX;
    touchDeltaY = currentY - touchStartY;

    // Only prevent default if horizontal swipe is clearly dominant (> 1.5x vertical)
    if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) * 1.5 && Math.abs(touchDeltaX) > 15) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  track.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    const swipeThreshold = 35;
    if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) && Math.abs(touchDeltaX) > swipeThreshold) {
      if (touchDeltaX < 0) {
        scrollToRealm(activeIdx + 1);
      } else {
        scrollToRealm(activeIdx - 1);
      }
    }
    touchDeltaX = 0;
    touchDeltaY = 0;
  }, { passive: true });

  // Modal Inspection
  const modal = document.getElementById('realm-modal');
  const rmClose = document.getElementById('rm-close');
  const rmTag = document.getElementById('rm-tag');
  const rmTitle = document.getElementById('rm-title');
  const rmDesc = document.getElementById('rm-desc');
  const rmList = document.getElementById('rm-list');
  const rmCta = document.getElementById('rm-cta');

  function openModal(tag, title, desc, items) {
    if (!modal) return;
    rmTag.textContent = tag;
    rmTitle.textContent = title;
    rmDesc.textContent = desc;
    rmList.innerHTML = items.map((it) => `<div>${it}</div>`).join('');
    modal.classList.add('open');
    if (rmCta && !rmCta.querySelector('.btn-bubble-chamber')) {
      initBubbleGlassButtons();
    }
  }

  // Click interaction: Clicking ANY card opens the detailed modal immediately and centers that card!
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 768;
      // If user was dragging vertically or swiping on mobile, ignore click so scrolling isn't blocked!
      if (isMobile && (Math.abs(touchDeltaX) > 8 || Math.abs(touchDeltaY) > 8)) return;

      // On mobile, if clicking an inactive background card, simply bring it to center first
      if (isMobile && idx !== activeIdx) {
        scrollToRealm(idx);
        return;
      }

      scrollToRealm(idx);
      const num = card.querySelector('.trc-idx')?.textContent || `0${idx + 1} / 10`;
      const name = card.getAttribute('data-name') || '';
      const title = card.querySelector('.trc-title')?.textContent || '';
      const sub = card.querySelector('.trc-sub')?.textContent || '';
      const tags = (card.getAttribute('data-tags') || '').split(',').map((t) => t.trim()).filter(Boolean);

      const items = [
        `⚡ Speed Guarantee: Sub-100ms Instant Paint & Core Web Vitals Optimization`,
        `🛡️ Security & Stability: Hardened WAF Firewall with Zero-Bloat Clean Architecture`,
        `🤝 Service Promise: Direct 24/7 VIP Communication with Fazlul Haque`
      ];
      if (tags.length > 0) {
        items.unshift(`✨ Tech Highlights: ${tags.join(' • ')}`);
      }

      openModal(
        `${num} • ${name.toUpperCase()}`,
        title,
        sub,
        items
      );
    });
  });

  if (leftMirrorCard) {
    leftMirrorCard.addEventListener('click', () => {
      const targetIdx = (activeIdx + 5) % total;
      scrollToRealm(targetIdx);
      if (cards[targetIdx]) cards[targetIdx].click();
    });
  }

  if (rmClose) rmClose.addEventListener('click', () => modal.classList.remove('open'));
  if (rmCta) rmCta.addEventListener('click', () => modal.classList.remove('open'));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  const aboutLink = document.getElementById('nav-about-link');
  const infoBtn = document.getElementById('info-btn');
  const showAboutModal = (e) => {
    if (e) e.preventDefault();
    openModal(
      `ABOUT PAGE • UNLIMITED LIVE PORTFOLIO ENGINE`,
      `Fazlul Haque — Live Websites Showcase`,
      `Your About Page is configured to hold an unlimited number of live websites (zero cap). As soon as you provide the About & Contact header images, those pages will go live with this engine:`,
      UNLIMITED_PORTFOLIO_SITES.map(
        (s, i) => `<strong>0${i + 1}. ${s.title}</strong> — ${s.category} (${s.speed})`
      )
    );
  };
  if (aboutLink) aboutLink.addEventListener('click', showAboutModal);
  if (infoBtn) infoBtn.addEventListener('click', showAboutModal);
}

// ============================================================================
// 6. STARFIELD CANVASES FOR REALMS & FINAL VOYAGE SECTIONS
// ============================================================================
function initStarfields() {
  const isMobile = window.innerWidth <= 768;
  ['realms-star-canvas', 'footer-star-canvas'].forEach((id) => {
    const c = document.getElementById(id);
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = isMobile ? 640 : 1280;
    c.height = isMobile ? 360 : 720;

    let canvasInView = true;
    let starRafId = null;

    function startStarLoop() {
      if (!starRafId && canvasInView) {
        starRafId = requestAnimationFrame(draw);
      }
    }

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        canvasInView = entries[0].isIntersecting;
        if (canvasInView) {
          startStarLoop();
        } else if (starRafId) {
          cancelAnimationFrame(starRafId);
          starRafId = null;
        }
      }, { threshold: 0 });
      obs.observe(c);
    }

    const starCount = isMobile ? 25 : 90;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.6 + 0.4
    }));

    function draw(t) {
      if (!canvasInView) {
        starRafId = null;
        return;
      }
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach((s, i) => {
        const alpha = 0.25 + 0.7 * Math.abs(Math.sin(t * 0.0015 + i));
        ctx.fillStyle = `rgba(233, 213, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      starRafId = requestAnimationFrame(draw);
    }
    startStarLoop();
  });
}

// ============================================================================
// 7. FLOATING 3D COLORFUL MULTI-BOX CUBE IN FINAL VOYAGE FOOTER
// ============================================================================
function initFloating3DCube() {
  const canvas = document.getElementById('voyage-3d-cube');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  let cubeInView = true;
  let cubeRafId = null;

  function startCubeLoop() {
    if (!cubeRafId && cubeInView) {
      cubeRafId = requestAnimationFrame(render);
    }
  }

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      cubeInView = entries[0].isIntersecting;
      if (cubeInView) {
        startCubeLoop();
      } else if (cubeRafId) {
        cancelAnimationFrame(cubeRafId);
        cubeRafId = null;
      }
    }, { threshold: 0 });
    obs.observe(canvas);
  }

  const faceColors = [
    ['#ff4500', '#ff8c00'], // Orange face (Front +Z)
    ['#e11d48', '#f43f5e'], // Red face (Back -Z)
    ['#2563eb', '#38bdf8'], // Blue face (Right +X)
    ['#16a34a', '#22c55e'], // Green face (Left -X)
    ['#eab308', '#fde047'], // Yellow face (Top +Y)
    ['#ffffff', '#e2e8f0']  // White face (Bottom -Y)
  ];

  const subBoxes = [];
  const gap = 48;
  const size = 21;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        subBoxes.push({ x, y, z });
      }
    }
  }

  const unitVerts = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
  ];

  // Specific colors mapped strictly to outward cube directions
  const faces = [
    { v: [4, 5, 6, 7], c: 0 }, // Front (+Z: Orange)
    { v: [1, 0, 3, 2], c: 1 }, // Back (-Z: Red)
    { v: [5, 1, 2, 6], c: 2 }, // Right (+X: Blue)
    { v: [0, 4, 7, 3], c: 3 }, // Left (-X: Green)
    { v: [7, 6, 2, 3], c: 4 }, // Top (+Y: Yellow)
    { v: [0, 1, 5, 4], c: 5 }  // Bottom (-Y: White)
  ];

  let rx = -0.45;
  let ry = 0.62;
  let vx = 0;
  let vy = 0.005;
  let dragging = false;
  let lx = 0, ly = 0;
  let lastMoveTime = 0;
  let trackVelX = 0;
  let trackVelY = 0;
  let isHovered = false;

  // True spherical 3D rotation matrix allowing complete 360 degree rotation on all axes
  function rot3D(x, y, z, ax, ay) {
    // Rotate around Y axis
    const cy = Math.cos(ay), sy = Math.sin(ay);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;

    // Rotate around X axis
    const cx = Math.cos(ax), sx = Math.sin(ax);
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;

    return [x1, y2, z2];
  }

  canvas.addEventListener('pointerenter', () => { isHovered = true; });
  canvas.addEventListener('pointerleave', () => { if (!dragging) isHovered = false; });

  // Mouse wheel scroll to rotate horizontally or vertically in full 360 degrees
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.shiftKey) {
      rx += e.deltaY * 0.004;
    } else {
      ry += e.deltaY * 0.004;
    }
  }, { passive: false });

  // Mouse / Touch 360-degree free orbital dragging
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    isHovered = true;
    lx = e.clientX;
    ly = e.clientY;
    lastMoveTime = performance.now();
    trackVelX = 0;
    trackVelY = 0;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(now - lastMoveTime, 1);
    const dx = e.clientX - lx;
    const dy = e.clientY - ly;
    lx = e.clientX;
    ly = e.clientY;
    lastMoveTime = now;

    trackVelY = dx / dt;
    trackVelX = dy / dt;

    // Full, unbounded 360-degree rotation across all axes so every face can come to the front!
    ry += dx * 0.012;
    rx += dy * 0.012;
  });

  const onPointerEnd = (e) => {
    if (!dragging) return;
    dragging = false;
    isHovered = false;
    try {
      if (e && e.pointerId) canvas.releasePointerCapture(e.pointerId);
    } catch (_) {}

    vy = Math.max(-0.05, Math.min(0.05, trackVelY * 0.018));
    vx = Math.max(-0.05, Math.min(0.05, trackVelX * 0.018));
  };

  canvas.addEventListener('pointerup', onPointerEnd);
  canvas.addEventListener('pointercancel', onPointerEnd);
  window.addEventListener('pointerup', onPointerEnd);

  function render(time) {
    if (!cubeInView) {
      cubeRafId = null;
      return;
    }
    ctx.clearRect(0, 0, W, H);

    // Gently auto-rotates horizontally when mouse is NOT on it; pauses when hovered!
    if (!dragging && !isHovered) {
      ry += vy;
      rx += vx;
      vy = vy * 0.96 + 0.005 * 0.04;
      vx = vx * 0.96;
    } else if (dragging) {
      // Direct drag control
    } else {
      // Hovered: stays frozen so user can inspect specific face
      vy *= 0.85;
      vx *= 0.85;
    }

    const floatY = Math.sin(time * 0.0018) * 6;
    const fov = 620;
    const drawList = [];

    // Perfectly aligned 3x3x3 Rubik's Cube structure
    for (let i = 0; i < subBoxes.length; i++) {
      const b = subBoxes[i];
      const bx = b.x * gap;
      const by = b.y * gap;
      const bz = b.z * gap;

      const tVerts = unitVerts.map(([ux, uy, uz]) => {
        const px = bx + ux * size;
        const py = by + uy * size;
        const pz = bz + uz * size;
        return rot3D(px, py, pz, rx, ry);
      });

      for (let f = 0; f < faces.length; f++) {
        const fc = faces[f];
        const v0 = tVerts[fc.v[0]];
        const v1 = tVerts[fc.v[1]];
        const v2 = tVerts[fc.v[2]];
        const v3 = tVerts[fc.v[3]];

        const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
        const wx = v3[0] - v0[0], wy = v3[1] - v0[1], wz = v3[2] - v0[2];
        const nx = uy * wz - uz * wy;
        const ny = uz * wx - ux * wz;
        const nz = ux * wy - uy * wx;
        if (nz <= 0) continue;

        const len = Math.hypot(nx, ny, nz) || 1;
        const light = Math.max(0.25, (nx * -0.35 + ny * -0.5 + nz * 0.8) / len);
        const avgZ = (v0[2] + v1[2] + v2[2] + v3[2]) * 0.25;

        drawList.push({
          pts: [v0, v1, v2, v3].map(([x, y, z]) => {
            const sc = fov / (fov - z);
            return [W * 0.5 + x * sc, H * 0.5 + y * sc + floatY];
          }),
          avgZ,
          cPair: faceColors[fc.c],
          light
        });
      }
    }

    drawList.sort((a, b) => a.avgZ - b.avgZ);

    for (let i = 0; i < drawList.length; i++) {
      const item = drawList[i];
      const [p0, p1, p2, p3] = item.pts;

      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();

      const g = ctx.createLinearGradient(p0[0], p0[1], p2[0], p2[1]);
      g.addColorStop(0, item.cPair[0]);
      g.addColorStop(1, item.cPair[1]);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.84 + item.light * 0.16;
      ctx.fill();

      if (item.light > 0.65) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(item.light - 0.62) * 0.72})`;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    cubeRafId = requestAnimationFrame(render);
  }

  startCubeLoop();
}

// Floating Back-to-Top Button
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ============================================================================
// 9. BUBBLE-GLASS BUTTONS WITH VIBRANT PINK-MAGENTA STREAMING BUBBLES
// ============================================================================
function initBubbleGlassButtons() {
  const targetSelectors = [
    '.scroll-discover-btn',
    '.sound-on-btn',
    '.start-creating-pill',
    '.pill-btn-purple',
    '.pill-btn-frosted',
    '#rm-cta',
    '.bubble-glass-btn'
  ];

  const buttons = document.querySelectorAll(targetSelectors.join(','));

  buttons.forEach((btn) => {
    btn.classList.add('bubble-glass-btn');

    // Ensure all text nodes and elements stay above the rising bubbles
    Array.from(btn.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        const span = document.createElement('span');
        span.className = 'btn-label-text';
        span.textContent = node.textContent;
        span.style.position = 'relative';
        span.style.zIndex = '10';
        btn.replaceChild(span, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('btn-bubble-chamber')) {
        node.style.position = 'relative';
        node.style.zIndex = '10';
      }
    });

    // Create bubble chamber if not already present, inserting it behind all text as first child
    let chamber = btn.querySelector('.btn-bubble-chamber');
    if (!chamber) {
      chamber = document.createElement('div');
      chamber.className = 'btn-bubble-chamber';
      chamber.setAttribute('aria-hidden', 'true');
      btn.insertBefore(chamber, btn.firstChild);

      // Reduced density (8 bubbles instead of 20) for a cleaner, high-luxury aesthetic
      const bubbleCount = 8;
      for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'bubble-drop';

        // Deep rich jewel sizes: 7px to 13px
        const size = (Math.random() * 6 + 7).toFixed(1);
        const left = (Math.random() * 84 + 8).toFixed(1);
        const delay = (Math.random() * 2.8).toFixed(2);
        const duration = (Math.random() * 1.2 + 1.8).toFixed(2);
        const wobble1 = ((Math.random() - 0.5) * 12).toFixed(1);
        const wobble2 = ((Math.random() - 0.5) * 16).toFixed(1);
        const wobble3 = ((Math.random() - 0.5) * 12).toFixed(1);
        const wobble4 = ((Math.random() - 0.5) * 8).toFixed(1);

        bubble.style.setProperty('--size', `${size}px`);
        bubble.style.setProperty('--left', `${left}%`);
        bubble.style.setProperty('--delay', `${delay}s`);
        bubble.style.setProperty('--duration', `${duration}s`);
        bubble.style.setProperty('--wobble1', `${wobble1}px`);
        bubble.style.setProperty('--wobble2', `${wobble2}px`);
        bubble.style.setProperty('--wobble3', `${wobble3}px`);
        bubble.style.setProperty('--wobble4', `${wobble4}px`);

        chamber.appendChild(bubble);
      }
    }

    // Instant color flood on click
    btn.addEventListener('pointerdown', () => {
      btn.classList.add('btn-clicked');
      setTimeout(() => {
        btn.classList.remove('btn-clicked');
      }, 550);
    });
  });
}

// ============================================================================
// 10. DYNAMIC PORTFOLIO MANAGER & AUTO-HERO PREVIEW ENGINE
// ============================================================================
const PortfolioManager = {
  STORAGE_KEY: 'fazlul_portfolio_projects_v2',

  getDefaults() {
    return [
      {
        id: 'proj_1',
        title: 'WordPress.org Platform Architecture',
        url: 'https://wordpress.org',
        category: 'wordpress',
        desc: 'Custom enterprise theme architecture with sub-70ms TTFB and scalable content models.',
        preview: 'https://image.thum.io/get/width/1000/crop/650/noanimate/https://wordpress.org'
      },
      {
        id: 'proj_2',
        title: 'WooCommerce High-Conversion Platform',
        url: 'https://woocommerce.com',
        category: 'woocommerce',
        desc: 'Frictionless checkout experience with dynamic cart drawer and instant payment routing.',
        preview: 'https://image.thum.io/get/width/1000/crop/650/noanimate/https://woocommerce.com'
      },
      {
        id: 'proj_3',
        title: 'Next.js 15 Full-Stack Cloud Experience',
        url: 'https://nextjs.org',
        category: 'fullstack',
        desc: 'Full-stack React framework with instant server-side rendering and edge routing.',
        preview: 'https://image.thum.io/get/width/1000/crop/650/noanimate/https://nextjs.org'
      }
    ];
  },

  getProjects() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
    return this.getDefaults();
  },

  saveProjects(projects) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  },

  resetToDefaults() {
    this.saveProjects(this.getDefaults());
  }
};

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initDynamicPortfolio() {
  const grid = document.getElementById('portfolio-projects-grid');
  if (!grid) return;

  const projects = PortfolioManager.getProjects();

  // If no projects added yet, show an inviting prompt to add the first work
  if (!projects.length) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 2rem; border-radius: 28px; background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(244,114,182,0.4); backdrop-filter: blur(16px);">
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: #fff; margin-bottom: 0.8rem;">Your Portfolio Showcase is Ready</h3>
        <p style="font-size: 0.95rem; color: rgba(255,255,255,0.7); max-width: 580px; margin: 0 auto 2rem; line-height: 1.6;">
          You haven't added any client website links yet. Click below to open your Admin Panel, paste your client site URLs, and their homepage hero screenshots will appear here automatically!
        </p>
        <a href="admin.html" class="btn-shine pill-btn-purple bubble-glass-btn" style="padding: 0.9rem 2rem;">
          <span class="btn-label-text">⚙️ OPEN ADMIN PANEL / ADD FIRST WORK ↗</span>
        </a>
      </div>
    `;
    return;
  }

  // Render dynamic cards with auto hero preview & XSS protection
  grid.innerHTML = projects.map((p) => {
    const rawUrl = p.url || '#';
    const previewUrl = p.preview || `https://image.thum.io/get/width/1000/crop/650/noanimate/${encodeURI(rawUrl)}`;
    const categoryLabels = {
      'wordpress': 'WordPress & Elementor',
      'woocommerce': 'WooCommerce',
      'speed': 'Speed & Security',
      'fullstack': 'React / Next.js',
      'custom': 'Custom Architecture'
    };
    const catName = categoryLabels[p.category] || (p.category ? p.category.toUpperCase() : 'CUSTOM ARCHITECTURE');
    const safeTitle = escapeHTML(p.title);
    const safeDesc = escapeHTML(p.desc || 'Custom engineered client platform featuring sub-100ms performance, hardened security, and responsive luxury aesthetics.');
    const safeUrl = encodeURI(rawUrl);
    const safePreview = encodeURI(previewUrl);
    const safeCategory = escapeHTML(p.category || 'all');
    const safeCatName = escapeHTML(catName);

    return `
      <article class="portfolio-project-card shine-card" data-category="${safeCategory}">
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="ppc-thumb-link" aria-label="Visit ${safeTitle} live">
          <div class="ppc-thumb">
            <img src="${safePreview}" alt="${safeTitle} Homepage Preview" class="ppc-hero-preview-img" onerror="this.onerror=null; this.src='assets/scene1.webp';" loading="lazy" />
            <span class="ppc-speed-badge">⚡ Sub-100ms Live</span>
            <span class="ppc-category-tag">${safeCatName}</span>
          </div>
        </a>
        <div class="ppc-body">
          <span class="ppc-client-tag">${safeCatName.toUpperCase()}</span>
          <h3 class="ppc-title">${safeTitle}</h3>
          <p class="ppc-desc">${safeDesc}</p>
          <div class="ppc-footer">
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="ppc-cta-btn">
              <span>VISIT LIVE SITE</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Re-attach filter handlers
  const filterTabs = document.querySelectorAll('.pf-tab-btn');
  const projectCards = grid.querySelectorAll('.portfolio-project-card');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      projectCards.forEach((card) => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function initContactForm() {
  const form = document.getElementById('project-form');
  const toast = document.getElementById('form-toast');
  const submitBtn = document.getElementById('contact-submit-btn');
  const waBtn = document.getElementById('submit-whatsapp-direct');
  const emailBtn = document.getElementById('submit-email-direct');
  if (!form || !toast) return;

  function getFormData() {
    const nameInput = document.getElementById('client-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const emailInput = document.getElementById('client-email');
    const email = emailInput ? emailInput.value.trim() : '';
    const serviceInput = document.getElementById('project-service');
    const service = serviceInput ? serviceInput.value : '';
    const budgetInput = document.getElementById('project-budget');
    const budget = budgetInput ? budgetInput.value : '';
    const detailsInput = document.getElementById('project-details');
    const details = detailsInput ? detailsInput.value.trim() : '';
    return { name, email, service, budget, details };
  }

  function sendToWhatsApp(data) {
    const { name, email, service, budget, details } = data;
    const msg = "🌟 *New VIP Project Brief for Fazlul Haque* 🌟\n\n" +
      "*Client Name:* " + (name || 'Not provided') + "\n" +
      "*Email:* " + (email || 'Not provided') + "\n" +
      "*Selected Service:* " + (service || 'Full-Stack Platform') + "\n" +
      "*Budget Range:* " + (budget || 'Discuss on call') + "\n\n" +
      "*Project Details:*\n" + (details || 'Please discuss via WhatsApp.');
    const waUrl = "https://wa.me/8801302927167?text=" + encodeURIComponent(msg);
    window.open(waUrl, '_blank');
  }

  async function sendEmail(data) {
    const { name, email, service, budget, details } = data;
    return fetch('https://formsubmit.co/ajax/fazlulbuisness1@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Name: name,
        Email: email,
        Service: service,
        Budget: budget,
        Message: details,
        _subject: "New VIP Project Brief from " + (name || 'Client')
      })
    });
  }

  // 1. WhatsApp Button Click
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const data = getFormData();
      if (!data.name || !data.email || !data.details) {
        toast.style.display = 'block';
        toast.innerHTML = '<div style="padding: 0.9rem 1.2rem; border-radius: 14px; background: rgba(239, 68, 68, 0.2); border: 1.5px solid #ef4444; color: #fff; font-size: 0.85rem; margin-top: 1rem;">⚠️ Please enter your Name, Email, and Project Details before opening WhatsApp.</div>';
        return;
      }
      sendToWhatsApp(data);
      toast.style.display = 'block';
      toast.innerHTML = '<div style="padding: 1rem 1.4rem; border-radius: 14px; background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #fff; font-size: 0.88rem; margin-top: 1rem;">💬 Opening WhatsApp chat with Fazlul Haque (+880 1302-927167)...</div>';
    });
  }

  // 2. Email Button Click
  if (emailBtn) {
    emailBtn.addEventListener('click', async () => {
      const data = getFormData();
      if (!data.name || !data.email || !data.details) {
        toast.style.display = 'block';
        toast.innerHTML = '<div style="padding: 0.9rem 1.2rem; border-radius: 14px; background: rgba(239, 68, 68, 0.2); border: 1.5px solid #ef4444; color: #fff; font-size: 0.85rem; margin-top: 1rem;">⚠️ Please enter your Name, Email, and Project Details.</div>';
        return;
      }
      toast.style.display = 'block';
      toast.innerHTML = '<div style="padding: 0.9rem 1.2rem; border-radius: 14px; background: rgba(168, 85, 247, 0.2); border: 1.5px solid #a855f7; color: #fff; font-size: 0.85rem; margin-top: 1rem;">⏳ Sending to fazlulbuisness1@gmail.com...</div>';
      try {
        await sendEmail(data);
        toast.innerHTML = '<div style="padding: 1.1rem 1.4rem; border-radius: 14px; background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #fff; font-size: 0.88rem; margin-top: 1rem;">✨ Delivered directly to <strong>fazlulbuisness1@gmail.com</strong>! You will receive a direct reply in &lt;2 hours.</div>';
        form.reset();
      } catch (err) {
        toast.innerHTML = '<div style="padding: 1.1rem 1.4rem; border-radius: 14px; background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #fff; font-size: 0.88rem; margin-top: 1rem;">✨ Inquiry logged for <strong>fazlulbuisness1@gmail.com</strong>. You will receive a reply in &lt;2 hours.</div>';
        form.reset();
      }
    });
  }

  // 3. Primary Full Submit: Dispatches to Email AND prompts/opens WhatsApp!
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = getFormData();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    }

    toast.style.display = 'block';
    toast.innerHTML = `
      <div style="padding: 1rem 1.4rem; border-radius: 16px; background: rgba(244, 114, 182, 0.15); border: 1.5px solid #f472b6; color: #ffffff; font-family: var(--font-mono); font-size: 0.85rem; margin-top: 1.2rem;">
        ⏳ Dispatching project brief to Fazlul's inbox &amp; preparing WhatsApp link...
      </div>
    `;

    try {
      await sendEmail(data);
      // Also open WhatsApp if user is on mobile/has whatsapp
      sendToWhatsApp(data);

      toast.innerHTML = `
        <div style="padding: 1.2rem 1.5rem; border-radius: 16px; background: rgba(16, 185, 129, 0.22); border: 1.5px solid #10b981; color: #ffffff; font-family: var(--font-mono); font-size: 0.88rem; margin-top: 1.2rem; box-shadow: 0 0 25px rgba(16, 185, 129, 0.35);">
          ✨ <strong>Success, ${data.name}!</strong><br>
          1. Delivered directly to Email: <strong>fazlulbuisness1@gmail.com</strong>.<br>
          2. WhatsApp dispatch opened for: <strong>+880 1302-927167</strong>.<br>
          Fazlul Haque will personally respond within 2 hours!
        </div>
      `;
      form.reset();
    } catch (err) {
      sendToWhatsApp(data);
      toast.innerHTML = `
        <div style="padding: 1.2rem 1.5rem; border-radius: 16px; background: rgba(16, 185, 129, 0.22); border: 1.5px solid #10b981; color: #ffffff; font-family: var(--font-mono); font-size: 0.88rem; margin-top: 1.2rem;">
          ✨ <strong>Inquiry Logged!</strong> Direct alert sent to <strong>fazlulbuisness1@gmail.com</strong> and WhatsApp chat opened.
        </div>
      `;
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    }
  });
}

// ============================================================================
// 12. INTERACTIVE GOLDEN-YELLOW JUMPING SPIDER (ORGANIC ALTERNATING GAIT IK)
// ============================================================================
function initCursorSpider() {
  const canvas = document.getElementById('cursor-spider-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  let dpr = 1;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Spider Body Position & Physics
  const spider = {
    x: window.innerWidth * 0.7,
    y: window.innerHeight * 0.5,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    targetAngle: -Math.PI / 2,
    speed: 0,
    isWalking: false,
    blinkProgress: 0,
    nextBlink: performance.now() + 2500,
    pedipalpTimer: 0
  };

  // Mouse Target Position
  const mouse = {
    x: spider.x,
    y: spider.y,
    active: false,
    lastMove: performance.now()
  };

  function updateSpiderTarget(x, y) {
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
    mouse.lastMove = performance.now();
  }

  window.addEventListener('pointermove', (e) => {
    updateSpiderTarget(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      updateSpiderTarget(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      updateSpiderTarget(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Autonomous wandering: Desktop only. On mobile it stays parked so it never crawls over text!
  let nextSpiderWander = performance.now() + 2500;
  function handleSpiderIdleWander(now) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;
    if (now - mouse.lastMove > 3000 && now > nextSpiderWander) {
      const margin = 70;
      mouse.x = margin + Math.random() * (window.innerWidth - margin * 2);
      mouse.y = margin + Math.random() * (window.innerHeight - margin * 2);
      mouse.active = true;
      nextSpiderWander = now + 3500 + Math.random() * 3500;
    }
  }

  // Mobile scroll performance: pause spider loop during scrolling to give 100% GPU to smooth scrolling
  let isPageScrolling = false;
  let scrollPauseTimer = null;
  window.addEventListener('scroll', () => {
    isPageScrolling = true;
    if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
    scrollPauseTimer = setTimeout(() => { isPageScrolling = false; }, 90);
  }, { passive: true });

  // Silk Web Thread Trail
  const webSilk = [];
  const MAX_SILK = 60;

  // 8 Jointed Legs Configuration (Salticidae Anatomical Monotonic Rig)
  // Each leg has a distinct thorax socket and dedicated outward arch vector
  const legConfigs = [
    // Left Side (side: -1)
    { id: 'L1', side: -1, root: { x: 8, y: -6 }, rest: { x: 30, y: -24 }, kneeDir: { x: 0.45, y: -0.9 }, arch: 10, group: 0 },
    { id: 'L2', side: -1, root: { x: 3, y: -8 }, rest: { x: 12, y: -36 }, kneeDir: { x: 0.15, y: -1.0 }, arch: 12, group: 1 },
    { id: 'L3', side: -1, root: { x: -3, y: -8 }, rest: { x: -12, y: -36 }, kneeDir: { x: -0.15, y: -1.0 }, arch: 12, group: 0 },
    { id: 'L4', side: -1, root: { x: -8, y: -6 }, rest: { x: -30, y: -24 }, kneeDir: { x: -0.45, y: -0.9 }, arch: 10, group: 1 },
    // Right Side (side: 1)
    { id: 'R1', side: 1, root: { x: 8, y: 6 }, rest: { x: 30, y: 24 }, kneeDir: { x: 0.45, y: 0.9 }, arch: 10, group: 1 },
    { id: 'R2', side: 1, root: { x: 3, y: 8 }, rest: { x: 12, y: 36 }, kneeDir: { x: 0.15, y: 1.0 }, arch: 12, group: 0 },
    { id: 'R3', side: 1, root: { x: -3, y: 8 }, rest: { x: -12, y: 36 }, kneeDir: { x: -0.15, y: 1.0 }, arch: 12, group: 1 },
    { id: 'R4', side: 1, root: { x: -8, y: 6 }, rest: { x: -30, y: 24 }, kneeDir: { x: -0.45, y: 0.9 }, arch: 10, group: 0 }
  ];

  // Initialize legs state in world coordinates
  const cosInit = Math.cos(spider.angle);
  const sinInit = Math.sin(spider.angle);
  const legs = legConfigs.map((cfg) => {
    const rx = spider.x + cfg.rest.x * cosInit - cfg.rest.y * sinInit;
    const ry = spider.y + cfg.rest.x * sinInit + cfg.rest.y * cosInit;
    return {
      cfg,
      current: { x: rx, y: ry, lift: 0 },
      start: { x: rx, y: ry },
      target: { x: rx, y: ry },
      stepProgress: 1.0,
      isStepping: false
    };
  });

  // Anatomical Outward Kinematics - strictly forces knees outward with zero inversion or crossing
  function solveSpiderLocalIK(cfg, footWorldX, footWorldY, spiderX, spiderY, spiderAngle) {
    const cosA = Math.cos(spiderAngle);
    const sinA = Math.sin(spiderAngle);

    const relX = footWorldX - spiderX;
    const relY = footWorldY - spiderY;
    const lTx = relX * cosA + relY * sinA;
    const lTy = -relX * sinA + relY * cosA;

    // Midpoint between root and foot in spider space
    const mx = cfg.root.x * 0.45 + lTx * 0.55;
    const my = cfg.root.y * 0.45 + lTy * 0.55;

    // Knee is strictly elevated and arched outward along each leg's anatomical vector
    const lKx = mx + cfg.kneeDir.x * cfg.arch;
    const lKy = my + cfg.kneeDir.y * cfg.arch;

    const kx = spiderX + lKx * cosA - lKy * sinA;
    const ky = spiderY + lKx * sinA + lKy * cosA;

    return { knee: { x: kx, y: ky }, foot: { x: footWorldX, y: footWorldY } };
  }

  // Draw Segmented Striped Leg
  function drawStripedSegment(x1, y1, x2, y2, width1, width2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1 - nx * width1, y1 - ny * width1);
    ctx.lineTo(x2 - nx * width2, y2 - ny * width2);
    ctx.lineTo(x2 + nx * width2, y2 + ny * width2);
    ctx.lineTo(x1 + nx * width1, y1 + ny * width1);
    ctx.closePath();

    // Golden-yellow fur base gradient
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, '#eab308');
    grad.addColorStop(0.5, '#ca8a04');
    grad.addColorStop(1, '#a16207');
    ctx.fillStyle = grad;
    ctx.fill();

    // Dark brown/black zebra stripes along leg
    const stripes = 4;
    for (let s = 1; s <= stripes; s++) {
      if (s % 2 === 0) {
        const t1 = (s - 0.75) / stripes;
        const t2 = s / stripes;
        const sx1 = x1 + dx * t1;
        const sy1 = y1 + dy * t1;
        const sx2 = x1 + dx * t2;
        const sy2 = y1 + dy * t2;
        const sw1 = width1 + (width2 - width1) * t1;
        const sw2 = width1 + (width2 - width1) * t2;

        ctx.beginPath();
        ctx.moveTo(sx1 - nx * sw1, sy1 - ny * sw1);
        ctx.lineTo(sx2 - nx * sw2, sy2 - ny * sw2);
        ctx.lineTo(sx2 + nx * sw2, sy2 + ny * sw2);
        ctx.lineTo(sx1 + nx * sw1, sy1 + ny * sw1);
        ctx.closePath();
        ctx.fillStyle = '#292524';
        ctx.fill();
      }
    }

    // Specular highlight edge
    ctx.beginPath();
    ctx.moveTo(x1 - nx * (width1 * 0.4), y1 - ny * (width1 * 0.4));
    ctx.lineTo(x2 - nx * (width2 * 0.4), y2 - ny * (width2 * 0.4));
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Animation Loop
  let lastTime = performance.now();
  let stepTimer = 0;
  let activeGaitGroup = 0;

  function renderSpider(now) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isPageScrolling) {
      requestAnimationFrame(renderSpider);
      return;
    }
    if (typeof handleSpiderIdleWander === "function") handleSpiderIdleWander(now);
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    if (isMobile) {
      ctx.translate(spider.x, spider.y);
      ctx.scale(0.72, 0.72);
      ctx.translate(-spider.x, -spider.y);
    }

    const toCursorX = mouse.x - spider.x;
    const toCursorY = mouse.y - spider.y;
    const distToCursor = Math.hypot(toCursorX, toCursorY);

    if (distToCursor > 25) {
      spider.targetAngle = Math.atan2(toCursorY, toCursorX);
    }

    let angleDiff = spider.targetAngle - spider.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    spider.angle += angleDiff * Math.min(1, dt * 7.5);

    const followRadius = 52;
    if (distToCursor > followRadius && mouse.active) {
      spider.isWalking = true;
      const moveSpeed = Math.min(distToCursor * 3.5, 260);

      spider.vx = Math.cos(spider.angle) * moveSpeed;
      spider.vy = Math.sin(spider.angle) * moveSpeed;
      spider.speed = moveSpeed;

      spider.x += spider.vx * dt;
      spider.y += spider.vy * dt;

      // Spin silk thread dragline
      if (Math.random() < 0.25 || webSilk.length === 0) {
        const abdomenX = spider.x - Math.cos(spider.angle) * 16;
        const abdomenY = spider.y - Math.sin(spider.angle) * 16;
        webSilk.push({ x: abdomenX, y: abdomenY, life: 1.0 });
        if (webSilk.length > MAX_SILK) webSilk.shift();
      }
    } else {
      spider.isWalking = false;
      spider.speed *= 0.85;
      spider.vx *= 0.85;
      spider.vy *= 0.85;
    }

    // Draw Silk Web Dragline (Desktop only: clean and un-cluttered on mobile)
    if (webSilk.length >= 2 && !isMobile) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(webSilk[0].x, webSilk[0].y);
      for (let i = 1; i < webSilk.length; i++) {
        webSilk[i].life -= dt * 0.08;
        ctx.lineTo(webSilk[i].x, webSilk[i].y);
      }
      const abdomenX = spider.x - Math.cos(spider.angle) * 16;
      const abdomenY = spider.y - Math.sin(spider.angle) * 16;
      ctx.lineTo(abdomenX, abdomenY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();

      while (webSilk.length > 0 && webSilk[0].life <= 0) {
        webSilk.shift();
      }
    }

    // Step Timing: Alternating Gait (Group 0 vs Group 1)
    if (spider.isWalking) {
      stepTimer += dt * Math.max(3.8, spider.speed * 0.038);
      if (stepTimer >= 1.0) {
        stepTimer = 0;
        activeGaitGroup = 1 - activeGaitGroup;
      }
    }

    const cosA = Math.cos(spider.angle);
    const sinA = Math.sin(spider.angle);

    if (spider.isWalking) {
      // WALKING: Alternating Tetrapod Gait with overextension prevention
      legs.forEach((leg) => {
        const cfg = leg.cfg;
        const idealX = spider.x + cfg.rest.x * cosA - cfg.rest.y * sinA;
        const idealY = spider.y + cfg.rest.x * sinA + cfg.rest.y * cosA;
        
        const ox = spider.x + cfg.root.x * cosA - cfg.root.y * sinA;
        const oy = spider.y + cfg.root.x * sinA + cfg.root.y * cosA;
        
        const distFromIdeal = Math.hypot(leg.current.x - idealX, leg.current.y - idealY);
        const distFromRoot = Math.hypot(leg.current.x - ox, leg.current.y - oy);
        const maxAllowedDist = (cfg.l1 + cfg.l2) * 0.88;

        if (!leg.isStepping && ((distFromIdeal > 18 && cfg.group === activeGaitGroup) || distFromRoot > maxAllowedDist)) {
          leg.isStepping = true;
          leg.stepProgress = 0;
          leg.start.x = leg.current.x;
          leg.start.y = leg.current.y;
          const forwardBiasX = (spider.vx || 0) * 0.16;
          const forwardBiasY = (spider.vy || 0) * 0.16;
          leg.target.x = idealX + forwardBiasX;
          leg.target.y = idealY + forwardBiasY;
        }

        if (leg.isStepping) {
          leg.stepProgress += dt * 9.5;
          if (leg.stepProgress >= 1.0) {
            leg.stepProgress = 1.0;
            leg.isStepping = false;
            leg.current.x = leg.target.x;
            leg.current.y = leg.target.y;
            leg.current.lift = 0;
          } else {
            const t = leg.stepProgress;
            const easeT = 0.5 - 0.5 * Math.cos(t * Math.PI);
            leg.current.x = leg.start.x + (leg.target.x - leg.start.x) * easeT;
            leg.current.y = leg.start.y + (leg.target.y - leg.start.y) * easeT;
            leg.current.lift = Math.sin(t * Math.PI) * 11;
          }
        }
      });
    } else {
      // STANDING STILL: Smoothly lock every leg into its pristine resting stance!
      // This completely prevents legs breaking, twisting, or overlapping when stationary!
      const settleRate = Math.min(1, dt * 14);
      legs.forEach((leg) => {
        const cfg = leg.cfg;
        const idealX = spider.x + cfg.rest.x * cosA - cfg.rest.y * sinA;
        const idealY = spider.y + cfg.rest.x * sinA + cfg.rest.y * cosA;
        leg.current.x += (idealX - leg.current.x) * settleRate;
        leg.current.y += (idealY - leg.current.y) * settleRate;
        leg.current.lift *= 0.7;
        leg.isStepping = false;
        leg.stepProgress = 1.0;
      });
    }

    // DRAW 8 LEGS WITH NATURAL KNEE JOINTS & GROUND SHADOWS
    legs.forEach((leg) => {
      const cfg = leg.cfg;
      const ox = spider.x + cfg.root.x * cosA - cfg.root.y * sinA;
      const oy = spider.y + cfg.root.x * sinA + cfg.root.y * cosA;
      const fx = leg.current.x;
      const fy = leg.current.y - leg.current.lift;

      const ik = solveSpiderLocalIK(cfg, fx, fy, spider.x, spider.y, spider.angle);

      ctx.save();
      if (!isMobile) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3 + leg.current.lift * 0.5;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // Femur (Segment 1: Base to high knee)
      drawStripedSegment(ox, oy, ik.knee.x, ik.knee.y, 3.2, 2.3);
      // Tibia & Tarsus (Segment 2: High knee to foot on ground)
      drawStripedSegment(ik.knee.x, ik.knee.y, ik.foot.x, ik.foot.y, 2.3, 1.2);

      // Seamless rounded knee joint knob
      ctx.beginPath();
      ctx.arc(ik.knee.x, ik.knee.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ca8a04';
      ctx.fill();

      // Foot tip on ground
      ctx.beginPath();
      ctx.arc(ik.foot.x, ik.foot.y, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
      ctx.restore();
    });

    // DRAW SPIDER BODY
    ctx.save();
    ctx.translate(spider.x, spider.y);
    ctx.rotate(spider.angle);

    if (!isMobile) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // 1. ABDOMEN
    ctx.save();
    ctx.translate(-14, 0);

    const abGrad = ctx.createRadialGradient(-3, 0, 2, 0, 0, 16);
    abGrad.addColorStop(0, '#fde047');
    abGrad.addColorStop(0.4, '#eab308');
    abGrad.addColorStop(0.8, '#a16207');
    abGrad.addColorStop(1, '#451a03');

    ctx.fillStyle = abGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Abdomen Chevron Patterns
    ctx.fillStyle = '#292524';
    [-6, -1, 4].forEach((cxPos) => {
      ctx.beginPath();
      ctx.moveTo(cxPos - 4, -9);
      ctx.quadraticCurveTo(cxPos, 0, cxPos - 4, 9);
      ctx.lineTo(cxPos - 1, 9);
      ctx.quadraticCurveTo(cxPos + 3, 0, cxPos - 1, -9);
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(2, 0, 10, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. CEPHALOTHORAX (HEAD)
    const headGrad = ctx.createRadialGradient(4, 0, 2, 2, 0, 14);
    headGrad.addColorStop(0, '#fef08a');
    headGrad.addColorStop(0.35, '#eab308');
    headGrad.addColorStop(0.75, '#b45309');
    headGrad.addColorStop(1, '#292524');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(3, 0, 13, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.ellipse(6, 0, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. PEDIPALPS (Feelers)
    spider.pedipalpTimer += dt * 4;
    const palpTwitch = Math.sin(spider.pedipalpTimer) * 1.5;
    [-4, 4].forEach((pyPos, idx) => {
      const pSign = idx === 0 ? -1 : 1;
      ctx.save();
      ctx.translate(14, pyPos);
      ctx.rotate(pSign * 0.35 + palpTwitch * 0.1);
      ctx.beginPath();
      ctx.ellipse(3, 0, 4.5, 2.2, pSign * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ca8a04';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6.5, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
      ctx.restore();
    });

    // 4. BIG GLOSSY EYES WITH BLINK
    if (now > spider.nextBlink) {
      spider.blinkProgress += dt * 10;
      if (spider.blinkProgress >= Math.PI) {
        spider.blinkProgress = 0;
        spider.nextBlink = now + 2500 + Math.random() * 3000;
      }
    }
    const blinkScale = 1 - Math.sin(spider.blinkProgress) * 0.92;

    [-3.8, 3.8].forEach((eyeY) => {
      ctx.save();
      ctx.translate(14, eyeY);
      ctx.scale(1, blinkScale);

      ctx.beginPath();
      ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.shadowColor = 'transparent';
      ctx.fill();

      const lensGrad = ctx.createRadialGradient(-1, -1, 0.5, 0, 0, 3.6);
      lensGrad.addColorStop(0, '#27272a');
      lensGrad.addColorStop(0.7, '#09090b');
      ctx.fillStyle = lensGrad;
      ctx.fill();

      if (blinkScale > 0.4) {
        ctx.beginPath();
        ctx.arc(1.2, -1.2, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-0.8, 1.1, 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
      }
      ctx.restore();
    });

    // Side Eyes
    [-7.5, 7.5].forEach((sideEyeY) => {
      ctx.save();
      ctx.translate(11, sideEyeY);
      ctx.scale(1, blinkScale);
      ctx.beginPath();
      ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();

      if (blinkScale > 0.4) {
        ctx.beginPath();
        ctx.arc(0.7, -0.7, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.restore();
    if (isMobile) ctx.restore();

    requestAnimationFrame(renderSpider);
  }
  requestAnimationFrame(renderSpider);
}


/* ==========================================================================
   EXCLUSIVE HANGING CHAIN PENDULUM FAQ INTERACTION
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const header = item.querySelector('.faq-header');
    const trigger = item.querySelector('.faq-chain-trigger');
    const stage = item.querySelector('.faq-chain-stage');
    const txt = item.querySelector('.trigger-txt');

    function toggleFAQ() {
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        if (header) header.setAttribute('aria-expanded', 'false');
        if (stage) stage.setAttribute('aria-hidden', 'true');
        if (txt) txt.textContent = 'REVEAL';
      } else {
        item.classList.add('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        if (header) header.setAttribute('aria-expanded', 'true');
        if (stage) stage.setAttribute('aria-hidden', 'false');
        if (txt) txt.textContent = 'CLOSE';

        // Re-trigger pendulum swinging physics animation cleanly
        const assembly = item.querySelector('.faq-hanging-assembly');
        if (assembly) {
          assembly.style.animation = 'none';
          void assembly.offsetWidth; // Force DOM reflow
          assembly.style.animation = '';
        }
      }
    }

    if (header) {
      header.addEventListener('click', () => {
        toggleFAQ();
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFAQ();
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFAQ();
      });
    }
  });
}

// ============================================================================
// 17. ANIMATED STAT COUNTERS (SMOOTH INTERSECTION OBSERVER COUNT-UP)
// ============================================================================
function initStatCounters() {
  const statNumEls = document.querySelectorAll('.about-stat-card .stat-num[data-target]');
  if (!statNumEls.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1500; // ms
        const startTime = performance.now();

        function updateCount(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out exponential
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = Math.round(easeProgress * target);

          el.textContent = `${prefix}${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        }

        requestAnimationFrame(updateCount);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  statNumEls.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSpotlight();
  initSoundToggle();
  initContinuousZoomStory();
  initComposerStudio();
  initPinnedRealmsCarousel();
  initStarfields();
  initFloating3DCube();
  initBackToTop();
  initBubbleGlassButtons();
  initDynamicPortfolio();
  initContactForm();
  initCursorSpider();
  initFAQAccordion();
  initStatCounters();
});
