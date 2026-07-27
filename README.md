# Pulse Racing

Pulse Racing is a browser-based, single-player racing game built as an Angular
and Phaser frontend with a Spring Boot and PostgreSQL backend.

## Phase status

Phases 1 through 6 establish the monorepo, framework dependencies,
configuration, deployment scaffolding, PostgreSQL user schema, stateless JWT
authentication, and the Angular landing, login, registration, and race-hub
experience. The Phaser game includes Green Hills and Desert Track, top-down
driving, checkpoints, three-lap races, timing, pause, restart, and local best
times. Server-side game saves, rewards, unlocks, garage selection, profile data,
settings, and the top-20 leaderboard are integrated through authenticated REST
APIs.

## Prerequisites

- Node.js 24.15 or newer LTS
- npm 11
- Java 21
- Maven 3.9+
- Docker with Compose, or a local PostgreSQL 17 instance

## Run locally

Start PostgreSQL:

```shell
docker compose up -d postgres
```

Start the API:

```shell
cd backend
mvn spring-boot:run
```

Start the web application in a second terminal:

```shell
cd frontend
npm ci
npm start
```

The application runs at `http://localhost:4200`; the health endpoint is
`http://localhost:8080/api/health`.

## Authentication API

- `POST /register` or `POST /api/auth/register` creates an account and returns
  a bearer token.
- `POST /login` or `POST /api/auth/login` verifies credentials and returns a
  bearer token.
- Protected endpoints require `Authorization: Bearer <token>`.

Passwords are stored using BCrypt. JWT signing secret material must contain at
least 32 bytes, and production deployments must override the development
default.

## Application API

- `GET /api/profile` returns the authenticated driver's progression.
- `PUT /api/profile` updates the username or selected car color.
- `GET /api/save` returns progression, unlocks, and settings.
- `POST /api/save` records a completed race and applies server-side rewards.
- `PUT /api/save/settings` persists volume and reduced-motion preferences.
- `GET /api/leaderboard` returns the public top 20.

Race results award 250 coins and 100 experience. Completing the first race
unlocks Desert Track. Leaderboard order uses the lowest best time, with total
wins as the tie-breaker.

## Verification

```shell
cd frontend
npm test -- --watch=false
npm run build

cd ../backend
mvn test
mvn package -DskipTests
```

The final regression suite contains nine Angular tests and nine Spring Boot
tests. Production frontend dependencies report no known npm vulnerabilities.

## Configuration

Copy `.env.example` into the environment configuration used by your hosting
platform. Never commit production secrets. The Vercel configuration deploys the
Angular application; deploy the stateful Spring Boot API and PostgreSQL database
to a container-capable service and set the frontend API URL accordingly.

The frontend production environment currently uses `/api`. When the API is
hosted on a separate origin, replace that value during deployment and set
`CORS_ALLOWED_ORIGIN` on the backend to the final frontend origin.

## Production deployment

The primary release artifact is the root [Dockerfile](Dockerfile). It builds the
Angular application, embeds it into the Spring Boot JAR, and serves the UI and
API from one origin. The container runs as an unprivileged user on Java 21.

The root [render.yaml](render.yaml) provisions:

- the `pulse-racing` Docker web service;
- managed PostgreSQL;
- generated JWT signing material;
- `/actuator/health` deployment health checks;
- graceful shutdown and Flyway migration execution.

To deploy, push the repository to GitHub, GitLab, or Bitbucket and create a
Render Blueprint from `render.yaml`. The included free database plan expires
after Render's current free-tier retention period and is intended only for
portfolio previews. Select a paid PostgreSQL plan with backups before storing
durable player data.

Production logs use Logstash JSON through the `prod` Spring profile. Render can
be configured to deploy only after the included GitHub Actions checks pass.
Rollback is performed by redeploying a previously successful commit; Flyway
migrations must remain forward-compatible.

The optional [vercel.json](vercel.json) deploys only the Angular frontend.
Because the primary container already serves both layers, use Vercel only when
you have separately deployed the API and configured an API proxy or production
API origin.

## Release operations

- Health: `GET /actuator/health`
- Application health: `GET /api/health`
- Schema changes: versioned files under `backend/src/main/resources/db/migration`
- CI: `.github/workflows/ci.yml`
- Dependency updates: `.github/dependabot.yml`
- Local production build: `docker build -t pulse-racing .`

## Layout

- `frontend/src/app/components`: reusable presentational components
- `frontend/src/app/pages`: routed application views
- `frontend/src/app/services`: HTTP and state services
- `frontend/src/app/guards`: route access rules
- `frontend/src/app/models`: shared TypeScript contracts
- `frontend/src/app/shared`: cross-feature UI utilities
- `frontend/src/app/game`: Phaser scenes and game systems
- `backend/src/main/java/com/pulseracing`: layered backend packages
