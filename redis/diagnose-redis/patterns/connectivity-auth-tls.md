# Connectivity, authentication, and TLS

Load this pattern for connection refusal, DNS, cluster bootstrap, Sentinel recovery, ACL, certificate, trust-store, mTLS, or identity-token symptoms.

## Triage

1. Identify client, exact version, topology, endpoint source, TLS mode, auth mode, and the last known-good version.
2. Resolve DNS and TCP reachability from the application runtime, not a workstation.
3. For Cluster, compare seed endpoints with every address returned by `CLUSTER SLOTS`/`CLUSTER SHARDS`. A reachable seed does not make advertised private addresses reachable.
4. For Sentinel, record discovery attempts and verify recovery after both Sentinel and data nodes return.
5. Verify the effective client configuration. URI constructors and framework adapters may not preserve every TLS option.
6. Confirm certificate chain, hostname verification, SNI, trust store, client certificate, ACL username, and credential/token expiry without printing secrets.
7. Compare one variable at a time across working and failing environments or client versions.

## Evidence

Capture sanitized endpoint class, resolved address, connect/handshake duration, exception cause chain, client/server versions, topology response, reconnect events, token expiry window, and correlation timestamps. Treat an untriaged issue as reported behavior, not a Redis defect.

Do not disable TLS verification as a fix. Do not log passwords, access keys, tokens, certificates, or complete connection strings.
