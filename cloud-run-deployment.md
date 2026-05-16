# Deploying to Google Cloud Run (GCP)

## What Works Out of the Box

- Your Docker image (`php:8.2-fpm + nginx + supervisor`) is Cloud Run compatible — Cloud Run runs any container that listens on a port (you expose `80`).
- Multi-stage build is already optimized for production.

---

## What Needs to Change

### 1. PostgreSQL — Use Cloud SQL, Not a Sidecar

Cloud Run containers are **stateless and ephemeral** — the `db` service in your `docker-compose.yml` won't exist. You need:

- **Cloud SQL (PostgreSQL)** as a managed database
- Connect via Cloud SQL Auth Proxy (built into Cloud Run via `--add-cloudsql-instances` flag)

### 2. File Storage — Use Cloud Storage, Not a Volume

Your `docker-compose.yml` mounts `./storage` as a volume. Cloud Run has no persistent local filesystem. You need to:

- Store uploaded files in **Google Cloud Storage (GCS)**
- Use a Laravel GCS filesystem driver (e.g., `league/flysystem-google-cloud-storage`)

### 3. Caddy Reverse Proxy — Not Needed

Cloud Run handles HTTPS/TLS termination automatically. Drop Caddy; your nginx inside the container is sufficient.

### 4. Session / Cache — Use Redis or Database

If you use file-based sessions or cache (default Laravel), those won't persist across instances. Use:

- **Cloud Memorystore (Redis)**, or
- Switch to database sessions in `config/session.php`

### 5. `.env` File — Use Secret Manager

Replace the `.env` volume mount with **GCP Secret Manager** secrets injected as environment variables in the Cloud Run service config.

---

## Cloud Run Suitability

| Concern | Verdict |
|---|---|
| Stateless HTTP requests | Good fit |
| Background jobs / queues | Use **Cloud Tasks** or a separate worker service |
| WebSockets | Not supported natively (use `--session-affinity` for limited support) |
| Cost | Pay-per-request — good for variable traffic |

---

## Minimal Deployment Steps

### 1. Authenticate and set project

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Build and push the image

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/accountant-web
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy accountant-web \
  --image gcr.io/YOUR_PROJECT/accountant-web \
  --platform managed \
  --region europe-west2 \
  --add-cloudsql-instances YOUR_PROJECT:europe-west2:accountant-db \
  --set-env-vars APP_ENV=production \
  --set-secrets DB_PASSWORD=accountant-db-password:latest \
  --port 80 \
  --allow-unauthenticated
```

---

## Recommended GCP Services

| Purpose | Service |
|---|---|
| Database | Cloud SQL (PostgreSQL 16) |
| File storage | Cloud Storage (GCS) |
| Secrets / env vars | Secret Manager |
| Cache / sessions | Cloud Memorystore (Redis) |
| Background jobs | Cloud Tasks |
| Container registry | Artifact Registry (or GCR) |
| CI/CD | Cloud Build |

---

## Environment Variables to Set in Cloud Run

| Variable | Source |
|---|---|
| `APP_KEY` | Secret Manager |
| `APP_URL` | Env var |
| `DB_HOST` | `/cloudsql/PROJECT:REGION:INSTANCE` |
| `DB_DATABASE` | Env var |
| `DB_USERNAME` | Env var |
| `DB_PASSWORD` | Secret Manager |
| `REDIS_HOST` | Memorystore private IP |
| `FILESYSTEM_DISK` | `gcs` |
| `GCS_BUCKET` | Env var |
