// Chapter metadata + cert-gate logic. Concept/quiz/boss content lives in knowledge/*.json.
// Cert names reflect Salesforce Trailhead naming (merged May 2024).

export const CHAPTERS = [
  { id: 1,  slug: 'the-awakening',       title: 'The Awakening',        subtitle: 'Platform, Studio, Mule 4 runtime, flow anatomy',                cert: 'MuleSoft Dev I',   icon: 'Sparkles' },
  { id: 2,  slug: 'api-architects-path', title: "API Architect's Path", subtitle: 'RAML 1.0, OAS 3.0, API Designer, Exchange, mocking',            cert: 'MuleSoft Dev I',   icon: 'DraftingCompass' },
  { id: 3,  slug: 'the-flow-master',     title: 'The Flow Master',      subtitle: 'Flow types, routers, Scatter-Gather, Choice, First Successful', cert: 'MuleSoft Dev I',   icon: 'GitBranch' },
  { id: 4,  slug: 'dataweave-sage',      title: 'DataWeave Sage',       subtitle: 'Types, map/filter/reduce/groupBy, multi-format, functions',     cert: 'Dev I + Dev II',   icon: 'Wand2' },
  { id: 5,  slug: 'the-connector-guild', title: 'The Connector Guild',  subtitle: 'HTTP, Database, File, JMS, Salesforce, Anypoint MQ',            cert: 'MuleSoft Dev I',   icon: 'Plug' },
  { id: 6,  slug: 'error-batch-warrior', title: 'Error & Batch Warrior',subtitle: 'Error handling strategies, batch, async patterns',              cert: 'MuleSoft Dev II',  icon: 'ShieldAlert' },
  { id: 7,  slug: 'security-sentinel',   title: 'Security Sentinel',    subtitle: 'OAuth 2.0, JWT, Client ID, TLS/mTLS, Secrets Manager',          cert: 'MuleSoft Dev II',  icon: 'Lock' },
  { id: 8,  slug: 'api-governance-lord', title: 'API Governance Lord',  subtitle: 'API Manager, policies, SLA tiers, autodiscovery, analytics',    cert: 'MuleSoft Dev II',  icon: 'Scale' },
  { id: 9,  slug: 'runtime-deployment',  title: 'Runtime & Deployment', subtitle: 'CloudHub 1.0 vs 2.0, Runtime Fabric, on-prem, workers',         cert: 'Dev II + Arch I',  icon: 'Server' },
  { id: 10, slug: 'devops-enforcer',     title: 'DevOps Enforcer',      subtitle: 'Anypoint CLI, Maven, CI/CD, MUnit, coverage',                   cert: 'Integration Arch I', icon: 'Workflow' },
  { id: 11, slug: 'architecture-oracle', title: 'Architecture Oracle',  subtitle: 'API-led, event-driven, Kafka, idempotency, DLQ',                cert: 'Integration Arch I', icon: 'Network' },
  { id: 12, slug: 'observability-keeper',title: 'Observability Keeper', subtitle: 'Anypoint Monitoring, dashboards, log4j2, tracing',              cert: 'Integration Arch I', icon: 'Activity' },
  { id: 13, slug: 'the-ai-frontier',     title: 'The AI Frontier',      subtitle: 'Inference/Vector/Agentforce connectors, Flex Gateway, ACB, RAG',cert: 'Arch I + Prestige', icon: 'BrainCircuit', prestige: true }
]

export const CERT_GATES = [
  {
    id: 'MCD-L1',
    name: 'Salesforce Certified MuleSoft Developer I',
    shortName: 'MuleSoft Developer I',
    afterChapter: 5,
    unlocksChapter: 6,
    questions: 60,
    passPct: 70,
    durationMin: 60,
    badge: 'MuleSoft Developer I'
  },
  {
    id: 'MCD-L2',
    name: 'Salesforce Certified MuleSoft Developer II',
    shortName: 'MuleSoft Developer II',
    afterChapter: 9,
    unlocksChapter: 10,
    questions: 60,
    passPct: 70,
    durationMin: 60,
    badge: 'MuleSoft Developer II'
  },
  {
    id: 'MCIA',
    name: 'Salesforce Certified MuleSoft Integration Architect I',
    shortName: 'Integration Architect I',
    afterChapter: 12,
    unlocksChapter: 13,
    questions: 70,
    passPct: 70,
    durationMin: 90,
    badge: 'Integration Architect I'
  }
]

// Returns the cert gate that must be passed BEFORE entering this chapter (or null).
export function gateBefore(chapterId) {
  return CERT_GATES.find((g) => g.unlocksChapter === chapterId) || null
}

// Returns the cert gate unlocked by completing this chapter (or null).
export function gateAfter(chapterId) {
  return CERT_GATES.find((g) => g.afterChapter === chapterId) || null
}
