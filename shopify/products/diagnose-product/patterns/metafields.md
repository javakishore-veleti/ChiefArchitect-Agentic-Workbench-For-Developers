# Product metafields

Resolve the definition by owner type, namespace and key, then compare the submitted value and type with that definition. Distinguish a missing value, an inaccessible field and a validation failure.

Capture indexed `userErrors.field` paths and verify the owner is the intended product or variant. Do not coerce JSON or reference values speculatively. Definitions and referenced metaobject entries can differ by shop/environment.
