export default function GovernancePage() {
  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-accent-success px-4 py-10 text-center sm:px-6 sm:py-16">
        <h1 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-4xl">
          Community Governance Model
        </h1>
        <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
          Front Line Whānau is guided by the voices of those who have lived the neonatal journey.
        </p>
      </div>

      <div className="prose prose-invert prose-lg mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <h2>Our Approach to Governance</h2>
        <p>
          To ensure the platform remains culturally safe, equitable, and genuinely useful, we
          operate a community-led governance model. This means major decisions regarding data
          sovereignty, feature development, and moderation policies are made in consultation with
          our Governance Board.
        </p>

        <h3>The Governance Board</h3>
        <p>Our board consists of:</p>
        <ul>
          <li>
            <strong>Whanau Representatives:</strong> Parents who have navigated the NICU/SCBU
            journey across different regions in Aotearoa.
          </li>
          <li>
            <strong>Clinical Advisors:</strong> Neonatologists and NICU nurses providing medical
            oversight.
          </li>
          <li>
            <strong>Maori & Pasifika Cultural Advisors:</strong> Ensuring our platform upholds Te
            Tiriti o Waitangi and respects Pacific data sovereignty.
          </li>
          <li>
            <strong>Privacy & Security Experts:</strong> Safeguarding the Taonga Vault encryption
            models.
          </li>
        </ul>

        <h3>Te Tiriti o Waitangi</h3>
        <p>
          We are committed to the principles of Te Tiriti o Waitangi. All data collected about Maori
          is treated as taonga (a treasure) and is subject to Maori data sovereignty principles.
        </p>
      </div>
    </div>
  );
}
