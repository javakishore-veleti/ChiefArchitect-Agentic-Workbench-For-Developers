# Creation and editing

Separate direct `orderCreate`, draft-order completion and order-edit flows; their validation and inventory behavior differ. Inspect top-level errors and every mutation `userErrors` path. For edits, compare original and current quantities/money; verify `merchantEditable` and its errors. Validate variant, selling-plan, bundle, address, tax, duty and metafield inputs against the selected API schema.

Do not replay a mutation to diagnose it. Reproduce input validation offline or use read queries. A retry may duplicate an order unless the caller provides and verifies its own idempotency evidence.
