// Unlockable reusable assets. unlocked_by references quest/boss/dungeon IDs.

export const INVENTORY_ITEMS = [
  {
    item_id: 'INV-DW-001',
    item_type: 'dw-snippet',
    title: 'Group & Aggregate Pipeline',
    description: 'The groupBy → mapObject → pluck reporting pattern: partition records, aggregate per group, reshape to an array.',
    unlocked_by: 'DW-003',
    unlock_hint: 'Complete the groupBy/pluck concept in Chapter 4',
    content: `%dw 2.0
output application/json
// orders: [{region, rep, amount}]
var byRegion = payload groupBy $.region
---
byRegion pluck ((group, region) -> {
  region: region as String,
  count: sizeOf(group),
  revenue: sum(group map $.amount),
  topRep: (group orderBy -$.amount)[0].rep
})`
  },
  {
    item_id: 'INV-DW-002',
    item_type: 'dw-snippet',
    title: 'One-or-Many Normalizer',
    description: 'Defensive normalization when upstream sends either a single object or an array — the flaky-contract survival kit.',
    unlocked_by: 'DW-005',
    unlock_hint: 'Complete the Custom Functions concept in Chapter 4',
    content: `%dw 2.0
output application/json
fun normalizeOneOrMany(x) = x match {
  case is Array -> x
  case is Null -> []
  else -> [x]
}
---
normalizeOneOrMany(payload.orders) map { id: $.id, status: upper($.status default "UNKNOWN") }`
  },
  {
    item_id: 'INV-DW-003',
    item_type: 'dw-snippet',
    title: 'JSON Array → XML Repeated Elements',
    description: 'The single-root + dynamic-object wrapping pattern every XML integration eventually needs.',
    unlocked_by: 'BOSS-04',
    unlock_hint: 'Defeat the Weave Lich (Chapter 4 boss)',
    content: `%dw 2.0
output application/xml writeDeclaration=true
---
{
  Orders: {
    (payload map {
      Order: {
        "@id": $.id,
        customer: $.customer,
        total: $.total as String {format: "#.00"}
      }
    })
  }
}`
  },
  {
    item_id: 'INV-DW-004',
    item_type: 'dw-snippet',
    title: 'PII Masking Module',
    description: 'Redaction functions for logs and prompts: mask emails, cards, phones. Use before ANY logging of payloads.',
    unlocked_by: 'BOSS-07',
    unlock_hint: 'Defeat the Sentinel Prime (Chapter 7 boss)',
    content: `%dw 2.0
output application/json
fun maskEmail(e: String) =
  (e splitBy "@") match {
    case parts if sizeOf(parts) == 2 -> (parts[0][0 to 1] default "**") ++ "***@" ++ parts[1]
    else -> "***"
  }
fun maskCard(c: String) = "**** **** **** " ++ c[-4 to -1]
fun maskPhone(p: String) = p replace /\\d(?=\\d{4})/ with "*"
---
payload update {
  case .email if ($ is String) -> maskEmail($)
  case .cardNumber if ($ is String) -> maskCard($)
  case .phone if ($ is String) -> maskPhone($)
}`
  },
  {
    item_id: 'INV-DW-005',
    item_type: 'dw-snippet',
    title: 'Array Diff (Added/Removed/Changed)',
    description: 'Compare two datasets by key — the delta-sync building block for any reconciliation job.',
    unlocked_by: 'DW-SQ1',
    unlock_hint: 'Complete the Transformation Gauntlet side quest (Chapter 4)',
    content: `%dw 2.0
output application/json
var oldByKey = vars.old groupBy $.id
var newByKey = payload groupBy $.id
---
{
  added: payload filter (oldByKey[$.id] == null),
  removed: vars.old filter (newByKey[$.id] == null),
  changed: payload filter ((item) ->
    oldByKey[item.id] != null and oldByKey[item.id][0] != item)
}`
  },
  {
    item_id: 'INV-FLOW-001',
    item_type: 'flow-template',
    title: 'Reliable Acquisition Skeleton',
    description: 'Persist-first intake: accept → validate → durable queue → 202. The reliability pattern as ready-to-paste XML.',
    unlocked_by: 'ERR-004',
    unlock_hint: 'Complete the Async Reliability concept in Chapter 6',
    content: `<flow name="order-intake">
  <http:listener config-ref="api-httpListenerConfig" path="/orders" allowedMethods="POST"/>
  <ee:transform doc:name="validate-or-raise">
    <ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
if (payload.orderId == null or payload.amount == null)
  (dw::Runtime::fail("APP:VALIDATION - orderId and amount required"))
else payload]]></ee:set-payload></ee:message>
  </ee:transform>
  <vm:publish config-ref="vm-config" queueName="orders-q"/> <!-- persistent queue -->
  <ee:transform doc:name="202-response">
    <ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ accepted: true, correlationId: correlationId }]]></ee:set-payload></ee:message>
    <ee:variables><ee:set-variable variableName="httpStatus">202</ee:set-variable></ee:variables>
  </ee:transform>
  <error-handler>
    <on-error-propagate type="APP:VALIDATION">
      <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ error: "VALIDATION_FAILED", detail: error.description }]]></ee:set-payload></ee:message></ee:transform>
    </on-error-propagate>
  </error-handler>
</flow>`
  },
  {
    item_id: 'INV-FLOW-002',
    item_type: 'flow-template',
    title: 'Scatter-Gather Partial Success',
    description: 'Aggregate from N backends, tolerate individual failures, report degraded status — production dashboard pattern.',
    unlocked_by: 'BOSS-03',
    unlock_hint: 'Defeat the Router King (Chapter 3 boss)',
    content: `<flow name="aggregate-profile">
  <http:listener config-ref="api-httpListenerConfig" path="/profile/{id}"/>
  <scatter-gather>
    <route>
      <try>
        <http:request config-ref="crm" path="/customers/{id}"/>
        <error-handler><on-error-continue>
          <set-payload value='#[output application/json --- {status: "degraded", source: "crm"}]'/>
        </on-error-continue></error-handler>
      </try>
    </route>
    <route>
      <try>
        <http:request config-ref="billing" path="/invoices/{id}"/>
        <error-handler><on-error-continue>
          <set-payload value='#[output application/json --- {status: "degraded", source: "billing"}]'/>
        </on-error-continue></error-handler>
      </try>
    </route>
  </scatter-gather>
  <ee:transform>
    <ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
var results = payload pluck $.payload
---
{
  data: results,
  degraded: results filter ($.status == "degraded") map $.source,
  status: if (isEmpty(results filter ($.status == "degraded"))) "FULL" else "PARTIAL"
}]]></ee:set-payload></ee:message>
  </ee:transform>
</flow>`
  },
  {
    item_id: 'INV-FLOW-003',
    item_type: 'flow-template',
    title: 'Watermark Sync Skeleton',
    description: 'Scheduler + Object Store watermark for incremental sync from any timestamped source. Persist AFTER success.',
    unlocked_by: 'CON-SQ2',
    unlock_hint: 'Complete the Watermark Master side quest (Chapter 5)',
    content: `<flow name="incremental-sync">
  <scheduler><scheduling-strategy><fixed-frequency frequency="5" timeUnit="MINUTES"/></scheduling-strategy></scheduler>
  <os:retrieve key="watermark" objectStore="sync-os" target="wm">
    <os:default-value>1970-01-01T00:00:00Z</os:default-value>
  </os:retrieve>
  <db:select config-ref="db">
    <db:sql>SELECT * FROM orders WHERE updated_at &gt; :wm ORDER BY updated_at</db:sql>
    <db:input-parameters>#[{wm: vars.wm}]</db:input-parameters>
  </db:select>
  <choice>
    <when expression="#[not isEmpty(payload)]">
      <set-variable variableName="newWm" value="#[max(payload map $.updated_at)]"/>
      <!-- process records (publish/transform/load) -->
      <flow-ref name="process-records"/>
      <!-- persist watermark ONLY after downstream success -->
      <os:store key="watermark" objectStore="sync-os">
        <os:value>#[vars.newWm]</os:value>
      </os:store>
    </when>
  </choice>
</flow>`
  },
  {
    item_id: 'INV-ERR-001',
    item_type: 'error-pattern',
    title: 'RFC-7807 Global Error Handler',
    description: 'Org-standard problem+json error contract: typed handlers mapping to correct statuses with correlationId echo.',
    unlocked_by: 'ERR-SQ2',
    unlock_hint: 'Complete the Error Contract Architect side quest (Chapter 6)',
    content: `<error-handler name="global-error-handler">
  <on-error-propagate type="APP:VALIDATION">
    <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ "type": "urn:acme:validation", "title": "Validation failed", "status": 400,
  "detail": error.description, "correlationId": correlationId }]]></ee:set-payload></ee:message>
    <ee:variables><ee:set-variable variableName="httpStatus">400</ee:set-variable></ee:variables></ee:transform>
  </on-error-propagate>
  <on-error-propagate type="HTTP:NOT_FOUND">
    <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ "type": "urn:acme:not-found", "title": "Resource not found", "status": 404,
  "detail": error.description, "correlationId": correlationId }]]></ee:set-payload></ee:message>
    <ee:variables><ee:set-variable variableName="httpStatus">404</ee:set-variable></ee:variables></ee:transform>
  </on-error-propagate>
  <on-error-propagate type="HTTP:TIMEOUT">
    <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ "type": "urn:acme:upstream-timeout", "title": "Upstream timeout", "status": 504,
  "detail": "Dependency exceeded its budget", "correlationId": correlationId }]]></ee:set-payload></ee:message>
    <ee:variables><ee:set-variable variableName="httpStatus">504</ee:set-variable></ee:variables></ee:transform>
  </on-error-propagate>
  <on-error-propagate type="HTTP:CONNECTIVITY, MULE:RETRY_EXHAUSTED">
    <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ "type": "urn:acme:upstream-unavailable", "title": "Upstream unavailable", "status": 502,
  "detail": error.errorType.identifier, "correlationId": correlationId }]]></ee:set-payload></ee:message>
    <ee:variables><ee:set-variable variableName="httpStatus">502</ee:set-variable></ee:variables></ee:transform>
  </on-error-propagate>
  <on-error-propagate type="ANY">
    <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{ "type": "urn:acme:internal", "title": "Internal error", "status": 500,
  "detail": "Unexpected error", "correlationId": correlationId }]]></ee:set-payload></ee:message>
    <ee:variables><ee:set-variable variableName="httpStatus">500</ee:set-variable></ee:variables></ee:transform>
  </on-error-propagate>
</error-handler>`
  },
  {
    item_id: 'INV-ERR-002',
    item_type: 'error-pattern',
    title: 'Idempotent Consumer with DLQ Lifecycle',
    description: 'MANUAL ack + DB-constraint idempotency + redelivery cap + poison routing — the complete at-least-once consumer.',
    unlocked_by: 'BOSS-06',
    unlock_hint: 'Defeat the Chaos Knight (Chapter 6 boss)',
    content: `<flow name="order-consumer" maxConcurrency="4">
  <anypoint-mq:subscriber config-ref="amq" destination="orders-q"
      acknowledgementMode="MANUAL"/>
  <try>
    <!-- idempotency: unique constraint on event_id is the arbiter -->
    <db:insert config-ref="db">
      <db:sql>INSERT INTO processed_events(event_id, payload, processed_at)
              VALUES (:id, :body, CURRENT_TIMESTAMP)</db:sql>
      <db:input-parameters>#[{id: payload.eventId, body: write(payload, "application/json")}]</db:input-parameters>
    </db:insert>
    <flow-ref name="process-order"/>
    <anypoint-mq:ack ackToken="#[attributes.ackToken]" config-ref="amq"/>
    <error-handler>
      <on-error-continue type="DB:QUERY_EXECUTION" when="#[error.description contains 'unique']">
        <!-- duplicate: already processed — ack and move on -->
        <logger level="INFO" message="#['Duplicate event absorbed: ' ++ payload.eventId]"/>
        <anypoint-mq:ack ackToken="#[attributes.ackToken]" config-ref="amq"/>
      </on-error-continue>
      <on-error-propagate type="ANY">
        <!-- nack → redelivery; broker maxRedelivery routes to DLQ -->
        <anypoint-mq:nack ackToken="#[attributes.ackToken]" config-ref="amq"/>
      </on-error-propagate>
    </error-handler>
  </try>
</flow>

<flow name="dlq-monitor">
  <anypoint-mq:subscriber config-ref="amq" destination="orders-dlq"/>
  <logger level="ERROR" message="#['DEAD LETTER: ' ++ write(payload, 'application/json')]"/>
  <!-- alert + persist for triage/replay -->
</flow>`
  },
  {
    item_id: 'INV-RAML-001',
    item_type: 'raml-fragment',
    title: 'Pageable Trait + Error Type Library',
    description: 'Exchange-ready RAML library: pagination trait, standard error responses, base types — the governance starter kit.',
    unlocked_by: 'API-SQ1',
    unlock_hint: 'Complete the Fragment Forge side quest (Chapter 2)',
    content: `#%RAML 1.0 Library
# acme-common.raml — publish to Exchange as a library asset
types:
  ErrorResponse:
    properties:
      type: string
      title: string
      status: integer
      detail?: string
      correlationId: string
    example:
      type: "urn:acme:not-found"
      title: "Resource not found"
      status: 404
      correlationId: "abc-123"
traits:
  pageable:
    queryParameters:
      page:
        type: integer
        minimum: 1
        default: 1
      size:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
    responses:
      200:
        headers:
          X-Total-Count: integer
  standardErrors:
    responses:
      400:
        body:
          application/json:
            type: ErrorResponse
      404:
        body:
          application/json:
            type: ErrorResponse
      500:
        body:
          application/json:
            type: ErrorResponse`
  },
  {
    item_id: 'INV-RAML-002',
    item_type: 'raml-fragment',
    title: 'Secured Resource Template',
    description: 'OAuth2 security scheme + secured resourceType showing securedBy usage — copy into any new spec.',
    unlocked_by: 'BOSS-02',
    unlock_hint: 'Defeat the Spec Wraith (Chapter 2 boss)',
    content: `#%RAML 1.0
title: Orders API
version: v1
mediaType: application/json
securitySchemes:
  oauth2:
    type: OAuth 2.0
    describedBy:
      headers:
        Authorization:
          description: Bearer <access_token>
      responses:
        401:
          description: Missing/invalid/expired token
        403:
          description: Token lacks required scope
    settings:
      authorizationUri: https://auth.acme.com/oauth/authorize
      accessTokenUri: https://auth.acme.com/oauth/token
      authorizationGrants: [client_credentials]
securedBy: [oauth2]
/orders:
  get:
    description: List orders (requires read:orders scope)
  post:
    description: Create order (requires write:orders scope)
  /{orderId}:
    get:
      responses:
        200:
        404:`
  },
  {
    item_id: 'INV-FLOW-004',
    item_type: 'flow-template',
    title: 'Poor Man\'s Circuit Breaker',
    description: 'Object Store failure counter with open/half-open semantics — fail fast when a dependency is sick.',
    unlocked_by: 'BOSS-11',
    unlock_hint: 'Defeat the Oracle of Patterns (Chapter 11 boss)',
    content: `<sub-flow name="call-with-breaker">
  <os:retrieve key="cb-failures" objectStore="cb-os" target="failures">
    <os:default-value>0</os:default-value>
  </os:retrieve>
  <os:retrieve key="cb-opened-at" objectStore="cb-os" target="openedAt">
    <os:default-value>0</os:default-value>
  </os:retrieve>
  <choice>
    <!-- OPEN: fail fast unless cool-down elapsed (half-open probe) -->
    <when expression="#[(vars.failures as Number >= 5) and ((now() as Number) - (vars.openedAt as Number) < 30)]">
      <raise-error type="APP:CIRCUIT_OPEN" description="Dependency circuit open — failing fast"/>
    </when>
    <otherwise>
      <try>
        <http:request config-ref="fragile-api" path="/data" responseTimeout="3000"/>
        <os:store key="cb-failures" objectStore="cb-os"><os:value>0</os:value></os:store>
        <error-handler>
          <on-error-propagate type="HTTP:TIMEOUT, HTTP:CONNECTIVITY">
            <os:store key="cb-failures" objectStore="cb-os">
              <os:value>#[(vars.failures as Number) + 1]</os:value>
            </os:store>
            <os:store key="cb-opened-at" objectStore="cb-os">
              <os:value>#[now() as Number]</os:value>
            </os:store>
          </on-error-propagate>
        </error-handler>
      </try>
    </otherwise>
  </choice>
</sub-flow>`
  },
  {
    item_id: 'INV-DW-006',
    item_type: 'dw-snippet',
    title: 'LLM Output Schema Guard',
    description: 'Validate model JSON output before it touches downstream systems — the AI-era input validation pattern.',
    unlocked_by: 'BOSS-13',
    unlock_hint: 'Defeat the Frontier Sovereign (Chapter 13 boss)',
    content: `%dw 2.0
output application/json
import * from dw::Runtime
var parsed = try(() -> read(payload.completion, "application/json"))
var valid = parsed.success
  and parsed.result.category? and (parsed.result.category is String)
  and parsed.result.priority? and (["LOW","MEDIUM","HIGH"] contains parsed.result.priority)
  and parsed.result.summary? and (sizeOf(parsed.result.summary default "") <= 500)
---
if (valid)
  { ok: true, data: parsed.result }
else
  { ok: false,
    reason: if (parsed.success) "SCHEMA_VIOLATION" else "NOT_JSON",
    raw: payload.completion[0 to 200] }
// Caller: if (!ok) → bounded retry with reason fed back to the model, then fallback`
  },
  {
    item_id: 'INV-FLOW-005',
    item_type: 'flow-template',
    title: 'Batch ETL Skeleton',
    description: 'Validate → enrich → aggregate bulk-load with reject routing and reconciled On Complete — the Chapter 6 boss pattern.',
    unlocked_by: 'DGN-001',
    unlock_hint: 'Clear The Sunken Data Vault dungeon',
    content: `<flow name="nightly-etl">
  <scheduler><scheduling-strategy><cron expression="0 0 2 * * ?"/></scheduling-strategy></scheduler>
  <file:read config-ref="files" path="inbound/orders.csv"/>
  <batch:job jobName="orders-etl" maxFailedRecords="-1" blockSize="100">
    <batch:process-records>
      <batch:step name="validate">
        <ee:transform><ee:message><ee:set-payload><![CDATA[%dw 2.0
output application/json
---
if (payload.orderId == null) dw::Runtime::fail("missing orderId") else payload]]></ee:set-payload></ee:message></ee:transform>
      </batch:step>
      <batch:step name="enrich" acceptPolicy="NO_FAILURES">
        <http:request config-ref="enrichment" path="/customers/{id}" target="customer"/>
      </batch:step>
      <batch:step name="load" acceptPolicy="NO_FAILURES">
        <batch:aggregator size="200">
          <db:bulk-insert config-ref="db">
            <db:sql>INSERT INTO orders_stage(order_id, customer_name) VALUES (:id, :name)</db:sql>
            <db:bulk-input-parameters>#[payload map {id: $.orderId, name: $.customer.name}]</db:bulk-input-parameters>
          </db:bulk-insert>
        </batch:aggregator>
      </batch:step>
      <batch:step name="rejects" acceptPolicy="ONLY_FAILURES">
        <logger level="WARN" message="#['REJECT: ' ++ write(payload, 'application/json')]"/>
      </batch:step>
    </batch:process-records>
    <batch:on-complete>
      <logger level="INFO" message="#['ETL done. total=' ++ payload.totalRecords ++
        ' ok=' ++ payload.successfulRecords ++ ' failed=' ++ payload.failedRecords]"/>
    </batch:on-complete>
  </batch:job>
</flow>`
  }
]
