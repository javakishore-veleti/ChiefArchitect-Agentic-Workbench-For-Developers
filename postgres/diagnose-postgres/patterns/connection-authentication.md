# Connection and authentication

Use this pattern for connection rejection, TLS/certificate failures, `pg_hba.conf` mismatches, or database `CONNECT` denial.

## Inspect in order

1. Record the resolved host, port, database, requested role, client address, SSL mode and server version. Never print passwords or private keys.
2. Separate transport/TLS failure from PostgreSQL authentication. A TLS chain error may occur before a matching HBA rule authenticates the role.
3. On the server, inspect `pg_hba_file_rules` for parse errors and rule order. Do not modify or reload HBA configuration during diagnosis.
4. Compare certificate issuer, SAN/hostname, validity and trusted CA. Do not recommend disabling verification as the default fix.
5. Confirm `rolcanlogin`, role validity, database existence, `datallowconn`, connection limits and `has_database_privilege(role, database, 'CONNECT')`.
6. Remember that `PUBLIC` grants, direct grants and inherited membership can each provide access. A successful `REVOKE` may leave another grant path.

Load `knowledge/security.jsonl` only when evidence is needed. Relevant topics include TLS CA failures, database CONNECT grant provenance and sequence permissions misreported as missing objects.

## Return

Report the failing layer, matched evidence, effective identity, exact denied capability and the smallest safe remediation. Mark managed-service controls that cannot be inspected instead of inventing their state.
