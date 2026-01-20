# NestJS Multi-DB Microservice Starter

A production-ready NestJS 11 monorepo starter for building microservices with multiple databases. Ships with an API gateway, background workers, and shared libraries—so you can focus on features instead of boilerplate.

## Features

- **Monorepo Architecture** — Four runnable apps: `service`, `admin`, `gateway`, and `worker`
- **Dual Database Support** — MongoDB (Mongoose) + PostgreSQL (TypeORM) out of the box
- **API Gateway** — Edge proxy with routing to downstream services
- **Background Workers** — RabbitMQ consumers for async jobs, emails, SMS, and file processing
- **Shared Libraries** — Reusable core modules for auth, validation, filters, and database connections
- **Production Ready** — Global validation, exception filters, request logging, and Swagger docs

## Project Structure

```
├── apps/
│   ├── service/          # User/Account API (port 7000)
│   ├── admin/            # Admin API (port 7001)
│   ├── gateway/          # API Gateway (port 7004)
│   └── worker/           # Background Jobs (port 7010)
├── libs/
│   ├── core/             # Shared providers, guards, filters, DB connections
│   └── banking/          # Domain module example (wallets, transactions)
├── config/               # Centralized configuration
├── templates/            # Email templates
├── docker/               # Docker configurations
└── _env/                 # Environment files per app
```

## Technology Stack

| Category | Technologies |
|----------|-------------|
| Framework | NestJS 11 (TypeScript) |
| Databases | MongoDB (Mongoose), PostgreSQL (TypeORM) |
| Message Queue | RabbitMQ (AMQP) |
| Cache | Redis (ioredis) |
| Real-time | Socket.io with Redis adapter |
| Auth | JWT, Passport.js, bcryptjs |
| 2FA | speakeasy (TOTP) |
| Payments | Stripe, PayStack, Flutterwave, PayPal |
| File Storage | Cloudinary, AWS S3, Google Cloud Storage |
| Email | SendGrid, Resend |
| SMS | Twilio, Multitexter |
| Push Notifications | Firebase Admin SDK |
| Testing | Jest, Supertest |

## Prerequisites

- Node.js 18+
- Yarn
- PostgreSQL
- MongoDB
- RabbitMQ (for worker queues)
- Redis (optional)

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd nestjs-multidb-api-starter
yarn install
```

### 2. Configure environment

Copy the example environment files and update with your credentials:

```bash
cp _env/.env.example _env/.env
cp _env/service/.env.example _env/service/.env.local
cp _env/admin/.env.example _env/admin/.env.local
cp _env/gateway/.env.example _env/gateway/.env.local
cp _env/worker/.env.example _env/worker/.env.local
```

Configuration keys are defined in `config/configuration.ts` and cover:
- App metadata and ports
- MongoDB and PostgreSQL connections
- Redis and RabbitMQ URLs
- JWT secrets
- Third-party provider credentials

### 3. Run the services

```bash
# Run all services in watch mode
yarn dev

# Or run individual services
yarn start:dev:service    # http://localhost:7000
yarn start:dev:admin      # http://localhost:7001
yarn start:dev:gateway    # http://localhost:7004
yarn start:dev:worker     # http://localhost:7010
```

### 4. Access API documentation

Swagger docs are available at `/api/docs` for:
- Service API: http://localhost:7000/api/docs
- Admin API: http://localhost:7001/api/docs

## Architecture

### Request Flow

```
Client → Gateway → Service / Admin / Worker
                        ↓
                   Database(s)
```

- **Gateway** routes requests to downstream services via HTTP proxy middleware
- **RabbitMQ** handles async communication between services

### Design Patterns

**Repository/Service Layer:**
```
Controller → Service → BaseService → Database
```

**Base Classes:**
- `MongoBaseService` — CRUD operations for MongoDB
- `PgService` — CRUD operations for PostgreSQL
- `BaseController` — Standardized response handling
- `BaseAbstract` — Common service logic

### Core Module

`CoreModule` provides:
- MongoDB connection via `MongooseModule`
- PostgreSQL connection via `TypeOrmModule`
- Auto-loading of entities and schemas
- Shared guards, filters, and pipes

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Run all services in watch mode |
| `yarn build` | Build all apps for production |
| `yarn start:prod` | Start production build |
| `yarn test` | Run unit tests |
| `yarn test:e2e` | Run end-to-end tests |
| `yarn test:cov` | Run tests with coverage |
| `yarn lint` | Lint codebase |

## Development Notes

- Global middleware (validation, response filters, morgan logging) is configured in each app's `main.ts`
- Entities and schemas are auto-discovered from module directories
- The worker service consumes RabbitMQ queues—configure `RABBIT_MQ_URL` accordingly
- File uploads support multiple providers via `DEFAULT_FILE_STORAGE` env variable

## Extending the Starter

1. **Add a new app**: `nest generate app <name>` and wire up in `nest-cli.json`
2. **Add a shared library**: `nest generate library <name>` under `libs/`
3. **Add database entities**: Place in the relevant module and they'll be auto-loaded
4. **Add background jobs**: Create consumers in the worker app using the RabbitMQ patterns

## License

MIT
