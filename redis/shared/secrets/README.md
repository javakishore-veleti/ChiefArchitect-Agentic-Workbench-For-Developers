# Secret references

Configuration stores references, never values. Supported provider identifiers are `environment`, `mounted-file`, `azure-key-vault`, `aws-secrets-manager`, `hashicorp-vault`, and `kubernetes-secret`. The runtime adapter must retrieve the value using its workload identity and must not print, persist, compare, or return it. If no provider is configured, fail closed rather than searching other environments.
