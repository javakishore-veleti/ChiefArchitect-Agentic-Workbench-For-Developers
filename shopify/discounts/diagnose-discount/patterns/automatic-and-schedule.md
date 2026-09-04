# Automatic discounts and schedules

Confirm method is automatic, status is active for the observed timestamp, prerequisites are met, and the discount class matches its intended target. Compare timestamps in UTC and include shop timezone only as presentation context. For subscriptions, inspect purchase option and recurring-cycle configuration. Query the discount node after create/update rather than assuming Admin UI state is current. If an equivalent code discount works, compare their stored configurations and Function bindings; do not conclude that the Function logic differs until inputs and outputs are captured.

Official: https://shopify.dev/docs/apps/build/discounts
