# Bulletproof Quality Assurance System

> **Version**: 1.1.0 — March 2, 2026
> **Scope**: Any `@decentralchain/*` package or DecentralChain application
> **Goal**: Zero broken code reaches version control — every commit is format-clean, lint-clean, type-safe, and test-passing

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GIT COMMIT TRIGGER                          │
│                       .husky/pre-commit hook                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     npm run bulletproof                             │
│  format → lint:fix → typecheck → test                               │
└─────────────────────────────────────────────────────────────────────┘
```

Every step must exit 0 or the pipeline halts and the commit is rejected.

---

## How to Use This File

1. Open any DecentralChain package or application.
2. Verify the project has the scripts and configs listed below.
3. If anything is missing, add it — this document is the source of truth.
4. Run `npm run bulletproof` manually or let Husky enforce it on every commit.

This system is **project-agnostic**. The specific Prettier rules, ESLint plugins, and test patterns vary per project — but the four-step pipeline structure and enforcement mechanism are universal.

---

## 1. Husky Pre-Commit Hook

**File:** `.husky/pre-commit`

```bash
npx lint-staged && npm run typecheck
```

**How it works:**

- Intercepts every `git commit` command.
- `lint-staged` runs Prettier + ESLint on **staged files only** (fast).
- `typecheck` runs on the full project (must pass before commit).
- If **any step fails, the commit is blocked**.

**Variant for projects without a compile step** (pure JS):

```bash
npx lint-staged && npm run typecheck && npm run test
```

### lint-staged Configuration

In `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs,cjs}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml,css}": ["prettier --write"]
  }
}
```

---

## 2. Format Step: `npm run format`

**Command:** `prettier --write .`

**Config:** `.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Scope:** All source files not excluded by `.prettierignore`.

**Check-only variant:** `prettier --check .` (for CI — no writes).

### Project-Specific Plugins

| Project Type          | Plugin                                        |
| --------------------- | --------------------------------------------- |
| React / Tailwind apps | `prettier-plugin-tailwindcss` (class sorting) |
| SDK / Node libraries  | None needed                                   |

---

## 3. Lint Step: `npm run lint` / `npm run lint:fix`

**Command:** `eslint .` (check) or `eslint . --fix` (auto-fix)

**Config:** `eslint.config.mjs` (ESLint flat config)

### Minimum Required Rules (All Projects)

| Category     | Rules                                        | Severity                                 |
| ------------ | -------------------------------------------- | ---------------------------------------- |
| Unused code  | `@typescript-eslint/no-unused-vars`          | `error` (with `varsIgnorePattern: '^_'`) |
| Console      | `no-console`                                 | `warn` (allow `warn`, `error`)           |
| Const        | `prefer-const`                               | `error`                                  |
| Var          | `no-var`                                     | `error`                                  |
| Type imports | `@typescript-eslint/consistent-type-imports` | `error`                                  |

### Additional Rules by Project Type

| Project Type       | Extra Rules                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| React apps         | `jsx-key`, `rules-of-hooks`, `exhaustive-deps`, `no-direct-mutation-state`  |
| Browser libs       | `no-eval`, `no-implied-eval`                                                |
| Crypto / financial | `no-bitwise` (prevent accidental `&` vs `&&`), `eqeqeq`                     |
| SDK libraries      | `@typescript-eslint/no-explicit-any: warn` or `off` (pragmatic for interop) |

### ESLint + Prettier Integration

Always include `eslint-config-prettier` as the last config to disable formatting rules that conflict with Prettier.

---

## 4. Typecheck Step: `npm run typecheck`

**Command:** `tsc --noEmit`

**Config:** `tsconfig.json`

### Minimum Strictness (All Projects)

| Option                       | Value  | Effect                                                 |
| ---------------------------- | ------ | ------------------------------------------------------ |
| `strict`                     | `true` | Enables all strict checks                              |
| `noUncheckedIndexedAccess`   | `true` | Array/object index returns `T \| undefined`            |
| `noFallthroughCasesInSwitch` | `true` | Prevents fall-through in switch                        |
| `noImplicitOverride`         | `true` | Requires `override` keyword                            |
| `skipLibCheck`               | `true` | Skip `.d.ts` checking (faster, avoids upstream issues) |
| `noEmit`                     | `true` | Type-check only — build tool handles emit              |

### Recommended Additional Strictness

