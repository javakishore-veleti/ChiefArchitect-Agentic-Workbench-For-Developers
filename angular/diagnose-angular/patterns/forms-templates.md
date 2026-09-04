# Forms and templates

Load this pattern for reactive or signal-form state, CVAs, validators, form directives, template control flow, ICU expressions, or migration output.

## Evidence to collect

- Form API family, complete control tree, disabled state, update strategy, validators, and pending transitions.
- Identity changes for `FormGroup`, `FormControl`, directives, and subscriptions—not only their values.
- CVA call order and types passed through `writeValue`, registration, disabled state, and emitted changes.
- Original and generated templates for migration failures; compiler and language-service diagnostics separately.
- DOM attachment/removal sequence when `@if` or `@for` owns a form control.

## Diagnosis

Distinguish runtime form state, template-compiler output, migration defects, and editor-only diagnostics. A language-service warning is not proof that a template fails compilation. Replacing a form object may invalidate a subscription even when the directive's own bound inputs appear unchanged. For async validation, capture `PENDING` through the submit decision instead of sampling only final validity.

Do not advise disabling template checks or casting away form types as a diagnosis. Minimize the reproduction while retaining the actual control-flow and directive lifetimes.

Query `knowledge/framework-components.jsonl` with `area == "forms-templates"`; open only matching records. Verify the applicable contract against the linked angular.dev page.
