FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && \
    if [ \"$DJANGO_ENV\" = \"production\" ]; then \
      gunicorn budget_service.wsgi:application --bind 0.0.0.0:8000; \
    else \
      python manage.py runserver 0.0.0.0:8000; \
    fi"]