# Creation and schema

Check the configured Admin API version before changing the document. Introspect or consult that version's mutation input and payload; deprecated examples frequently use renamed fields. Capture both top-level `errors` and payload `userErrors { field code message }`. A transport success does not mean the mutation succeeded, and an error does not prove that no object was created: query by stable title or code before retrying. Verify `write_discounts`; related customer, product, or shipping reads may need additional scopes. Never retry a create mutation automatically.

Official: https://shopify.dev/docs/apps/build/discounts
