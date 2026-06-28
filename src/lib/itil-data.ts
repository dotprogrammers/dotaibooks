// ITIL 5 Product Syllabus Structure
// Based on official ITIL Product (Version 5) Syllabus

export interface SyllabusCategory {
  id: string
  number: number
  name: string
  weighting: number
  color: string
  lifecycleActivity?: string
  description: string
  subTopics: {
    id: string
    title: string
    assessmentCriteria: { id: string; text: string; bloomsLevel: number }[]
  }[]
}

export const EXAM_CONFIG = {
  totalQuestions: 40,
  totalMarks: 40,
  durationMinutes: 90,
  passMark: 28,
  passPercentage: 70,
  bloomsLevel2Percent: 65,
  bloomsLevel3Percent: 35,
  extraTimeMinutes: 113, // for non-native speakers
} as const

export const SYLLABUS_CATEGORIES: SyllabusCategory[] = [
  {
    id: '1',
    number: 1,
    name: 'Digital Products and Services',
    weighting: 15.0,
    color: '#0891b2',
    description:
      'Key concepts of digital products and services, the ITIL Product and Service Lifecycle Model, and lifecycle management activities.',
    subTopics: [
      {
        id: '1.1',
        title: 'Introduction to digital products and services',
        assessmentCriteria: [
          { id: '1.1.1', text: 'Understand the key concepts of digital products and services', bloomsLevel: 2 },
          { id: '1.1.2', text: 'Describe the characteristics of digital products', bloomsLevel: 2 },
          { id: '1.1.3', text: 'Explain how digital products and services create value', bloomsLevel: 2 },
          { id: '1.1.4', text: 'Understand the scope and purpose of the ITIL Product and Service Lifecycle Model', bloomsLevel: 2 },
          { id: '1.1.5', text: 'Describe the lifecycle management activities of a digital product', bloomsLevel: 2 },
          { id: '1.1.6', text: 'Understand how an organization\'s value chain activities support the ITIL Product and Service Lifecycle', bloomsLevel: 2 },
        ],
      },
      {
        id: '1.2',
        title: 'The digital product and service lifecycle management activities',
        assessmentCriteria: [
          { id: '1.2.1', text: 'Describe the purpose of the "discover" activity', bloomsLevel: 2 },
          { id: '1.2.2', text: 'Describe the purpose of the "design" activity', bloomsLevel: 2 },
          { id: '1.2.3', text: 'Describe the purpose of the "acquire" activity', bloomsLevel: 2 },
          { id: '1.2.4', text: 'Describe the purpose of the "build" activity', bloomsLevel: 2 },
          { id: '1.2.5', text: 'Describe the purpose of the "transition" activity', bloomsLevel: 2 },
          { id: '1.2.6', text: 'Describe the purpose of the "operate" activity', bloomsLevel: 2 },
          { id: '1.2.7', text: 'Describe the purpose of the "deliver" activity', bloomsLevel: 2 },
          { id: '1.2.8', text: 'Describe the purpose of the "support" activity', bloomsLevel: 2 },
          { id: '1.2.9', text: 'Describe the benefits of the ITIL Product and Service Lifecycle management activities from a product vendor perspective', bloomsLevel: 2 },
          { id: '1.2.10', text: 'Describe the challenges of the ITIL Product and Service Lifecycle management activities, from a product vendor perspective', bloomsLevel: 2 },
        ],
      },
    ],
  },
  {
    id: '2',
    number: 2,
    name: 'Discover',
    weighting: 10.0,
    color: '#0d9488',
    lifecycleActivity: 'Discover',
    description:
      'The discover activity: identifying opportunities, understanding customer needs, and informing roadmaps and backlogs through vision, strategy, and portfolio.',
    subTopics: [
      {
        id: '2.1',
        title: 'Key concepts and practices of the "discover" activity',
        assessmentCriteria: [
          { id: '2.1.1', text: 'Understand the key concepts of the "discover" activity', bloomsLevel: 2 },
          { id: '2.1.2', text: 'Explain how vision, strategy, and portfolio inform discovery', bloomsLevel: 2 },
          { id: '2.1.3', text: 'Describe the practices enabling the "discover" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '2.2',
        title: 'Steps and outputs of the "discover" activity',
        assessmentCriteria: [
          { id: '2.2.1', text: 'Describe the outputs of the "discover" activity', bloomsLevel: 2 },
          { id: '2.2.2', text: 'Apply the steps of the "discover" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '2.3',
        title: 'Success factors and metrics of the "discover" activity',
        assessmentCriteria: [
          { id: '2.3.1', text: 'Explain the Critical Success Factors (CSFs) and metrics of the "discover" activity', bloomsLevel: 2 },
          { id: '2.3.2', text: 'Apply recommendations for effective/successful discovery', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '3',
    number: 3,
    name: 'Design',
    weighting: 10.0,
    color: '#0284c7',
    lifecycleActivity: 'Design',
    description:
      'The design activity: creating solutions so they can be built, operated, delivered, and supported effectively across the lifecycle.',
    subTopics: [
      {
        id: '3.1',
        title: 'Key concepts and practices of the "design" activity',
        assessmentCriteria: [
          { id: '3.1.1', text: 'Understand the key concepts of the "design" activity', bloomsLevel: 2 },
          { id: '3.1.2', text: 'Describe the practices enabling the "design" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '3.2',
        title: 'Steps and outputs of the "design" activity',
        assessmentCriteria: [
          { id: '3.2.1', text: 'Describe the outputs of the "design" activity', bloomsLevel: 2 },
          { id: '3.2.2', text: 'Apply the steps of the "design" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '3.3',
        title: 'Success factors and metrics of the "design" activity',
        assessmentCriteria: [
          { id: '3.3.1', text: 'Explain the CSFs and metrics of the "design" activity', bloomsLevel: 2 },
          { id: '3.3.2', text: 'Apply recommendations for effective design', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '4',
    number: 4,
    name: 'Acquire',
    weighting: 10.0,
    color: '#2563eb',
    lifecycleActivity: 'Acquire',
    description:
      'The acquire activity: securing and allocating technology, people, and third-party services to enable implementation.',
    subTopics: [
      {
        id: '4.1',
        title: 'Key concepts and practices of the "acquire" activity',
        assessmentCriteria: [
          { id: '4.1.1', text: 'Describe the differences between the acquisition of technology, people, and third-party services', bloomsLevel: 2 },
          { id: '4.1.2', text: 'Describe the practices enabling the "acquire" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '4.2',
        title: 'Steps and outputs of the "acquire" activity',
        assessmentCriteria: [
          { id: '4.2.1', text: 'Describe the outputs of the "acquire" activity', bloomsLevel: 2 },
          { id: '4.2.2', text: 'Apply the steps of the "acquire" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '4.3',
        title: 'Success factors and metrics of the "acquire" activity',
        assessmentCriteria: [
          { id: '4.3.1', text: 'Explain the CSFs and metrics of the "acquire" activity', bloomsLevel: 2 },
          { id: '4.3.2', text: 'Apply recommendations for effective acquisition', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '5',
    number: 5,
    name: 'Build',
    weighting: 10.0,
    color: '#7c3aed',
    lifecycleActivity: 'Build',
    description:
      'The build activity: integrating design into build, developing and assembling the components of a digital product.',
    subTopics: [
      {
        id: '5.1',
        title: 'Key concepts and practices of the "build" activity',
        assessmentCriteria: [
          { id: '5.1.1', text: 'Describe the integration of design into "build" activity', bloomsLevel: 2 },
          { id: '5.1.2', text: 'Describe the practices enabling the "build" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '5.2',
        title: 'Steps and outputs of the "build" activity',
        assessmentCriteria: [
          { id: '5.2.1', text: 'Describe the outputs of the "build" activity', bloomsLevel: 2 },
          { id: '5.2.2', text: 'Apply the steps of the "build" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '5.3',
        title: 'Success factors and metrics of the "build" activity',
        assessmentCriteria: [
          { id: '5.3.1', text: 'Explain the CSFs and metrics of the "build" activity', bloomsLevel: 2 },
          { id: '5.3.2', text: 'Apply recommendations for effective build', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '6',
    number: 6,
    name: 'Transition',
    weighting: 7.5,
    color: '#9333ea',
    lifecycleActivity: 'Transition',
    description:
      'The transition activity: moving a product from build to live operation, ensuring readiness and stakeholder acceptance.',
    subTopics: [
      {
        id: '6.1',
        title: 'Key concepts and practices of the "transition" activity',
        assessmentCriteria: [
          { id: '6.1.1', text: 'Understand the key concepts of the "transition" activity', bloomsLevel: 2 },
          { id: '6.1.2', text: 'Describe the practices enabling the "transition" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '6.2',
        title: 'Steps and outputs of the "transition" activity',
        assessmentCriteria: [
          { id: '6.2.1', text: 'Describe the outputs of the "transition" activity', bloomsLevel: 2 },
          { id: '6.2.2', text: 'Apply the steps of the "transition" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '6.3',
        title: 'Success factors and metrics of the "transition" activity',
        assessmentCriteria: [
          { id: '6.3.1', text: 'Explain the CSFs and metrics of the "transition" activity', bloomsLevel: 2 },
          { id: '6.3.2', text: 'Apply recommendations for effective transition', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '7',
    number: 7,
    name: 'Operate',
    weighting: 7.5,
    color: '#c026d3',
    lifecycleActivity: 'Operate',
    description:
      'The operate activity: running the digital product in live environments, monitoring, and maintaining day-to-day operation.',
    subTopics: [
      {
        id: '7.1',
        title: 'Key concepts and practices of the "operate" activity',
        assessmentCriteria: [
          { id: '7.1.1', text: 'Understand the key concepts of the "operate" activity', bloomsLevel: 2 },
          { id: '7.1.2', text: 'Describe the practices enabling the "operate" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '7.2',
        title: 'Steps and outputs of the "operate" activity',
        assessmentCriteria: [
          { id: '7.2.1', text: 'Describe the outputs of the "operate" activity', bloomsLevel: 2 },
          { id: '7.2.2', text: 'Apply the steps of the "operate" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '7.3',
        title: 'Success factors and metrics of the "operate" activity',
        assessmentCriteria: [
          { id: '7.3.1', text: 'Explain the CSFs and metrics of the "operate" activity', bloomsLevel: 2 },
          { id: '7.3.2', text: 'Apply recommendations for effective operation', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '8',
    number: 8,
    name: 'Deliver',
    weighting: 7.5,
    color: '#db2777',
    lifecycleActivity: 'Deliver',
    description:
      'The deliver activity: service delivery in the product lifecycle, making services available to consumers.',
    subTopics: [
      {
        id: '8.1',
        title: 'Key concepts and practices of the "deliver" activity',
        assessmentCriteria: [
          { id: '8.1.1', text: 'Describe the service delivery in product lifecycle', bloomsLevel: 2 },
          { id: '8.1.2', text: 'Describe the practices enabling the "deliver" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '8.2',
        title: 'Steps and outputs of the "deliver" activity',
        assessmentCriteria: [
          { id: '8.2.1', text: 'Describe the outputs of the "deliver" activity', bloomsLevel: 2 },
          { id: '8.2.2', text: 'Apply the steps of the "deliver" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '8.3',
        title: 'Success factors and metrics of the "deliver" activity',
        assessmentCriteria: [
          { id: '8.3.1', text: 'Explain the CSFs and metrics of the "deliver" activity', bloomsLevel: 2 },
          { id: '8.3.2', text: 'Apply recommendations for effective delivery', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '9',
    number: 9,
    name: 'Support',
    weighting: 7.5,
    color: '#e11d48',
    lifecycleActivity: 'Support',
    description:
      'The support activity: providing support for digital products and services, handling incidents and user needs.',
    subTopics: [
      {
        id: '9.1',
        title: 'Key concepts and practices of the "support" activity',
        assessmentCriteria: [
          { id: '9.1.1', text: 'Understand the key concepts of the "support" activity', bloomsLevel: 2 },
          { id: '9.1.2', text: 'Describe the practices enabling the "support" activity and their role', bloomsLevel: 2 },
        ],
      },
      {
        id: '9.2',
        title: 'Steps and outputs of the "support" activity',
        assessmentCriteria: [
          { id: '9.2.1', text: 'Describe the outputs of the "support" activity', bloomsLevel: 2 },
          { id: '9.2.2', text: 'Apply the steps of the "support" activity', bloomsLevel: 3 },
        ],
      },
      {
        id: '9.3',
        title: 'Success factors and metrics of the "support" activity',
        assessmentCriteria: [
          { id: '9.3.1', text: 'Explain the CSFs and metrics of the "support" activity', bloomsLevel: 2 },
          { id: '9.3.2', text: 'Apply recommendations for effective support', bloomsLevel: 3 },
        ],
      },
    ],
  },
  {
    id: '10',
    number: 10,
    name: 'The ITIL Product and Service Lifecycle',
    weighting: 15.0,
    color: '#ea580c',
    description:
      'Managing the end-to-end lifecycle, operating models, value streams, and how ITIL complements AI, DevOps, and PRINCE2.',
    subTopics: [
      {
        id: '10.1',
        title: 'Managing the end-to-end lifecycle',
        assessmentCriteria: [
          { id: '10.1.1', text: 'Describe how operating models distribute responsibilities', bloomsLevel: 2 },
          { id: '10.1.2', text: 'Understand the key concepts of the product vendor\'s value streams', bloomsLevel: 2 },
          { id: '10.1.3', text: 'Explain how value streams integrate lifecycle stages', bloomsLevel: 2 },
          { id: '10.1.4', text: 'Apply principles of organizational and technology enablement across the lifecycle', bloomsLevel: 3 },
          { id: '10.1.5', text: 'Describe digital product management success factor', bloomsLevel: 2 },
          { id: '10.1.6', text: 'Apply an appropriate organizational structure to support successful product management', bloomsLevel: 3 },
        ],
      },
      {
        id: '10.2',
        title: 'ITIL, AI and other frameworks',
        assessmentCriteria: [
          { id: '10.2.1', text: 'Understand the ITIL AI Capability Model', bloomsLevel: 2 },
          { id: '10.2.2', text: 'Understand how the use of AI can support product management', bloomsLevel: 2 },
          { id: '10.2.3', text: 'Understand how AI and automation affect methods and tools used for product management', bloomsLevel: 2 },
          { id: '10.2.4', text: 'Understand how ITIL and DevOps are complementary in the management of the digital product and service lifecycle', bloomsLevel: 2 },
          { id: '10.2.5', text: 'Understand how ITIL and PRINCE2 are complementary in the management of the digital product and service lifecycle', bloomsLevel: 2 },
        ],
      },
    ],
  },
]

export const LIFECYCLE_ACTIVITIES = [
  { id: 'discover', name: 'Discover', color: '#0d9488', icon: 'compass', purpose: 'Identify opportunities, understand customer needs, and inform roadmaps and backlogs.' },
  { id: 'design', name: 'Design', color: '#0284c7', icon: 'pen-ruler', purpose: 'Create solutions so they can be built, operated, delivered, and supported effectively.' },
  { id: 'acquire', name: 'Acquire', color: '#2563eb', icon: 'shopping-cart', purpose: 'Secure and allocate technology, people, and third-party services to enable implementation.' },
  { id: 'build', name: 'Build', color: '#7c3aed', icon: 'hammer', purpose: 'Develop and assemble the components of a digital product, integrating design.' },
  { id: 'transition', name: 'Transition', color: '#9333ea', icon: 'arrow-right-left', purpose: 'Move a product from build to live operation, ensuring readiness and acceptance.' },
  { id: 'operate', name: 'Operate', color: '#c026d3', icon: 'play', purpose: 'Run the digital product in live environments, monitoring and maintaining it.' },
  { id: 'deliver', name: 'Deliver', color: '#db2777', icon: 'package', purpose: 'Make services available to consumers and deliver value through service consumption.' },
  { id: 'support', name: 'Support', color: '#e11d48', icon: 'life-buoy', purpose: 'Provide support for digital products and services, handling incidents and user needs.' },
]

export const QUESTION_TYPES = {
  standard: 'Standard OTQ - a stem with four answer options',
  'missing-word': 'Missing word(s) - a sentence with a word or words missing',
  list: 'List OTQ - a list of four statements, select two correct',
  negative: 'Negative standard OTQ - negatively worded stem',
} as const

export type QuestionType = keyof typeof QUESTION_TYPES

export function getCategoryById(id: string): SyllabusCategory | undefined {
  return SYLLABUS_CATEGORIES.find((c) => c.id === id)
}

export function getCategoryColor(id: string): string {
  return getCategoryById(id)?.color || '#64748b'
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name || 'Unknown'
}
