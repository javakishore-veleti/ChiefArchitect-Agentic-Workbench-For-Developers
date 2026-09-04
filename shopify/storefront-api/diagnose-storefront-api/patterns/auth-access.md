# Authentication and access

Check the resolved shop, API version, token type, sales channel, and Hydrogen app before changing scopes. Public tokens use `X-Shopify-Storefront-Access-Token`; private tokens use `Shopify-Storefront-Private-Token` and server-side requests should forward the buyer IP. Tokenless access supports only a limited surface.

Reproduce a minimal `shop` query. Distinguish HTTP 401/403, GraphQL access errors, and a field returning null. A configured scope change may require token/channel regeneration or redeployment; prove the effective token rather than trusting configuration text. Never place private tokens in browser code, logs, variables JSON, or reports.

Official references: https://shopify.dev/docs/api/storefront/latest#authentication and https://shopify.dev/docs/api/usage/authentication

