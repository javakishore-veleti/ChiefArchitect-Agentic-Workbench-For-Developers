# Variants and options

Read product options and variants before mutation. Map each intended variant to the exact ordered option name/value tuple. Check duplicates, option existence, per-operation limits, inventory-item state and API-version schema.

For bulk variant mutations, collect every `userErrors.field`, code and message and map indexed fields back to the submitted item. Treat partial-looking client output as unproven until the product is re-read. Never reuse variant or option GIDs from another shop.
