# Mock4IELTS Architecture

This document is the canonical architecture reference for the Mock4IELTS
monorepo. App-specific docs should link here instead of duplicating system
structure, deployment, or ownership rules.

## Repository Layout

```txt
mock4ielts/
  .claude/                 Local assistant/project context
  .github/                 GitHub Actions, PR templates, repository automation
  apps/
    web/                   Public learner-facing Next.js application
    admin/                 Admin dashboard Next.js application
  docs/
    architecture.md        System and repository architecture
    api.md                 Web and admin API contract
    ci-cd.md               CI/CD operations
  .editorconfig            Repository-wide editor behavior
  .gitignore               Repository-wide Git ignore rules
  .prettierignore          Repository-wide formatting ignore rules
  package.json             Monorepo command runner only
  README.md                Project entrypoint
```

## Applications

### `apps/web`

The public web application is the learner-facing product. It contains:

- route tree and pages under `apps/web/src/app`
- public assets under `apps/web/public`
- API client and endpoint registry in `apps/web/src/lib/axios.ts`
- web-specific package, lockfiles, Next config, TypeScript config, Dockerfile,
  and compose file

The web app uses npm. Its dependency graph and lockfile belong inside
`apps/web`, not at the repository root.

Primary responsibilities:

- authentication for learners
- profile, subscriptions, statistics, favorites, and notifications
- IELTS practice flows for listening, reading, writing, and speaking
- mock exam and contest participation
- LiveKit token route for speaking sessions at `GET /api/token`

### `apps/admin`

The admin application is the operational dashboard for content and user
management. It contains:

- dashboard route tree under `apps/admin/src/app/dashboard`
- admin API client and endpoint registry in `apps/admin/src/lib/axios.ts`
- section, part, question, contest, mock exam, user, and media management views
- admin-specific package, lockfile, Next config, TypeScript config, Dockerfile,
  and compose file

The admin app uses Yarn 1.x. Its dependency graph and lockfile belong inside
`apps/admin`.

Primary responsibilities:

- admin JWT login and refresh
- section authoring across listening, reading, writing, and speaking
- part/question CRUD and question reorder operations
- mock exam and contest lifecycle management
- user administration
- media upload for content assets

## Root Ownership Rules

The repository root is not an application runtime. It owns repository-level
coordination only.

| File or directory | Keep at root? | Reason |
| --- | --- | --- |
| `.github/` | Yes | GitHub Actions and PR templates are repository-level automation. |
| `.claude/` | Yes | Assistant/project context applies to the whole workspace. |
| `docs/` | Yes | Canonical docs must be in one place for both apps. |
| `.editorconfig` | Yes | Editor behavior should be consistent across web, admin, docs, and scripts. |
| `.gitignore` | Yes | Ignore rules should cover generated files in all apps. |
| `.prettierignore` | Yes | Formatting exclusions should be consistent repo-wide. |
| `package.json` | Yes | Root package is a command runner for the monorepo, not an app dependency file. |
| Next.js configs | No | App-specific Next config belongs in `apps/web` or `apps/admin`. |
| app lockfiles | No | `package-lock.json` belongs to `apps/web`; `yarn.lock` belongs to `apps/admin`. |
| Dockerfile/compose | No | Runtime image context is app-specific and belongs inside each app folder. |
| `src/` and `public/` | No | Source and public assets belong inside the owning app. |

Do not add another `.editorconfig`, `.gitignore`, or `.prettierignore` inside an
app unless that app has a genuine exception that cannot be expressed safely at
the root. The current preferred setup is one root policy file for the whole
repository.

## Dependency Boundaries

The apps are intentionally independent at runtime.

- Web dependencies are installed with `npm ci` from `apps/web`.
- Admin dependencies are installed with `yarn install --frozen-lockfile` from
  `apps/admin`.
- Root `package.json` delegates commands into the app folders and should not
  collect application dependencies.
- Shared code should not be moved to root until there is a stable, repeated
  need across both apps. Prefer app-local code while contracts are still moving.

Root scripts:

```bash
npm run dev          # delegates to apps/web
npm run build        # delegates to apps/web
npm run lint         # delegates to apps/web
npm run admin:dev
npm run admin:build
npm run admin:lint
npm run lint:all
npm run build:all
```

## Runtime Configuration

Both apps read backend configuration from environment variables.

Common public variables:

- `NEXT_PUBLIC_SERVER_URL`
- `NEXT_PUBLIC_ASSETS_DIR`

Web-only public/runtime variables:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `NEXT_PUBLIC_SPEAKING_USE_LOCAL_TOKEN_ROUTE`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_AGENT_NAME`

Admin keeps placeholder config support for Firebase, Amplify, Auth0, and
Supabase because it is based on a dashboard starter, but the active auth method
is JWT.

## API Integration Pattern

Both apps use an Axios instance with a centralized endpoint registry.

- Web: `apps/web/src/lib/axios.ts`
- Admin: `apps/admin/src/lib/axios.ts`

API clients must keep backend URLs relative to `NEXT_PUBLIC_SERVER_URL`.
Components should not hard-code absolute API URLs. When an API response shape
needs normalization, do it in the nearest API adapter or utility layer, not in
presentation components.

The full API contract is documented in [api.md](./api.md).

## Deployment Architecture

The monorepo builds two independent images:

- web: `ghcr.io/ziiyodullayevv/mock4ielts`
- admin: `ghcr.io/ziiyodullayevv/mock4ielts-admin-panel`

GitHub Actions validates both apps on pull requests into `main`. On pushes to
`main`, CI also builds and pushes both images. CD deploys the images to the VPS:

- web from `/opt/mock4ielts-frontend`
- admin from `/opt/mock4ielts-admin`

Deployment details and secret requirements are documented in
[ci-cd.md](./ci-cd.md).

## Pull Request Expectations

Every PR should preserve these invariants:

- `apps/web` and `apps/admin` remain isolated app roots.
- root remains orchestration-only.
- API contract changes update [api.md](./api.md).
- architecture, folder ownership, dependency manager, or deployment changes
  update this document and [ci-cd.md](./ci-cd.md) when relevant.
- local validation is recorded in the PR body.

Recommended validation:

```bash
npm run lint
npm run build
npm run admin:lint
npm run admin:build
```
