# Protected data and scopes

Admin customer access can require both declared/granted scopes and protected-customer-data approval. Capture the exact denied field, GraphQL error code, installed app scopes, distribution type, and deployed app configuration. More scopes do not cure missing protected-data approval; approval does not cure a missing scope.

Probe `id`, lifecycle state, and non-sensitive fields first. Add email, phone, name, addresses, or orders only when the investigation is authorized. Redact values in saved evidence.
