# Configuration diagnostics

Use this pattern for external configuration, profiles, `ConfigData`, property binding, conditional auto-configuration and secret references. Load `knowledge/config-testing.jsonl` only after routing to configuration.

## Establish the effective configuration

1. Record Boot, Framework and Java versions plus the failing environment and launch command.
2. Inventory property sources in precedence order and retain each value's origin; redact values whose keys or origins may contain credentials.
3. Record active/default profiles and evaluate every `spring.config.activate.on-profile` expression.
4. Expand `spring.config.location`, `additional-location` and imports in actual load order. Distinguish optional, fixed, relative, extensionless and `configtree:` locations.
5. For custom Config Data, trace resolver and loader phases separately. Do not assume an earlier textual import can supply credentials to a later resolver.
6. For `@ConfigurationProperties`, capture prefix, binding style, target types, converters, validation failures and collection/list replacement behavior.
7. For a missing auto-configuration, inspect the condition evaluation report: class, bean, property, resource and web-application conditions.

## Common interpretations

- An unresolved `${NAME}` requires source and placeholder analysis; never invent a value.
- Imported documents are inserted immediately below the declaring document. File position alone does not establish precedence.
- A profile name accepted by an older Boot version may fail newer validation.
- `@Primary` selects among beans; it does not override a definition.
- Sanitized Actuator output is evidence. Exporting all effective values can leak secrets and is not a safe default.

Return the first incorrect source, phase, binding target or condition; the winning value's origin with its value redacted when sensitive; exact version behavior; and the smallest configuration-only reproducer.

Official checkpoints: [External configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html), [Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html), and [Auto-configuration conditions](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration.condition-annotations).
