# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues via:

1. **GitHub Security Advisories**: Use the "Report a vulnerability" button on the [Security tab](https://github.com/Decentral-America/cubensis-connect/security/advisories)
2. **Email**: Contact the maintainers directly through GitHub

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix**: Critical issues will be patched as soon as possible

## Security Practices

This extension handles cryptocurrency wallets. We enforce:

- No `Math.random()` in security-sensitive paths — `crypto.getRandomValues()` only
- TypeScript strict mode with full type checking
- Automated security audits via `npm audit` in CI
- Pre-commit hooks that block non-compliant code
- Code review required for all changes
