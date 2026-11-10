FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app

# Завантажені картинки живуть в окремому томі (див. docker-compose.prod.yml),
# тому папка існує в образі й належить непривілейованому користувачу.
RUN useradd --system --no-create-home appuser \
    && mkdir -p /data/uploads \
    && chown -R appuser /data
USER appuser

EXPOSE 8000

# Міграції при кожному старті (безпечно: alembic пропускає вже застосовані).
# --workers 1 свідомо: RSS-планувальник (APScheduler) працює всередині процесу,
# а кілька воркерів збирали б RSS кілька разів і робили дублі.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 --proxy-headers --forwarded-allow-ips='*'"]
