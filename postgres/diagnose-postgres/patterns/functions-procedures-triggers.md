# Functions, procedures, and triggers

Resolve routines by schema, name, and full identity arguments; names alone are ambiguous because PostgreSQL supports overloading. Report routine kind, language, owner, volatility, parallel safety, security definer, configuration (especially `search_path`), result type, and definition.

For triggers, report owning table, timing/events, enabled state, constraint relationship, and function identity. Separate DML triggers from event triggers. Flag security-definer routines with mutable or unsafe `search_path`; do not execute routine bodies while inspecting them.

Use `queries/inspect-routine.sql`; inspect trigger bindings separately with `queries/inspect-routine-triggers.sql`. Treat concurrent DDL and catalog-version defects as version-sensitive, not application errors.
