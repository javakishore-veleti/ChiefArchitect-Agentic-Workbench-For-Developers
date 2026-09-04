# Metafield vocabulary template

Copy `metafield-vocabulary.example.json`, replace its example mappings, validate it against the schema, and commit the configured file when the terms and metafield coordinates are safe repository metadata. Never store metafield values, customer data, tokens, or secrets here.

Each canonical term and alias must be unique after case and punctuation normalization. Runtime selection accepts `--vocabulary FILE` or `SHOPIFY_METAFIELD_VOCABULARY_PATH`. The resolver fails on missing or ambiguous terms. The query builder reads a metafield from an already identified Shopify object; it does not claim that every object collection can be searched by arbitrary metafield value.
