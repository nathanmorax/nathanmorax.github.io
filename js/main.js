/* ============================================
   Nathan Mora — portafolio interactivo
   Lógica principal: cursor, galería, modal FLIP
   ============================================ */

(function () {
  'use strict';

  // ---- referencias al DOM ----
  const cursor      = document.querySelector('.custom-cursor');
  const scrollEl    = document.getElementById('scrollContainer');
  const backdrop    = document.getElementById('modalBackdrop');
  const closeBtn    = document.getElementById('modalClose');
  const projectName = document.getElementById('projectName');

  // ---- estado ----
  let isAnimating = false;
  let isModalOpen = false;
  const DURATION  = 700; // ms, debe coincidir con CSS transition

  // ---- cursor ----
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.top  = e.clientY + 'px';
      cursor.style.left = e.clientX + 'px';
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, .project-slide, .modal-close, button')) {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.4)';
      } else {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });

    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }

  // ---- datos ----
  const projects = [
    {
      title: 'App 1',
      image: 'images/App3.png',
      category: 'Interface Design',
      client: 'Cliente 1',
      year: '2024',
      team: ['Nathan Mora']
    },
    {
      title: 'App 2',
      image: 'images/App2.png',
      category: 'Interface Design',
      client: 'Cliente 2',
      year: '2024',
      team: ['Nathan Mora']
    },
    {
      title: 'App 3',
      image: 'images/App3.png',
      category: 'Interface Design',
      client: 'Cliente 3',
      year: '2024',
      team: ['Nathan Mora']
    },
    {
      title: 'App 4',
      image: 'images/App2.png',
      category: 'Interface Design',
      client: 'Cliente 4',
      year: '2024',
      team: ['Nathan Mora']
    },
    {
      title: 'App 5',
      image: 'images/App2.png',
      category: 'Interface Design',
      client: 'Cliente 5',
      year: '2024',
      team: ['Nathan Mora']
    },
    {
      title: 'App 6',
      image: 'images/App3.png',
      category: 'Interface Design',
      client: 'Cliente 6',
      year: '2024',
      team: ['Nathan Mora']
    }
  ];

  // ---- render galería ----
  projects.forEach(function (p, i) {
    const slide = document.createElement('div');
    slide.className = 'project-slide';
    slide.setAttribute('data-index', i);
    slide.setAttribute('role', 'button');
    slide.setAttribute('tabindex', '0');
    slide.setAttribute('aria-label', 'Abrir ' + p.title);

    slide.innerHTML =
      '<div class="project-slide-info">' +
        '<h2>' + p.title + '</h2>' +
        '<div class="meta">' + p.category + '<br>' + p.client + '</div>' +
        '<div class="year">' + p.year + '</div>' +
        '<div class="credits">' + p.team.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>' +
      '</div>' +
      '<img src="' + p.image + '" class="project-slide-image" alt="' + p.title + '" loading="lazy">';

    slide.addEventListener('click', function () {
      if (!isModalOpen && !isAnimating) openModal(i, slide);
    });

    // también se puede abrir con teclado (Enter / Espacio)
    slide.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isModalOpen && !isAnimating) openModal(i, slide);
      }
    });

    scrollEl.appendChild(slide);
  });

  // ---- helpers FLIP ----
  function snapshotSlides() {
    const slides = scrollEl.querySelectorAll('.project-slide');
    const buffer = [];
    slides.forEach(function (s) {
      const img = s.querySelector('.project-slide-image');
      if (img) {
        buffer.push({
          slide: s,
          img: img,
          rect: img.getBoundingClientRect()
        });
      }
    });
    return buffer;
  }

  function playFlip(snapshots) {
    // aplica transform de contorno para simular la posición previa
    snapshots.forEach(function (s) {
      const newRect = s.img.getBoundingClientRect();
      const dx = s.rect.left - newRect.left;
      const dy = s.rect.top - newRect.top;
      const sx = s.rect.width / newRect.width;
      const sy = s.rect.height / newRect.height;

      s.img.style.transition = 'none';
      s.img.style.transformOrigin = 'top left';
      s.img.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    });

    // forzar reflow limpio con rAF (no con offsetHeight a secas)
    requestAnimationFrame(function () {
      snapshots.forEach(function (s) {
        s.img.style.transition = '';
        s.img.style.transform = '';
      });
    });

    // limpiar props after transition completes (dejamos un margen)
    setTimeout(function () {
      snapshots.forEach(function (s) {
        s.img.style.transition = '';
        s.img.style.transform = '';
        s.img.style.transformOrigin = '';
      });
    }, DURATION + 80);
  }

  // ---- abrir modal ----
  function openModal(index, element) {
    if (isAnimating || isModalOpen) return;
    isAnimating = true;

    const snapshots = snapshotSlides();

    document.body.classList.add('modal-open');
    scrollEl.classList.add('is-modal');
    backdrop.classList.add('active');
    closeBtn.classList.add('visible');

    // centrar el slide elegido
    if (element) {
      const targetScroll = element.offsetLeft;
      scrollEl.scrollLeft = targetScroll;
    }

    playFlip(snapshots);

    setTimeout(function () {
      isAnimating = false;
      isModalOpen = true;
    }, DURATION);
  }

  // ---- cerrar modal ----
  function closeModal() {
    if (!isModalOpen || isAnimating) return;
    isAnimating = true;

    const visibleSlide = getVisibleSlide();
    const snapshots    = snapshotSlides();

    scrollEl.classList.remove('is-modal');
    document.body.classList.remove('modal-open');
    backdrop.classList.remove('active');
    closeBtn.classList.remove('visible');

    if (visibleSlide) {
      const centerScreen = window.innerWidth / 2;
      const slideCenter  = visibleSlide.offsetLeft + visibleSlide.offsetWidth / 2;
      scrollEl.scrollLeft = slideCenter - centerScreen;
    }

    playFlip(snapshots);

    setTimeout(function () {
      isAnimating = false;
      isModalOpen = false;
    }, DURATION);
  }

  // ---- slide visible en el centro ----
  function getVisibleSlide() {
    const slides = scrollEl.querySelectorAll('.project-slide');
    if (!slides.length) return null;

    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;

    // edge: último slide (dentro de 2px del extremo)
    if (maxScroll > 0 && scrollEl.scrollLeft >= maxScroll - 2) {
      return slides[slides.length - 1];
    }
    // edge: primer slide
    if (scrollEl.scrollLeft <= 2) {
      return slides[0];
    }

    const center = window.innerWidth / 2;
    let closest  = null;
    let closestDist = Infinity;
    slides.forEach(function (s) {
      const r = s.getBoundingClientRect();
      const mid = (r.left + r.right) / 2;
      const d   = Math.abs(mid - center);
      if (d < closestDist) {
        closestDist = d;
        closest     = s;
      }
    });
    return closest;
  }

  // ---- nombre del proyecto en header ----
  function updateProjectName() {
    if (isModalOpen) {
      projectName.classList.remove('visible');
      return;
    }
    const visible = getVisibleSlide();
    if (!visible) {
      projectName.classList.remove('visible');
      return;
    }
    const idx = parseInt(visible.getAttribute('data-index'), 10);
    const p   = projects[idx];
    if (!p) {
      projectName.classList.remove('visible');
      return;
    }
    projectName.textContent = p.title;
    projectName.classList.add('visible');
  }

  // scroll throttling con rAF
  let ticking = false;
  scrollEl.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProjectName();
        ticking = false;
      });
      ticking = true;
    }
  });

  // inicial
  updateProjectName();

  // ---- eventos globales ----
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isModalOpen) closeModal();
  });

  // click en backdrop → cerrar
  backdrop.addEventListener('click', function () {
    if (isModalOpen && !isAnimating) closeModal();
  });

  // click en botón de cerrar → cerrar
  closeBtn.addEventListener('click', function () {
    if (isModalOpen && !isAnimating) closeModal();
  });

  // click en el container (fuera del slide) → cerrar
  scrollEl.addEventListener('click', function (e) {
    if (isModalOpen && !isAnimating && !e.target.closest('.project-slide')) {
      closeModal();
    }
  });

  // redimensionado: asegura que el modal no quede cortado
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (isModalOpen) {
        const visible = getVisibleSlide();
        if (visible) {
          scrollEl.scrollLeft = visible.offsetLeft;
        }
      }
    }, 100);
  });

  // ---- links del header (smooth scroll a #about) ----
  document.querySelectorAll('.nav__link[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = link.getAttribute('href');
      if (target && target.length > 1) {
        const el = document.querySelector(target);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ---- fallback si una imagen no carga ----
  document.addEventListener('error', function (e) {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.classList.contains('project-slide-image')) {
      img.style.display = 'none';
      // opcional: mostrar un placeholder en el slide
      const slide = img.closest('.project-slide');
      if (slide) {
        const placeholder = document.createElement('div');
        placeholder.className = 'project-slide-image-fallback';
        placeholder.style.cssText =
          'width:62vh;height:62vh;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;';
        placeholder.textContent = 'Sin imagen';
        slide.appendChild(placeholder);
      }
    }
  }, true);

})();
