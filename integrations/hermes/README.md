# Hermes Agent

Hermes consumes the same canonical `SKILL.md` packages, but it installs skills instead of discovering `.agents/skills` from an arbitrary cloned repository.

Add this repository as a tap:

```bash
hermes skills tap add javakishore-veleti/ChiefArchitect-Agentic-Workbench-For-Developers
```

Then browse and install the required diagnostic skill with `hermes skills browse` and `hermes skills install`. For a direct GitHub installation, select the canonical skill folder, such as:

```text
javakishore-veleti/ChiefArchitect-Agentic-Workbench-For-Developers/azure/diagnose-azure
javakishore-veleti/ChiefArchitect-Agentic-Workbench-For-Developers/shopify/orders/diagnose-order
```

Do not place credentials in a skill or topology file. Use the environment variables, workload identity, CLI identity or external secret-provider references described by the selected canonical skill. Exact install syntax can vary by Hermes release; confirm the resolved source and security-scan result before enabling it.
