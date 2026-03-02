# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-03-02

### Changed — BULLETPROOF Phase

- Added Husky v9 pre-commit hook enforcing format → lint → typecheck → test pipeline
- Added lint-staged for staged-file-only Prettier + ESLint on commit
- Created ESLint flat config (`eslint.config.mjs`) with React, Hooks, TypeScript, and security rules
- Updated Prettier to v3 with standardized config (semi, trailing commas, 100 print width)
- Added `.editorconfig` for consistent editor settings
- Upgraded TypeScript from 3.x to 5.x with strict mode enabled
- Replaced Mocha/Chai test runner with Vitest + `@vitest/coverage-v8`
- Added coverage thresholds (30% initial — migrated project baseline)

### Changed — MODERNIZE Phase

- **Webpack 4 → Webpack 5**: Replaced `extract-text-webpack-plugin` with `mini-css-extract-plugin`, `awesome-typescript-loader` with `babel-loader + @babel/preset-typescript`, `url-loader`/`file-loader` with Webpack 5 asset modules
- **Babel 6 → Babel 7+**: Removed all Babel 6 packages. Created modern `babel.config.json` with `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript`
- **All `@waves/*` imports replaced** with `@decentralchain/*` across 60+ files (using npm aliases until packages are published)
- Updated `engines.node` from `^10.24.1` to `>=22`
- Updated `.nvmrc` from `10` to `22`
- Updated manifest.json author from `support@decentralchain.org` to `DecentralChain`
- Updated LICENSE copyright to `DecentralChain`
- Removed `decentralchain` and `decentral.exchange` references from `inpage.js`
- Created modern CI workflow with Node 22/24 matrix
- Added Dependabot configuration for weekly dependency updates
- Added governance docs: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`

### Fixed — FINAL_AUDIT Phase

- **Security**: Replaced `Math.random()` with `crypto.getRandomValues()` in `Statistics.js` and `ConfirmBackup.tsx`
- Renamed `WavesTransactionConverter.js` → `TransactionConverter.js`
- Renamed `wavesTransactionsController.js` → `transactionsController.js`
- Removed dead/legacy dependencies
- Added `KNOWN_ISSUES.md` documenting npm aliases and remaining tech debt

### Removed

- `.babelrc` (Babel 6 config)
- All Babel 6 packages from devDependencies
- `awesome-typescript-loader`, `extract-text-webpack-plugin`, `url-loader`, `file-loader`
- `mocha`, `chai`, Selenium test tooling
- `request` (deprecated HTTP client)

---

## Legacy Changelog

## Cubensis Connect

#### version 1.1.12

- Fix links to decentral.exchange

#### version 1.1.11

- Fix debounce on delete account btn
- Add backup accounts store

#### version 1.1.10

- Added methods to sign and verify custom data
- Added Stagenet in network selector
- simplified the creation of the new accounts
- accounts are now sorted in the list by last activity
- added Privacy Policy confirmation on the registration screen
- fixed bug of empty InvokeScript function error
- fixed network byte loss , while switching between different custom networks

#### version 1.1.9

- CubensisConnect proxy
- Update fixed libs

#### version 1.1.8

- Add auto calculate fee
- Fix auth api
- Orders UI
- Update major libs versions with keeper refactor (updated crypto protocol)

#### version 1.1.7

- Order v3 support
- Fix auto payment
- Add script invocation in package
- Fix some texts

#### version 1.1.6

- Add encrypt and decrypt API by DH
- Fix some UI problems

#### version 1.1.5

- Add notifications
- Update development invocation script
- Fix publicState eventschrome
- Fix build with no lokalize api key
- Some UI fixes
- Messages refactoring

#### version 1.1.4

- Idle configurable
- Some ui fixes
- Tokenomika auto orders

#### version 1.1.3

- Fix bug with attachments from decentralchain lib

#### version 1.1.2

- Add script invocation type: 16
- Add initial promise
- Update documentation

#### version 1.1.1

- Remove Google Analytics
- Update package,json meta data
- Fix delete wallet
- Fix auth protocol host

#### version 1.1.0

- Add custom node for developer
- Add auto sign transactions, with limits by time and tokens
- Some visual bug fixes

#### version 1.0.9

- Fix memory leaks
- Attachment as byte Array in tx type 4 and type 11

#### version 1.0.8

- Fix init badge on restart keeper
- Refactor requests and change design
- Init cancel lease request (fetch transaction lease)
- Fix public state permissions on empty keeper
- Add list of waiting requests
- Add batch of txs
- Extends remote config
- Add autoClick disable setting
- Add ru/en documentation
- Refactor errors
- Opera build scripts update.

---

#### version 1.0.7

- Expiration requests
- Add black/white lists
- Add user permissions
- Add edit permissions page
- Add smart asset transactions
- Some design fixes
- Refactor current active message
- Add to keeper public state tx versions
- Update signature lib
- Update dictionary JSON
- Update api massTransfer tx format
- Fix auth api
