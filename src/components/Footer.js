export function Footer() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer" id="site-footer">
      <div class="container">
        <p class="footer-whakatauaki">
          "He aha te mea nui o te ao? He tāngata, he tāngata, he tāngata."
        </p>
        <p class="footer-translation">
          What is the most important thing in the world? It is people, it is people, it is people.
        </p>

        <ul class="footer-links">
          <li><a href="https://www.temanararaunga.maori.nz/" target="_blank" rel="noopener noreferrer" id="footer-link-tmr">Te Mana Raraunga</a></li>
          <li><a href="https://github.com/fivepanelhat/Front_Line_Whanau" target="_blank" rel="noopener noreferrer" id="footer-link-github">GitHub</a></li>
          <li><a href="#features" id="footer-link-features">Features</a></li>
          <li><a href="#values" id="footer-link-values">Values</a></li>
        </ul>

        <p class="footer-copy">
          &copy; ${year} Front Line Whānau. MIT Licence. Built with aroha in Aotearoa.
        </p>
      </div>
    </footer>
  `;
}
