import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { Features } from './components/Features.js';
import { Values } from './components/Values.js';
import { Footer } from './components/Footer.js';

export function App() {
  return `
    ${Header()}
    <main>
      ${Hero()}
      ${Features()}
      ${Values()}
    </main>
    ${Footer()}
  `;
}
