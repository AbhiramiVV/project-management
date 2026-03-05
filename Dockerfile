FROM python:3.11-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:0.3.3 /uv /uvx /bin/

# Copy the application code.
WORKDIR /app
COPY . .

# Install dependencies using uv.
RUN uv pip install --system -e .

EXPOSE 8000

# Run the application.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
