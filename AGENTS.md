<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-rules -->
# Project Rules

## Default Delivery Workflow

The user authorizes the agent to use GitHub CLI and Vercel CLI for normal implementation work.

When the user asks for a fix, feature, refactor, or other code change:

1. Inspect the repository, current branch, remotes, and working tree.
2. Preserve unrelated user changes.
3. Implement the requested change.
4. Run the smallest relevant verification.
5. Commit all in-scope changes with a clear commit message.
6. Push the commit to the correct GitHub remote and branch.
7. Confirm that Vercel deployed the pushed commit successfully.
8. Report the commit, deployment status, and verification results.

Do not stop after making only local changes when the requested work is complete.

Do not deploy an uncommitted or unpushed local worktree when the project is connected to GitHub. GitHub must receive the commit first so Vercel deploys the same source that exists in the repository.

Do not ask for permission before ordinary commits, pushes, or deployment verification. These actions are part of the default delivery workflow authorized above.

Pause instead only for rare cases such as:

- The user explicitly asks not to commit, push, or deploy.
- The change requires a destructive or breaking production database migration.
- The implementation exposes secrets or creates a serious security risk.
- There is an unresolved merge conflict or an ambiguous ownership conflict with existing user changes.
- Required GitHub or Vercel credentials are unavailable.
- Verification reveals a failure that requires a user decision.

Routine uncertainty, ordinary implementation choices, or the absence of a full test suite are not reasons to leave completed work uncommitted.

## GitHub Repository Setup

If the project already has a Git repository and GitHub remote, use them.

If the requested implementation has no Git repository or remote:

- Initialize Git if needed.
- Create an appropriate GitHub repository when the task is intended to be persisted or deployed.
- Add the GitHub remote.
- Commit the implementation.
- Push the correct branch.
- Do not create unrelated repositories for analysis-only tasks.

Use GitHub CLI when useful for repository inspection and setup.

Before changing files, inspect:

```bash
git status --short --branch
git remote -v
git branch --show-current
```

Preserve unrelated changes. Do not use destructive commands such as:

```bash
git reset --hard
git checkout -- .
git clean -fd
```

unless the user explicitly requests that exact destructive operation.

Stage only files belonging to the requested change. Do not commit secrets, `.env` files, generated artifacts, caches, or unrelated user work.

After committing, verify the commit and push:

```bash
git status --short --branch
git log -1 --oneline
git push origin <branch>
```

## Vercel Deployment

Use an existing Vercel project when one is already linked to the repository.

After pushing to GitHub:

1. Wait for the GitHub triggered Vercel deployment.
2. Inspect deployments with Vercel CLI.
3. Confirm the deployment is `Ready`.
4. Confirm it belongs to the pushed commit or current branch.
5. Verify the relevant production endpoint when practical.

Useful commands include:

```bash
vercel ls <project>
vercel inspect <deployment>
vercel logs <deployment>
```

Never use `vercel --prod` to deploy a stale local worktree over a GitHub-connected project.

If GitHub does not trigger Vercel automatically, deploy through Vercel CLI only after the changes have been committed and pushed. Confirm that the local checkout is at the pushed commit before deploying.

If the user explicitly asks for deployment and no Vercel project exists:

- Create or link the Vercel project.
- Configure the project using the repository and intended framework settings.
- Deploy it.
- Confirm the deployment is ready.
- Report the project and deployment details.

Do not create a Vercel project merely because a local project exists when the user did not request deployment.

## Package Manager

This project uses **pnpm** exclusively. Never use `npm` or `yarn`.

- Install deps: `pnpm install`
- Run scripts: `pnpm dev`, `pnpm build`, `pnpm lint`
- Add packages: `pnpm add <pkg>`, `pnpm add -D <pkg>`
- Prisma: `pnpm prisma generate`, `pnpm prisma migrate dev`, `pnpm prisma migrate reset`

## Database & ORM (Prisma v7 Architecture)

- **Provider:** PostgreSQL (Supabase Frankfurt)
- **Prisma Configuration:** The database connection configuration lives strictly in `prisma.config.ts`, **NOT** in `schema.prisma` (deprecated).
- **CLI & Migrations:** `prisma.config.ts` is explicitly reserved for the Direct URL (`DIRECT_URL` on port 5432) so the CLI never hangs on migrations.
- **App Runtime & Connection Pooling:** To avoid hitting max connection limits on the serverless Vercel runtime, the application client must be initialized in a separate file such as `lib/db.ts` or `lib/prisma.ts`. You **must** instantiate a standard `pg` Pool using the Transaction Pooler URL (`DATABASE_URL` on port 6543) and inject it into Prisma using the `@prisma/adapter-pg` driver adapter. Never merge this runtime configuration into `prisma.config.ts`.
- **Command References:**
  - Run migrations: `pnpm prisma migrate dev --name <description>`
  - Reset DB: `pnpm prisma migrate reset`

Breaking or destructive database migrations require explicit user direction before production deployment. Additive, backward-compatible migrations may follow the normal commit, push, and deployment workflow.

## Text Encoding and Turkish UI Copy

- Preserve files as UTF-8.
- Turkish UI text must use real Turkish characters (`ç`, `ğ`, `ı`, `İ`, `ö`, `ş`, `ü`) and must never be committed as mojibake or replacement characters.

## UI Safety and Editing

- Never use browser-native confirmation dialogs such as `window.confirm`.
- Destructive actions must use a custom in-app modal with a clear cancel action.
- Editing existing entries must happen in an in-place modal, not by navigating to a separate edit page.
- Never use a loading cursor such as `cursor-wait`; keep the normal cursor while actions are pending.

## Verification Discipline

Keep verification lightweight and proportional to the change.

For syntax and TypeScript checks, prefer:

```bash
pnpm exec tsc --noEmit
```

Use targeted linting or focused checks when appropriate.

Do not run `pnpm build` for routine checks unless explicitly requested or the change genuinely needs a production build.

Run a production build when the change affects:

- Next.js routing or rendering behavior.
- Server components, route handlers, middleware, or proxy behavior.
- Environment configuration.
- Prisma generation or deployment configuration.
- Vercel deployment behavior.

Avoid redundant verification commands. One targeted check is preferable to several overlapping checks.

Do not use the in-app Browser or browser automation for routine local UI verification. The user will manually test visual or UI behavior unless browser-based verification is explicitly requested.

Before pushing, make sure the relevant verification passes. If verification cannot be run because of an environment limitation, report that clearly and only proceed when the change is otherwise safe and does not require a user decision.

## Commit Message

Write concise, clear Git commit messages.

If the subject line accurately describes the change, do not add a body.

Use these rules:

- Keep the subject near 50 characters when practical.
- Capitalize the subject.
- Use the imperative mood.
- Do not end the subject with punctuation.
- Separate the subject from the body with a blank line.
- Wrap the body at 72 characters.
- Use a body only for useful context.
- Do not repeat the subject in the body.

Examples:

```text
Prevent admin page cache redirects
```

```text
Add homework writer session cleanup

Remove expired writer sessions during authentication and prevent
inactive accounts from accessing the panel.
```

Only return the commit message by itself when the user explicitly asks for a commit message. For normal implementation tasks, the final response must summarize the changes, verification, commit, push, and deployment status.

<!-- END:project-rules -->
