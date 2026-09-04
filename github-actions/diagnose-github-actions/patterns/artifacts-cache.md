# Artifacts and cache

For artifacts, inspect producer run/attempt, name, path/glob, hidden-file behavior, digest, retention, overwrite/merge behavior, permissions, and download destination. Verify provenance before deployment.

For caches, inspect exact key/version/scope, restore-key fallback, dependency lock hash, branch, backend/action version, archive compatibility, size, and save races. Cache is an optimization, never deployment provenance. Do not place credentials or sensitive build output in either store; never delete entries during diagnosis.
