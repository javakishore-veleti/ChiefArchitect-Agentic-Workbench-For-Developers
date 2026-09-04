# Allocations and reporting

Distinguish discount definition, application, and allocation. An application describes why/how a discount was applied; allocations distribute monetary value across lines. Record amount and currency at each level and avoid reconstructing percentages from rounded allocated amounts. Usage and sales aggregates can update asynchronously. For orders, preserve original order currency and presentment context. If attribution is unclear, inspect application type/title/code/function metadata rather than guessing from a line amount.

Official: https://shopify.dev/docs/api/admin-graphql/latest/interfaces/DiscountApplication
