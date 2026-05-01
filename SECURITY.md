# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Responsible Disclosure

1. **DO NOT** create a public issue for security vulnerabilities
2. Email us directly at: **security@example.com** (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### ⏱️ Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Released**: Within 30 days (critical), 90 days (non-critical)
- **Public Disclosure**: After fix is released

### 🛡️ Security Best Practices

#### API Keys
- API keys are stored **locally** in browser localStorage
- Keys are **never** sent to our servers
- Users can clear keys at any time
- We recommend using environment-specific keys

#### Script Execution
- This editor does **NOT** execute userscripts
- Scripts are only edited and saved
- Always review code before installing in Tampermonkey

#### Dependencies
- We regularly update dependencies
- Security patches are applied promptly
- Check `npm audit` before releases

### 📋 Security Checklist for Contributors

- [ ] No hardcoded secrets or API keys
- [ ] No `eval()` or `Function()` usage
- [ ] Input validation for all user inputs
- [ ] XSS prevention in rendered content
- [ ] CSP headers configured
- [ ] Dependencies are up to date

## 🔐 Encryption

- localStorage data is not encrypted (browser limitation)
- Consider using browser profiles for sensitive work
- API keys should be rotated regularly

## 📞 Contact

For security concerns, contact:
- Email: security@example.com
- Please use [PGP encryption](https://keybase.io) if possible

Thank you for helping keep Tampermonkey Script Editor secure! 🛡️
