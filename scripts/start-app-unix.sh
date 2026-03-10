#!/bin/bash

set -e

echo "Waiting for database to be ready..."

# Wait until the database is accepting connections
until pg_isready -h db -p 5432 -U postgres > /dev/null 2>&1; do
  echo "  ...database not ready, sleeping 1s"
  sleep 1
done

echo "Database is ready!"

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
