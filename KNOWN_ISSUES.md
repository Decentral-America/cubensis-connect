# Known Issues

## npm Aliases for `@decentralchain/*` Packages

**Severity**: MEDIUM  
**Affected packages**:

- `@decentralchain/bignumber` → aliased to `npm:@waves/bignumber@^1.0.0`
- `@decentralchain/data-entities` → aliased to `npm:@waves/data-entities@^2.0.4`
- `@decentralchain/ts-types` → aliased to `npm:@waves/ts-types@^0.3.3`
- `@decentralchain/signature-generator` → aliased to `npm:@waves/signature-generator@^5.2.1`

**Why**: The `@decentralchain/*` equivalents of these packages have not yet been published to npm. All source code imports use `@decentralchain/*`, but npm resolves them to the original `@waves/*` packages via npm aliases.

**Resolution path**: Fork and publish these packages under the `@decentralchain` npm scope. Once published, remove the `npm:@waves/*` aliases from `package.json` and replace with direct version references.

**Risk**: The `@waves/*` packages are no longer actively maintained. If they are unpublished or compromised on npm, the alias resolution would break. Pin exact versions and audit regularly.

---

## Legacy Selenium/WebDriver Tests

**Severity**: LOW  
**Affected files**: All files in `test/*.ui.ts`

**Why**: The original test suite uses Mocha + Selenium WebDriver + testcontainers for browser automation testing. These are integration tests that require Docker and a running browser, not unit tests. They have been excluded from the Vitest configuration.

**Resolution path**: Gradually extract testable logic from controllers and UI components into pure functions, and write Vitest unit tests for them. Keep the Selenium tests as an optional integration test suite run separately.

---

## `@babel/core` as Runtime Dependency

**Severity**: LOW  
**Affected file**: `package.json`

**Why**: `@babel/core` was historically listed in `dependencies` (not `devDependencies`) and some runtime code paths may reference it. It has been moved to `devDependencies` in the modernization. If any runtime import of babel is discovered, it should be refactored away.

---

## Protobuf Compiled Files

**Severity**: INFO  
**Affected files**: `*.proto.compiled.js`, `*.proto.compiled.d.ts`

**Why**: These are auto-generated files from protobufjs. They are excluded from Prettier/ESLint formatting. If the `.proto` source changes, these files need to be regenerated.
