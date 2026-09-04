# RUM and Synthetics

1. Resolve application/test ID, environment, version, location/device, and release window.
2. Split DNS/TLS/network, server, browser rendering, JavaScript, resource, privacy masking, and user-action delays.
3. Compare RUM population with synthetics; synthetic failure is repeatable evidence, not user-impact magnitude.
4. Validate RUM-to-trace origin mapping, allowed tracing URLs, sampling, session replay privacy, and source maps.
5. Inspect result metadata before screenshots or session contents; disclose sensitive artifacts only when authorized.

Use `knowledge/evidence.jsonl` with `area=rum-synthetics`.
