export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-emerald-700 py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Community Governance Model</h1>
        <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
          Front Line Whānau is guided by the voices of those who have lived the neonatal journey.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 prose prose-emerald prose-lg">
        <h2>Our Approach to Governance</h2>
        <p>
          To ensure the platform remains culturally safe, equitable, and genuinely useful, we operate a community-led governance model. This means major decisions regarding data sovereignty, feature development, and moderation policies are made in consultation with our Governance Board.
        </p>

        <h3>The Governance Board</h3>
        <p>
          Our board consists of:
        </p>
        <ul>
          <li><strong>Whānau Representatives:</strong> Parents who have navigated the NICU/SCBU journey across different regions in Aotearoa.</li>
          <li><strong>Clinical Advisors:</strong> Neonatologists and NICU nurses providing medical oversight.</li>
          <li><strong>Māori & Pasifika Cultural Advisors:</strong> Ensuring our platform upholds Te Tiriti o Waitangi and respects Pacific data sovereignty.</li>
          <li><strong>Privacy & Security Experts:</strong> Safeguarding the Taonga Vault encryption models.</li>
        </ul>

        <h3>Te Tiriti o Waitangi</h3>
        <p>
          We are committed to the principles of Te Tiriti o Waitangi. All data collected about Māori is treated as taonga (a treasure) and is subject to Māori data sovereignty principles.
        </p>
      </div>
    </div>
  );
}
