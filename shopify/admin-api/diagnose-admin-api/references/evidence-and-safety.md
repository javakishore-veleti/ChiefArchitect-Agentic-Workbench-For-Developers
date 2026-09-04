# Evidence and safety contract

Return: resolved context; minimal reproduction; requested and actual API version; query variables with secrets removed; HTTP status; GraphQL top-level errors; mutation userErrors; request ID; requested/actual query cost and throttle status; affected stable business keys; facts; inference; confidence; missing access; next action.

Default to read-only. A mutation requires explicit authorization naming the target shop and intended change. For production, show inputs, impact, validation and rollback before execution. Stop after unexpected scope, broad result size, throttling that persists after bounded backoff, or evidence of sensitive data exposure.

Never persist access tokens, session cookies, customer personal information, payment information or raw production payloads. Store synthetic fixtures only.
