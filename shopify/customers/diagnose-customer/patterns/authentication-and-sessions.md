# Authentication and sessions

For Customer Account API failures, verify exact registered redirect URI, authorization-code flow with PKCE, `state` and `nonce`, cookie/session persistence, token audience, expiry, refresh handling, and logout behavior. Never print codes or tokens. Distinguish browser session loss from API authorization failure.

For Admin calls, use the shared Admin authentication resolver. Client ID/secret are not an API access token. For legacy Storefront calls, a Storefront token authorizes the channel while a customer access token identifies the buyer; neither is an Admin token.
