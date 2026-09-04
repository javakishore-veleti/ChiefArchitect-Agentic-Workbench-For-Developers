# Configuration and secret resolution

The repository stores routing metadata and secret references only. `configs-envs-mapping[]` assigns one named configuration to one or more arbitrary environment names. `configs[]` holds the corresponding storefront, Shopify and Hydrogen setup. Resolve by environment plus config name or storefront; never guess when several configurations match.

Supported secret providers are environment variables, mounted files, Azure Key Vault, AWS Secrets Manager, HashiCorp Vault and Kubernetes Secrets. Cloud and Kubernetes adapters use their runtime identity and standard CLI authentication. Mounted files are preferred when a CSI driver, external-secrets controller or Vault Agent already performs secret delivery.

Client-credentials authentication exchanges the resolved client ID and secret at Shopify's shop-scoped token endpoint and caches the returned token in process memory. Offline and runtime token modes resolve an access-token reference directly. Never log, serialize or persist resolved secret values or tokens.
