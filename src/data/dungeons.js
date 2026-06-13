// Multi-concept dungeon challenges crossing 2-3 chapters.

export const DUNGEONS = [
  {
    dungeon_id: 'DGN-001',
    title: 'The Sunken Data Vault',
    requires_chapters: [4, 5, 6],
    xp: 300,
    brief: 'A nightly ETL raid: file ingestion, DataWeave surgery, batch loading, and chaos-proof error handling — in one build.',
    scenario: 'A legacy vendor drops orders-YYYYMMDD.csv (10k+ rows, embedded JSON in a "meta" column, dirty data) on SFTP nightly.\n\nBuild the complete pipeline:\n1. Idempotent SFTP pickup (minAge guard, move-on-success/error).\n2. DW: parse rows, read() the embedded JSON, normalize one-or-many line items, reject rows missing orderId/amount with row-level reasons.\n3. Batch job: validate step, enrichment step (NO_FAILURES), aggregator (200) bulk-inserting to DB, ONLY_FAILURES rejects step writing a rejects file.\n4. max-failed-records=-1; On Complete publishes a reconciliation summary {total, ok, failed, rejected} to a queue.\n5. Chaos drill: kill the app mid-batch, restart, prove no duplicate rows (DB constraint) and an accurate final reconciliation.',
    objectives: [
      'File pickup is provably idempotent across restarts (no double-processing)',
      'Embedded JSON parsed via read(); dirty rows diverted with reasons, never crashing the job',
      'Bulk insert via aggregator — not per-row inserts (timed evidence)',
      'On Complete counts reconcile exactly: total = ok + failed + rejected',
      'Mid-batch kill + restart leaves zero duplicates and a correct summary'
    ]
  },
  {
    dungeon_id: 'DGN-002',
    title: 'The Gate of Two Keys',
    requires_chapters: [7, 8],
    xp: 300,
    brief: 'Security and governance fused: a partner-facing API that survives a hostile pen test AND a governance audit.',
    scenario: 'Expose /quotes to two external partners with different commercial tiers.\n\nBuild and govern:\n1. mTLS at the edge (partner client certs) + JWT validation (issuer, audience, partner claim).\n2. API Manager: client ID enforcement + SLA tiers (Partner-Basic 100/min, Partner-Premium 2000/min) + spike control; correct policy ordering, documented.\n3. Tenant isolation: the partner claim filters every data query — cross-partner probing returns 403, never empty 200s.\n4. Secrets: all keystores/credentials via Secure Config Properties; git grep proves zero plaintext.\n5. Pen test yourself: 10 attack cases (expired JWT, wrong audience, no client cert, tier exhaustion, cross-tenant ids, token in logs check) — capture each response code.',
    objectives: [
      'mTLS handshake fails without a valid partner certificate',
      'All 10 attack cases return precisely the right status (401/403/429)',
      'Policy order documented with the rationale (auth before metering)',
      'SLA tiers provably differentiated under load (429 evidence for Basic)',
      'No secrets in git, no tokens/PII in logs (grep transcripts attached)'
    ]
  },
  {
    dungeon_id: 'DGN-003',
    title: 'The Labyrinth of Echoes',
    requires_chapters: [11, 12],
    xp: 300,
    brief: 'An event-driven saga with full observability — and a chaos gauntlet at the end. The pre-MCIA proving ground.',
    scenario: 'Order fulfillment saga across three apps: order-api → (events) → inventory-svc and shipping-svc, with compensation.\n\nBuild:\n1. OrderPlaced → fan-out exchange; inventory reserves stock (idempotent via DB constraint); shipping creates a shipment only after InventoryReserved (event chain).\n2. Compensation: InventoryReservationFailed → order-api marks the order REJECTED and emits OrderRejected.\n3. Resilience: every consumer has MANUAL ack, redelivery caps, DLQs with a depth-alert flow, and a parameterized replay flow.\n4. Observability: one correlationId stitches the entire saga across all three apps and both queues; structured JSON logs at every milestone; a golden-signals view of the entry API.\n5. Chaos gauntlet: duplicate OrderPlaced, kill inventory-svc mid-message, poison a shipment event, dependency dead for 2 minutes — document designed vs observed behavior for each.',
    objectives: [
      'Saga happy path completes across all three apps, evidenced by one correlation id grep',
      'Compensation path proven: failed reservation produces OrderRejected, no orphan shipments',
      'Duplicates absorbed idempotently at every consumer (constraint-backed)',
      'Poison message lands in the DLQ, alert fires, replay flow recovers it after the fix',
      'Chaos table complete: 4 scenarios, designed vs observed, with one honest fix applied'
    ]
  }
]
