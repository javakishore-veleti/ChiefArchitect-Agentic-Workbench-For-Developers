# Returns, refunds and cancellations

Model cancellation, return, exchange and refund as separate workflows. Inspect return status/lines, refund line items, transactions, restock choices, shipping refunds, duties, taxes and sales agreements. Compare calculated proposals with persisted refunds; do not infer the legal or accounting result from a single total.

Use calculation/read operations first. Refund, cancel, process-return and restock mutations require separate authorization with order, amount, currency, line quantities and notification choice stated explicitly.
