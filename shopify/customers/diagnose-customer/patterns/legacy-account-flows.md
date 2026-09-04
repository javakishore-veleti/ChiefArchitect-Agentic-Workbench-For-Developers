# Legacy account flows

Confirm the shop still uses legacy customer accounts before investigating `customerCreate`, `customerAccessTokenCreate`, password reset, or Multipass. Inspect both top-level errors and mutation `customerUserErrors`, token expiry, and Storefront API version.

Do not treat Customer Account API OAuth tokens as legacy Storefront customer access tokens. Record a migration finding when a headless implementation depends on deprecated legacy flows; keep immediate diagnosis separate from migration planning.
