document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('nav-open');
    }
}

/* NEWS CAROUSEL AUTO-ROTATE */
const newsCarousel = document.querySelector('.news-carousel');
let currentNewsIndex = 0;
const newsCards = document.querySelectorAll('.news-card');
const newsCardWidth = newsCards[0]?.offsetWidth || 400;
const newsGap = 24;

// Auto-rotate ogni 5 secondi
setInterval(() => {
    nextNews();
}, 5000);

function nextNews() {
    if (!newsCarousel) return;
    currentNewsIndex = (currentNewsIndex + 1) % newsCards.length;
    scrollToNews(currentNewsIndex);
}

function prevNews() {
    if (!newsCarousel) return;
    currentNewsIndex = (currentNewsIndex - 1 + newsCards.length) % newsCards.length;
    scrollToNews(currentNewsIndex);
}

function scrollToNews(index) {
    if (!newsCarousel) return;
    const scrollPosition = index * (newsCardWidth + newsGap);
    newsCarousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
}


