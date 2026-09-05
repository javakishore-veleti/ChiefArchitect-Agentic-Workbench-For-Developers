#!/usr/bin/env node
// Choose the GitLab credential and the header that carries it.
//
// GitLab accepts several credential types, each on its own header:
//   PRIVATE-TOKEN  personal, project and group access tokens (documented recommendation)
//   Authorization  OAuth 2.0 bearer tokens, which expire two hours after creation
//   JOB-TOKEN      CI/CD job tokens, valid only on a subset of endpoints
//
// Deploy tokens cannot authenticate against this API and are rejected here
// rather than failing later with an opaque 401.

export const SCHEMES = ['private-token', 'bearer', 'job-token'];

export function authHeader(scheme, token) {
  if (!token) throw new Error('No credential supplied');
  switch (String(scheme ?? '').toLowerCase()) {
    case 'private': case 'private-token': case '': return {'PRIVATE-TOKEN': token};
    case 'bearer': case 'oauth': case 'oauth2': return {Authorization: `Bearer ${token}`};
    case 'job': case 'job-token': case 'ci': return {'JOB-TOKEN': token};
    case 'deploy': case 'deploy-token':
      throw new Error('Deploy tokens cannot be used with the GitLab API; use a personal, project or group access token');
    default: throw new Error(`Unknown auth scheme "${scheme}"; use one of ${SCHEMES.join(', ')}`);
  }
}

// Explicit flag, then explicit environment, then CI job token, then default.
export function resolveCredential({flag, env = process.env} = {}) {
  const token = env.AWFD_GITLAB_TOKEN || env.CI_JOB_TOKEN;
  const scheme = flag
    || env.AWFD_GITLAB_AUTH
    || (!env.AWFD_GITLAB_TOKEN && env.CI_JOB_TOKEN ? 'job-token' : 'private-token');
  return {token, scheme};
}

export function describeAuthFailure(status, scheme, method, endpoint) {
  if (status === 401) return `401 Unauthorized on ${method} ${endpoint}. The credential is missing, expired, or wrong for the ${scheme} scheme. OAuth access tokens expire two hours after they are created.`;
  if (status === 403) return `403 Forbidden on ${method} ${endpoint}. The credential lacks the required scope or role: creating groups and projects needs the \`api\` scope and at least Maintainer on the target namespace.`;
  return null;
}
