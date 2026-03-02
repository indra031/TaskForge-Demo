# TaskForge — Demo Project for Agentic Coding Training

A task management monorepo used as a hands-on demo project for the **Agentic Coding** training series. It provides a realistic codebase with full agent configuration to demonstrate agentic coding concepts, context engineering, and workflow patterns.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 25, Spring Boot 4.0.3, Spring Data JPA, PostgreSQL 16 |
| Frontend | Angular 21, TypeScript 5.9, Angular Material, Tailwind CSS 4, NgRx Signal Store |
| Build | Maven 3.9+ (backend), Angular CLI 21 (frontend) |
| Testing | JUnit 5, Mockito, Testcontainers, Testing Library, Playwright |
| Infrastructure | Docker Compose (PostgreSQL + pgAdmin) |

## Quick Start

```bash
# Start database
docker compose up -d

# Backend
cd backend && mvn spring-boot:run

# Frontend (separate terminal)
cd frontend && npm install && ng serve
```

- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:4200
- pgAdmin: http://localhost:5050

## Agent Configuration

This project includes configuration for three major coding agents:

| Agent | Config File | Description |
|-------|------------|-------------|
| **Claude Code** | `CLAUDE.md` (root + module), `.claude/` directory | Full configuration with rules, hooks, skills, slash commands |
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/agents/` | Conventions, project context, custom sub-agents |
| **Gemini CLI** | `.gemini/settings.json`, `.gemini/agents/` | Context file references, custom sub-agents |

### MCP Servers (`.mcp.json`)

| Server | Purpose |
|--------|---------|
| **Context7** | Up-to-date library documentation (Spring Boot, Angular, etc.) |
| **Playwright** | Browser automation for E2E testing the Angular frontend |
| **PostgreSQL** | Direct database access for schema inspection, query analysis |

### Agent Building Blocks Demo

| Building Block | Location | What It Demonstrates |
|---------------|----------|---------------------|
| Memory files | `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/CLAUDE.md` | Hierarchical project memory |
| Rules | `.claude/rules/*.md` | Path-scoped, always-active constraints |
| Slash commands | `.claude/commands/review.md`, `.claude/commands/diagnose.md` | Custom `/review` and `/diagnose` workflows |
| Skills | `.claude/skills/spring-service-generator/`, `.claude/skills/test-writer/` | Service scaffolding skill, test writer sub-agent skill |
| Custom sub-agents | `.github/agents/test-writer.agent.md`, `.gemini/agents/test-writer.md` | Cross-tool custom sub-agent definitions |
| Hooks | `.claude/settings.json`, `.claude/hooks/protect-files.js` | File protection, conventions reminders, formatting, post-commit tests |
| MCP servers | `.mcp.json` | Context7, Playwright, PostgreSQL integration |
| Spec templates | `spec/*.md` | Spring service, Angular component, REST endpoint conventions |

## Project Structure

```
TaskForge-Demo-Project/
├── CLAUDE.md                          # Project-level memory (Claude Code)
├── .claude/
│   ├── settings.json                  # Hooks configuration
│   ├── hooks/
│   │   └── protect-files.js           # PreToolUse hook — blocks edits to config files
│   ├── rules/
│   │   ├── java-conventions.md        # Backend coding rules
│   │   ├── angular-conventions.md     # Frontend coding rules
│   │   └── api-design.md             # REST API design rules
│   ├── commands/
│   │   ├── review.md                  # /review slash command
│   │   └── diagnose.md               # /diagnose service analysis command
│   └── skills/
│       ├── spring-service-generator/  # Service scaffolding skill
│       │   └── SKILL.md
│       └── test-writer/              # Test writer sub-agent skill
│           └── SKILL.md
├── .github/
│   ├── copilot-instructions.md        # GitHub Copilot config
│   └── agents/
│       └── test-writer.agent.md       # Copilot custom sub-agent
├── .gemini/
│   ├── settings.json                  # Gemini CLI config
│   └── agents/
│       └── test-writer.md             # Gemini CLI custom sub-agent
├── .mcp.json                          # MCP server configuration
├── spec/
│   ├── spring-service.md              # How we write Spring services
│   ├── angular-component.md           # How we write Angular components
│   └── rest-endpoint.md               # How we write REST endpoints
├── docker-compose.yml                 # PostgreSQL + pgAdmin
├── pom.xml                            # Parent POM
├── backend/
│   ├── CLAUDE.md                      # Module-level memory
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/taskforge/
│       │   ├── config/                # Spring configuration
│       │   ├── controller/            # REST controllers
│       │   ├── dto/                   # Request/response records
│       │   ├── exception/             # Domain exceptions + global handler
│       │   ├── mapper/                # Hand-written mappers (entity ↔ DTO)
│       │   ├── model/                 # JPA entities
│       │   ├── repository/            # Spring Data JPA repositories
│       │   └── service/               # Business logic
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/          # Flyway migrations
│       └── test/java/com/taskforge/
│           └── service/               # Unit tests
└── frontend/
    ├── CLAUDE.md                      # Module-level memory
    ├── package.json
    ├── tsconfig.json
    └── src/app/
        ├── core/                      # Singleton services, guards, interceptors
        ├── features/                  # Feature modules
        │   ├── dashboard/
        │   ├── tasks/                 # Task CRUD, Kanban, store
        │   └── projects/
        └── shared/                    # Reusable components, models, pipes
```
