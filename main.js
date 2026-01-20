/**
 * Ремонт-Профи - Main JavaScript
 * Mobile-first, calculator with WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initAnimations();
    initCounters();
    initCalculator();
});

/**
 * Mobile Menu
 */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('navList');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('active')) {
            btn.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/**
 * Smooth Scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('header')?.offsetHeight || 80;
                const top = target.offsetTop - headerHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/**
 * Scroll Animations
 */
function initAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/**
 * Counter Animation
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
        current += step;
        if (current < target) {
            el.textContent = Math.floor(current);
            requestAnimationFrame(update);
        } else {
            el.textContent = target + (target >= 100 ? '+' : '');
        }
    };

    requestAnimationFrame(update);
}

/**
 * Calculator
 */
function initCalculator() {
    const calculator = document.querySelector('.calculator-card');
    if (!calculator) return;

    const areaInput = document.getElementById('areaInput');
    const areaRange = document.getElementById('areaRange');
    const totalPrice = document.getElementById('totalPrice');
    const whatsappBtn = document.getElementById('sendToWhatsApp');

    // Sync area inputs
    if (areaInput && areaRange) {
        areaInput.addEventListener('input', () => {
            let value = parseInt(areaInput.value) || 10;
            value = Math.max(10, Math.min(500, value));
            areaRange.value = Math.min(value, 200);
            updatePrice();
        });

        areaRange.addEventListener('input', () => {
            areaInput.value = areaRange.value;
            updatePrice();
        });
    }

    // Listen to radio and checkbox changes
    calculator.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', updatePrice);
    });

    // Select first option by default
    const firstOption = calculator.querySelector('input[name="repairType"]');
    if (firstOption) {
        firstOption.checked = true;
    }

    // Calculate price
    function updatePrice() {
        const repairType = calculator.querySelector('input[name="repairType"]:checked');
        const area = parseInt(areaInput?.value) || 50;

        // Base price per m²
        const pricePerM2 = repairType ? parseInt(repairType.dataset.price) : 4000;

        // Extras
        let extras = 0;
        calculator.querySelectorAll('input[name="extras"]:checked').forEach(checkbox => {
            extras += parseInt(checkbox.dataset.price) || 0;
        });

        // Total
        const total = (pricePerM2 * area) + extras;

        // Animate price change
        if (totalPrice) {
            totalPrice.style.transform = 'scale(1.1)';
            totalPrice.textContent = formatPrice(total);
            setTimeout(() => {
                totalPrice.style.transform = 'scale(1)';
            }, 150);
        }

        // Update WhatsApp link
        if (whatsappBtn) {
            const repairLabel = repairType?.dataset.label || 'Не выбран';
            const extrasLabels = [];
            calculator.querySelectorAll('input[name="extras"]:checked').forEach(cb => {
                const title = cb.closest('.calc-extra')?.querySelector('.extra-title')?.textContent;
                if (title) extrasLabels.push(title);
            });

            const message = encodeURIComponent(
                `Здравствуйте! Хочу узнать стоимость ремонта.\n\n` +
                `Тип ремонта: ${repairLabel}\n` +
                `Площадь: ${area} м²\n` +
                `Доп. работы: ${extrasLabels.length ? extrasLabels.join(', ') : 'Нет'}\n` +
                `Примерная стоимость: ${formatPrice(total)}`
            );

            whatsappBtn.href = `https://wa.me/996500245780?text=${message}`;
        }
    }

    // Initial calculation
    updatePrice();
}

/**
 * Format price with spaces
 */
function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' сом';
}

/**
 * Haptic feedback for mobile (if supported)
 */
function haptic() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Add haptic to buttons on mobile
document.querySelectorAll('.btn, .option-card, .extra-card').forEach(el => {
    el.addEventListener('touchstart', haptic, { passive: true });
});
