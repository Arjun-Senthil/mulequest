// 15-minute daily challenges. One is selected per calendar day (rotating).
export const DAILY_CHALLENGES = [
  { id: 'DC-001', title: 'DataWeave warm-up', task: 'Write a DW script that takes an array of order objects and returns total revenue per customer using groupBy + reduce. No looking at docs for the first attempt.' },
  { id: 'DC-002', title: 'Error handler sketch', task: 'On paper or in Studio: design the error handling for a flow that calls two REST APIs in sequence, where API #1 failures must retry 3 times and API #2 failures must roll back a DB insert.' },
  { id: 'DC-003', title: 'RAML speed run', task: 'Author a RAML 1.0 spec for a /customers resource with GET (paged), POST, and /customers/{id} GET/PUT/DELETE — with types, examples, and a 404 response — in under 15 minutes.' },
  { id: 'DC-004', title: 'Router recall', task: 'From memory, list every Mule 4 router/scope that can produce parallel execution and the variable/payload merge behavior of each. Verify against docs after.' },
  { id: 'DC-005', title: 'Status code drill', task: 'For each: idempotent retry-safe? 200, 201, 202, 204, 304, 400, 401, 403, 404, 409, 412, 429, 500, 502, 503, 504. Write one Mule scenario where you would return each.' },
  { id: 'DC-006', title: 'DW pattern: flatten', task: 'Given orders each containing an items[] array, produce a flat array of {orderId, sku, qty} using flatMap. Then do it again with reduce only.' },
  { id: 'DC-007', title: 'Batch block diagram', task: 'Draw the full lifecycle of a Batch Job: load/dispatch, process phases, aggregator, on-complete — and annotate where the payload is a record vs an array vs a BatchJobResult.' },
  { id: 'DC-008', title: 'OAuth flow sketch', task: 'Whiteboard the full authorization_code + PKCE flow between SPA, auth server, and a Mule API protected by an OAuth enforcement policy. Mark every token validation point.' },
  { id: 'DC-009', title: 'CloudHub sizing', task: 'You have an API doing 120 req/s, avg 80ms downstream latency, payloads ~50KB. Pick CloudHub worker size + count and justify with the math. Then do the same for CloudHub 2.0 replicas.' },
  { id: 'DC-010', title: 'MUnit kata', task: 'Write an MUnit test (XML or sketch) for a flow with an HTTP request: mock the requester, assert payload transform, and verify the error path raises HTTP:CONNECTIVITY handling.' },
  { id: 'DC-011', title: 'Idempotency drill', task: 'Design idempotent receipt for an orders API: choose key, store, TTL, and the response for duplicates. Compare Idempotent Message Validator vs ObjectStore vs DB unique constraint.' },
  { id: 'DC-012', title: 'API-led 3-layer split', task: 'Take "send order confirmations via email + SMS when an order ships" and split it into experience/process/system APIs with exact resource paths and payloads.' },
  { id: 'DC-013', title: 'DW tail: pluck & mapObject', task: 'Convert {"a":1,"b":2} into [{"key":"a","val":1},...] with pluck. Then invert a key:value object with mapObject. Then explain when each is the wrong tool.' },
  { id: 'DC-014', title: 'DLQ design', task: 'Design dead-letter handling for an Anypoint MQ consumer: max redeliveries, DLQ naming, alerting, replay procedure. Write the exact ack mode you would use and why.' }
]

export function todaysChallenge() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length]
}
