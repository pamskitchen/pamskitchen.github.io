/* ═══════════════════════════════════════════════════
   PAMSKITCHEN — CINEMATIC ENGINE
   GSAP + ScrollTrigger animations
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);

  /* ───────────────────────────────────────
     1. CURTAIN REVEAL
     ─────────────────────────────────────── */
  var curtainSection = document.querySelector('.hero-curtain');
  if (curtainSection) {
    // Split the curtain panels
    gsap.to('#cLeft', {
      xPercent: -100,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: curtainSection,
        start: 'top top',
        end: '55% top',
        scrub: 0.5
      }
    });
    gsap.to('#cRight', {
      xPercent: 100,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: curtainSection,
        start: 'top top',
        end: '55% top',
        scrub: 0.5
      }
    });
    // Fade in the scroll cue after curtains open
    gsap.to('#scrollCue', {
      opacity: 1,
      scrollTrigger: {
        trigger: curtainSection,
        start: '50% top',
        end: '65% top',
        scrub: true
      }
    });
    // Ken Burns on hero image
    gsap.fromTo('.hero-behind img', {
      scale: 1.05
    }, {
      scale: 1.18,
      ease: 'none',
      scrollTrigger: {
        trigger: curtainSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  }

  /* ───────────────────────────────────────
     2. KINETIC MARQUEE
     ─────────────────────────────────────── */
  var scrollVelocity = 0;
  ScrollTrigger.create({
    onUpdate: function (self) {
      scrollVelocity = Math.abs(self.getVelocity());
    }
  });

  document.querySelectorAll('.marquee-row').forEach(function (row) {
    var content = row.querySelector('.marquee-content');
    if (!content) return;
    // Clone for seamless loop
    var clone1 = content.cloneNode(true);
    var clone2 = content.cloneNode(true);
    var clone3 = content.cloneNode(true);
    row.appendChild(clone1);
    row.appendChild(clone2);
    row.appendChild(clone3);

    var direction = row.dataset.direction === 'right' ? 1 : -1;
    var speedMult = parseFloat(row.dataset.speed) || 1;
    var baseSpeed = 60;
    var contentWidth = content.offsetWidth;
    var x = direction === -1 ? 0 : -contentWidth;

    // Use simple per-frame movement (more reliable than delta-time)
    (function loop() {
      var speed = (baseSpeed + scrollVelocity * 0.12) * speedMult;
      x += direction * speed / 60;
      // Wrap seamlessly
      if (direction === -1 && x <= -contentWidth) x += contentWidth;
      if (direction === 1 && x >= 0) x -= contentWidth;
      row.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(loop);
    })();
  });

  /* ───────────────────────────────────────
     3. ACCORDION — click to lock on mobile
     ─────────────────────────────────────── */
  document.querySelectorAll('.accordion-panel').forEach(function (panel) {
    panel.addEventListener('click', function () {
      var siblings = panel.parentElement.children;
      for (var i = 0; i < siblings.length; i++) siblings[i].classList.remove('active');
      panel.classList.add('active');
    });
  });

  /* ───────────────────────────────────────
     4. HORIZONTAL SCROLL GALLERY
     ─────────────────────────────────────── */
  var hTrack = document.getElementById('hTrack');
  var hSection = document.getElementById('hSection');
  var hProgress = document.getElementById('hProgress');
  var hFill = document.getElementById('hFill');
  var hLabel = document.getElementById('hLabel');

  if (hTrack && hSection) {
    var hCards = hTrack.querySelectorAll('.hscroll-card');
    var totalCards = hCards.length;

    function getScrollDist() {
      return hTrack.scrollWidth - window.innerWidth;
    }

    gsap.to(hTrack, {
      x: function () { return -getScrollDist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: hSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          if (hFill) hFill.style.width = (p * 100) + '%';
          if (hLabel) hLabel.textContent = Math.min(Math.ceil(p * totalCards + 0.5), totalCards) + ' / ' + totalCards;
        },
        onEnter: function () { if (hProgress) hProgress.classList.add('visible'); },
        onLeave: function () { if (hProgress) hProgress.classList.remove('visible'); },
        onEnterBack: function () { if (hProgress) hProgress.classList.add('visible'); },
        onLeaveBack: function () { if (hProgress) hProgress.classList.remove('visible'); }
      }
    });
  }

  /* ───────────────────────────────────────
     5. TEXT MASK REVEAL
     ─────────────────────────────────────── */
  var maskSection = document.querySelector('.mask-section');
  if (maskSection) {
    gsap.to('.mask-reveal', {
      clipPath: 'inset(0% 0 0 0)',
      ease: 'none',
      scrollTrigger: {
        trigger: maskSection,
        start: 'top top',
        end: '60% bottom',
        scrub: 0.3
      }
    });
    gsap.to('.mask-subtext', {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: maskSection,
        start: '55% top',
        end: '70% top',
        scrub: true
      }
    });
  }

  /* ───────────────────────────────────────
     6. TEXT SCRAMBLE — CONTACT
     ─────────────────────────────────────── */
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789✦·—';

  function scrambleText(el, finalText, duration) {
    duration = duration || 1500;
    var len = finalText.length;
    var startTime = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var html = '';
      for (var i = 0; i < len; i++) {
        if (finalText[i] === ' ') {
          html += ' ';
          continue;
        }
        var charThreshold = (i / len) * 0.7 + 0.15;
        if (progress >= charThreshold) {
          html += '<span class="char resolved">' + finalText[i] + '</span>';
        } else {
          html += '<span class="char scrambling">' + chars[Math.floor(Math.random() * chars.length)] + '</span>';
        }
      }
      el.innerHTML = html;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  document.querySelectorAll('[data-scramble]').forEach(function (el) {
    var text = el.dataset.scramble;
    // Show scrambled placeholder
    el.innerHTML = text.split('').map(function (c) {
      return c === ' ' ? ' ' : '<span class="char scrambling">' + chars[Math.floor(Math.random() * chars.length)] + '</span>';
    }).join('');

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        scrambleText(el, text, 1400);
      }
    });
  });

  /* ───────────────────────────────────────
     7. FADE-UP ANIMATIONS
     ─────────────────────────────────────── */
  var fadeEls = document.querySelectorAll('.eyebrow, .section-h2, .accordion-head, .contact-sub, .contact-form, .contact-cols');
  fadeEls.forEach(function (el) {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  /* ───────────────────────────────────────
     8. COLOR SHIFT — Background mood per section
     ─────────────────────────────────────── */
  var colorSections = [
    { sel: '.hero-curtain', bg: '#0a0705' },
    { sel: '.accordion-section', bg: '#12100a' },
    { sel: '.hscroll-section', bg: '#0d0a08' },
    { sel: '.mask-section', bg: '#0a0705' },
    { sel: '.contact-section', bg: '#14100c' }
  ];
  colorSections.forEach(function (s) {
    var el = document.querySelector(s.sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: function () { document.body.style.background = s.bg; },
      onEnterBack: function () { document.body.style.background = s.bg; }
    });
  });

  // ── Refresh ScrollTrigger after full page load ──
  // Multiple refreshes to catch fonts, images, and layout settling
  function scheduleRefresh() {
    ScrollTrigger.refresh();
  }
  window.addEventListener('load', function () {
    setTimeout(scheduleRefresh, 100);
    setTimeout(scheduleRefresh, 500);
    setTimeout(scheduleRefresh, 1200);
    setTimeout(scheduleRefresh, 2500);
  });

  // Refresh when fonts finish loading
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      setTimeout(scheduleRefresh, 100);
    });
  }

  // Also refresh on resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scheduleRefresh, 250);
  });

})();
