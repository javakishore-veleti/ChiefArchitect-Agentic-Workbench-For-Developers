---
name: awfd-gitlab-repo
description: Use when creating, auditing, or reconciling GitLab groups, subgroups and projects in bulk from an architecture document, a JSON manifest, or a described repository layout.
---

# Manage GitLab repositories

Apply [GitLab operating rules](../shared/OPERATING-RULES.md).

Turn a described repository estate into GitLab groups, subgroups and projects. The description is the source of truth; this skill never invents a project that the description does not name.

## Resolve the specification

Accept the estate description in whichever form the user supplies, and normalize it with `scripts/parse-spec.mjs` before doing anything else.

- **JSON manifest** — `--json <file>`, already in the manifest shape below.
- **Markdown table** — `--markdown <file>`, any table whose headers name a repository and its grouping. Column headers are matched case-insensitively: a name column (`service`, `repo`, `repository`, `project`, `name`), and grouping columns (`portfolio`, `group`, `program`, `subgroup`, `team`, `domain`). Remaining columns are carried as metadata.
- **Described in conversation** — write the user's description to a JSON manifest first, show it, and have them confirm it. Never provision directly from prose.

Normalize every name to a GitLab path: lowercase, non-alphanumeric runs collapsed to a single hyphen, no leading or trailing hyphen. Report any name that collides after normalization instead of silently merging.

## Plan

Run `scripts/provision.mjs --root <namespace>` with no `--apply`. This is a dry run and needs no authorization. It prints the full tree: every group to create, every project to create, and every one already present.

Validate the plan with `scripts/validate-plan.mjs` before proposing it. The plan is rejected when it contains a destructive operation, a path that is not a legal GitLab path, a duplicate target, or a root namespace that does not resolve.

Show the plan and the counts. State explicitly what will be created and what already exists.

## Apply

Only after the user authorizes the shown plan, re-run with `--apply`. The instance host comes from `--host` or `AWFD_GITLAB_HOST`.

Credentials come from `AWFD_GITLAB_TOKEN`, carried on the header GitLab expects for that credential type. `scripts/auth.mjs` resolves this; never construct the header inline.

| Credential | Scheme | Header |
|---|---|---|
| Personal, project or group access token | `private-token` (default) | `PRIVATE-TOKEN` |
| OAuth 2.0 access token | `--auth bearer` | `Authorization: Bearer` |
| CI/CD job token | `--auth job-token`, or `CI_JOB_TOKEN` detected in a GitLab job | `JOB-TOKEN` |

The token needs the `api` scope and at least Maintainer on the target namespace. Deploy tokens do not work against this API and are rejected up front rather than failing later as a 401. OAuth access tokens expire two hours after they are created; a mid-run 401 on a long provisioning pass usually means expiry, not a wrong token.

Creation is idempotent: an existing group or project is reported and skipped, never duplicated or overwritten. Add `--seed` to commit a generated specification and Backstage `catalog-info.yaml` into each new project; seeding skips any project whose default branch already has content.

Never rename, transfer, archive or delete as part of a provisioning run. Those are separate operations requiring their own authorization for exact paths.

## Manifest shape

```json
{
  "groups":   [{"path": "patients", "name": "Patients", "parent": null},
               {"path": "identity", "name": "identity", "parent": "patients"}],
  "projects": [{"name": "patient-identity-service", "group": "patients/identity",
                "description": "…", "metadata": {"boot": "2.7", "phi": "yes"}}]
}
```

## Return

Return the resolved root namespace, the counts created and already present, the full path of anything created, any name that failed normalization, any namespace that was inaccessible, and the next safe operation. Report a partial run honestly: name what succeeded before the failure rather than implying the estate is complete.
