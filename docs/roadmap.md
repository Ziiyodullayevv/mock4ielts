# Mock4IELTS Roadmap

This roadmap tracks follow-up work after restoring the Mock4IELTS repository as
a monorepo with the public web app and admin panel.

## Current Repository Shape

- Public web app: repository root
- Admin panel: `apps/admin`
- Public web image: `ghcr.io/ziiyodullayevv/mock4ielts`
- Admin image: `ghcr.io/ziiyodullayevv/mock4ielts-admin-panel`

## Active Follow-Ups

- #1 Add monorepo smoke tests for web and admin
- #2 Document required production secrets for both apps
- #3 Consolidate monorepo package manager policy
- #4 Add admin deployment health verification
- #5 Review whether to move public web app under `apps/web`

## Validation Baseline

The restored monorepo currently passes:

```bash
npm run lint
npm run build
npm run admin:lint
npm run admin:build
```
