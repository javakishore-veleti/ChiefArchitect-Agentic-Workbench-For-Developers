# Environment and storefront topology

Treat these as independent axes:

- technical environment: development, QA, staging, preproduction, production or another configured stage;
- business storefront: any enterprise audience, portfolio, brand, region or channel;
- Shopify shop: the Admin API security and resource boundary;
- application: the custom app and scopes used for Admin API access;
- Hydrogen application and deployment: a consumer of commerce data, not the Admin API boundary;
- market, catalog and publication: visibility and contextual-pricing boundaries.

Discover mappings from approved configuration or platform APIs. Never encode an industry, storefront list or fixed environment sequence. One environment may contain several business storefronts; storefronts may share a shop or use separate shops.

Across shops, match resources using handles, SKU plus option identity, namespace/key, type/handle or an approved external ID. Record GIDs only as environment-local evidence.
