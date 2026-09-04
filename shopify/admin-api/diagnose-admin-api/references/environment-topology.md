# Environment and storefront topology

Use `shopify/shared/config/shopify-config.schema.json`. The required top-level model is:

- `configs-envs-mapping[]`: each `config-name` applies to one or more arbitrary environment names;
- `configs[]`: named storefront configurations containing Shopify setup and zero or more Hydrogen applications.

Resolve the requested environment to a named configuration. Multiple storefront configurations may apply to the same environment, so also use `config-name` or `storefront`; never guess an ambiguous match.

The Shopify shop owns Admin resources. Hydrogen apps consume commerce data and do not create separate Admin resource boundaries. A configuration can describe multiple Hydrogen apps, and a storefront can use different configurations across environment groups.

Across shops, match resources using stable business identifiers such as handle, SKU plus option identity, metafield namespace/key, metaobject type/handle or an approved external ID. Treat Shopify GIDs as shop-local evidence.
