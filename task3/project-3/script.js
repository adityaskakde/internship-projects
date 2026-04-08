const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const customCursor = document.getElementById('customCursor');
const preloader = document.querySelector('.preloader');
const linkElements = document.querySelectorAll('a');

const setTheme = (theme) => {
  if (theme === 'light') {
    body.classList.add('theme-light');
    if (themeToggle) {
      themeToggle.querySelector('.toggle-icon').textContent = '☀️';
      themeToggle.querySelector('.toggle-text').textContent = 'Light Mode';
    }
  } else {
    body.classList.remove('theme-light');
    if (themeToggle) {
      themeToggle.querySelector('.toggle-icon').textContent = '🌙';
      themeToggle.querySelector('.toggle-text').textContent = 'Dark Mode';
    }
  }
  window.localStorage.setItem('preferredTheme', theme);
};

const preferredTheme = window.localStorage.getItem('preferredTheme');
if (preferredTheme) {
  setTheme(preferredTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('light');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = body.classList.contains('theme-light') ? 'dark' : 'light';
    setTheme(nextTheme);
  });
}

window.addEventListener('load', () => {
  window.requestAnimationFrame(() => {
    body.classList.add('page-enter');
  });
  if (preloader) {
    preloader.classList.add('hidden');
  }
});

linkElements.forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
  if (link.target === '_blank') return;

  link.addEventListener('click', (event) => {
    const isSameOrigin = new URL(link.href, window.location.href).origin === window.location.origin;
    if (isSameOrigin) {
      event.preventDefault();
      body.classList.add('page-exit');
      setTimeout(() => {
        window.location.href = link.href;
      }, 380);
    }
  });
});

const revealElements = document.querySelectorAll('.scroll-reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealElements.forEach((el) => revealObserver.observe(el));

if (customCursor) {
  document.addEventListener('mousemove', (event) => {
    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('mouseenter', () => customCursor.classList.add('link-hover'));
    element.addEventListener('mouseleave', () => customCursor.classList.remove('link-hover'));
  });
}

// Additional animations
const heroTitle = document.querySelector('.hero__title');
if (heroTitle) {
  const text = heroTitle.textContent;
  heroTitle.innerHTML = text.split(' ').map(word => `<span class="word">${word}</span>`).join(' ');
  const words = heroTitle.querySelectorAll('.word');
  words.forEach((word, index) => {
    word.style.animationDelay = `${index * 0.1}s`;
    word.classList.add('animate-word');
  });
}

const cards = document.querySelectorAll('.glass-card');
cards.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
  card.classList.add('animate-card');
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-card, .animate-word').forEach(el => animateOnScroll.observe(el));

// Parallax effect on hero
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const rate = scrolled * -0.5;
  const heroDecor = document.querySelector('.hero__decor');
  if (heroDecor) {
    heroDecor.style.transform = `translateY(${rate}px)`;
  }
});

// Typing effect for hero text
const heroText = document.querySelector('.hero__text');
if (heroText) {
  const originalText = heroText.textContent;
  heroText.textContent = '';
  let i = 0;
  const typeWriter = () => {
    if (i < originalText.length) {
      heroText.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    }
  };
  setTimeout(typeWriter, 2000); // Start after hero animations
}

// Particle effect
const createParticle = () => {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + 'vw';
  particle.style.animationDuration = Math.random() * 3 + 2 + 's';
  particle.style.opacity = Math.random();
  document.body.appendChild(particle);
  setTimeout(() => {
    particle.remove();
  }, 5000);
};

setInterval(createParticle, 200);