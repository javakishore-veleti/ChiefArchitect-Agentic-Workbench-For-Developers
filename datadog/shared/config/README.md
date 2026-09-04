# Datadog configuration

Keep real topology and credentials outside Git. `configs-envs-mapping` maps any environment names to reusable organization/site configurations; each configuration may list services, tags, capability entitlements, and a credential reference. `services` may be empty when a controlled inventory provider supplies it.

Set `DATADOG_DIAGNOSTICS_CONFIG` to a local base JSON. Set `DATADOG_DIAGNOSTICS_CONFIG_OVERRIDE_URI`, or pass `--override-uri`, for an ephemeral local/HTTPS/S3/Azure Blob override. The resolver fetches only local and HTTPS directly. S3 and Azure Blob require a caller-provided fetch command so cloud identity remains outside this repository.

Environment credentials are the default fallback. Use a distinctive configured prefix and referenced variable names; never store values here.
