# Fulfillment and shipping

Use fulfillment orders as the operational source. Map fulfillment-order line-item IDs to order line items; do not submit order line-item IDs to fulfillment mutations. Check assigned location, request/hold state, supported actions, remaining quantity, tracking and delivery method. Shipping lines and fulfillment orders are not one-to-one, especially after edits or split routing.

Compare display fulfillment status only after examining underlying fulfillment orders. Never fulfill, move, hold, cancel or release fulfillment work without explicit authorization.
