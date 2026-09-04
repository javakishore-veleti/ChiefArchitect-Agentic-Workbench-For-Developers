# Discounts

After `cartDiscountCodesUpdate`, inspect each returned code's `applicable`, discount applications, line allocations, and cart costs. The mutation replaces the entire list. Confirm customer/market eligibility, minimums, combinations, dates, and merchandise scope. Separate a code present-but-inapplicable from a missing code. If checkout differs, capture cart state immediately before following `checkoutUrl`.

