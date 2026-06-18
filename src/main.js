import './styles/index.css';
import { App } from './App.js';

const appEl = document.getElementById('app');
if (appEl) {
  appEl.innerHTML = App();
}

// Intersection Observer for scroll-triggered animations
const observeElements = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.feature-card, .value-item').forEach((el) => {
    el.style.opacity = '0';
    observer.observe(el);
  });
};

// Run after DOM is painted
requestAnimationFrame(() => {
  requestAnimationFrame(observeElements);
});
