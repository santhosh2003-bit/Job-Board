import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const jobs: Prisma.JobCreateInput[] = [
  {
    title: "Senior Frontend Engineer",
    company: "Vercel",
    companyWebsite: "https://vercel.com",
    location: "San Francisco, CA",
    type: "FULL_TIME",
    category: "Engineering",
    experienceLevel: "SENIOR",
    remote: true,
    salaryMin: 150000,
    salaryMax: 210000,
    currency: "USD",
    featured: true,
    description:
      "We're looking for a Senior Frontend Engineer to build delightful, performant interfaces for millions of developers. You'll work closely with design and product to ship features end to end, own critical parts of our React/Next.js codebase, and set the bar for frontend quality across the org.",
    requirements: [
      "5+ years building production web apps with React",
      "Deep knowledge of Next.js, TypeScript and modern CSS",
      "Experience with performance profiling and Core Web Vitals",
      "A strong eye for design and UX detail",
    ],
    benefits: ["Equity", "Unlimited PTO", "Remote-first", "Health & dental", "Home office budget"],
    tags: ["React", "Next.js", "TypeScript", "CSS"],
    applyEmail: "careers@vercel.com",
  },
  {
    title: "Product Designer",
    company: "Linear",
    companyWebsite: "https://linear.app",
    location: "Remote (Europe)",
    type: "FULL_TIME",
    category: "Design",
    experienceLevel: "MID",
    remote: true,
    salaryMin: 90000,
    salaryMax: 130000,
    currency: "EUR",
    featured: true,
    description:
      "Join our small, senior design team to craft the tools that modern software teams love. You'll own features from concept to polished shipping quality, prototype interactions, and help evolve our design system.",
    requirements: [
      "4+ years of product design experience",
      "Strong portfolio of shipped product work",
      "Fluency in Figma and interaction prototyping",
      "Comfort working async in a distributed team",
    ],
    benefits: ["Equity", "Remote-first", "4-day summer weeks", "Learning budget"],
    tags: ["Figma", "Design Systems", "Prototyping"],
    applyEmail: "jobs@linear.app",
  },
  {
    title: "Backend Engineer (Go)",
    company: "Fly.io",
    location: "Remote (Global)",
    type: "FULL_TIME",
    category: "Engineering",
    experienceLevel: "MID",
    remote: true,
    salaryMin: 130000,
    salaryMax: 180000,
    currency: "USD",
    description:
      "Help us run apps close to users all over the world. You'll work on distributed systems, orchestration, and the guts of our platform in Go and Rust.",
    requirements: [
      "3+ years writing backend services in Go",
      "Understanding of networking and Linux internals",
      "Experience with distributed systems",
    ],
    benefits: ["Equity", "Remote-first", "Health insurance"],
    tags: ["Go", "Distributed Systems", "Linux"],
    applyEmail: "hiring@fly.io",
  },
  {
    title: "Growth Marketing Manager",
    company: "Notion",
    companyWebsite: "https://notion.so",
    location: "New York, NY",
    type: "FULL_TIME",
    category: "Marketing",
    experienceLevel: "SENIOR",
    remote: false,
    salaryMin: 110000,
    salaryMax: 150000,
    currency: "USD",
    description:
      "Own and scale our paid and lifecycle marketing programs. You'll run experiments across channels, partner with data to measure impact, and help millions of new users discover Notion.",
    requirements: [
      "5+ years in growth or performance marketing",
      "Hands-on with paid acquisition and analytics",
      "Strong analytical and experimentation mindset",
    ],
    benefits: ["Equity", "Health & dental", "Commuter benefits", "Wellness stipend"],
    tags: ["Growth", "SEO", "Paid Ads", "Analytics"],
    applyEmail: "talent@notion.so",
  },
  {
    title: "Data Analyst",
    company: "Airbnb",
    location: "Remote (US)",
    type: "FULL_TIME",
    category: "Data & Analytics",
    experienceLevel: "ENTRY",
    remote: true,
    salaryMin: 85000,
    salaryMax: 115000,
    currency: "USD",
    description:
      "Turn data into decisions. You'll build dashboards, run analyses that shape product direction, and partner with teams across the company to answer their toughest questions.",
    requirements: [
      "1-2 years in an analytics role",
      "Strong SQL and data visualization skills",
      "Familiarity with Python or R is a plus",
    ],
    benefits: ["Remote-friendly", "Travel credits", "Health insurance"],
    tags: ["SQL", "Python", "Tableau"],
    applyEmail: "data-jobs@airbnb.com",
  },
  {
    title: "iOS Engineering Intern",
    company: "Spotify",
    location: "Stockholm, Sweden",
    type: "INTERNSHIP",
    category: "Engineering",
    experienceLevel: "INTERN",
    remote: false,
    salaryMin: 3000,
    salaryMax: 3500,
    currency: "EUR",
    description:
      "Spend the summer shipping features used by hundreds of millions of listeners. You'll pair with senior engineers, learn our Swift codebase, and own a real project by the end of the internship.",
    requirements: [
      "Currently pursuing a CS or related degree",
      "Some experience with Swift or iOS development",
      "Curiosity and eagerness to learn",
    ],
    benefits: ["Mentorship", "Relocation support", "Spotify Premium"],
    tags: ["Swift", "iOS", "Mobile"],
    applyEmail: "internships@spotify.com",
  },
  {
    title: "DevOps / Platform Engineer",
    company: "GitLab",
    location: "Remote (Global)",
    type: "CONTRACT",
    category: "Engineering",
    experienceLevel: "SENIOR",
    remote: true,
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "USD",
    description:
      "Build and maintain the infrastructure that keeps GitLab running smoothly. Work with Kubernetes, Terraform and CI/CD pipelines at massive scale in an all-remote company.",
    requirements: [
      "Strong experience with Kubernetes and Terraform",
      "CI/CD pipeline design and maintenance",
      "Comfort in an all-remote, async environment",
    ],
    benefits: ["Fully remote", "Flexible hours", "Growth budget"],
    tags: ["Kubernetes", "Terraform", "CI/CD", "AWS"],
    applyEmail: "careers@gitlab.com",
  },
  {
    title: "Customer Support Specialist",
    company: "Stripe",
    location: "Dublin, Ireland",
    type: "PART_TIME",
    category: "Customer Support",
    experienceLevel: "ENTRY",
    remote: false,
    salaryMin: 40000,
    salaryMax: 52000,
    currency: "EUR",
    description:
      "Be the voice of Stripe for businesses of all sizes. You'll resolve technical questions, advocate for users internally, and help companies grow their revenue.",
    requirements: [
      "Excellent written communication",
      "Empathy and patience with users",
      "Interest in fintech and technical products",
    ],
    benefits: ["Health insurance", "Learning stipend", "Flexible schedule"],
    tags: ["Support", "Fintech", "Communication"],
    applyEmail: "support-hiring@stripe.com",
  },
  {
    title: "Machine Learning Engineer",
    company: "Hugging Face",
    location: "Remote (Global)",
    type: "FULL_TIME",
    category: "Data & Analytics",
    experienceLevel: "LEAD",
    remote: true,
    salaryMin: 180000,
    salaryMax: 250000,
    currency: "USD",
    featured: true,
    description:
      "Push the frontier of open-source machine learning. You'll lead research-to-production efforts, optimize model training and inference, and collaborate with a world-class community.",
    requirements: [
      "Deep experience training and deploying ML models",
      "Strong Python and PyTorch skills",
      "Track record leading technical projects",
    ],
    benefits: ["Equity", "Remote-first", "Conference budget", "Top-tier hardware"],
    tags: ["Python", "PyTorch", "LLMs", "NLP"],
    applyEmail: "ml-jobs@huggingface.co",
  },
  {
    title: "Finance Operations Associate",
    company: "Ramp",
    location: "New York, NY",
    type: "FULL_TIME",
    category: "Finance",
    experienceLevel: "MID",
    remote: false,
    salaryMin: 95000,
    salaryMax: 125000,
    currency: "USD",
    description:
      "Help build the finance function at one of the fastest-growing fintechs. You'll own reconciliation, reporting and process automation as we scale.",
    requirements: [
      "3+ years in finance or accounting operations",
      "Advanced spreadsheet skills",
      "Detail-oriented and process-driven",
    ],
    benefits: ["Equity", "Health & dental", "Commuter benefits"],
    tags: ["Finance", "Accounting", "Operations"],
    applyEmail: "finance-jobs@ramp.com",
  },
];

