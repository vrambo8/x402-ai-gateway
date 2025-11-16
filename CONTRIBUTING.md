# Contributing to x402 AI Gateway

Thank you for your interest in contributing to the x402 AI Gateway project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, etc.)
- Relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please:
- Check existing issues first to avoid duplicates
- Clearly describe the feature and its use case
- Explain why this feature would benefit the project
- Consider providing implementation suggestions

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/x402-ai-gateway.git
   cd x402-ai-gateway
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up development environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install pytest pytest-asyncio httpx black flake8
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

5. **Run tests**
   ```bash
   pytest tests/
   ```

6. **Format code**
   ```bash
   black app/ tests/
   flake8 app/ tests/
   ```

7. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Provide a clear description of your changes
   - Link any related issues

## Development Guidelines

### Code Style

- Follow PEP 8 Python style guide
- Use type hints where appropriate
- Keep functions focused and small
- Add docstrings to all public functions and classes

Example:
```python
async def calculate_cost(model: str, tokens: int) -> Decimal:
    """
    Calculate the cost for a given model and token count.

    Args:
        model: The OpenAI model name
        tokens: Number of tokens

    Returns:
        Cost in USD as Decimal
    """
    # Implementation
```

### Testing

- Write unit tests for all new features
- Aim for good test coverage
- Use pytest for testing
- Mock external dependencies (OpenAI API, Redis, PostgreSQL)

### Documentation

- Update README.md if adding new features
- Add inline comments for complex logic
- Update API documentation
- Include examples where helpful

### Commit Messages

Use clear, descriptive commit messages:
- Start with a verb (Add, Fix, Update, Remove)
- Keep first line under 50 characters
- Add details in body if needed

Good examples:
```
Add support for GPT-4o-mini model pricing
Fix rate limiting race condition in token bucket
Update documentation for x402 payment flow
Remove deprecated configuration options
```

## Project Structure

```
server/
├── app/
│   ├── config.py              # Configuration management
│   ├── cost/                  # Cost calculation modules
│   ├── db/                    # Database models and sessions
│   ├── logging/               # Logging configuration
│   ├── middlewares/           # FastAPI middleware
│   ├── monitoring/            # Prometheus metrics
│   ├── payment/               # x402 payment handling
│   ├── rate_limiting/         # Rate limiting logic
│   └── routes/                # API endpoints
├── tests/                     # Test files
├── alembic/                   # Database migrations
└── main.py                    # Application entry point

client/                        # Example client implementation
```

## Areas for Contribution

We welcome contributions in these areas:

### High Priority
- [ ] Support for more AI providers (Anthropic Claude, Google Gemini, Mistral)
- [ ] Admin dashboard UI
- [ ] Integration tests
- [ ] Load testing suite
- [ ] Grafana dashboard templates
- [ ] Kubernetes deployment examples

### Medium Priority
- [ ] Multi-currency support (ETH, SOL, other tokens)
- [ ] Webhook system for payment notifications
- [ ] Enhanced error handling and retry logic
- [ ] Load balancing across multiple API keys
- [ ] Usage analytics and reporting

### Nice to Have
- [ ] CLI tool for management
- [ ] Performance optimizations
- [ ] Additional AI model support
- [ ] Documentation improvements
- [ ] Client SDKs (JavaScript, Go, Rust)

## Getting Help

- Open an issue for questions
- Check existing issues and PRs
- Review documentation in README.md
- Read the implementation plan (crypto-openai-proxy-impl-plan.md)

## Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## Release Process

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md with changes
- Tag releases with version numbers
- Publish release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with the "question" label or reach out to the maintainers.

Thank you for contributing to x402 AI Gateway!
