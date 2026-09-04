# Buyer context and localization

Record the exact `@inContext` country, language, market, buyer identity, company location, and visitor consent used by the failing request. Compare with identical variables and token. Missing context can legitimately change currency, translated content, catalog price, availability, and checkout behavior.

Confirm the country/language is enabled for the resolved shop and sales channel. Do not infer a platform defect from different responses when buyer context differs. Route product price/availability defects to the products skill after proving the cross-cutting context is identical.

Official reference: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context

