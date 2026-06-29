// DOTAIBOOKS - Certification definitions for ITIL 5 + DevOps

export interface CertDef {
  slug: string
  name: string
  shortName: string
  provider: string
  description: string
  longDescription: string
  icon: string
  color: string
  examDuration: number
  totalQuestions: number
  passMark: number
  passPercentage: number
  bloomsLevels: string
  sortOrder: number
  categories: { number: number; name: string; weighting: number; color: string; description: string }[]
}

export const CERTIFICATIONS: CertDef[] = [
  {
    slug: 'itil-5-product',
    name: 'ITIL Product (Version 5)',
    shortName: 'ITIL 5',
    provider: 'PeopleCert',
    description: 'Master digital product and service lifecycle management with the ITIL v5 framework.',
    longDescription:
      'The ITIL Product (Version 5) qualification provides guidance to innovate and co-create value through digital products. It aligns people, processes, and technology to navigate the complexities of the product lifecycle and ensure products deliver measurable value aligned with business goals.',
    icon: '🎯',
    color: '#0891b2',
    examDuration: 90,
    totalQuestions: 40,
    passMark: 28,
    passPercentage: 70,
    bloomsLevels: '2,3',
    sortOrder: 1,
    categories: [
      { number: 1, name: 'Digital Products and Services', weighting: 15.0, color: '#0891b2', description: 'Key concepts of digital products and services, the ITIL Product and Service Lifecycle Model.' },
      { number: 2, name: 'Discover', weighting: 10.0, color: '#0d9488', description: 'Identifying opportunities, understanding customer needs, informing roadmaps and backlogs.' },
      { number: 3, name: 'Design', weighting: 10.0, color: '#0284c7', description: 'Creating solutions so they can be built, operated, delivered, and supported effectively.' },
      { number: 4, name: 'Acquire', weighting: 10.0, color: '#2563eb', description: 'Securing and allocating technology, people, and third-party services.' },
      { number: 5, name: 'Build', weighting: 10.0, color: '#7c3aed', description: 'Developing and assembling components of a digital product, integrating design.' },
      { number: 6, name: 'Transition', weighting: 7.5, color: '#9333ea', description: 'Moving a product from build to live operation, ensuring readiness and acceptance.' },
      { number: 7, name: 'Operate', weighting: 7.5, color: '#c026d3', description: 'Running the digital product in live environments, monitoring and maintaining it.' },
      { number: 8, name: 'Deliver', weighting: 7.5, color: '#db2777', description: 'Making services available to consumers and delivering value.' },
      { number: 9, name: 'Support', weighting: 7.5, color: '#e11d48', description: 'Providing support for digital products and services, handling incidents.' },
      { number: 10, name: 'The ITIL Product and Service Lifecycle', weighting: 15.0, color: '#ea580c', description: 'Managing end-to-end lifecycle, operating models, value streams, AI and DevOps.' },
    ],
  },
  {
    slug: 'devops-foundation',
    name: 'DevOps Foundation',
    shortName: 'DevOps FND',
    provider: 'DevOps Institute / PeopleCert',
    description: 'Build the foundational knowledge of DevOps principles, practices, and culture.',
    longDescription:
      'The DevOps Foundation certification provides the foundational knowledge of DevOps — explaining the core principles, practices, culture, automation, and metrics that enable organizations to deliver value faster and more reliably. Ideal for anyone involved in or affected by DevOps.',
    icon: '⚙️',
    color: '#059669',
    examDuration: 60,
    totalQuestions: 40,
    passMark: 26,
    passPercentage: 65,
    bloomsLevels: '1,2',
    sortOrder: 2,
    categories: [
      { number: 1, name: 'Exploring DevOps', weighting: 12.5, color: '#059669', description: 'DevOps definitions, CALMS, why DevOps, business and IT drivers.' },
      { number: 2, name: 'Core DevOps Principles', weighting: 10.0, color: '#0d9488', description: 'The Three Ways, Theory of Constraints, Chaos Engineering, learning culture.' },
      { number: 3, name: 'Key DevOps Practices', weighting: 17.5, color: '#0891b2', description: 'CI/CD, Site Reliability Engineering, automation practices.' },
      { number: 4, name: 'Business and Technology Frameworks', weighting: 17.5, color: '#0284c7', description: 'Agile, Lean, ITIL, ITSM and their relationship with DevOps.' },
      { number: 5, name: 'Cultures, Behaviours, and Operating Models', weighting: 15.0, color: '#2563eb', description: 'Cultural transformation, operating models, organizational structures.' },
      { number: 6, name: 'Automation and Architecting DevOps Toolchains', weighting: 12.5, color: '#7c3aed', description: 'Automation, toolchains, architecture for DevOps.' },
      { number: 7, name: 'Measurement, Metrics, and Reporting', weighting: 5.0, color: '#9333ea', description: 'Metrics, KPIs, reporting and visibility.' },
      { number: 8, name: 'Sharing, Shadowing, and Evolving', weighting: 10.0, color: '#c026d3', description: 'Knowledge sharing, shadowing, continuous evolution.' },
    ],
  },
  {
    slug: 'devops-leader',
    name: 'DevOps Leader',
    shortName: 'DevOps Leader',
    provider: 'DevOps Institute / PeopleCert',
    description: 'Lead DevOps transformation with leadership, culture, and measurement expertise.',
    longDescription:
      'The DevOps Leader certification is designed for those driving DevOps transformation. It covers transformational leadership, unlearning behaviours, becoming a DevOps organization, measurement, target operating models, and organizational design.',
    icon: '🚀',
    color: '#7c3aed',
    examDuration: 60,
    totalQuestions: 40,
    passMark: 26,
    passPercentage: 65,
    bloomsLevels: '1,2',
    sortOrder: 3,
    categories: [
      { number: 1, name: 'DevOps and Transformational Leadership', weighting: 15.0, color: '#7c3aed', description: 'Transformational leadership in a DevOps context.' },
      { number: 2, name: 'Unlearning Behaviours', weighting: 12.5, color: '#9333ea', description: 'Identifying and unlearning outdated behaviours and patterns.' },
      { number: 3, name: 'Becoming a DevOps Organization', weighting: 17.5, color: '#c026d3', description: 'Transforming into a DevOps organization.' },
      { number: 4, name: 'Measuring to Learn', weighting: 5.0, color: '#db2777', description: 'Metrics for learning and insight.' },
      { number: 5, name: 'Measuring to Improve', weighting: 5.0, color: '#e11d48', description: 'Metrics for continuous improvement.' },
      { number: 6, name: 'Target Operating Models and Organizational Designs', weighting: 15.0, color: '#ea580c', description: 'Target operating models and organizational design for DevOps.' },
      { number: 7, name: 'Leadership and Culture', weighting: 15.0, color: '#f59e0b', description: 'Leadership styles and cultural change.' },
      { number: 8, name: 'DevOps Leadership Practices', weighting: 15.0, color: '#0d9488', description: 'Practical leadership practices for DevOps.' },
    ],
  },
]

export function getCertBySlug(slug: string): CertDef | undefined {
  return CERTIFICATIONS.find((c) => c.slug === slug)
}
