# RExpense Monorepo

![Monorepo](https://img.shields.io/badge/Monorepo-Microservices-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)
![Kafka](https://img.shields.io/badge/Kafka-Event--Driven-yellow.svg)

A modern, event-driven personal finance system built with a microservices architecture.
This monorepo contains all backend services, infrastructure, and configuration for the RExpense project.

---

## Services

- **user_service** (NestJS/TypeScript)
  - User authentication, management, and event publishing
  - Kafka integration for user events
- **transaction_service** (Django/Python)
  - Transaction CRUD, category management
  - Synchronizes user data via Kafka events
  - Publishes transaction events
- **budget_service** (Django/Python)
  - Budget tracking and alerts
  - Synchronizes user data via Kafka events
  - Currently in active development!
- **(Planned)** notification_service (Go)
  - Real-time notifications for users

---

## Architecture

- **Event-Driven:** Services communicate via Kafka topics using a standardized message format.
- **Dockerized:** All services and dependencies (PostgreSQL, Kafka, Zookeeper) are orchestrated using Docker Compose.
- **Monorepo:** All code, configs, and docs live in a single repository for ease of development and deployment.

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- (For local dev) Node.js, Python 3.11, PostgreSQL, Kafka

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rexpense.git
   cd rexpense
   ```
2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` as needed for your environment.

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Apply migrations (if needed)**
   - For Django services:
     ```bash
     docker-compose exec transaction_service python manage.py migrate
     docker-compose exec budget_service python manage.py migrate
     ```

---

## Kafka Topic Initialization & Consumer Robustness

- Kafka topics are created by the `kafka-init` service using `init-topics.sh`.
- Kafka consumers are wrapped in a retry loop with exponential backoff, so they automatically recover from transient errors or topic unavailability.

---

## Message Format

All services communicate via Kafka using a standardized (snake_case) message format:
```json
{
  "message_id": "...",
  "timestamp": "...",
  "version": "1.0",
  "source": "service-name",
  "type": "event.type",
  "payload": { ... }
}
```

---

## Directory Structure

```
rexpense/
├── user_service/           # NestJS user microservice
├── transaction_service/    # Django transaction microservice
├── docker-compose.yml      # Orchestration for all services
├── .env.example            # Example environment variables
├── .gitignore              # Root ignore file
├── LICENSE                 # Project license
└── README.md               # This file
```

---

## Environment Variables
See [.env.example](./.env.example) for all required variables for all services.

---

## License
This project is licensed under the MIT License.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Roadmap
- [x] User service (NestJS)
- [x] Transaction service (Django)
- [ ] Budget service (Django) _(in progress)_
- [ ] Notification service (Go)
- [ ] Data pipeline & analytics

---

## Authors
- [remruatthanga](https://github.com/NanobyteRuata)

---

## Acknowledgements
- [NestJS](https://nestjs.com/)
- [Django](https://www.djangoproject.com/)
- [Kafka](https://kafka.apache.org/)
- [Docker](https://www.docker.com/)
- [DataTalksClub](https://datatalks.club/)
