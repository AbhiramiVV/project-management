FROM python:3.11-slim

# Install uv and postgresql-client (for pg_isready health check).
COPY --from=ghcr.io/astral-sh/uv:0.3.3 /uv /uvx /bin/
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy the application code.
WORKDIR /app
COPY . .

# Install dependencies using uv.
RUN uv pip install --system -e .

# Make startup script executable.
RUN chmod +x /app/scripts/start-app-unix.sh

EXPOSE 8000

# Run migrations then start the application.
CMD ["/app/scripts/start-app-unix.sh"]
