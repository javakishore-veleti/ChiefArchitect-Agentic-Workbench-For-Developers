# Payment and transactions

Treat order financial status as a projection, not the transaction ledger. Inspect transaction kind/status, parent transaction, gateway, processed time and amount/currency. Compare authorized, capturable, received, outstanding and refunded money sets. A partial capture, void, manual payment, store credit or asynchronous gateway can produce a status that looks contradictory.

Never capture, void or mark paid while diagnosing. State the exact proposed financial mutation and amount for separate authorization.
