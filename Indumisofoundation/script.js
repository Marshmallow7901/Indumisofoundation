const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function debounce(func, wait = 10) {
    let timeout;
    return function debounced(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('header');
    if (!mobileMenuBtn || !navLinks) return;

    function closeMenu() {
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }

    function openMenu() {
        // Sync dropdown top with actual header height
        if (header) {
            navLinks.style.top = header.offsetHeight + 'px';
        }
        navLinks.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
    }

    mobileMenuBtn.setAttribute('aria-controls', 'navLinks');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.contains('active') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    // Close when clicking outside the nav
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileMenuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
            mobileMenuBtn.focus();
        }
    });

    // Re-sync top on resize
    window.addEventListener('resize', debounce(() => {
        if (header && navLinks.classList.contains('active')) {
            navLinks.style.top = header.offsetHeight + 'px';
        }
        // Close menu if resized to desktop
        if (window.innerWidth > 768) {
            closeMenu();
            navLinks.style.top = '';
        }
    }, 100));
}

function initHeaderState() {
    const header = document.querySelector('header');
    if (!header) return;

    const toggleHeaderState = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    toggleHeaderState();
    window.addEventListener('scroll', debounce(toggleHeaderState, 5), { passive: true });
}

function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerOffset = 90;
            const offset = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        });
    });
}

function animateCounter(id, start, end, duration) {
    const el = document.getElementById(id);
    if (!el) return;

    let startTime = null;
    const suffix = id === 'livesCounter' ? '+' : '';

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const value = Math.floor(eased * (end - start) + start);
        el.textContent = `${value.toLocaleString()}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function initCounters() {
    const impactSection = document.querySelector('.impact-counter');
    if (!impactSection) return;

    const observer = new IntersectionObserver((entries, ob) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            animateCounter('livesCounter', 0, 24500, 2200);
            animateCounter('projectsCounter', 0, 312, 2200);
            animateCounter('itGraduatesCounter', 0, 3200, 2200);
            animateCounter('volunteersCounter', 0, 648, 2200);
            ob.unobserve(entry.target);
        });
    }, { threshold: 0.35 });

    observer.observe(impactSection);
}

function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground || prefersReducedMotion) return;

    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight * 1.2) {
            heroBackground.style.transform = `translate3d(0, ${scrolled * 0.35}px, 0)`;
        }
    };

    window.addEventListener('scroll', debounce(updateParallax, 8), { passive: true });
    updateParallax();
}

function initRipples() {
    document.querySelectorAll('.cta-button').forEach((button) => {
        button.addEventListener('click', (event) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.className = 'ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initCardTilt() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.program-card, .pillar-card, .counter-item');
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -5;
            const rotateY = ((x / rect.width) - 0.5) * 7;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function initMagneticButtons() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.cta-button').forEach((button) => {
        button.addEventListener('mousemove', (event) => {
            const rect = button.getBoundingClientRect();
            const dx = event.clientX - (rect.left + rect.width / 2);
            const dy = event.clientY - (rect.top + rect.height / 2);
            button.style.transform = `translate(${dx * 0.08}px, ${dy * 0.12}px)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

function initFallbackReveal() {
    const revealItems = document.querySelectorAll('.counter-item, .pillar-card, .program-card, .highlight-item, .it-image, .mission-statement');
    revealItems.forEach((item) => item.classList.add('reveal-item'));

    if (prefersReducedMotion) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, ob) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            ob.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => observer.observe(item));
}

async function initFramerStyleMotion() {
    if (prefersReducedMotion) return;

    try {
        const motion = await import('https://cdn.jsdelivr.net/npm/motion@11.13.1/+esm');
        const { animate, inView, stagger } = motion;

        animate('.hero h1', { opacity: [0, 1], y: [40, 0] }, { duration: 0.8, easing: 'ease-out' });
        animate('.hero p', { opacity: [0, 1], y: [24, 0] }, { duration: 0.8, delay: 0.15, easing: 'ease-out' });
        animate('.hero .cta-button', { opacity: [0, 1], y: [20, 0], scale: [0.96, 1] }, { duration: 0.6, delay: 0.25 });

        inView('.counter-grid, .pillars-grid, .programs-grid, .it-highlights', (element) => {
            animate(
                element.querySelectorAll('.counter-item, .pillar-card, .program-card, .highlight-item'),
                { opacity: [0, 1], y: [36, 0], scale: [0.98, 1] },
                { duration: 0.55, delay: stagger(0.08), easing: 'ease-out' }
            );
        });

        inView('.it-content', (element) => {
            animate(
                element.querySelectorAll('.it-text, .it-image'),
                { opacity: [0, 1], x: [-20, 0] },
                { duration: 0.65, delay: stagger(0.08), easing: 'ease-out' }
            );
        });
    } catch (error) {
        console.warn('Motion library unavailable, using CSS/IntersectionObserver fallback.', error);
    }
}

function initPage() {
    initMobileMenu();
    initHeaderState();
    initSmoothAnchors();
    initCounters();
    initParallax();
    initRipples();
    initCardTilt();
    initMagneticButtons();
    initFallbackReveal();
    initFramerStyleMotion();
}

document.addEventListener('DOMContentLoaded', initPage);