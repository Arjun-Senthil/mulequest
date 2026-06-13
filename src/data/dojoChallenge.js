/**
 * DataWeave Dojo — Curated challenge bank.
 * Each challenge: id, title, difficulty, topic, description, inputPayload (string),
 * inputMimeType, outputMimeType, hints[], solution (DW script string), expectedOutput (string), xp
 */

export const DOJO_CHALLENGES = [
  // ─── BASICS ────────────────────────────────────────────────────────────────
  {
    id: 'DJO-001',
    title: 'Hello, DataWeave',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'Transform the input JSON into a greeting object. Add a `greeting` field with value `"Hello, <name>!"` and a `ts` field with today\'s date as a string in `yyyy-MM-dd` format.',
    inputPayload: `{
  "name": "Arjun",
  "role": "MuleSoft Developer"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use string concatenation with the ++ operator',
      'now() returns the current DateTime — coerce it to String with a format'
    ],
    solution: `%dw 2.0
output application/json
---
{
  greeting: "Hello, " ++ payload.name ++ "!",
  role: payload.role,
  ts: now() as String {format: "yyyy-MM-dd"}
}`,
    expectedOutput: `{
  "greeting": "Hello, Arjun!",
  "role": "MuleSoft Developer",
  "ts": "<today's date>"
}`,
    xp: 20
  },
  {
    id: 'DJO-002',
    title: 'Null-safe Access',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'Some fields may be absent. Return an object with `city` (default "UNKNOWN") and `zipCode` (default "000000"). Do NOT throw if the fields are missing.',
    inputPayload: `{
  "name": "John",
  "address": {
    "street": "123 Main St"
  }
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use the ?. null-safe selector to navigate optional nested fields',
      'Chain with the `default` operator for fallback values'
    ],
    solution: `%dw 2.0
output application/json
---
{
  name: payload.name,
  city: payload.?address.?city default "UNKNOWN",
  zipCode: payload.?address.?zipCode default "000000"
}`,
    expectedOutput: `{
  "name": "John",
  "city": "UNKNOWN",
  "zipCode": "000000"
}`,
    xp: 20
  },
  {
    id: 'DJO-003',
    title: 'Type Coercion',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'The input has `amount` as a String and `date` in `dd/MM/yyyy` format. Output `amount` as a Number and `date` as `yyyy-MM-dd`.',
    inputPayload: `{
  "orderId": "ORD-001",
  "amount": "1500.75",
  "date": "15/01/2024"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use `as Number` to coerce a string to number',
      'Use `as Date {format: ...}` then `as String {format: ...}` for date reformatting'
    ],
    solution: `%dw 2.0
output application/json
---
{
  orderId: payload.orderId,
  amount: payload.amount as Number,
  date: payload.date as Date {format: "dd/MM/yyyy"} as String {format: "yyyy-MM-dd"}
}`,
    expectedOutput: `{
  "orderId": "ORD-001",
  "amount": 1500.75,
  "date": "2024-01-15"
}`,
    xp: 25
  },

  // ─── COLLECTIONS ───────────────────────────────────────────────────────────
  {
    id: 'DJO-004',
    title: 'Filter & Map',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'From the orders array, keep only orders where `status` is `"COMPLETED"` and `amount > 100`. Return each as `{id, amount, region}` (drop other fields).',
    inputPayload: `[
  {"id": "O1", "amount": 250, "status": "COMPLETED", "region": "APAC", "customer": "Alice"},
  {"id": "O2", "amount": 50,  "status": "COMPLETED", "region": "EMEA", "customer": "Bob"},
  {"id": "O3", "amount": 300, "status": "PENDING",   "region": "APAC", "customer": "Carol"},
  {"id": "O4", "amount": 150, "status": "COMPLETED", "region": "US",   "customer": "Dave"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Chain filter then map',
      'filter keeps items where the lambda returns true',
      'map transforms each item — use only the fields you need'
    ],
    solution: `%dw 2.0
output application/json
---
payload
  filter (o) -> o.status == "COMPLETED" and o.amount > 100
  map (o) -> { id: o.id, amount: o.amount, region: o.region }`,
    expectedOutput: `[
  {"id": "O1", "amount": 250, "region": "APAC"},
  {"id": "O4", "amount": 150, "region": "US"}
]`,
    xp: 30
  },
  {
    id: 'DJO-005',
    title: 'groupBy + Revenue Summary',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Group orders by `region`. For each region return `{region, orderCount, totalRevenue}`. Sort the output array by `totalRevenue` descending.',
    inputPayload: `[
  {"id": "O1", "region": "APAC", "amount": 500},
  {"id": "O2", "region": "EMEA", "amount": 200},
  {"id": "O3", "region": "APAC", "amount": 300},
  {"id": "O4", "region": "US",   "amount": 800},
  {"id": "O5", "region": "EMEA", "amount": 600},
  {"id": "O6", "region": "US",   "amount": 150}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'groupBy $.region produces {APAC: [...], EMEA: [...], US: [...]}',
      'Use mapObject to iterate key-value pairs, then pluck or valuesOf to get an array',
      'sum() sums a numeric array — use it with map to extract amounts first',
      'orderBy with - before the key sorts descending'
    ],
    solution: `%dw 2.0
output application/json
---
(payload groupBy $.region)
  mapObject (orders, region) -> {
    (region): {
      region: region,
      orderCount: sizeOf(orders),
      totalRevenue: sum(orders map $.amount)
    }
  }
  pluck $
  orderBy -$.totalRevenue`,
    expectedOutput: `[
  {"region": "US",   "orderCount": 2, "totalRevenue": 950},
  {"region": "EMEA", "orderCount": 2, "totalRevenue": 800},
  {"region": "APAC", "orderCount": 2, "totalRevenue": 800}
]`,
    xp: 50
  },
  {
    id: 'DJO-006',
    title: 'flatMap: All Line Items',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Each order has a nested `items` array. Return a flat list of ALL line items across all orders, with `orderId` added to each item.',
    inputPayload: `[
  {
    "orderId": "O1",
    "items": [
      {"sku": "A1", "qty": 2, "price": 10},
      {"sku": "A2", "qty": 1, "price": 25}
    ]
  },
  {
    "orderId": "O2",
    "items": [
      {"sku": "B1", "qty": 3, "price": 5}
    ]
  }
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'flatMap = map then flatten one level',
      'Inside the flatMap lambda, map the items array adding orderId to each'
    ],
    solution: `%dw 2.0
output application/json
---
payload flatMap (order) ->
  order.items map (item) -> {
    orderId: order.orderId,
    sku: item.sku,
    qty: item.qty,
    price: item.price,
    lineTotal: item.qty * item.price
  }`,
    expectedOutput: `[
  {"orderId": "O1", "sku": "A1", "qty": 2, "price": 10, "lineTotal": 20},
  {"orderId": "O1", "sku": "A2", "qty": 1, "price": 25, "lineTotal": 25},
  {"orderId": "O2", "sku": "B1", "qty": 3, "price": 5,  "lineTotal": 15}
]`,
    xp: 40
  },
  {
    id: 'DJO-007',
    title: 'reduce: Running Total',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Use `reduce` to build a running total array. Each item in the output should have `{txnId, amount, runningTotal}` where `runningTotal` is the cumulative sum up to that transaction.',
    inputPayload: `[
  {"txnId": "T1", "amount": 100},
  {"txnId": "T2", "amount": 250},
  {"txnId": "T3", "amount": 75},
  {"txnId": "T4", "amount": 400}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'reduce takes (accumulator, current) -> newAccumulator',
      'Initialize the accumulator as {total: 0, items: []}',
      'Each step: add current.amount to total, append {txnId, amount, runningTotal: newTotal} to items',
      'After reduce, return the .items from the final accumulator'
    ],
    solution: `%dw 2.0
output application/json
---
(payload reduce (txn, acc = {total: 0, items: []}) ->
  do {
    var newTotal = acc.total + txn.amount
    ---
    {
      total: newTotal,
      items: acc.items + [{
        txnId: txn.txnId,
        amount: txn.amount,
        runningTotal: newTotal
      }]
    }
  }
).items`,
    expectedOutput: `[
  {"txnId": "T1", "amount": 100, "runningTotal": 100},
  {"txnId": "T2", "amount": 250, "runningTotal": 350},
  {"txnId": "T3", "amount": 75,  "runningTotal": 425},
  {"txnId": "T4", "amount": 400, "runningTotal": 825}
]`,
    xp: 60
  },

  // ─── MULTI-FORMAT ──────────────────────────────────────────────────────────
  {
    id: 'DJO-008',
    title: 'JSON → XML',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'Convert the JSON order to XML. Root element must be `<Order>`. Each item in `items` array becomes an `<Item>` child element. Amount must be formatted with 2 decimal places.',
    inputPayload: `{
  "orderId": "ORD-042",
  "customer": "Arjun",
  "amount": 1500.5,
  "items": [
    {"sku": "SKU-1", "qty": 2},
    {"sku": "SKU-2", "qty": 1}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/xml',
    hints: [
      'XML output uses application/xml in the output directive',
      'For repeated XML elements (items array), wrap in a parent element: `Items: { Item: payload.items map {...} }`',
      'Use `as String {format: "0.00"}` for number formatting'
    ],
    solution: `%dw 2.0
output application/xml
---
{
  Order: {
    OrderId: payload.orderId,
    Customer: payload.customer,
    Amount: payload.amount as String {format: "0.00"},
    Items: {
      Item: payload.items map (item) -> {
        Sku: item.sku,
        Qty: item.qty
      }
    }
  }
}`,
    expectedOutput: `<?xml version='1.0' encoding='UTF-8'?>
<Order>
  <OrderId>ORD-042</OrderId>
  <Customer>Arjun</Customer>
  <Amount>1500.50</Amount>
  <Items>
    <Item><Sku>SKU-1</Sku><Qty>2</Qty></Item>
    <Item><Sku>SKU-2</Sku><Qty>1</Qty></Item>
  </Items>
</Order>`,
    xp: 45
  },
  {
    id: 'DJO-009',
    title: 'CSV → JSON with Aggregation',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'Parse CSV sales data and return a JSON summary: total rows, total revenue, and the top customer by revenue.',
    inputPayload: `customer,region,amount
Alice,APAC,500
Bob,EMEA,300
Alice,APAC,200
Carol,US,800
Bob,EMEA,100`,
    inputMimeType: 'application/csv',
    outputMimeType: 'application/json',
    hints: [
      'CSV input is automatically parsed as an array of objects when inputMimeType is application/csv',
      'Use groupBy $.customer, then mapObject to sum per customer',
      'For top customer, pluck the grouped object and orderBy -$.revenue, then [0]'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var byCustomer = payload groupBy $.customer mapObject (rows, customer) -> {
    (customer): sum(rows map ($.amount as Number))
  }
  var ranked = byCustomer pluck {customer: $$, revenue: $} orderBy -$.revenue
  ---
  {
    totalRows: sizeOf(payload),
    totalRevenue: sum(payload map ($.amount as Number)),
    topCustomer: ranked[0]
  }
}`,
    expectedOutput: `{
  "totalRows": 5,
  "totalRevenue": 1900,
  "topCustomer": {"customer": "Carol", "revenue": 800}
}`,
    xp: 55
  },
  {
    id: 'DJO-010',
    title: 'XML → JSON with Attributes',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'Convert the XML invoice (with XML attributes) to a clean JSON object. Extract the `id` attribute from `<Invoice>` and the `code` attribute from each `<Product>`.',
    inputPayload: `<?xml version="1.0"?>
<Invoice id="INV-001" currency="USD">
  <Customer>Arjun</Customer>
  <Products>
    <Product code="P1" qty="3">Widget A</Product>
    <Product code="P2" qty="1">Widget B</Product>
  </Products>
</Invoice>`,
    inputMimeType: 'application/xml',
    outputMimeType: 'application/json',
    hints: [
      'XML attributes are accessed with .@attributeName',
      'payload.Invoice.@id gets the id attribute of the root Invoice element',
      'For repeated XML elements, DataWeave returns an array automatically'
    ],
    solution: `%dw 2.0
output application/json
---
{
  invoiceId: payload.Invoice.@id,
  currency: payload.Invoice.@currency,
  customer: payload.Invoice.Customer,
  products: payload.Invoice.Products.*Product map (p) -> {
    code: p.@code,
    qty: p.@qty as Number,
    name: p
  }
}`,
    expectedOutput: `{
  "invoiceId": "INV-001",
  "currency": "USD",
  "customer": "Arjun",
  "products": [
    {"code": "P1", "qty": 3, "name": "Widget A"},
    {"code": "P2", "qty": 1, "name": "Widget B"}
  ]
}`,
    xp: 50
  },

  // ─── PATTERNS ──────────────────────────────────────────────────────────────
  {
    id: 'DJO-011',
    title: 'match/case: Payment Classifier',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Use `match` to classify each payment. Rules: credit amount > 1000 → "HIGH_CREDIT", credit ≤ 1000 → "CREDIT", debit amount > 500 → "HIGH_DEBIT", debit → "DEBIT", anything else → "UNKNOWN".',
    inputPayload: `[
  {"id": "P1", "type": "credit", "amount": 1500},
  {"id": "P2", "type": "credit", "amount": 200},
  {"id": "P3", "type": "debit",  "amount": 750},
  {"id": "P4", "type": "debit",  "amount": 100},
  {"id": "P5", "type": "refund", "amount": 50}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use map over the array',
      'Inside map, use match on each payment object',
      'Case arms with guards: `case { type: "credit", amount: a } if a > 1000 -> ...`'
    ],
    solution: `%dw 2.0
output application/json
---
payload map (p) -> {
  id: p.id,
  category: p match {
    case { type: "credit", amount: a } if a > 1000 -> "HIGH_CREDIT"
    case { type: "credit" }                         -> "CREDIT"
    case { type: "debit",  amount: a } if a > 500  -> "HIGH_DEBIT"
    case { type: "debit" }                          -> "DEBIT"
    else                                            -> "UNKNOWN"
  }
}`,
    expectedOutput: `[
  {"id": "P1", "category": "HIGH_CREDIT"},
  {"id": "P2", "category": "CREDIT"},
  {"id": "P3", "category": "HIGH_DEBIT"},
  {"id": "P4", "category": "DEBIT"},
  {"id": "P5", "category": "UNKNOWN"}
]`,
    xp: 50
  },
  {
    id: 'DJO-012',
    title: 'Dynamic Keys: Config Map',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Convert a flat config array `[{key, value}]` into a single config object where each entry\'s `key` becomes a dynamic object key.',
    inputPayload: `[
  {"key": "timeout",  "value": "30"},
  {"key": "retries",  "value": "3"},
  {"key": "endpoint", "value": "https://api.example.com"},
  {"key": "enabled",  "value": "true"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use `{(payload map { ($.key): $.value })}` to build an object from an array',
      'The outer `{}` merges all single-key objects from the map into one object',
      'The parens around `$.key` make it dynamic'
    ],
    solution: `%dw 2.0
output application/json
---
{(payload map { ($.key): $.value })}`,
    expectedOutput: `{
  "timeout": "30",
  "retries": "3",
  "endpoint": "https://api.example.com",
  "enabled": "true"
}`,
    xp: 45
  },
  {
    id: 'DJO-013',
    title: 'do block: Discount Calculator',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Use a `do` block with local variables to calculate a discounted price. Discount rules: GOLD tier → 20%, SILVER → 10%, else → 5%. Also add `taxAmount` (18% of discounted price) and `finalAmount`.',
    inputPayload: `{
  "productId": "PRD-001",
  "basePrice": 1000,
  "tier": "GOLD"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      '`do { var x = ..., var y = ... --- expression }` defines local variables',
      'Use an if/else chain or match to compute the discount rate',
      'Remember: do block needs `---` separating declarations from output'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var discountRate = payload.tier match {
    case "GOLD"   -> 0.20
    case "SILVER" -> 0.10
    else          -> 0.05
  }
  var discountedPrice = payload.basePrice * (1 - discountRate)
  var tax = discountedPrice * 0.18
  ---
  {
    productId: payload.productId,
    basePrice: payload.basePrice,
    tier: payload.tier,
    discountPct: discountRate * 100,
    discountedPrice: discountedPrice,
    taxAmount: tax,
    finalAmount: discountedPrice + tax
  }
}`,
    expectedOutput: `{
  "productId": "PRD-001",
  "basePrice": 1000,
  "tier": "GOLD",
  "discountPct": 20,
  "discountedPrice": 800,
  "taxAmount": 144,
  "finalAmount": 944
}`,
    xp: 55
  },
  {
    id: 'DJO-014',
    title: 'try(): Defensive Array Transform',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Some records have a malformed `amount` (non-numeric string) or invalid `date` format. Use `try()` so ALL records are processed. Bad records get `_error: true` and the error message instead of crashing.',
    inputPayload: `[
  {"id": "R1", "amount": "150.00", "date": "2024-01-15"},
  {"id": "R2", "amount": "not-a-number", "date": "2024-01-16"},
  {"id": "R3", "amount": "300.50", "date": "invalid-date"},
  {"id": "R4", "amount": "200.00", "date": "2024-01-18"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'try(() -> expr) returns {success: true, result: ...} or {success: false, error: {message: ...}}',
      'Use match after try() to handle both cases',
      'Nest two try() calls or one combined try() for both amount and date'
    ],
    solution: `%dw 2.0
output application/json
---
payload map (r) ->
  try(() -> {
    id: r.id,
    amount: r.amount as Number,
    date: r.date as Date {format: "yyyy-MM-dd"} as String {format: "dd-MMM-yyyy"}
  }) match {
    case { success: true  } -> $.result
    case { success: false } -> { id: r.id, _error: true, reason: $.error.message, raw: r }
  }`,
    expectedOutput: `[
  {"id": "R1", "amount": 150.00, "date": "15-Jan-2024"},
  {"id": "R2", "_error": true, "reason": "...", "raw": {...}},
  {"id": "R3", "_error": true, "reason": "...", "raw": {...}},
  {"id": "R4", "amount": 200.00, "date": "18-Jan-2024"}
]`,
    xp: 70
  },
  {
    id: 'DJO-015',
    title: 'Conditional Key Inclusion',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Build a user profile object. Include `middleName` ONLY if it is not null. Include `address` ONLY if the `includeAddress` flag is true. Omit, don\'t null-fill.',
    inputPayload: `{
  "firstName": "Arjun",
  "middleName": null,
  "lastName": "Senthil",
  "email": "arjun@example.com",
  "includeAddress": false,
  "address": {"city": "Bangalore", "country": "India"}
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Conditional key: `(key: value) if condition`',
      'The parens wrap the ENTIRE key-value pair',
      'Check `!= null` for the middleName condition'
    ],
    solution: `%dw 2.0
output application/json
---
{
  firstName: payload.firstName,
  (middleName: payload.middleName) if payload.middleName != null,
  lastName: payload.lastName,
  email: payload.email,
  (address: payload.address) if payload.includeAddress
}`,
    expectedOutput: `{
  "firstName": "Arjun",
  "lastName": "Senthil",
  "email": "arjun@example.com"
}`,
    xp: 40
  },
  {
    id: 'DJO-016',
    title: 'String: Regex & Masking',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Mask the email (keep first 2 chars of local part, replace rest before @ with ***). Extract the domain. Capitalize the name. Use string functions, not manual split.',
    inputPayload: `{
  "name": "arjun senthil",
  "email": "arjun.senthil@example.com"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use `replace /regex/ with replacement` for masking',
      '`substringBefore(email, "@")` gets the local part; `substringAfter` gets domain',
      '`capitalize` or split by space and map upper($..[0]) + $..[1:]'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var localPart = substringBefore(payload.email, "@")
  var domain = substringAfter(payload.email, "@")
  var maskedLocal = localPart[0 to 1] ++ (localPart[2 to -1] replace /[^]/ with "*")
  ---
  {
    name: payload.name splitBy " " map capitalize($) joinBy " ",
    maskedEmail: maskedLocal ++ "@" ++ domain,
    emailDomain: domain
  }
}`,
    expectedOutput: `{
  "name": "Arjun Senthil",
  "maskedEmail": "ar***********@example.com",
  "emailDomain": "example.com"
}`,
    xp: 55
  },
  {
    id: 'DJO-017',
    title: 'update: Nested Enrichment',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Use the `update` operator to enrich a deeply nested order without reconstructing it. Add `processedAt` (now), uppercase the customer name, and set the order status to "PROCESSED".',
    inputPayload: `{
  "orderId": "ORD-100",
  "customer": {
    "name": "alice johnson",
    "tier": "GOLD"
  },
  "order": {
    "status": "pending",
    "amount": 2500,
    "currency": "USD"
  }
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'update uses `case .path.to.field -> newValue` syntax',
      '`$` in the update arm refers to the current field value',
      'Multiple cases in a single update block'
    ],
    solution: `%dw 2.0
output application/json
---
payload update {
  case .customer.name   -> upper($)
  case .order.status    -> "PROCESSED"
  case .order           -> $ ++ { processedAt: now() as String {format: "yyyy-MM-dd'T'HH:mm:ss"} }
}`,
    expectedOutput: `{
  "orderId": "ORD-100",
  "customer": {"name": "ALICE JOHNSON", "tier": "GOLD"},
  "order": {"status": "PROCESSED", "amount": 2500, "currency": "USD", "processedAt": "..."}
}`,
    xp: 65
  },
  {
    id: 'DJO-018',
    title: 'Pivot Table with Dynamic Keys',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Transform the flat metrics array into a pivot table: one object per region, with each metric name as a dynamic key and its value as the value.',
    inputPayload: `[
  {"region": "APAC", "metric": "revenue",    "value": 50000},
  {"region": "APAC", "metric": "orders",     "value": 120},
  {"region": "EMEA", "metric": "revenue",    "value": 35000},
  {"region": "EMEA", "metric": "orders",     "value": 90},
  {"region": "US",   "metric": "revenue",    "value": 80000},
  {"region": "US",   "metric": "orders",     "value": 200}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'groupBy $.region to bucket by region',
      'mapObject to iterate each region\'s rows',
      'For each region, use `{(rows map { ($.metric): $.value })}` to build the dynamic key object'
    ],
    solution: `%dw 2.0
output application/json
---
(payload groupBy $.region)
  mapObject (rows, region) -> {
    (region): {
      region: region,
      (rows map { ($.metric): $.value })
    }
  }
  pluck $`,
    expectedOutput: `[
  {"region": "APAC", "revenue": 50000, "orders": 120},
  {"region": "EMEA", "revenue": 35000, "orders": 90},
  {"region": "US",   "revenue": 80000, "orders": 200}
]`,
    xp: 75
  },
  {
    id: 'DJO-019',
    title: 'Recursive Function: Deep Flatten',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Write a recursive DataWeave function that deep-flattens an arbitrarily nested array into a single flat array.',
    inputPayload: `[1, [2, 3], [4, [5, [6, 7]]], 8]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Define `fun deepFlatten(arr: Array): Array`',
      'Use flatMap: for each item, if it\'s an Array call deepFlatten recursively, else wrap in [item]',
      '`is Array` type guard to check if an item is an array'
    ],
    solution: `%dw 2.0
output application/json

fun deepFlatten(arr: Array): Array =
  arr flatMap (item) ->
    if (item is Array) deepFlatten(item)
    else [item]
---
deepFlatten(payload)`,
    expectedOutput: `[1, 2, 3, 4, 5, 6, 7, 8]`,
    xp: 80
  },
  {
    id: 'DJO-020',
    title: 'Full Pipeline: CSV → JSON Report',
    difficulty: 'advanced',
    topic: 'Multi-Format',
    description: 'The final boss challenge. Parse raw CSV sales data, clean it (handle nulls, coerce types, skip invalid rows using try()), group by region, and produce a JSON report with per-region stats and a global summary.',
    inputPayload: `salesperson,region,amount,date
Alice,APAC,500,2024-01-10
Bob,EMEA,bad_value,2024-01-11
Carol,APAC,300,2024-01-12
Dave,US,800,invalid-date
Eve,EMEA,600,2024-01-14
Frank,APAC,200,2024-01-15`,
    inputMimeType: 'application/csv',
    outputMimeType: 'application/json',
    hints: [
      'First map with try() to parse and coerce each row — mark bad rows',
      'Filter out rows where _error is true (or keep them in a "failed" list)',
      'groupBy $.region on the clean rows, then mapObject for per-region stats',
      'Build a global summary with total, failed count, processed count'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var parsed = payload map (row) ->
    try(() -> {
      salesperson: row.salesperson,
      region: row.region,
      amount: row.amount as Number,
      date: row.date as Date {format: "yyyy-MM-dd"}
    }) match {
      case { success: true  } -> $.result
      case { success: false } -> { _error: true, raw: row }
    }

  var clean = parsed filter !$.?_error
  var failed = parsed filter ($.?_error default false)

  var byRegion = (clean groupBy $.region)
    mapObject (rows, region) -> {
      (region): {
        region: region,
        salesCount: sizeOf(rows),
        totalRevenue: sum(rows map $.amount),
        avgRevenue: (sum(rows map $.amount) / sizeOf(rows)) as Number {format: "0.00"}
      }
    }
    pluck $
  ---
  {
    summary: {
      totalRows: sizeOf(payload),
      processed: sizeOf(clean),
      failed: sizeOf(failed)
    },
    byRegion: byRegion,
    failedRows: failed map $.raw
  }
}`,
    expectedOutput: `{
  "summary": {"totalRows": 6, "processed": 4, "failed": 2},
  "byRegion": [
    {"region": "APAC", "salesCount": 2, "totalRevenue": 700, "avgRevenue": 350},
    ...
  ],
  "failedRows": [...]
}`,
    xp: 100
  },

  // ─── SORTING & DEDUP ───────────────────────────────────────────────────────
  {
    id: 'DJO-021',
    title: 'orderBy: Multi-field Sort',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'Sort the employees first by `department` (ascending), then by `salary` (descending) within each department.',
    inputPayload: `[
  {"name": "Alice", "department": "Engineering", "salary": 90000},
  {"name": "Bob",   "department": "Sales",       "salary": 70000},
  {"name": "Carol", "department": "Engineering", "salary": 110000},
  {"name": "Dave",  "department": "Sales",       "salary": 80000},
  {"name": "Eve",   "department": "Engineering", "salary": 95000}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'orderBy accepts a lambda; prefix with - for descending',
      'Chain two orderBy calls — second sort is applied after the first',
      'First orderBy $.department (asc), then orderBy -$.salary (desc)'
    ],
    solution: `%dw 2.0
output application/json
---
payload
  orderBy $.department
  orderBy (e) -> if (e.department == (payload orderBy $.department)[0].department) -e.salary else e.salary`,
    expectedOutput: `[
  {"name": "Carol", "department": "Engineering", "salary": 110000},
  {"name": "Eve",   "department": "Engineering", "salary": 95000},
  {"name": "Alice", "department": "Engineering", "salary": 90000},
  {"name": "Dave",  "department": "Sales",       "salary": 80000},
  {"name": "Bob",   "department": "Sales",       "salary": 70000}
]`,
    xp: 30
  },
  {
    id: 'DJO-022',
    title: 'distinctBy: Deduplication',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'Remove duplicate products — keep only the first occurrence of each `productId`. Then count how many duplicates were removed.',
    inputPayload: `[
  {"productId": "P1", "name": "Widget A", "price": 10},
  {"productId": "P2", "name": "Widget B", "price": 20},
  {"productId": "P1", "name": "Widget A", "price": 10},
  {"productId": "P3", "name": "Widget C", "price": 30},
  {"productId": "P2", "name": "Widget B", "price": 20}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'distinctBy $.productId keeps the first occurrence of each unique productId',
      'duplicatesRemoved = sizeOf(payload) - sizeOf(deduped)'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var deduped = payload distinctBy $.productId
  ---
  {
    products: deduped,
    totalInput: sizeOf(payload),
    duplicatesRemoved: sizeOf(payload) - sizeOf(deduped)
  }
}`,
    expectedOutput: `{
  "products": [
    {"productId": "P1", "name": "Widget A", "price": 10},
    {"productId": "P2", "name": "Widget B", "price": 20},
    {"productId": "P3", "name": "Widget C", "price": 30}
  ],
  "totalInput": 5,
  "duplicatesRemoved": 2
}`,
    xp: 30
  },
  {
    id: 'DJO-023',
    title: 'max/min/avg on Arrays',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'From the scores array, find the max score, min score, average (rounded to 2 decimal places), and the name of the top scorer.',
    inputPayload: `[
  {"student": "Alice", "score": 88},
  {"student": "Bob",   "score": 95},
  {"student": "Carol", "score": 72},
  {"student": "Dave",  "score": 91},
  {"student": "Eve",   "score": 85}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'max(payload map $.score) gives the maximum value',
      'To find the student with max score: filter where score == maxScore, then [0].student',
      'Round with `as Number {format: "0.00"}`'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var scores = payload map $.score
  var maxScore = max(scores)
  ---
  {
    maxScore: maxScore,
    minScore: min(scores),
    avgScore: (avg(scores)) as Number {format: "0.00"},
    topScorer: (payload filter $.score == maxScore)[0].student
  }
}`,
    expectedOutput: `{
  "maxScore": 95,
  "minScore": 72,
  "avgScore": 86.20,
  "topScorer": "Bob"
}`,
    xp: 30
  },
  {
    id: 'DJO-024',
    title: 'zip: Merge Two Arrays',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'You have two arrays — `keys` and `values` of equal length. Zip them together to create an array of `{key, value}` objects, then convert to a single config object.',
    inputPayload: `{
  "keys": ["host", "port", "timeout", "retries"],
  "values": ["api.example.com", "8080", "30", "3"]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'zip(payload.keys, payload.values) produces [[k1,v1],[k2,v2],...]',
      'Each element of the zipped array is a 2-element array: [key, value]',
      'Use map to convert each pair to {key: pair[0], value: pair[1]}'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var pairs = zip(payload.keys, payload.values)
  ---
  {
    pairs: pairs map { key: $[0], value: $[1] },
    config: {(pairs map { ($[0]): $[1] })}
  }
}`,
    expectedOutput: `{
  "pairs": [
    {"key": "host",    "value": "api.example.com"},
    {"key": "port",    "value": "8080"},
    {"key": "timeout", "value": "30"},
    {"key": "retries", "value": "3"}
  ],
  "config": {
    "host": "api.example.com",
    "port": "8080",
    "timeout": "30",
    "retries": "3"
  }
}`,
    xp: 45
  },
  {
    id: 'DJO-025',
    title: 'intersect & substract',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Given two permission arrays, find: (1) permissions in BOTH (intersection), (2) permissions only in `granted` but NOT in `required` (extra), (3) permissions in `required` but NOT in `granted` (missing).',
    inputPayload: `{
  "required": ["read", "write", "delete", "admin"],
  "granted":  ["read", "write", "execute", "audit"]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'intersect(a, b) returns elements in both arrays',
      'substract(a, b) returns elements in a that are NOT in b',
      'missing = required NOT IN granted = substract(required, granted)'
    ],
    solution: `%dw 2.0
output application/json
---
{
  common:  intersect(payload.required, payload.granted),
  extra:   substract(payload.granted,  payload.required),
  missing: substract(payload.required, payload.granted),
  hasAllRequired: sizeOf(substract(payload.required, payload.granted)) == 0
}`,
    expectedOutput: `{
  "common":  ["read", "write"],
  "extra":   ["execute", "audit"],
  "missing": ["delete", "admin"],
  "hasAllRequired": false
}`,
    xp: 45
  },
  {
    id: 'DJO-026',
    title: 'partition: Split an Array',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Split the transactions into two groups: `passed` (amount >= 0) and `failed` (amount < 0 or null). Use the `partition` function from `dw::core::Arrays`.',
    inputPayload: `[
  {"id": "T1", "amount": 100},
  {"id": "T2", "amount": -50},
  {"id": "T3", "amount": 200},
  {"id": "T4", "amount": null},
  {"id": "T5", "amount": 75}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Import: `import partition from dw::core::Arrays`',
      'partition(array, (item) -> condition) returns {success: [...], failure: [...]}',
      'Handle null amount with: (item.?amount default -1) >= 0'
    ],
    solution: `%dw 2.0
import partition from dw::core::Arrays
output application/json
---
do {
  var result = partition(payload, (t) -> (t.?amount default -1) >= 0)
  ---
  {
    passed:  result.success,
    failed:  result.failure,
    passCount: sizeOf(result.success),
    failCount: sizeOf(result.failure)
  }
}`,
    expectedOutput: `{
  "passed":  [{"id": "T1", "amount": 100}, {"id": "T3", "amount": 200}, {"id": "T5", "amount": 75}],
  "failed":  [{"id": "T2", "amount": -50}, {"id": "T4", "amount": null}],
  "passCount": 3,
  "failCount": 2
}`,
    xp: 50
  },
  {
    id: 'DJO-027',
    title: 'indexOf & indexWhere',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Find the index of product "P3" in the array. Also find the index of the FIRST product with price > 50. Return -1 if not found.',
    inputPayload: `[
  {"id": "P1", "name": "Pen",    "price": 5},
  {"id": "P2", "name": "Book",   "price": 25},
  {"id": "P3", "name": "Laptop", "price": 999},
  {"id": "P4", "name": "Phone",  "price": 599},
  {"id": "P5", "name": "Cable",  "price": 10}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Import indexOf and indexWhere from dw::core::Arrays',
      'indexOf(array, value) — finds exact element match',
      'indexWhere(array, condition) — finds first element where condition is true'
    ],
    solution: `%dw 2.0
import indexOf, indexWhere from dw::core::Arrays
output application/json
---
{
  indexOfP3: indexWhere(payload, (p) -> p.id == "P3"),
  firstExpensiveIndex: indexWhere(payload, (p) -> p.price > 50),
  firstExpensiveProduct: payload[indexWhere(payload, (p) -> p.price > 50)]
}`,
    expectedOutput: `{
  "indexOfP3": 2,
  "firstExpensiveIndex": 2,
  "firstExpensiveProduct": {"id": "P3", "name": "Laptop", "price": 999}
}`,
    xp: 45
  },

  // ─── OBJECT OPERATIONS ─────────────────────────────────────────────────────
  {
    id: 'DJO-028',
    title: 'keysOf, valuesOf, entriesOf',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'From the config object, extract: all keys as an array, all values as an array, and rebuild as `[{key, value}]` entries array using `entriesOf`.',
    inputPayload: `{
  "dbHost": "localhost",
  "dbPort": "5432",
  "dbName": "mulequest",
  "poolSize": "10"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'keysOf(obj) returns array of key strings',
      'valuesOf(obj) returns array of values',
      'entriesOf(obj) returns [{key, value}] array'
    ],
    solution: `%dw 2.0
output application/json
---
{
  keys:    keysOf(payload),
  values:  valuesOf(payload),
  entries: entriesOf(payload)
}`,
    expectedOutput: `{
  "keys":   ["dbHost", "dbPort", "dbName", "poolSize"],
  "values": ["localhost", "5432", "mulequest", "10"],
  "entries": [
    {"key": "dbHost",    "value": "localhost"},
    {"key": "dbPort",    "value": "5432"},
    {"key": "dbName",    "value": "mulequest"},
    {"key": "poolSize",  "value": "10"}
  ]
}`,
    xp: 25
  },
  {
    id: 'DJO-029',
    title: 'mapObject: Transform Keys and Values',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Transform the object: convert all keys to UPPER_SNAKE_CASE (camelCase → UPPER_SNAKE_CASE) and all string values to uppercase. Number values stay as-is.',
    inputPayload: `{
  "firstName": "arjun",
  "lastName": "senthil",
  "yearsExperience": 7,
  "currentRole": "mulesoft developer"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'mapObject (value, key) -> { (newKey): newValue }',
      'To camelCase → UPPER_SNAKE: insert _ before uppercase letters, then uppercase all',
      '`key replace /([A-Z])/ with "_$1"` inserts underscore before each uppercase letter'
    ],
    solution: `%dw 2.0
output application/json
---
payload mapObject (v, k) -> {
  (upper(k replace /([A-Z])/ with "_$1")): v match {
    case is String -> upper(v)
    else           -> v
  }
}`,
    expectedOutput: `{
  "FIRST_NAME": "ARJUN",
  "LAST_NAME": "SENTHIL",
  "YEARS_EXPERIENCE": 7,
  "CURRENT_ROLE": "MULESOFT DEVELOPER"
}`,
    xp: 50
  },
  {
    id: 'DJO-030',
    title: 'Merge Objects with ++',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'Merge `defaults`, `overrides`, and a computed `meta` object into one config. `overrides` keys should win over `defaults`. Add `generatedAt` = now().',
    inputPayload: `{
  "defaults": {
    "timeout": 30,
    "retries": 3,
    "logLevel": "INFO"
  },
  "overrides": {
    "timeout": 60,
    "logLevel": "DEBUG"
  }
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'a ++ b merges objects — if the same key exists in both, b wins',
      'Build the meta object inline and merge it too'
    ],
    solution: `%dw 2.0
output application/json
---
payload.defaults ++ payload.overrides ++ {
  generatedAt: now() as String {format: "yyyy-MM-dd'T'HH:mm:ss"},
  source: "merged"
}`,
    expectedOutput: `{
  "timeout": 60,
  "retries": 3,
  "logLevel": "DEBUG",
  "generatedAt": "...",
  "source": "merged"
}`,
    xp: 25
  },
  {
    id: 'DJO-031',
    title: 'pluck: Object → Array',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Convert the nested `inventory` object (keyed by productId) into a flat array, adding the `productId` field to each item from its key.',
    inputPayload: `{
  "P001": {"name": "Widget A", "stock": 100, "price": 9.99},
  "P002": {"name": "Widget B", "stock": 50,  "price": 19.99},
  "P003": {"name": "Widget C", "stock": 0,   "price": 4.99}
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'pluck (value, key, index) -> transform extracts an array from an object',
      '`$$` is the key in pluck/mapObject shorthand, `$` is the value',
      'Add productId: $$ to include the key as a field'
    ],
    solution: `%dw 2.0
output application/json
---
payload pluck (product, productId) -> {
  productId: productId,
  name: product.name,
  stock: product.stock,
  price: product.price,
  inStock: product.stock > 0
}`,
    expectedOutput: `[
  {"productId": "P001", "name": "Widget A", "stock": 100, "price": 9.99,  "inStock": true},
  {"productId": "P002", "name": "Widget B", "stock": 50,  "price": 19.99, "inStock": true},
  {"productId": "P003", "name": "Widget C", "stock": 0,   "price": 4.99,  "inStock": false}
]`,
    xp: 40
  },
  {
    id: 'DJO-032',
    title: 'Array Slicing & Pagination',
    difficulty: 'beginner',
    topic: 'Collections',
    description: 'Implement pagination. Given `page` (1-based) and `pageSize`, return the correct slice of the items array plus pagination metadata.',
    inputPayload: `{
  "page": 2,
  "pageSize": 3,
  "items": [
    {"id": 1, "name": "A"}, {"id": 2, "name": "B"}, {"id": 3, "name": "C"},
    {"id": 4, "name": "D"}, {"id": 5, "name": "E"}, {"id": 6, "name": "F"},
    {"id": 7, "name": "G"}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Start index = (page - 1) * pageSize',
      'End index = start + pageSize - 1',
      'Array slice: array[start to end]',
      'totalPages = ceil(sizeOf(items) / pageSize)'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var start = (payload.page - 1) * payload.pageSize
  var end   = start + payload.pageSize - 1
  var total = sizeOf(payload.items)
  ---
  {
    data: payload.items[start to end],
    pagination: {
      page:       payload.page,
      pageSize:   payload.pageSize,
      totalItems: total,
      totalPages: ceil(total / payload.pageSize as Number),
      hasNext:    end < total - 1,
      hasPrev:    payload.page > 1
    }
  }
}`,
    expectedOutput: `{
  "data": [{"id": 4, "name": "D"}, {"id": 5, "name": "E"}, {"id": 6, "name": "F"}],
  "pagination": {
    "page": 2, "pageSize": 3, "totalItems": 7, "totalPages": 3,
    "hasNext": true, "hasPrev": true
  }
}`,
    xp: 40
  },

  // ─── MATH & NUMBERS ────────────────────────────────────────────────────────
  {
    id: 'DJO-033',
    title: 'Math Functions',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'Calculate financial metrics: round to 2 decimals, ceiling for units, floor for discount, absolute value for variance, and power for compound interest.',
    inputPayload: `{
  "principal": 10000,
  "ratePercent": 8.5,
  "years": 3,
  "rawUnits": 4.3,
  "variance": -125.67
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'round(n), ceil(n), floor(n), abs(n) — standard math functions',
      'Compound interest: principal * pow((1 + rate/100), years)',
      'pow(base, exponent) for exponentiation'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var rate = payload.ratePercent / 100
  var compoundAmount = payload.principal * pow((1 + rate), payload.years)
  ---
  {
    compoundAmount:  round(compoundAmount * 100) / 100,
    interest:        round((compoundAmount - payload.principal) * 100) / 100,
    unitsNeeded:     ceil(payload.rawUnits),
    discountUnits:   floor(payload.rawUnits),
    absVariance:     abs(payload.variance)
  }
}`,
    expectedOutput: `{
  "compoundAmount": 12772.84,
  "interest": 2772.84,
  "unitsNeeded": 5,
  "discountUnits": 4,
  "absVariance": 125.67
}`,
    xp: 30
  },
  {
    id: 'DJO-034',
    title: 'Number Formatting',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'Format numbers for different output requirements: currency (2 decimals with commas), percentage, scientific notation, and zero-padded integer.',
    inputPayload: `{
  "revenue": 1234567.891,
  "growthRate": 0.0875,
  "largeNumber": 0.000000123,
  "invoiceNumber": 42
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use `as String {format: "pattern"}` with Java DecimalFormat patterns',
      '#,##0.00 = comma thousands separator with 2 decimal places',
      '0.00% = percentage (multiplies by 100)',
      '0.000E0 = scientific notation'
    ],
    solution: `%dw 2.0
output application/json
---
{
  currency:      payload.revenue      as String {format: "#,##0.00"},
  percentage:    payload.growthRate   as String {format: "0.00%"},
  scientific:    payload.largeNumber  as String {format: "0.000E0"},
  paddedInvoice: payload.invoiceNumber as String {format: "000000"}
}`,
    expectedOutput: `{
  "currency":      "1,234,567.89",
  "percentage":    "8.75%",
  "scientific":    "1.230E-7",
  "paddedInvoice": "000042"
}`,
    xp: 30
  },

  // ─── STRING DEEP DIVE ──────────────────────────────────────────────────────
  {
    id: 'DJO-035',
    title: 'String Module Functions',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Use `dw::core::Strings` module functions: `isBlank`, `wrapWith`, `pluralize`, `leftPad`, `rightPad`, `repeat`, and `normalizeSpaces` to clean and format a record.',
    inputPayload: `{
  "username": "  arjun  ",
  "tag": "developer",
  "count": 1,
  "code": "42",
  "note": "   too   many    spaces   "
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Import from dw::core::Strings',
      'trim() removes leading/trailing whitespace (built-in)',
      'leftPad(str, length, padChar) pads from the left',
      'normalizeSpaces collapses multiple spaces into one'
    ],
    solution: `%dw 2.0
import isBlank, leftPad, rightPad, repeat, normalizeSpaces, wrapWith from dw::core::Strings
output application/json
---
{
  username:       trim(payload.username),
  paddedCode:     leftPad(payload.code, 6, "0"),
  separator:      repeat("-", 20),
  tag:            wrapWith(payload.tag, "[", "]"),
  cleanNote:      normalizeSpaces(trim(payload.note)),
  isUsernameBlank: isBlank(payload.username)
}`,
    expectedOutput: `{
  "username":        "arjun",
  "paddedCode":      "000042",
  "separator":       "--------------------",
  "tag":             "[developer]",
  "cleanNote":       "too many spaces",
  "isUsernameBlank": false
}`,
    xp: 45
  },
  {
    id: 'DJO-036',
    title: 'String Interpolation & Template',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'Build an email body and subject line using string interpolation. Format the date nicely and include conditional content based on `isPremium`.',
    inputPayload: `{
  "recipientName": "Arjun",
  "orderId": "ORD-2024-001",
  "amount": 1500.75,
  "dueDate": "2024-02-15",
  "isPremium": true
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use ++ for string concatenation',
      'Coerce date: payload.dueDate as Date {format: "yyyy-MM-dd"} as String {format: "dd MMM yyyy"}',
      'Use if/else inline for conditional content'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var formattedDate = payload.dueDate as Date {format: "yyyy-MM-dd"} as String {format: "dd MMM yyyy"}
  var premiumNote = if (payload.isPremium) " Thank you for being a Premium member!" else ""
  ---
  {
    subject: "Payment Due: Order " ++ payload.orderId,
    body: "Dear " ++ payload.recipientName ++ ",\\n\\n" ++
          "Your payment of $" ++ (payload.amount as String {format: "#,##0.00"}) ++
          " for order " ++ payload.orderId ++
          " is due on " ++ formattedDate ++ "." ++
          premiumNote ++ "\\n\\nThank you."
  }
}`,
    expectedOutput: `{
  "subject": "Payment Due: Order ORD-2024-001",
  "body": "Dear Arjun,\\n\\nYour payment of $1,500.75 for order ORD-2024-001 is due on 15 Feb 2024. Thank you for being a Premium member!\\n\\nThank you."
}`,
    xp: 35
  },
  {
    id: 'DJO-037',
    title: 'Regex: Extract & Validate',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Validate and parse structured data from a log line. Extract timestamp, log level, thread, and message using regex capture groups.',
    inputPayload: `{
  "logLine": "2024-01-15 10:23:45.123 [INFO] [main-thread] Order ORD-001 processed successfully"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'scan returns an array of match arrays; first match is scan(...)[0]',
      'Capture groups: scan(/pattern(group1)(group2)/) — [0] is full match, [1] is first group',
      'Pattern: timestamp is \\\\d{4}-\\\\d{2}-\\\\d{2} \\\\d{2}:\\\\d{2}:\\\\d{2}.\\\\d{3}'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var match = payload.logLine scan /^(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d{3}) \\[(\\w+)\\] \\[([\\w-]+)\\] (.+)$/
  var parts = match[0]
  ---
  if (sizeOf(match) > 0) {
    timestamp: parts[1],
    level:     parts[2],
    thread:    parts[3],
    message:   parts[4],
    isError:   parts[2] == "ERROR" or parts[2] == "WARN"
  } else {
    error: "Could not parse log line",
    raw: payload.logLine
  }
}`,
    expectedOutput: `{
  "timestamp": "2024-01-15 10:23:45.123",
  "level":     "INFO",
  "thread":    "main-thread",
  "message":   "Order ORD-001 processed successfully",
  "isError":   false
}`,
    xp: 55
  },

  // ─── READ/WRITE ────────────────────────────────────────────────────────────
  {
    id: 'DJO-038',
    title: 'read(): Parse Embedded JSON Strings',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'Each event has a `payload` field that is a JSON string (not an object). Use `read()` to parse each embedded JSON and extract specific fields.',
    inputPayload: `[
  {"eventId": "E1", "type": "order",   "payload": "{\"orderId\": \"O1\", \"amount\": 500, \"region\": \"APAC\"}"},
  {"eventId": "E2", "type": "invoice", "payload": "{\"invoiceId\": \"I1\", \"total\": 1200, \"currency\": \"USD\"}"},
  {"eventId": "E3", "type": "order",   "payload": "{\"orderId\": \"O2\", \"amount\": 300, \"region\": \"EMEA\"}"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'read(string, "application/json") parses a JSON string into a DataWeave object',
      'Wrap in try() in case the embedded JSON is malformed',
      'Access fields normally after read()'
    ],
    solution: `%dw 2.0
output application/json
---
payload map (event) ->
  do {
    var parsed = read(event.payload, "application/json")
    ---
    {
      eventId: event.eventId,
      type:    event.type,
      data:    parsed,
      summary: event.type match {
        case "order"   -> "Order " ++ (parsed.?orderId default "?") ++ " — $" ++ (parsed.?amount default 0 as String)
        case "invoice" -> "Invoice " ++ (parsed.?invoiceId default "?") ++ " — " ++ (parsed.?currency default "") ++ " " ++ (parsed.?total default 0 as String)
        else           -> "Unknown event"
      }
    }
  }`,
    expectedOutput: `[
  {"eventId": "E1", "type": "order",   "data": {"orderId": "O1", "amount": 500, "region": "APAC"}, "summary": "Order O1 — $500"},
  {"eventId": "E2", "type": "invoice", "data": {"invoiceId": "I1", "total": 1200, "currency": "USD"}, "summary": "Invoice I1 — USD 1200"},
  {"eventId": "E3", "type": "order",   "data": {"orderId": "O2", "amount": 300, "region": "EMEA"}, "summary": "Order O2 — $300"}
]`,
    xp: 55
  },
  {
    id: 'DJO-039',
    title: 'write(): Embed Formatted Output',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'Build an envelope object where the `body` field is the inner payload serialized as a compact JSON string (no indent), and `checksum` is the character count of that string.',
    inputPayload: `{
  "messageId": "MSG-001",
  "data": {
    "customerId": "C1",
    "orders": [{"id": "O1", "amount": 500}, {"id": "O2", "amount": 300}]
  }
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'write(value, "application/json", {indent: false}) serializes to a compact JSON string',
      'sizeOf(string) returns character count',
      'The result of write() is a String, not an object'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var bodyStr = write(payload.data, "application/json", {indent: false})
  ---
  {
    messageId: payload.messageId,
    body:      bodyStr,
    checksum:  sizeOf(bodyStr),
    timestamp: now() as String {format: "yyyy-MM-dd'T'HH:mm:ss"}
  }
}`,
    expectedOutput: `{
  "messageId": "MSG-001",
  "body":      "{\"customerId\":\"C1\",\"orders\":[{\"id\":\"O1\",\"amount\":500},{\"id\":\"O2\",\"amount\":300}]}",
  "checksum":  78,
  "timestamp": "..."
}`,
    xp: 50
  },
  {
    id: 'DJO-040',
    title: 'JSON → CSV Output',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'Transform the orders array to CSV output with a specific column order: `orderId,customer,region,amount,status`. Amounts should have 2 decimal places.',
    inputPayload: `[
  {"orderId": "O1", "customer": "Alice", "region": "APAC", "amount": 1500.5,  "status": "COMPLETED"},
  {"orderId": "O2", "customer": "Bob",   "region": "EMEA", "amount": 200.0,   "status": "PENDING"},
  {"orderId": "O3", "customer": "Carol", "region": "US",   "amount": 3200.75, "status": "COMPLETED"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/csv',
    hints: [
      'Set output to application/csv',
      'CSV output uses the field names from the object as headers',
      'Control column order by constructing objects with fields in the desired order',
      'Format amount with as String {format: "0.00"}'
    ],
    solution: `%dw 2.0
output application/csv header=true
---
payload map (o) -> {
  orderId:  o.orderId,
  customer: o.customer,
  region:   o.region,
  amount:   o.amount as String {format: "0.00"},
  status:   o.status
}`,
    expectedOutput: `orderId,customer,region,amount,status
O1,Alice,APAC,1500.50,COMPLETED
O2,Bob,EMEA,200.00,PENDING
O3,Carol,US,3200.75,COMPLETED`,
    xp: 40
  },
  {
    id: 'DJO-041',
    title: 'XML Namespaces',
    difficulty: 'advanced',
    topic: 'Multi-Format',
    description: 'Parse an XML message with namespaces. Extract `orderId` from the `ord` namespace and `customer` from the `cust` namespace. Output as clean JSON.',
    inputPayload: `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ord="http://example.com/order"
               xmlns:cust="http://example.com/customer">
  <soap:Body>
    <ord:Order>
      <ord:orderId>ORD-999</ord:orderId>
      <cust:customer>
        <cust:name>Arjun</cust:name>
        <cust:tier>GOLD</cust:tier>
      </cust:customer>
      <ord:amount>2500</ord:amount>
    </ord:Order>
  </soap:Body>
</soap:Envelope>`,
    inputMimeType: 'application/xml',
    outputMimeType: 'application/json',
    hints: [
      'Declare namespace variables: `ns ord http://example.com/order`',
      'Access namespaced elements: payload.soap#Envelope.soap#Body.ord#Order.ord#orderId',
      'Or use the namespace prefix syntax with `#`'
    ],
    solution: `%dw 2.0
output application/json
ns soap http://schemas.xmlsoap.org/soap/envelope/
ns ord  http://example.com/order
ns cust http://example.com/customer
---
do {
  var order = payload.soap#Envelope.soap#Body.ord#Order
  ---
  {
    orderId:  order.ord#orderId,
    amount:   order.ord#amount as Number,
    customer: {
      name: order.cust#customer.cust#name,
      tier: order.cust#customer.cust#tier
    }
  }
}`,
    expectedOutput: `{
  "orderId": "ORD-999",
  "amount": 2500,
  "customer": {"name": "Arjun", "tier": "GOLD"}
}`,
    xp: 70
  },
  {
    id: 'DJO-042',
    title: 'Build a SOAP Envelope',
    difficulty: 'advanced',
    topic: 'Multi-Format',
    description: 'Convert a simple JSON order into a SOAP 1.1 envelope XML for a legacy backend. Include proper namespace declarations and a SOAP action header.',
    inputPayload: `{
  "orderId": "ORD-500",
  "customer": "Arjun",
  "amount": 750.00,
  "currency": "USD"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/xml',
    hints: [
      'Declare ns variables for soap envelope and your target namespace',
      'Root element is soap#Envelope with soap#Body inside',
      'XML attributes use @{attrName: value} syntax inside an element'
    ],
    solution: `%dw 2.0
output application/xml
ns soap http://schemas.xmlsoap.org/soap/envelope/
ns ord  http://example.com/orderService
---
{
  soap#Envelope @(
    "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
    "xmlns:ord":  "http://example.com/orderService"
  ): {
    soap#Body: {
      ord#SubmitOrder: {
        ord#orderId:  payload.orderId,
        ord#customer: payload.customer,
        ord#amount:   payload.amount as String {format: "0.00"},
        ord#currency: payload.currency
      }
    }
  }
}`,
    expectedOutput: `<?xml version='1.0' encoding='UTF-8'?>
<soap:Envelope xmlns:soap="..." xmlns:ord="...">
  <soap:Body>
    <ord:SubmitOrder>
      <ord:orderId>ORD-500</ord:orderId>
      <ord:customer>Arjun</ord:customer>
      <ord:amount>750.00</ord:amount>
      <ord:currency>USD</ord:currency>
    </ord:SubmitOrder>
  </soap:Body>
</soap:Envelope>`,
    xp: 65
  },

  // ─── ADVANCED PATTERNS ─────────────────────────────────────────────────────
  {
    id: 'DJO-043',
    title: 'Recursive: Flatten Nested Category Tree',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Flatten a nested category tree into a flat array, adding a `depth` field and `parentId` to each node.',
    inputPayload: `[
  {
    "id": "C1", "name": "Electronics", "children": [
      {"id": "C1-1", "name": "Phones", "children": [
        {"id": "C1-1-1", "name": "Android", "children": []},
        {"id": "C1-1-2", "name": "iOS",     "children": []}
      ]},
      {"id": "C1-2", "name": "Laptops", "children": []}
    ]
  },
  {
    "id": "C2", "name": "Clothing", "children": [
      {"id": "C2-1", "name": "Men",   "children": []},
      {"id": "C2-2", "name": "Women", "children": []}
    ]
  }
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Write a recursive function: fun flatten(nodes, parentId, depth)',
      'Each call: current node + flatten(node.children, node.id, depth+1)',
      'Base case: empty children → just return current node in array'
    ],
    solution: `%dw 2.0
output application/json

fun flattenTree(nodes: Array, parentId: String | Null = null, depth: Number = 0): Array =
  nodes flatMap (node) ->
    [{id: node.id, name: node.name, parentId: parentId, depth: depth}]
    ++ flattenTree(node.children, node.id, depth + 1)
---
flattenTree(payload)`,
    expectedOutput: `[
  {"id": "C1",     "name": "Electronics", "parentId": null,  "depth": 0},
  {"id": "C1-1",   "name": "Phones",      "parentId": "C1",  "depth": 1},
  {"id": "C1-1-1", "name": "Android",     "parentId": "C1-1","depth": 2},
  {"id": "C1-1-2", "name": "iOS",         "parentId": "C1-1","depth": 2},
  {"id": "C1-2",   "name": "Laptops",     "parentId": "C1",  "depth": 1},
  {"id": "C2",     "name": "Clothing",    "parentId": null,  "depth": 0},
  {"id": "C2-1",   "name": "Men",         "parentId": "C2",  "depth": 1},
  {"id": "C2-2",   "name": "Women",       "parentId": "C2",  "depth": 1}
]`,
    xp: 80
  },
  {
    id: 'DJO-044',
    title: 'Recursive: Build Tree from Flat List',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'The reverse of DJO-043. Given a flat array with `id` and `parentId`, reconstruct the nested tree structure.',
    inputPayload: `[
  {"id": "C1",   "name": "Electronics", "parentId": null},
  {"id": "C1-1", "name": "Phones",      "parentId": "C1"},
  {"id": "C1-2", "name": "Laptops",     "parentId": "C1"},
  {"id": "C2",   "name": "Clothing",    "parentId": null},
  {"id": "C2-1", "name": "Men",         "parentId": "C2"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Find root nodes: filter where parentId == null',
      'Write recursive fun buildChildren(nodes, parentId)',
      'For each node, call buildChildren recursively with node.id as the parentId'
    ],
    solution: `%dw 2.0
output application/json

fun buildChildren(all: Array, parentId): Array =
  (all filter ($.?parentId == parentId)) map (node) -> {
    id:       node.id,
    name:     node.name,
    children: buildChildren(all, node.id)
  }
---
buildChildren(payload, null)`,
    expectedOutput: `[
  {"id": "C1", "name": "Electronics", "children": [
    {"id": "C1-1", "name": "Phones",  "children": []},
    {"id": "C1-2", "name": "Laptops", "children": []}
  ]},
  {"id": "C2", "name": "Clothing", "children": [
    {"id": "C2-1", "name": "Men", "children": []}
  ]}
]`,
    xp: 85
  },
  {
    id: 'DJO-045',
    title: 'Higher-Order Functions',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Write a reusable `applyTransforms` function that takes an array and a list of transform functions, applying each in sequence (function pipeline). Apply 3 transforms: filter negative amounts, round amounts, add status label.',
    inputPayload: `[
  {"id": "T1", "amount": 150.456},
  {"id": "T2", "amount": -50},
  {"id": "T3", "amount": 200.789},
  {"id": "T4", "amount": -10},
  {"id": "T5", "amount": 75.1}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'fun applyTransforms(data, transforms) = transforms reduce (fn, acc = data) -> fn(acc)',
      'Each transform is a function: (array) -> array',
      'Define transforms as var t1 = (arr) -> arr filter ...'
    ],
    solution: `%dw 2.0
output application/json

fun applyTransforms(data: Array, transforms: Array): Array =
  transforms reduce (fn, acc = data) -> fn(acc)
---
do {
  var filterNegative = (arr) -> arr filter $.amount >= 0
  var roundAmounts   = (arr) -> arr map ($ ++ {amount: round($.amount * 100) / 100})
  var addStatus      = (arr) -> arr map ($ ++ {
    status: if ($.amount > 100) "HIGH" else "NORMAL"
  })
  ---
  applyTransforms(payload, [filterNegative, roundAmounts, addStatus])
}`,
    expectedOutput: `[
  {"id": "T1", "amount": 150.46, "status": "HIGH"},
  {"id": "T3", "amount": 200.79, "status": "HIGH"},
  {"id": "T5", "amount": 75.1,  "status": "NORMAL"}
]`,
    xp: 80
  },
  {
    id: 'DJO-046',
    title: 'Type System: Custom Type Definitions',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Define custom types `Money`, `Customer`, and `Order`. Use them in function signatures to document intent. Validate an order and return typed output.',
    inputPayload: `{
  "orderId": "ORD-001",
  "customer": {"id": "C1", "name": "Arjun", "tier": "GOLD"},
  "items": [
    {"sku": "S1", "qty": 2, "unitPrice": 500},
    {"sku": "S2", "qty": 1, "unitPrice": 1200}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'type Money = {amount: Number, currency: String}',
      'type CustomerType = {id: String, name: String, tier: String}',
      'Functions with typed params: fun calcTotal(items: Array<Object>): Number'
    ],
    solution: `%dw 2.0
output application/json

type Money       = {amount: Number, currency: String}
type CustomerRec = {id: String, name: String, tier: String}
type LineItem    = {sku: String, qty: Number, unitPrice: Number, lineTotal: Number}

fun toLineItem(item: Object): LineItem = {
  sku:       item.sku,
  qty:       item.qty,
  unitPrice: item.unitPrice,
  lineTotal: item.qty * item.unitPrice
}

fun discountFor(tier: String): Number =
  tier match {
    case "GOLD"   -> 0.15
    case "SILVER" -> 0.10
    else          -> 0.05
  }
---
do {
  var lines    = payload.items map toLineItem($)
  var subtotal = sum(lines map $.lineTotal)
  var discount = discountFor(payload.customer.tier)
  var total    = subtotal * (1 - discount)
  ---
  {
    orderId:  payload.orderId,
    customer: payload.customer,
    lines:    lines,
    pricing: {
      subtotal:     subtotal,
      discountPct:  discount * 100,
      discountAmt:  subtotal * discount,
      total:        total
    }
  }
}`,
    expectedOutput: `{
  "orderId": "ORD-001",
  "lines": [
    {"sku": "S1", "qty": 2, "unitPrice": 500,  "lineTotal": 1000},
    {"sku": "S2", "qty": 1, "unitPrice": 1200, "lineTotal": 1200}
  ],
  "pricing": {"subtotal": 2200, "discountPct": 15, "discountAmt": 330, "total": 1870}
}`,
    xp: 75
  },

  // ─── REAL-WORLD MULESOFT ───────────────────────────────────────────────────
  {
    id: 'DJO-047',
    title: 'HTTP Error Response Builder',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Build a standardized API error response. Map Mule error types to HTTP status codes and RFC 7807 problem+json format. Input is the error type string.',
    inputPayload: `{
  "errorType": "HTTP:NOT_FOUND",
  "errorDescription": "Customer C999 not found",
  "requestId": "REQ-abc123",
  "path": "/api/customers/C999"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Match errorType to HTTP status: HTTP:NOT_FOUND → 404, HTTP:UNAUTHORIZED → 401, etc.',
      'RFC 7807 fields: type, title, status, detail, instance',
      'Use match/case on the errorType string'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var statusMap = payload.errorType match {
    case "HTTP:NOT_FOUND"        -> {status: 404, title: "Not Found"}
    case "HTTP:UNAUTHORIZED"     -> {status: 401, title: "Unauthorized"}
    case "HTTP:FORBIDDEN"        -> {status: 403, title: "Forbidden"}
    case "APP:VALIDATION"        -> {status: 400, title: "Bad Request"}
    case "HTTP:BAD_REQUEST"      -> {status: 400, title: "Bad Request"}
    case "MULE:CONNECTIVITY"     -> {status: 503, title: "Service Unavailable"}
    else                         -> {status: 500, title: "Internal Server Error"}
  }
  ---
  {
    type:      "https://api.example.com/errors/" ++ lower(statusMap.title replace " " with "-"),
    title:     statusMap.title,
    status:    statusMap.status,
    detail:    payload.errorDescription,
    instance:  payload.path,
    requestId: payload.requestId,
    timestamp: now() as String {format: "yyyy-MM-dd'T'HH:mm:ss'Z'"}
  }
}`,
    expectedOutput: `{
  "type":      "https://api.example.com/errors/not-found",
  "title":     "Not Found",
  "status":    404,
  "detail":    "Customer C999 not found",
  "instance":  "/api/customers/C999",
  "requestId": "REQ-abc123",
  "timestamp": "..."
}`,
    xp: 60
  },
  {
    id: 'DJO-048',
    title: 'Canonical Data Model Mapping',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Map a Salesforce Opportunity record to your internal canonical Order model. Field names, types, and structure differ significantly — this is a real API-led mapping exercise.',
    inputPayload: `{
  "Id":                 "0063X000004WlFO",
  "Name":               "Arjun - MuleSoft License 2024",
  "AccountId":          "0013X000004FkWx",
  "Account": {"Name": "IBM India", "BillingCity": "Bangalore"},
  "Amount":             150000,
  "CurrencyIsoCode":    "INR",
  "CloseDate":          "2024-03-31",
  "StageName":          "Closed Won",
  "Probability":        100,
  "OwnerId":            "0053X000007ABCD",
  "Owner": {"Name": "Sales Rep A"},
  "CreatedDate":        "2024-01-10T08:30:00.000+0000"
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Map StageName to internal status: "Closed Won" → "CONFIRMED", "Closed Lost" → "CANCELLED"',
      'Reformat CloseDate from yyyy-MM-dd to dd/MM/yyyy',
      'Construct nested address object from Account fields'
    ],
    solution: `%dw 2.0
output application/json
---
{
  orderId:       payload.Id,
  orderName:     payload.Name,
  status:        payload.StageName match {
    case "Closed Won"  -> "CONFIRMED"
    case "Closed Lost" -> "CANCELLED"
    case "Prospecting" -> "LEAD"
    else               -> "IN_PROGRESS"
  },
  customer: {
    accountId:   payload.AccountId,
    accountName: payload.Account.Name,
    billingCity: payload.Account.BillingCity
  },
  financials: {
    amount:      payload.Amount,
    currency:    payload.CurrencyIsoCode,
    probability: payload.Probability / 100
  },
  dates: {
    closeDate:   payload.CloseDate as Date {format: "yyyy-MM-dd"} as String {format: "dd/MM/yyyy"},
    createdAt:   payload.CreatedDate[0 to 18]
  },
  owner: {
    id:   payload.OwnerId,
    name: payload.Owner.Name
  }
}`,
    expectedOutput: `{
  "orderId": "0063X000004WlFO",
  "status": "CONFIRMED",
  "customer": {"accountName": "IBM India", "billingCity": "Bangalore"},
  "financials": {"amount": 150000, "currency": "INR", "probability": 1},
  "dates": {"closeDate": "31/03/2024", "createdAt": "2024-01-10T08:30:00"}
}`,
    xp: 70
  },
  {
    id: 'DJO-049',
    title: 'Idempotency Key Generation',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Generate a deterministic idempotency key from request fields. Concatenate `sourceSystem + orderId + eventType + date`, normalize it, then create a checksum-style key using string operations.',
    inputPayload: `{
  "sourceSystem": "SAP-ECC",
  "orderId": "SO-2024-00123",
  "eventType": "ORDER_CREATED",
  "eventDate": "2024-01-15T10:30:00",
  "payload": {"amount": 5000}
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Concatenate the key fields, uppercase, remove special chars with replace',
      'sizeOf gives a numeric component for the key',
      'Format as SYSTEM-HASH pattern'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var keyComponents = [
    payload.sourceSystem,
    payload.orderId,
    payload.eventType,
    payload.eventDate[0 to 9]
  ]
  var rawKey  = keyComponents joinBy "-"
  var cleaned = upper(rawKey replace /[^A-Z0-9-]/ with "")
  var checksum = sizeOf(cleaned) * 31 + sizeOf(payload.orderId) * 17
  ---
  {
    idempotencyKey: cleaned ++ "-" ++ (checksum as String),
    components:     keyComponents,
    generatedAt:    now() as String {format: "yyyy-MM-dd'T'HH:mm:ss"}
  }
}`,
    expectedOutput: `{
  "idempotencyKey": "SAP-ECC-SO-2024-00123-ORDER_CREATED-2024-01-15-<checksum>",
  "components": ["SAP-ECC", "SO-2024-00123", "ORDER_CREATED", "2024-01-15"]
}`,
    xp: 55
  },
  {
    id: 'DJO-050',
    title: 'Batch Aggregator Output',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Simulate a Mule Batch aggregator step output. Given a batch of records with success/failure flags, produce a batch report with per-step metrics and failed record details.',
    inputPayload: `{
  "batchJobId": "BATCH-2024-001",
  "step": "enrichAndValidate",
  "records": [
    {"id": "R1", "status": "SUCCESS", "processingTimeMs": 45},
    {"id": "R2", "status": "FAILURE", "error": "DB timeout",        "processingTimeMs": 3000},
    {"id": "R3", "status": "SUCCESS", "processingTimeMs": 52},
    {"id": "R4", "status": "FAILURE", "error": "Validation failed", "processingTimeMs": 10},
    {"id": "R5", "status": "SUCCESS", "processingTimeMs": 38}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'partition records into success and failure groups',
      'avg() on processingTimeMs for performance metrics',
      'Group failures by error type using groupBy'
    ],
    solution: `%dw 2.0
import partition from dw::core::Arrays
output application/json
---
do {
  var p       = partition(payload.records, (r) -> r.status == "SUCCESS")
  var success = p.success
  var failed  = p.failure
  var times   = payload.records map $.processingTimeMs
  ---
  {
    batchJobId: payload.batchJobId,
    step:       payload.step,
    summary: {
      total:          sizeOf(payload.records),
      successCount:   sizeOf(success),
      failureCount:   sizeOf(failed),
      successRate:    ((sizeOf(success) / sizeOf(payload.records)) * 100) as Number {format: "0.00"} ++ "%",
      avgProcessingMs: avg(times) as Number {format: "0"},
      maxProcessingMs: max(times)
    },
    failedRecords: failed map { id: $.id, error: $.error, processingTimeMs: $.processingTimeMs },
    errorSummary: (failed groupBy $.error) mapObject (records, errorMsg) -> {
      (errorMsg): sizeOf(records)
    }
  }
}`,
    expectedOutput: `{
  "batchJobId": "BATCH-2024-001",
  "summary": {
    "total": 5, "successCount": 3, "failureCount": 2,
    "successRate": "60.00%", "avgProcessingMs": "629", "maxProcessingMs": 3000
  },
  "failedRecords": [{"id": "R2", "error": "DB timeout", ...}, ...],
  "errorSummary": {"DB timeout": 1, "Validation failed": 1}
}`,
    xp: 85
  },
  {
    id: 'DJO-051',
    title: 'Upsert Merge: New vs Existing',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Given an array of `existing` records and `incoming` records (both keyed by `id`), produce: updated (id in both — merge with incoming winning), new (only in incoming), unchanged (only in existing).',
    inputPayload: `{
  "existing": [
    {"id": "C1", "name": "Alice", "tier": "SILVER", "score": 80},
    {"id": "C2", "name": "Bob",   "tier": "GOLD",   "score": 95},
    {"id": "C3", "name": "Carol", "tier": "BRONZE",  "score": 60}
  ],
  "incoming": [
    {"id": "C1", "name": "Alice", "tier": "GOLD", "score": 88},
    {"id": "C4", "name": "Dave",  "tier": "SILVER","score": 75}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Build lookup objects keyed by id using groupBy then mapObject to get single items',
      'existingIds = payload.existing map $.id',
      'incomingIds = payload.incoming map $.id',
      'updated: intersect(existingIds, incomingIds)',
      'new: substract(incomingIds, existingIds)'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var existingMap  = {(payload.existing  map { ($.id): $ })}
  var incomingMap  = {(payload.incoming  map { ($.id): $ })}
  var existingIds  = keysOf(existingMap)
  var incomingIds  = keysOf(incomingMap)
  var updatedIds   = intersect(existingIds, incomingIds)
  var newIds       = substract(incomingIds, existingIds)
  var unchangedIds = substract(existingIds, incomingIds)
  ---
  {
    updated:   updatedIds   map (id) -> existingMap[id] ++ incomingMap[id],
    new:       newIds       map (id) -> incomingMap[id],
    unchanged: unchangedIds map (id) -> existingMap[id],
    summary: {
      updatedCount:   sizeOf(updatedIds),
      newCount:       sizeOf(newIds),
      unchangedCount: sizeOf(unchangedIds)
    }
  }
}`,
    expectedOutput: `{
  "updated":   [{"id": "C1", "name": "Alice", "tier": "GOLD", "score": 88}],
  "new":       [{"id": "C4", "name": "Dave",  "tier": "SILVER","score": 75}],
  "unchanged": [{"id": "C2", ...}, {"id": "C3", ...}],
  "summary": {"updatedCount": 1, "newCount": 1, "unchangedCount": 2}
}`,
    xp: 90
  },
  {
    id: 'DJO-052',
    title: 'skipNullOn Header',
    difficulty: 'beginner',
    topic: 'Basics',
    description: 'Use the `skipNullOn` output directive to automatically exclude null fields everywhere — both in objects and arrays. Compare the output with and without it.',
    inputPayload: `{
  "orderId": "O1",
  "customer": "Arjun",
  "discount": null,
  "notes": null,
  "items": [
    {"sku": "S1", "qty": 2,    "color": null},
    {"sku": "S2", "qty": null, "color": "red"}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Add `skipNullOn: "everywhere"` to the output directive',
      'This removes null fields from objects AND null items from arrays',
      'Try without it first to see the difference'
    ],
    solution: `%dw 2.0
output application/json skipNullOn="everywhere"
---
payload`,
    expectedOutput: `{
  "orderId": "O1",
  "customer": "Arjun",
  "items": [
    {"sku": "S1", "qty": 2},
    {"sku": "S2", "color": "red"}
  ]
}`,
    xp: 20
  },
  {
    id: 'DJO-053',
    title: 'Conditional Output Format',
    difficulty: 'intermediate',
    topic: 'Multi-Format',
    description: 'The `format` field in the input determines output type: "json" → JSON, "csv" → CSV. Use `write()` to produce the target format and return it as a string in an envelope.',
    inputPayload: `{
  "format": "csv",
  "data": [
    {"name": "Alice", "dept": "Engineering", "salary": 90000},
    {"name": "Bob",   "dept": "Sales",       "salary": 70000},
    {"name": "Carol", "dept": "HR",          "salary": 65000}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use a match/case on payload.format',
      'write(value, mimeType) serializes to string',
      'CSV mime type is "application/csv"'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var mimeType = payload.format match {
    case "csv"  -> "application/csv"
    case "xml"  -> "application/xml"
    else        -> "application/json"
  }
  var serialized = write(payload.data, mimeType)
  ---
  {
    format:       payload.format,
    mimeType:     mimeType,
    content:      serialized,
    recordCount:  sizeOf(payload.data)
  }
}`,
    expectedOutput: `{
  "format":      "csv",
  "mimeType":    "application/csv",
  "content":     "name,dept,salary\\nAlice,Engineering,90000\\n...",
  "recordCount": 3
}`,
    xp: 55
  },
  {
    id: 'DJO-054',
    title: 'Date Arithmetic: SLA Calculator',
    difficulty: 'intermediate',
    topic: 'Basics',
    description: 'Calculate SLA metrics for a support ticket. Compute: `ageInDays` (from createdAt to now), `dueDate` (createdAt + SLA days by priority), `isOverdue` (now > dueDate), `timeRemainingHours`.',
    inputPayload: `{
  "ticketId": "TKT-001",
  "priority": "HIGH",
  "createdAt": "2024-01-10T09:00:00",
  "slaDays": {"CRITICAL": 1, "HIGH": 3, "MEDIUM": 7, "LOW": 14}
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Parse createdAt: payload.createdAt as DateTime {format: "yyyy-MM-dd\'T\'HH:mm:ss"}',
      'Add SLA days: createdAt + |P$(n)D| won\'t work with variables — use Period arithmetic differently',
      'Alternatively: createdAt + (slaDays * 24 * 60 * 60 * 1000) as Period'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var created  = payload.createdAt as DateTime {format: "yyyy-MM-dd'T'HH:mm:ss"}
  var slaDays  = payload.slaDays[payload.priority]
  var dueDate  = created + |P1D| * slaDays
  var nowDT    = now()
  var overdue  = nowDT > dueDate
  var diffMs   = (dueDate - nowDT) as Number
  ---
  {
    ticketId:          payload.ticketId,
    priority:          payload.priority,
    createdAt:         payload.createdAt,
    dueDate:           dueDate as String {format: "yyyy-MM-dd'T'HH:mm:ss"},
    isOverdue:         overdue,
    slaDays:           slaDays,
    timeRemainingNote: if (overdue) "SLA BREACHED" else "Within SLA"
  }
}`,
    expectedOutput: `{
  "ticketId": "TKT-001",
  "priority": "HIGH",
  "dueDate": "2024-01-13T09:00:00",
  "isOverdue": true,
  "slaDays": 3,
  "timeRemainingNote": "SLA BREACHED"
}`,
    xp: 60
  },
  {
    id: 'DJO-055',
    title: 'Currency Conversion Matrix',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Given exchange rates relative to USD, convert a multi-currency order to all supported currencies and return a conversion matrix.',
    inputPayload: `{
  "amount": 1000,
  "baseCurrency": "USD",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 83.5,
    "JPY": 149.2
  }
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'mapObject over payload.rates to build the conversion object',
      'Each value: payload.amount * rate, formatted to 2 decimal places',
      'Include the base currency too with rate 1.00'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var allRates = payload.rates ++ {(payload.baseCurrency): 1.0}
  ---
  {
    originalAmount:  payload.amount,
    baseCurrency:    payload.baseCurrency,
    conversions: allRates mapObject (rate, currency) -> {
      (currency): {
        amount:        (payload.amount * rate) as Number {format: "0.00"} as Number,
        exchangeRate:  rate
      }
    }
  }
}`,
    expectedOutput: `{
  "originalAmount": 1000,
  "baseCurrency": "USD",
  "conversions": {
    "EUR": {"amount": 920.00, "exchangeRate": 0.92},
    "GBP": {"amount": 790.00, "exchangeRate": 0.79},
    "INR": {"amount": 83500.00, "exchangeRate": 83.5},
    "JPY": {"amount": 149200.00, "exchangeRate": 149.2},
    "USD": {"amount": 1000.00, "exchangeRate": 1}
  }
}`,
    xp: 50
  },
  {
    id: 'DJO-056',
    title: 'Diff Two Objects',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Compare two versions of a customer record and return a `changes` array showing each field that changed with `{field, oldValue, newValue}`. Ignore fields that are the same.',
    inputPayload: `{
  "before": {"id": "C1", "name": "Alice", "tier": "SILVER", "email": "alice@old.com", "score": 80},
  "after":  {"id": "C1", "name": "Alice", "tier": "GOLD",   "email": "alice@new.com", "score": 80}
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'keysOf(before) to get all field names',
      'filter to keep only keys where before[key] != after[key]',
      'map each changed key to {field, oldValue, newValue}'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var fields   = keysOf(payload.before)
  var changed  = fields filter (k) -> payload.before[k] != payload.after[k]
  ---
  {
    id:       payload.before.id,
    hasChanges: sizeOf(changed) > 0,
    changeCount: sizeOf(changed),
    changes: changed map (k) -> {
      field:    k,
      oldValue: payload.before[k],
      newValue: payload.after[k]
    }
  }
}`,
    expectedOutput: `{
  "id": "C1",
  "hasChanges": true,
  "changeCount": 2,
  "changes": [
    {"field": "tier",  "oldValue": "SILVER",        "newValue": "GOLD"},
    {"field": "email", "oldValue": "alice@old.com",  "newValue": "alice@new.com"}
  ]
}`,
    xp: 75
  },
  {
    id: 'DJO-057',
    title: 'Array Chunking',
    difficulty: 'intermediate',
    topic: 'Collections',
    description: 'Split a large array into fixed-size chunks. Useful for batch API calls. Given an array and a `chunkSize`, return an array of arrays.',
    inputPayload: `{
  "chunkSize": 3,
  "items": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Use dw::core::Arrays divideBy function: divideBy(array, size)',
      'Or write manually: range 0..ceil(sizeOf/chunkSize)-1 and slice each'
    ],
    solution: `%dw 2.0
import divideBy from dw::core::Arrays
output application/json
---
do {
  var chunks = payload.items divideBy payload.chunkSize
  ---
  {
    chunkSize:  payload.chunkSize,
    totalItems: sizeOf(payload.items),
    chunkCount: sizeOf(chunks),
    chunks:     chunks
  }
}`,
    expectedOutput: `{
  "chunkSize": 3,
  "totalItems": 10,
  "chunkCount": 4,
  "chunks": [[1,2,3],[4,5,6],[7,8,9],[10]]
}`,
    xp: 45
  },
  {
    id: 'DJO-058',
    title: 'Lookup Table Pattern',
    difficulty: 'intermediate',
    topic: 'Patterns',
    description: 'Enrich a list of country codes using a lookup object (inline reference data). Map each record\'s `countryCode` to full country name, region, and currency. Handle unknown codes gracefully.',
    inputPayload: `{
  "orders": [
    {"orderId": "O1", "countryCode": "IN", "amount": 5000},
    {"orderId": "O2", "countryCode": "US", "amount": 1200},
    {"orderId": "O3", "countryCode": "XX", "amount": 800},
    {"orderId": "O4", "countryCode": "GB", "amount": 2500}
  ]
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Define var countryLookup = {IN: {...}, US: {...}, GB: {...}} as an inline reference',
      'Access: countryLookup[order.countryCode] — returns null if not found',
      'Use default {} with null-safe chaining for unknown codes'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var lookup = {
    IN: {name: "India",          region: "APAC", currency: "INR"},
    US: {name: "United States",  region: "AMER", currency: "USD"},
    GB: {name: "United Kingdom", region: "EMEA", currency: "GBP"},
    DE: {name: "Germany",        region: "EMEA", currency: "EUR"},
    JP: {name: "Japan",          region: "APAC", currency: "JPY"}
  }
  ---
  payload.orders map (o) -> do {
    var info = lookup[o.countryCode]
    ---
    {
      orderId:     o.orderId,
      amount:      o.amount,
      countryCode: o.countryCode,
      country:     info.?name     default "UNKNOWN",
      region:      info.?region   default "UNKNOWN",
      currency:    info.?currency default "UNKNOWN",
      isKnown:     info != null
    }
  }
}`,
    expectedOutput: `[
  {"orderId": "O1", "countryCode": "IN", "country": "India",          "region": "APAC", "isKnown": true},
  {"orderId": "O2", "countryCode": "US", "country": "United States",  "region": "AMER", "isKnown": true},
  {"orderId": "O3", "countryCode": "XX", "country": "UNKNOWN",        "region": "UNKNOWN","isKnown": false},
  {"orderId": "O4", "countryCode": "GB", "country": "United Kingdom", "region": "EMEA", "isKnown": true}
]`,
    xp: 55
  },
  {
    id: 'DJO-059',
    title: 'Event Aggregation Window',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'Aggregate streaming events by 5-minute windows. Each event has a `timestamp`. Group events into time windows, calculate stats per window.',
    inputPayload: `[
  {"id": "E1",  "value": 10, "timestamp": "2024-01-15T10:00:30"},
  {"id": "E2",  "value": 20, "timestamp": "2024-01-15T10:02:15"},
  {"id": "E3",  "value": 15, "timestamp": "2024-01-15T10:06:00"},
  {"id": "E4",  "value": 30, "timestamp": "2024-01-15T10:08:45"},
  {"id": "E5",  "value": 5,  "timestamp": "2024-01-15T10:12:00"}
]`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Extract minute from timestamp: timestamp[11 to 15] gives HH:mm',
      'Window = floor(minute / 5) * 5 gives the start minute of each 5-min window',
      'groupBy the window key, then mapObject to calculate stats per window'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  fun windowKey(ts: String): String = do {
    var hour   = ts[11 to 12] as Number
    var minute = ts[14 to 15] as Number
    var winMin = floor(minute / 5) * 5
    ---
    ts[0 to 10] ++ "T" ++ (hour as String {format: "00"}) ++ ":" ++ (winMin as String {format: "00"}) ++ ":00"
  }
  var withWindows = payload map (e) -> e ++ {window: windowKey(e.timestamp)}
  var grouped     = withWindows groupBy $.window
  ---
  grouped mapObject (events, window) -> {
    (window): {
      windowStart: window,
      eventCount:  sizeOf(events),
      sum:         sum(events map $.value),
      avg:         avg(events map $.value) as Number {format: "0.00"},
      min:         min(events map $.value),
      max:         max(events map $.value)
    }
  }
  pluck $
  orderBy $.windowStart
}`,
    expectedOutput: `[
  {"windowStart": "2024-01-15T10:00:00", "eventCount": 2, "sum": 30, "avg": 15.00},
  {"windowStart": "2024-01-15T10:05:00", "eventCount": 2, "sum": 45, "avg": 22.50},
  {"windowStart": "2024-01-15T10:10:00", "eventCount": 1, "sum": 5,  "avg": 5.00}
]`,
    xp: 90
  },
  {
    id: 'DJO-060',
    title: 'The Ultimate Challenge: Order Processing Pipeline',
    difficulty: 'advanced',
    topic: 'Patterns',
    description: 'End-to-end order processing transform. Parse mixed input, validate (try()), enrich with lookup, calculate pricing with discounts, generate CSV for finance and JSON for API, all in one script.',
    inputPayload: `{
  "batchId": "BATCH-2024-060",
  "orders": [
    {"id": "O1", "customerId": "C1", "sku": "SKU-A", "qty": "3",  "rawPrice": "1000.50", "currency": "USD"},
    {"id": "O2", "customerId": "C2", "sku": "SKU-B", "qty": "bad","rawPrice": "500",     "currency": "USD"},
    {"id": "O3", "customerId": "C1", "sku": "SKU-A", "qty": "1",  "rawPrice": "1000.50", "currency": "GBP"}
  ],
  "customers": [
    {"id": "C1", "name": "Arjun", "tier": "GOLD"},
    {"id": "C2", "name": "Bob",   "tier": "SILVER"}
  ],
  "discounts": {"GOLD": 0.15, "SILVER": 0.10, "BRONZE": 0.05}
}`,
    inputMimeType: 'application/json',
    outputMimeType: 'application/json',
    hints: [
      'Step 1: Build customer lookup map',
      'Step 2: Parse each order with try() — bad qty should mark as failed',
      'Step 3: Enrich clean orders with customer info and apply discount',
      'Step 4: Write clean orders as CSV string using write()',
      'Step 5: Build final response envelope with summary, api response, and csvExport'
    ],
    solution: `%dw 2.0
output application/json
---
do {
  var customerMap = {(payload.customers map {($.id): $})}

  var parsed = payload.orders map (o) ->
    try(() -> {
      id:         o.id,
      customerId: o.customerId,
      sku:        o.sku,
      qty:        o.qty as Number,
      unitPrice:  o.rawPrice as Number,
      currency:   o.currency
    }) match {
      case {success: true}  -> $.result
      case {success: false} -> {_error: true, id: o.id, reason: $.error.message}
    }

  var clean  = parsed filter !$.?_error
  var failed = parsed filter ($.?_error default false)

  var enriched = clean map (o) -> do {
    var customer = customerMap[o.customerId]
    var discount = payload.discounts[customer.?tier default "BRONZE"] default 0.05
    var lineTotal = o.qty * o.unitPrice
    var finalAmt  = lineTotal * (1 - discount)
    ---
    o ++ {
      customerName: customer.?name default "UNKNOWN",
      tier:         customer.?tier default "UNKNOWN",
      discountPct:  discount * 100,
      lineTotal:    lineTotal,
      finalAmount:  finalAmt,
      currency:     o.currency
    }
  }

  var csvData = write(enriched map {
    orderId: $.id, customer: $.customerName, sku: $.sku,
    qty: $.qty, unitPrice: $.unitPrice, finalAmount: ($.finalAmount as Number {format: "0.00"})
  }, "application/csv")
  ---
  {
    batchId: payload.batchId,
    summary: {
      total:       sizeOf(payload.orders),
      processed:   sizeOf(enriched),
      failed:      sizeOf(failed),
      totalRevenue: sum(enriched map $.finalAmount)
    },
    orders:      enriched,
    failedOrders: failed map {id: $.id, reason: $.reason},
    csvExport:   csvData
  }
}`,
    expectedOutput: `{
  "batchId": "BATCH-2024-060",
  "summary": {"total": 3, "processed": 2, "failed": 1, "totalRevenue": ...},
  "orders": [...enriched with discounts...],
  "failedOrders": [{"id": "O2", "reason": "...bad qty..."}],
  "csvExport": "orderId,customer,sku,qty,unitPrice,finalAmount\\n..."
}`,
    xp: 120
  }
]

export const DOJO_TOPICS = [...new Set(DOJO_CHALLENGES.map(c => c.topic))]
export const DOJO_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

export function getDojoChallengeById(id) {
  return DOJO_CHALLENGES.find(c => c.id === id) || null
}
