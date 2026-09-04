# API boundaries

First identify the account model and caller. Admin operations use `/admin/api/<version>/graphql.json` and an Admin token. Current buyer self-service uses the Customer Account API with customer OAuth/OIDC. Storefront `customer*` password/token operations belong to legacy customer accounts. Tokens and GraphQL types are not interchangeable.

Check endpoint host/path, token issuer/audience, account model selected in Shopify, Hydrogen application's configured client, and the operation's API documentation. A valid token for the wrong surface is still invalid. Do not recommend a legacy operation merely because it is familiar.
