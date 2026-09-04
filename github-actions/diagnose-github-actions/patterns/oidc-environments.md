# OIDC and environments

Inspect `id-token: write`, token audience/subject, repository/ref/environment claims, reusable workflow identity, cloud trust policy, branch/tag context, and environment protection. Never decode and publish a live token.

Use environment-scoped trust and stable claims, narrow cloud roles, required reviewers/rules, and separate nonproduction from production identities. Diagnose permission denial, audience mismatch, subject mismatch, missing environment, and expired token independently. Do not weaken trust conditions as a diagnostic shortcut.
