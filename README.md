# Mock4IELTS

Mock4IELTS is a Next.js monorepo for the public IELTS preparation platform and
its admin panel.

## Apps

- `apps/web` - public learner-facing web app
- `apps/admin` - dashboard for sections, users, contests, and mock exams

## Requirements

- Node.js 22+
- npm for the public web app
- Yarn 1.x for the admin app

## Development

Run the public web app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Run the admin panel:

```bash
npm run admin:install
npm run admin:dev
```

Open `http://localhost:8083`.

## Checks

```bash
npm run lint
npm run build
npm run admin:lint
npm run admin:build
```

## Documentation

- [Architecture](./docs/architecture.md)
- [API contract](./docs/api.md)
- [CI/CD](./docs/ci-cd.md)

## Deployment

The web app builds the `ghcr.io/ziiyodullayevv/mock4ielts` image.
The admin app builds the `ghcr.io/ziiyodullayevv/mock4ielts-admin-panel` image.

The GitHub Actions workflow validates both apps and publishes both images on
successful pushes to `main`.
