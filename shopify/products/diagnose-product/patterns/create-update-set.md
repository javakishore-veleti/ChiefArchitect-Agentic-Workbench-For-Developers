# Create, update and productSet

First identify the contract: create, patch-like update, or declarative synchronization with `productSet`. Inspect the exact input type in the configured API version and capture all `userErrors`.

For `productSet`, establish whether omitted list fields are preserved or treated as authoritative by the current contract. Record synchronous/asynchronous mode and poll the returned operation when applicable. Re-read the product before claiming success. Mutations require explicit authorization and an idempotency/retry decision.
