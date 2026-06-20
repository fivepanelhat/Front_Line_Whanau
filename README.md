# Front_Line_Whanau

**Front Line Families Support Hub NZ**  
A sovereign, privacy-first digital platform supporting families of preterm twins in Aotearoa New Zealand.

Built with **rangatiratanga**, cultural safety, and legal compliance at its core.

---

## Why This Project Exists

Families of preterm twins face overwhelming challenges — fragmented information, complex application processes for financial support, housing stress, and significant emotional and mental health impacts. Many families miss out on entitled support during one of the most difficult periods of their lives.

This platform exists to reduce that burden by providing clear, personalised, and culturally safe support **before, during, and after** the neonatal journey.

---

## The 5 W's – Problems We Are Solving

### Why (The Problem)
- Fragmented and hard-to-access support information
- Complex WINZ and IRD application processes
- High stress and trauma during NICU stays
- Limited culturally safe and coordinated support

### What (The Solution)
A sovereign, privacy-first digital platform offering:
- Personalised support pathways
- Intelligent form pre-filling
- Secure document storage (Taonga Vault)
- Independent Client-Side Documentor
- Services directory with real-world contacts

### Who
**Primary**: Front Line Families of preterm twins and extended whānau  
**Secondary**: Neonatal teams, social workers, midwives, and support organisations

### Where (Real-World Application Examples)
- Applying for Preterm Baby Payment while baby is in NICU
- Managing housing repairs or tenancy issues after discharge
- Coordinating Home Help and financial support
- Accessing mental health resources (PlunketLine, 1737)
- Enabling extended whānau to assist with documentation

### How
- Sovereign Edge AI + client-side first architecture
- Multi-agent system (Aether Summit + 3 specialist agents)
- Strong alignment with Te Tiriti o Waitangi and Te Mana Raraunga principles
- Clear informed consent and legal compliance

---

## Values & Governance

The **Front Line Families Support Hub NZ** is founded on a commitment to **rangatiratanga**, cultural safety, legal compliance, and balanced protection for both families and practitioners.

### Core Values

- **Rangatiratanga & Whānau Sovereignty** — Front Line Families retain authority and final decision-making over their data, care pathways, and consent.
- **Kaitiakitanga** — Responsible guardianship of sensitive information as taonga.
- **Equity & Active Protection** — Working to reduce disparities and proactively protect vulnerable whānau.
- **Inclusivity & Non-Discrimination** — This platform is for **all families**, regardless of ethnicity, culture, religion, family structure, sexual orientation, gender identity, or socioeconomic background. Discrimination of any kind is not tolerated.
- **Extended Whānau & Diverse Family Structures** — We recognise and support the important role of extended whānau, grandparents, siblings, and chosen family in the care and wellbeing of preterm babies.
- **Respect for All Cultures** — While grounded in Te Tiriti o Waitangi and Māori Data Sovereignty, the platform respects and accommodates diverse cultural, spiritual, and religious beliefs and practices.

### Regulatory Compliance

This platform is designed to operate in full compliance with New Zealand law, including:

- **Privacy Act 2020** and the **Health Information Privacy Code 2020 (HIPC)**
- **Oranga Tamariki Act 1989**
- **Care of Children Act 2004**
- **Health Practitioners Competence Assurance Act 2003**
- **Health and Safety at Work Act 2015**
- **Residential Tenancies Act 1986**

### Māori Data Sovereignty & Te Tiriti o Waitangi

We align with **Te Mana Raraunga – The Māori Data Sovereignty Network** and the principles of **Te Tiriti o Waitangi**, including **Tino Rangatiratanga**, **Kaitiakitanga**, and **Equity**.

**Reference**: [Te Mana Raraunga Māori Data Sovereignty Network](https://www.temanararaunga.maori.nz/)

### Sovereign AI & Privacy-First Design

- Client-side and Edge-first architecture by default
- Strong encryption with user-controlled keys
- Minimal data extraction — families control what leaves their device
- Transparent consent flows for any server-side processing

### Informed Consent & Protection of Front Line Families

- **Informed Consent is Final** — No action involving personal or health data occurs without explicit, informed consent.
- **Right to Information & Revocation** — Families can access, export, or request deletion of their data.
- **Independent Client-Side Documentor** — A secure private space for recording decisions and interactions.
- **Protection of Vulnerable Whānau** — Special care is taken during high-stress periods (e.g. NICU stays).

### Rights, Safety & Protection of Practitioners

We recognise that practitioners (neonatal teams, social workers, midwives, and support workers) also require protection:

- Professional autonomy is respected
- Good faith actions are supported by existing legal protections
- Practitioner data is handled under the Privacy Act 2020
- The system aims to reduce unnecessary administrative and emotional burden

---

## Key Features

- Personalised support pathways
- Intelligent form pre-filling (WINZ, IRD, Tenancy)
- Secure multi-modal document storage
- Independent Client-Side Documentor
- Taranaki + National services directory
- Trauma-informed and culturally grounded design

---

## Getting Started (Development)

### Prerequisites
- Node.js 18+
- Git

### Windows (PowerShell)

```powershell
# Clone the repository
git clone https://github.com/fivepanelhat/Front_Line_Whanau.git

# Move into the project folder
cd Front_Line_Whanau

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Linux / macOS (Bash)

```bash
# Clone the repository
git clone https://github.com/fivepanelhat/Front_Line_Whanau.git

# Move into the project folder
cd Front_Line_Whanau

# Install dependencies
npm install

# Start the development server
npm run dev
```

> **Note:** On some Linux distributions, you may need to install Node.js via [nvm](https://github.com/nvm-sh/nvm) if your system package manager provides an older version:
>
> ```bash
> # Install nvm
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
>
> # Restart your terminal, then install Node.js 18+
> nvm install 18
> nvm use 18
> ```

---

## Project Structure

```text
Front_Line_Whanau/
├── public/                  # Static assets
│   └── favicon.svg
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level views
│   ├── services/            # Client-side service modules
│   ├── styles/              # Global styles and design tokens
│   ├── utils/               # Utility functions and helpers
│   ├── App.js               # Root application component
│   └── main.js              # Application entry point
├── .gitignore
├── index.html               # HTML entry point
├── package.json
├── vite.config.js           # Vite build configuration
└── README.md
```

---

## Contributing

We welcome contributions from developers, designers, social workers, and anyone who wants to help whānau in need. Please read our contributing guidelines before submitting a pull request.

### Code of Conduct

All contributors are expected to uphold the values outlined in this README, including **inclusivity**, **cultural safety**, and **respect for all families and practitioners**.

---

## Licence

This project is licensed under the **MIT Licence**. See [LICENCE](LICENCE) for details.

---

## Acknowledgements

- **Te Mana Raraunga** — Māori Data Sovereignty Network
- **Taranaki DHB Neonatal Unit** — For inspiring this work
- **All the front line families** — Your strength drives this project

---

> *"He aha te mea nui o te ao? He tāngata, he tāngata, he tāngata."*  
> *What is the most important thing in the world? It is people, it is people, it is people.*
