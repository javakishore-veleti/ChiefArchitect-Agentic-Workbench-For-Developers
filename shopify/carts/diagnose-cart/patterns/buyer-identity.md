# Buyer identity

Inspect country code, authenticated-customer state, company location, and delivery address. Buyer country controls international pricing and should match shipping context. For B2B pricing, confirm the customer token belongs to the expected shop and the company location has the expected catalog. Dynamic checkout or a recreated cart can lose prior identity; compare cart IDs and `updatedAt`.