// --- ATS scoring configuration (admin-editable at runtime) -------------------

const atsCriteria: Prisma.AtsCriterionCreateInput[] = [
  { key: "jd_match", label: "Job description match", weight: 30, order: 1,
    description: "How well the resume's keywords align with the target job description (TF-IDF keyword matching)." },
  { key: "skills_coverage", label: "Skills coverage", weight: 20, order: 2,
    description: "Presence of recognised, role-relevant skills from the managed skills dictionary." },
  { key: "sections", label: "Resume sections", weight: 15, order: 3,
    description: "Whether standard, clearly-titled sections (experience, education, skills, etc.) are present." },
  { key: "action_impact", label: "Action verbs & impact", weight: 12, order: 4,
    description: "Use of strong action verbs and quantified achievements (numbers, %, $)." },
  { key: "contact_info", label: "Contact information", weight: 10, order: 5,
    description: "Presence of email, phone, and a LinkedIn/portfolio link the ATS can extract." },
  { key: "formatting", label: "ATS formatting", weight: 8, order: 6,
    description: "ATS-friendly structure: sensible length, bullet points, dates, no parser-breaking glyphs." },
  { key: "readability", label: "Readability & length", weight: 5, order: 7,
    description: "Overall length and sentence readability." },
];

const atsSkills: { category: string; skills: [string, ...string[]][] }[] = [
  { category: "Engineering", skills: [
    ["JavaScript", "js"], ["TypeScript", "ts"], ["React", "react.js", "reactjs"],
    ["Next.js", "nextjs"], ["Node.js", "node", "nodejs"], ["Python"], ["Go", "golang"],
    ["Java"], ["SQL"], ["PostgreSQL", "postgres"], ["Docker"], ["Kubernetes", "k8s"],
    ["AWS"], ["CI/CD"], ["REST", "rest api"], ["GraphQL"], ["Git"], ["Testing", "unit testing"],
  ]},
  { category: "Design", skills: [
    ["Figma"], ["Sketch"], ["Prototyping"], ["Design systems"], ["User research"],
    ["Wireframing"], ["Accessibility", "a11y"], ["Adobe XD"], ["UI design"], ["UX design"],
  ]},
  { category: "Product", skills: [
    ["Roadmapping", "roadmap"], ["User stories"], ["Agile"], ["Scrum"], ["Analytics"],
    ["A/B testing"], ["Stakeholder management"], ["Jira"], ["Product strategy"],
  ]},
  { category: "Marketing", skills: [
    ["SEO"], ["SEM"], ["Google Analytics"], ["Content marketing"], ["Email marketing"],
    ["Paid ads", "ppc"], ["Social media"], ["HubSpot"], ["Copywriting"], ["CRM"],
  ]},
  { category: "Sales", skills: [
    ["Salesforce"], ["Lead generation"], ["Cold calling"], ["Negotiation"], ["CRM"],
    ["Account management"], ["Pipeline management"], ["B2B"], ["Closing"],
  ]},
  { category: "Data & Analytics", skills: [
    ["Python"], ["SQL"], ["R"], ["Tableau"], ["Power BI", "powerbi"], ["Excel"],
    ["Machine learning", "ml"], ["Pandas"], ["Statistics"], ["Data visualization"],
    ["ETL"], ["PyTorch"], ["TensorFlow"],
  ]},
  { category: "Finance", skills: [
    ["Financial modeling"], ["Accounting"], ["Excel"], ["Forecasting"], ["Budgeting"],
    ["Reconciliation"], ["QuickBooks"], ["Reporting"], ["Auditing"],
  ]},
  { category: "General", skills: [
    ["Communication"], ["Leadership"], ["Problem solving"], ["Teamwork", "collaboration"],
    ["Project management"], ["Time management"], ["Adaptability"],
  ]},
];

async function main() {
  console.log("🌱 Seeding database...");
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
  console.log(`✅ Seeded ${jobs.length} jobs.`);

  // ATS criteria (upsert so re-seeding preserves admin weight tweaks by key).
  for (const criterion of atsCriteria) {
    await prisma.atsCriterion.upsert({
      where: { key: criterion.key },
      update: { label: criterion.label, description: criterion.description, order: criterion.order },
      create: criterion,
    });
  }
  console.log(`✅ Seeded ${atsCriteria.length} ATS criteria.`);

  // ATS skills dictionary.
  let skillCount = 0;
  for (const group of atsSkills) {
    for (const [name, ...aliases] of group.skills) {
      await prisma.atsSkill.upsert({
        where: { name_category: { name, category: group.category } },
        update: { aliases },
        create: { name, category: group.category, aliases },
      });
      skillCount++;
    }
  }
  console.log(`✅ Seeded ${skillCount} ATS skills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
