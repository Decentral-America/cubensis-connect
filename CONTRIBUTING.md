# Contributing to Cubensis Connect

Thank you for your interest in contributing to Cubensis Connect!

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Decentral-America/cubensis-connect.git
   cd cubensis-connect
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Run the development build**

   ```bash
   echo '{}' > config.json
   npm run dev
   ```

4. **Load the extension** (Chrome):
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/chrome` folder

## Quality Gates

Every commit must pass the bulletproof pipeline:

```bash
npm run bulletproof
```

This runs: **format → lint → typecheck → test**

Husky pre-commit hooks enforce this automatically. If any step fails, the commit is blocked.

## Code Style

- **Prettier** handles all formatting — do not fight it
- **ESLint** (flat config) enforces code quality rules
- **TypeScript** strict mode is enabled — no `any` in new code
- **Vitest** is the test runner — all new code must have tests

## Pull Request Process

1. Create a feature branch from `master`
2. Make your changes with passing tests
3. Run `npm run bulletproof` locally
4. Open a PR — CI will run the full pipeline
5. Address review feedback
6. Merge when approved and CI passes

## Security

This extension manages cryptocurrency wallets and signs transactions. All code changes are reviewed with security in mind:

- Never use `Math.random()` — use `crypto.getRandomValues()`
- Never log, store, or transmit private keys or seed phrases in plain text
- Always validate user input (addresses, amounts, fees)
- Use `===` for all comparisons

## Reporting Issues

Use [GitHub Issues](https://github.com/Decentral-America/cubensis-connect/issues) to report bugs or request features.
