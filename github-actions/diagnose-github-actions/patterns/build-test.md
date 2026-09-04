# Build and test

Read workflow and reusable-workflow revisions at the run SHA. Check trigger filters, matrix expansion, `needs`/`if` evaluation, shell and working directory, toolchain/runtime image changes, service-container health, test report paths, timeouts, cancellation, and concurrency. Separate deterministic compilation/test failures from runner or dependency outages. Reproduce only with the same lockfiles and toolchain; do not execute untrusted pull-request code with secrets or write permissions.

Safe evidence: checks API, annotations, job/step logs, dependency/cache outcome, uploaded test reports, and changed files. Prefer minimal matrices, fail-fast chosen deliberately, dependency locking, and reusable build/test workflows.
