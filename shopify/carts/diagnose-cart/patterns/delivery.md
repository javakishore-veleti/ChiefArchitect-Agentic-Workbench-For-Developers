# Delivery

Delivery groups depend on buyer identity/address and shippable lines. Verify country, province, postal code, inventory location, shipping profile, market, and subscription grouping. Empty groups without a usable address are not necessarily a platform defect. Carrier-calculated rates require `withCarrierRates: true` with `@defer`; distinguish static from carrier rates and capture deferred patches.

