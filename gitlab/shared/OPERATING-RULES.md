# GitLab Operating Rules

Use these rules for any GitLab skill. Unlike the diagnostic verticals, repository management **writes**, so the authorization rules are binding rather than advisory.

- Discover setup dynamically. Never embed an organization's group, subgroup, project or namespace inventory in a skill.
- Accept instance host, root namespace, group, subgroup, project, visibility and topic filters when provided.
- Record inaccessible namespaces and projects; never interpret missing access as an empty result.
- Resolve the target namespace before proposing any change. A namespace that resolves to more than one candidate is ambiguous and stops the operation.
- **Plan before writing.** Produce the complete set of intended creations, renames, archivals and deletions, show it, and obtain explicit authorization for those exact targets. A dry run is the default and the only mode that needs no authorization.
- **Creation is the only write this skill performs without a second confirmation.** Renaming, transferring, archiving and deleting each require their own explicit authorization naming the exact project path, and deletion additionally requires the operator to confirm that the project has no unique history.
- Operations must be idempotent. Check for an existing group or project before creating it, and report it as already present rather than failing or duplicating.
- Never write a token, password or key into a project, a variable, a description or a log line. Read credentials from the environment or an external secret provider, and never echo them in an error message.
- Match the credential to its header: `PRIVATE-TOKEN` for personal, project and group access tokens, `Authorization: Bearer` for OAuth 2.0, `JOB-TOKEN` in CI. Deploy tokens cannot authenticate against this API.
- Report a 401 as a credential problem and a 403 as a scope or role problem. Neither is an empty result.
- Never commit content that contains protected health information, personal data or production secrets, including in seeded README and catalog files.
- Prefer the smallest namespace scope that satisfies the request. Do not enumerate an entire instance to satisfy a question about one group.
