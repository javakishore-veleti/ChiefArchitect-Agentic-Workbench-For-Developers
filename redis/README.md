# Redis skills

| Skill | Purpose | Default context |
|---|---|---|
| `diagnose-redis` | Route Redis failures to focused patterns and produce bounded, evidence-based diagnostics | `SKILL.md` plus one selected pattern |

The skill supports multiple named deployments per arbitrary environment across Redis OSS, Enterprise, Cloud, Azure-managed, and AWS-managed services. Start from `shared/config/redis-config.example.json` and `shared/key-vocabulary/key-vocabulary.example.json`.

Set `REDIS_CONFIG_OVERRIDE_URI` for configuration held outside Git. Local paths, `file://`, HTTP(S), `s3://`, and `azblob://account/container/blob` are supported; cloud sources use the runtime workload identity.

Community evidence and detailed pattern files are loaded only after routing, keeping normal prompt usage small. Production commands are read-only by default; all plans are validated before execution.

## Evidence catalog

Research window: September 4, 2024 through September 4, 2026.

| Source | Distinct cases |
|---|---:|
| Redis Community Forum | 12 |
| Redis core server | 12 |
| Jedis, Lettuce, node-redis and redis-py | 15 |
| Redis Stack | 10 |
| Managed Azure, AWS and Redis Cloud services | 10 |
| **Total** | **59** |

The entrypoint is 181 words, approximately 240 tokens. Evidence shards and pattern files are not loaded by default.
