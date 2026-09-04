# Reusable workflows

Resolve caller and called workflow at their exact refs. Inspect `workflow_call` inputs, secret inheritance, output propagation, nested depth, matrix values, permissions reduction, environment behavior, and OIDC `job_workflow_ref`. Distinguish reusable workflows from composite actions.

Centralize governed build/deploy logic while keeping typed inputs and explicit secrets. A called workflow cannot elevate token permissions granted by its caller. Pin cross-repository calls to immutable SHAs for high-trust paths.
