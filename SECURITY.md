# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of x402 AI Gateway seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please DO NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities by emailing the maintainers or by using GitHub's private vulnerability reporting feature:

1. Go to the [Security tab](../../security) of this repository
2. Click "Report a vulnerability"
3. Fill out the form with as much detail as possible

Alternatively, you can create a private security advisory directly.

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations (optional)
- Your contact information for follow-up questions

### Response Timeline

- **Initial Response**: We aim to acknowledge receipt of your vulnerability report within 48 hours
- **Status Update**: We will provide a more detailed response within 7 days, including:
  - Confirmation of the vulnerability
  - Our planned timeline for addressing it
  - Any additional information we need from you
- **Resolution**: We aim to release a fix within 30 days for critical vulnerabilities

### Disclosure Policy

- We ask that you do not publicly disclose the vulnerability until we have had a chance to address it
- Once a fix is released, we will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)
- We maintain a security changelog documenting all security-related fixes

## Security Best Practices for Users

### Credential Management

**CRITICAL**: Never commit `.env` files or any files containing secrets to version control.

1. **Use Environment Variables**: All sensitive credentials should be stored in `.env` files that are listed in `.gitignore`

2. **Rotate Credentials Regularly**:
   - OpenAI API keys
   - Coinbase Developer Platform credentials
   - Ethereum private keys
   - Wallet secrets

3. **Use Separate Credentials for Development and Production**:
   - Development: Use testnet credentials and low-value test accounts
   - Production: Use mainnet credentials with proper security measures

4. **Secure Your Private Keys**:
   - Never share Ethereum private keys or CDP wallet secrets
   - Consider using hardware wallets for production deployments
   - Use key management services (AWS KMS, HashiCorp Vault) for production

### Network Security

1. **Use HTTPS**: Always use TLS/SSL in production deployments
2. **Firewall Configuration**: Restrict access to the API server to authorized clients only
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **DDoS Protection**: Use a reverse proxy or CDN with DDoS protection

### Wallet Security

1. **Testnet First**: Always test on Base Sepolia testnet before using mainnet
2. **Fund Limits**: Only fund payment wallets with the minimum required amount
3. **Monitor Transactions**: Regularly monitor your wallet addresses for unexpected activity
4. **Separate Hot/Cold Wallets**: Use hot wallets for automated payments, cold wallets for treasury

### Docker Security

1. **Don't Run as Root**: The Dockerfile should use a non-root user (currently uses root - please update)
2. **Scan Images**: Regularly scan Docker images for vulnerabilities
3. **Update Dependencies**: Keep base images and dependencies up to date
4. **Secrets Management**: Use Docker secrets or environment files, never build secrets into images

### API Security

1. **Validate Inputs**: Always validate and sanitize user inputs
2. **x402 Verification**: Ensure all requests include valid x402 payment proofs
3. **Log Monitoring**: Monitor logs for suspicious activity
4. **CORS Configuration**: Configure CORS appropriately for your use case

## Known Security Considerations

### Smart Contract Dependencies

This project relies on the x402 protocol and USDC smart contracts on Base network:
- Always verify contract addresses before interacting
- Monitor the x402 protocol for security updates
- Be aware of potential smart contract vulnerabilities

### Third-Party API Dependencies

- **OpenAI API**: This project proxies requests to OpenAI - ensure your OpenAI account has spending limits configured
- **Coinbase Developer Platform**: CDP credentials have broad permissions - use dedicated API keys for this application
- **Base Network**: RPC endpoint security and availability affects payment verification

### Payment Flow Security

1. **Payment Verification**: All requests must include valid x402 payment proofs
2. **Double-Spending Prevention**: The x402 protocol prevents double-spending
3. **Settlement Verification**: Always verify on-chain settlement for high-value transactions

## Security Update Policy

We will release security updates as follows:

1. **Critical vulnerabilities**: Immediate patch release
2. **High severity**: Patch within 7 days
3. **Medium severity**: Patch within 30 days
4. **Low severity**: Included in next regular release

Security updates will be announced via:
- GitHub Security Advisories
- Release notes with `[SECURITY]` tag
- CHANGELOG.md with security section

## Compliance

This project handles cryptocurrency transactions. Users are responsible for:
- Compliance with local regulations regarding cryptocurrency
- KYC/AML requirements in their jurisdiction
- Tax reporting for cryptocurrency transactions
- Terms of service compliance for OpenAI API usage

## Security Audits

This project has not yet undergone a formal security audit. Community security reviews and audits are welcome and appreciated.

## Contact

For non-security related issues, please use the standard GitHub issue tracker.

For security concerns, please use the private reporting methods described above.

## Acknowledgments

We appreciate the security research community and will acknowledge security researchers who responsibly disclose vulnerabilities (unless they prefer to remain anonymous).
