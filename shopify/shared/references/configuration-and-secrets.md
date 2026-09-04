# Configuration and secret resolution

The repository stores routing metadata and secret references only. `configs-envs-mapping[]` assigns one named configuration to one or more arbitrary environment names. `configs[]` holds the corresponding storefront, Shopify and Hydrogen setup. Resolve by environment plus config name or storefront; never guess when several configurations match.

Supported secret providers are environment variables, mounted files, Azure Key Vault, AWS Secrets Manager, HashiCorp Vault and Kubernetes Secrets. Cloud and Kubernetes adapters use their runtime identity and standard CLI authentication. Mounted files are preferred when a CSI driver, external-secrets controller or Vault Agent already performs secret delivery.

Client-credentials authentication exchanges the resolved client ID and secret at Shopify's shop-scoped token endpoint and caches the returned token in process memory. Offline and runtime token modes resolve an access-token reference directly. Never log, serialize or persist resolved secret values or tokens.

If a resolved config has no `shopify.authentication`, the default environment provider looks for scoped variables. With the default prefix these are `SHOPIFY_<STOREFRONT>_<ENV>_ADMIN_ACCESS_TOKEN` or the pair `SHOPIFY_<STOREFRONT>_<ENV>_CLIENT_ID` and `SHOPIFY_<STOREFRONT>_<ENV>_CLIENT_SECRET`. Set `environment-variable-prefix` on a config or `SHOPIFY_SECRET_PREFIX` at runtime to use an enterprise prefix. Explicit authentication configuration always wins. Scoped fallback never uses another environment's or storefront's credentials.

Set `SHOPIFY_CONFIG_OVERRIDE_URI` or pass `--override-uri` to load non-secret override JSON outside Git. Supported sources are local paths, `file://`, HTTPS or signed URLs, `s3://`, and `azblob://ACCOUNT/CONTAINER/BLOB`. Runtime cloud identities authenticate S3 and Azure Blob. Override entries replace complete mappings or configs with the same `config-name`; partial credential deep-merges are intentionally forbidden. The merged document is validated before resolution.
