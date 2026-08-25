# Typing Speed Game

A full-stack typing speed game. Type 20 randomly generated letters as fast as you can;
each wrong key adds a 0.5s penalty. Beat your best time to see "Success!".

## Stack

- **Frontend:** React + Vite + TypeScript, `graphql-request`
- **Backend:** Bun + TypeScript + GraphQL Yoga
- **Database:** PostgreSQL + Prisma
- **Auth:** JWT + bcrypt
- **Infra:** Docker Compose

## Prerequisites (Windows)

- Docker Desktop, with **WSL2 backend** enabled (Settings → General → "Use the WSL 2
  based engine"). If WSL2 isn't installed, run in an admin PowerShell:
  `wsl --install`, then reboot.
- Nothing else — no Bun, Node, or Postgres install needed on the host. All of it runs
  inside the Linux containers below.

## Quick start (Docker, Windows)

1. Copy env files (PowerShell or CMD):
   ```powershell
   copy .env.example .env
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env
   ```
2. Run everything:
   ```powershell
   docker compose up --build
   ```
3. Open:
   - Frontend: http://localhost:5173
   - GraphQL playground: http://localhost:4000/graphql

Migrations run automatically on backend startup (`prisma migrate deploy`).

If port `5432` is already taken by a native Windows Postgres install, see the note
under `docker-compose.yml` above.

## Tests

Run the backend test suite inside a throwaway container — no local Bun needed:
```powershell
docker compose run --rm backend bun test
```

## Useful day-to-day commands

```powershell
# Rebuild + restart just the backend after a code change
docker compose up --build backend

# Run a one-off Prisma command inside a fresh container
docker compose run --rm backend bunx prisma studio

# Tail logs
docker compose logs -f backend

# Stop everything (keeps the db volume)
docker compose down

# Stop everything and wipe the Postgres volume too
docker compose down -v
```

## Project structure

```
typing-speed-game/
  backend/    # Bun + GraphQL Yoga + Prisma API
  frontend/   # React + Vite client
  docker-compose.yml
```

## Architecture & key decisions

- **GraphQL over REST**: a single `/graphql` endpoint covers auth, game results, history,
  and the leaderboard with precise, typed queries — no over/under-fetching across five
  different game-related views.
- **JWT auth via context, not per-resolver checks**: the Yoga `context` function decodes
  the `Authorization` header once per request; resolvers just read `ctx.userId`, keeping
  auth logic in one place ( `src/context.ts` ).
- **Score integrity**: the client computes the result instantly for UX, but the server
  independently re-validates `penaltyTime === wrongAttempts * 0.5` before persisting, so
  the leaderboard can't be gamed by a modified client payload.
- **Best-per-user leaderboard**: uses Prisma `groupBy` + `_min(timeTaken)` so one player's
  many attempts don't dominate the board — only their personal best counts.
- **Local-first best score**: the game is fully playable and keeps a best score without
  an account (`localStorage`); logging in adds history + the public leaderboard on top,
  it doesn't gate the core loop.


