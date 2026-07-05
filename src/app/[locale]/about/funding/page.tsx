export default function FundingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-accent-success py-10 sm:py-16 px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Sustainable Funding & Operations</h1>
        <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
          How we sustain the platform to provide free, equitable support for all whanau across Aotearoa.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 prose prose-invert prose-lg">
        <h2>Our Funding Model</h2>
        <p>
          Front Line Whānau operates as a not-for-profit initiative. Our primary goal is to remove barriers to access, meaning the platform will <strong>always remain free for parents and whānau</strong>. To achieve this, we rely on a diversified, sustainable funding and operations model.
        </p>

        <h3>Philanthropic Partnerships</h3>
        <p>
          We partner with philanthropic organizations, trusts, and community foundations that share our vision of improving neonatal health outcomes in New Zealand. These grants fund our core development, security infrastructure, and community outreach.
        </p>

        <h3>Health System Integration (B2B)</h3>
        <p>
          While the platform is free for users, we offer premium integration services and advanced population-health analytics (strictly anonymized) to District Health Boards (Health NZ) and clinical research institutions. This model subsidizes the cost of maintaining the high-security Taonga Vault and AI agent infrastructure.
        </p>

        <h3>Community Support</h3>
        <p>
          We are deeply grateful for community donations and volunteer contributions. From lived-experience parents sharing their stories, to developers contributing to our open-source tools, community support is the lifeblood of our operations.
        </p>

        <h2>Operational Sustainability</h2>
        <p>
          By utilizing modern, serverless architecture and open-source models, we keep our operational overhead extremely low. This ensures that every dollar funded goes directly into improving the user experience and expanding access to vital resources for preterm whānau.
        </p>
      </div>
    </div>
  );
}
