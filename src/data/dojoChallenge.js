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
  }
]

export const DOJO_TOPICS = [...new Set(DOJO_CHALLENGES.map(c => c.topic))]
export const DOJO_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

export function getDojoChallengeById(id) {
  return DOJO_CHALLENGES.find(c => c.id === id) || null
}
