# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend for an event management and social platform. The application uses MongoDB for data persistence, Qdrant for vector search capabilities, and integrates with various third-party services (AWS S3, Stripe, OpenAI, Google Cloud Vision, Solana).

## Architecture

The codebase follows a layered architecture pattern:

### Core Layer (`src/core/`)
- **Domain entities and interfaces**: Business logic models (Event, User, Profile, Group, Location, Comment, Feed, etc.)
- **Repository interfaces**: Abstract definitions for data access patterns
- **Core services**: Framework-agnostic business logic (e.g., BcryptService)
- **DTOs and utilities**: Shared data transfer objects and helper functions

### Application Layer (`src/application/`)
- **Services**: Use case implementations that orchestrate domain logic
  - Event management (EventService, EventEmbeddingService)
  - User/Profile management (UserService, ProfileService)
  - Social features (GroupService, FeedService, CommentService, MessageService)
  - Payments (TicketsService, AssessmentService)
  - Email (MailService)
  - Community and registration workflows
- **Mappers**: Transform domain entities to DTOs (EventMapper)
- **Helpers**: Application-specific utilities (event-update.helper)
- **Templates**: Email templates

### Infrastructure Layer (`src/infrastructure/`)
- **Repositories**: MongoDB implementations of repository interfaces
- **Schemas**: Mongoose schema definitions for all entities
- **Services**: External integrations and technical capabilities
  - Authentication (AuthService, JwtStrategy)
  - AI/ML (ChatGPTService, QdrantService - vector search)
  - Media processing (ImageService, VideoService)
  - Third-party APIs (GroovecastService, GeolocationService)
  - Web scraping (ScrapeService)
- **Modules**: Feature modules (AuthModule)
- **Seeds**: Database seeding scripts
- **Migrations**: Database migration scripts

### Presentation Layer (`src/presentation/`)
- **Controllers**: HTTP endpoints for all features (Event, User, Profile, Group, Feed, Comment, Message, Search, Tickets, Registration, Community, Posts, Artist, Assessment, Groovecast)
- **DTOs**: Request/response data structures
- **Guards**: Authorization and authentication (JwtAuthGuard, OwnerGuard, ProfileOwnerGuard, GroupGuard, ArtistGuard, CommentGuard, UploadGuard, JwtOptionalAuthGuard)
- **Gateways**: WebSocket handlers (MessageGateway)
- **Decorators**: Custom decorators for common patterns

### Dependency Injection
The application uses NestJS's dependency injection with interface-based repository pattern. Repository implementations are provided with string tokens (e.g., `'IEventRepository'`) mapped to concrete MongoDB implementations.

## Key Technologies

- **Database**: MongoDB with Mongoose ODM
- **Vector Search**: Qdrant for AI-powered event/user search and recommendations
- **Authentication**: JWT with Passport strategy
- **File Storage**: AWS S3 (Hetzner Object Storage)
- **Payment Processing**: Stripe
- **AI/ML**: OpenAI API for embeddings and chat, Google Cloud Vision for image analysis
- **OCR**: Tesseract.js for text extraction from images
- **Blockchain**: Solana web3.js integration
- **Email**: Nodemailer with Mailer module
- **Scheduling**: NestJS Schedule module for cron jobs
- **Validation**: class-validator and class-transformer, Zod for API responses

## Development Commands

### Running the Application
```bash
npm run start              # Standard mode
npm run start:dev          # Watch mode (use for development)
npm run start:debug        # Debug mode with watch
npm run start:prod         # Production mode
```

### Building
```bash
npm run build              # Compile TypeScript to dist/
```

### Code Quality
```bash
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
```

### Testing

**Unit Tests:**
```bash
npm run test               # Run all unit tests
npm run test:watch         # Watch mode
npm run test:unit          # Explicitly run unit tests (*.spec.ts)
npm run test:cov           # Generate coverage report
```

**Integration Tests:**
```bash
npm run test:integration           # Run integration tests (*.integration.spec.ts)
npm run test:integration:watch     # Watch mode with runInBand
```

**E2E Tests:**
```bash
npm run test:e2e           # Run end-to-end tests
```

**Module-Specific Tests:**
```bash
npm run test:organiser         # Test organiser module with coverage
npm run test:organiser:watch   # Watch mode
npm run test:edit              # Test event-edit functionality
npm run test:edit:watch        # Watch mode
```

**Debug Tests:**
```bash
npm run test:debug         # Run tests with Node debugger
```

### Database Operations
```bash
npm run seed               # Seed database with initial data (locations, events)
```

## Environment Configuration

The application requires a `.env` file with the following key variables:
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `QDRANT_URL`, `QDRANT_API_KEY`: Qdrant vector database credentials
- `QDRANT_EVENTS_COLLECTION`, `QDRANT_USERS_COLLECTION`: Collection names
- `EMBEDDING_DIM`: Embedding dimension for vector search
- `HETZNER_ACCESS_KEY`: S3-compatible storage access key
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`: Email service configuration
- `PORT`: Server port (default: 4000)

## Important Implementation Details

### CORS Configuration
The application has CORS enabled for specific origins including localhost (various ports) and production domains (retromountainphangan.com, avanti-kollektiv.de, event-scanner.com, vartakt.com). Modify `src/main.ts` to add/remove allowed origins.

### Global Validation
A global ValidationPipe is enabled, automatically validating all request DTOs using class-validator decorators.

### Static File Serving
- `/images` path serves files from `uploads/images/`
- Root serves `public/` directory

### MongoDB Connection
Connection URI is configured via environment variable in InfrastructureModule using MongooseModule.forRootAsync().

### Repository Pattern
All data access goes through repository interfaces defined in `src/core/repositories/` and implemented in `src/infrastructure/repositories/mongodb/`. Services depend on repository interfaces, not concrete implementations.

### Test Configuration
- Unit tests use `*.spec.ts` pattern with jest.config.js (rootDir: src)
- Integration tests use `*.integration.spec.ts` pattern with jest.integration.config.js and run with test setup
- MongoDB Memory Server is available for testing

### TypeScript Configuration
The project uses relaxed TypeScript settings (strictNullChecks: false, noImplicitAny: false) for rapid development. Consider enabling strict mode incrementally when refactoring.

### Polyfills
`crypto.randomUUID` is polyfilled in main.ts for environments that don't support it natively.

## Common Patterns

### Creating a New Feature Module
1. Define domain entity in `src/core/domain/`
2. Create repository interface in `src/core/repositories/`
3. Create Mongoose schema in `src/infrastructure/schemas/`
4. Implement repository in `src/infrastructure/repositories/mongodb/`
5. Create application service in `src/application/services/`
6. Create controller in `src/presentation/controllers/`
7. Create DTOs in `src/presentation/dtos/`
8. Register in `InfrastructureModule` (provider, export) and `AppModule` (controller)

### Adding Authentication to Endpoints
Use `@UseGuards(JwtAuthGuard)` decorator on controllers or methods. Access user via `@Req() req` and `req.user`.

### Working with Vector Search
Use QdrantService for similarity search on events and users. EventEmbeddingService handles generating embeddings via OpenAI.
