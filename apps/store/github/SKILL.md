# GitHub — AI Skill

## Capability
GitHub API integration: repo, branch, file, commit, issue, PR, gist management. Local Git operations (CLI).

## Auth
JWT token required. GitHub token configured in user settings.

## API Endpoints

### Settings
- **GET /api/github/settings** — GitHub token settings
- **POST /api/github/settings** — Save token

### User & Repos
- **GET /api/github/user** — GitHub user info
- **GET /api/github/repos** — List repos
- **POST /api/github/repos** — Create repo
- **DELETE /api/github/repos/:owner/:repo** — Delete repo

### Branches
- **GET /api/github/repos/:owner/:repo/branches** — List branches
- **POST /api/github/repos/:owner/:repo/branches** — Create branch
- **DELETE /api/github/repos/:owner/:repo/branches/:branch** — Delete branch

### Contents
- **GET /api/github/repos/:owner/:repo/contents** — Root contents
- **GET /api/github/repos/:owner/:repo/contents/*path** — File contents

### Commits
- **GET /api/github/repos/:owner/:repo/commits** — Commit history

### Issues
- **GET /api/github/repos/:owner/:repo/issues** — List issues
- **POST /api/github/repos/:owner/:repo/issues** — Create issue
- **PATCH /api/github/repos/:owner/:repo/issues/:number** — Update issue
- **GET /api/github/repos/:owner/:repo/issues/:number/comments** — List comments
- **POST /api/github/repos/:owner/:repo/issues/:number/comments** — Add comment

### Pull Requests
- **GET /api/github/repos/:owner/:repo/pulls** — List PRs

### Gists
- **GET /api/github/gists** — List gists
- **GET /api/github/gists/:id** — Get gist detail
- **POST /api/github/gists** — Create gist
- **DELETE /api/github/gists/:id** — Delete gist

### Local Git (CLI)
- **GET /api/git/repos** — List local repos
- **POST /api/git/init** — git init
- **POST /api/git/clone** — git clone
- **POST /api/git/status** — git status
- **POST /api/git/add** — git add
- **POST /api/git/commit** — git commit
- **POST /api/git/pull** — git pull
- **POST /api/git/push** — git push
- **POST /api/git/log** — git log
- **POST /api/git/remote-add** — git remote add

## Storage
JSON file — `data/users/{username}/github/settings.json`
