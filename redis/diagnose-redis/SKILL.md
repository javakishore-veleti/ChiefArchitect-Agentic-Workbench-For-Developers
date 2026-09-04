---
name: diagnose-redis
description: Diagnose Redis connectivity, correctness, performance, clustering, persistence, Streams, Search, and managed-service issues using bounded read-only evidence.
---

# Diagnose Redis

Resolve the requested environment and deployment from `redis/shared/config/`, then classify the symptom with `scripts/classify-issue.mjs`. Read only the selected pattern named by `patterns/index.json`; consult only the relevant source shard under `knowledge/` when comparable evidence is needed.

Resolve business key terms with `redis/shared/key-vocabulary/resolve-key-term.mjs`. Require every template parameter; never invent keys or expand an unbounded pattern.

Before execution, pass the command plan through `scripts/validate-command-plan.mjs`. Production is read-only by default. Never run broad discovery, blocking inspection, administrative, destructive, or mutation commands without explicit authorization and an independently bounded target.

Collect the smallest evidence set that distinguishes the likely causes. Report context, observations, probable cause with confidence, contradictory evidence, and next safe action. Distinguish Redis core behavior from client-library and managed-service behavior.

Configuration may be committed from the templates or loaded through `REDIS_CONFIG_OVERRIDE_URI` from a local/file URI, HTTPS, S3, or Azure Blob. Override entries replace complete `config-name` entries rather than deep-merging credentials. Secret references identify a provider; they never contain secret values.
