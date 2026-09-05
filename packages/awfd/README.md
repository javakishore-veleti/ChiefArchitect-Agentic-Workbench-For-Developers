# `@javakishore-veleti/awfd`

Explicit, zero-dependency installer for AWFD technology skill packs.

```sh
npm install --save-dev @javakishore-veleti/awfd-azure
npx awfd install
```

The installer writes only after an explicit `install`, `update`, or `uninstall` command. It records managed-file hashes in `.agentic-workbench/installation.json` and refuses to overwrite or remove locally modified files unless `--force` is supplied.

```sh
awfd list
awfd install azure --harness codex,claude,copilot
awfd install --all --dry-run
awfd update
awfd doctor
awfd uninstall azure
```

Pack packages expose an `awfd-pack.json` descriptor and a payload directory. Harness aliases map Codex, Cursor, and Antigravity to `.agents/skills`; Claude to `.claude/skills`; and Copilot to `.github/skills`.
