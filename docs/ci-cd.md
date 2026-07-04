# CI/CD

The repository uses GitHub Actions for validation, image publishing, and VPS
deployment.

## CI

`CI` runs on pushes to `main` and `develop`, pull requests into `main`, and
manual dispatch.

Required PR checks:

- `web`
- `admin`

On pushes to `main`, the workflow also builds and pushes:

- `ghcr.io/ziiyodullayevv/mock4ielts-web`
- `ghcr.io/ziiyodullayevv/mock4ielts-admin`

Build contexts:

- web: `apps/web`
- admin: `apps/admin`

## CD

`CD` runs after a successful `CI` run on `main` and can also be started
manually. It deploys:

- public web app from `/opt/mock4ielts-frontend`
- admin panel from `/opt/mock4ielts-admin`

## Required Secrets

- `VPS_HOST` or `SSH_HOST`
- `VPS_USER` or `SSH_USERNAME`
- `VPS_SSH_KEY` or `SSH_PRIVATE_KEY`
- `NEXT_PUBLIC_SERVER_URL`
- `NEXT_PUBLIC_ASSETS_DIR`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `NEXT_PUBLIC_SPEAKING_USE_LOCAL_TOKEN_ROUTE`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_AGENT_NAME`

The repository must also have GitHub Actions enabled. If runs fail with an
account billing lock, the workflows will not start until the GitHub account
state is fixed.