| Option                               | Value  | Notes                                                                         |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| `noUnusedLocals`                     | `true` | If upstream deps cooperate; otherwise use ESLint                              |
| `noUnusedParameters`                 | `true` | Same caveat                                                                   |
| `exactOptionalPropertyTypes`         | `true` | Distinguishes `undefined` from missing; may conflict with some protobuf types |
| `noPropertyAccessFromIndexSignature` | `true` | Forces bracket notation for index signatures                                  |

> **Lesson learned (DCC-18):** If upstream packages ship `.ts` source (not `.d.ts`), `noUnusedLocals` will flag errors inside `node_modules`. In that case, keep it `false` in tsconfig and enforce via ESLint instead — ESLint only checks your source.

---

## 5. Test Step: `npm run test`

**Command:** `vitest run`

**Config:** `vitest.config.ts`

### Minimum Configuration

| Setting               | Value                                         |
| --------------------- | --------------------------------------------- |
| Coverage provider     | `@vitest/coverage-v8`                         |
| Coverage thresholds   | See table below                               |
| Reporters             | `['default']` (add `['json-summary']` for CI) |
| Exclude from coverage | `test/**`, `node_modules/**`, `dist/**`       |

### Coverage Thresholds by Project Maturity

| Stage                                        | Branches | Functions | Lines | Statements |
| -------------------------------------------- | -------- | --------- | ----- | ---------- |
| **New project**                              | 90%      | 90%       | 90%   | 90%        |
| **Migrated project** (first release)         | 70%      | 70%       | 70%   | 70%        |
| **Established project** (post-stabilization) | 80%      | 80%       | 80%   | 80%        |

> **Lesson learned (DCC-18):** Starting at 90% for a large migrated codebase is unrealistic. Start at 70%, ratchet to 80% once coverage gaps are filled, then 90% for steady-state.

### Test Quality Checklist

- [ ] Every public function has at least one happy-path test
- [ ] Every error path (`throw`, `catch`) has a test
- [ ] Edge cases: empty input, `null`, `undefined`, max-value boundaries
- [ ] For crypto/financial code: round-trip tests (encrypt → decrypt, serialize → deserialize)
- [ ] No test depends on external services (network, filesystem) unless in an `integration/` folder excluded from CI

---

## Tool Responsibility Matrix

| Concern             |  Prettier   |   ESLint    | TypeScript  |   Vitest    |
| ------------------- | :---------: | :---------: | :---------: | :---------: |
| Formatting          | **primary** |             |             |             |
| Code style          |             | **primary** |             |             |
| Import order        |             | **primary** |             |             |
| Type safety         |             |   partial   | **primary** |             |
| Dead code detection |             | **primary** |  secondary  |             |
| Runtime correctness |             |             |             | **primary** |
| React rules         |             | **primary** |             |             |
| Security patterns   |             | **primary** |             |             |

---

## Execution Contexts

| Trigger                 | Command                             | Behavior                                   |
| ----------------------- | ----------------------------------- | ------------------------------------------ |
| **Git commit**          | Husky → `lint-staged` + `typecheck` | Auto-fixes staged files, blocks on failure |
| **Manual (with fixes)** | `npm run bulletproof`               | Fixes then validates everything            |
| **CI (check only)**     | `npm run bulletproof:check`         | No auto-fixes — fails on any issue         |

### Required `package.json` Scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "bulletproof": "npm run format && npm run lint && npm run typecheck && npm run test",
    "bulletproof:check": "npm run format:check && npm run lint:check && npm run typecheck && npm run test"
  }
}
```

> Adjust glob patterns per project. The script names and pipeline order must stay consistent.

---

## CI/CD Integration

```yaml
- name: Install dependencies
  run: npm ci

- name: Security audit
  run: npm audit --audit-level=high

- name: Run bulletproof checks
  run: npm run bulletproof:check
```

> Always use `npm ci` (not `npm install`) in CI — it verifies lockfile integrity.

---

## Adding Bulletproof to a New Project

1. `npm install -D husky lint-staged prettier eslint vitest @vitest/coverage-v8`
2. `npx husky init`
3. Write `.husky/pre-commit` per section 1
4. Add `lint-staged` config to `package.json`
5. Add all scripts from the Required Scripts section
6. Add `.prettierrc.json`, `eslint.config.mjs`, `tsconfig.json`, `vitest.config.ts`
7. Run `npm run bulletproof` — fix everything that fails
8. Commit. The hook is now active.

---

The system ensures **no broken code can be committed** without proper formatting, linting, type checking, and passing tests. Every DecentralChain package uses this pipeline — no exceptions.
