# Profile and addresses

Inspect payload `userErrors` and returned customer/address nodes. Validate field format, country/zone compatibility, address ownership, default-address ID, and API-specific input shape. Customer Account and Admin mutations have different types and authorization rules.

For missing changes, confirm the mutation targeted the resolved shop and customer ID, then re-read by ID. Do not retry writes automatically; report whether the observed failure is validation, authorization, or propagation.
