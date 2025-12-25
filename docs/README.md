# 📚 Documentation Index

This folder contains all the documentation for the Dating App project. Below is a comprehensive guide to what each document covers.

---

## 📖 Available Documentation

### 1. **API_DOCUMENTATION.md**

**Purpose:** Complete REST API reference for the dating app backend

**What it covers:**

- All available API endpoints and routes
- Request/response formats and examples
- Authentication using wallet public keys
- User management endpoints (create, get, update)
- Profile management APIs
- Preferences management APIs
- Likes/matching system endpoints
- Photo management APIs
- Prompt answer endpoints
- Key user flows and integration examples

**Use this when:**

- Implementing frontend API calls
- Testing API endpoints with Postman/Thunder Client
- Understanding request/response data structures
- Integrating wallet-based authentication

---

### 2. **DATABASE_SCHEMA.md**

**Purpose:** Detailed database schema documentation with Prisma models

**What it covers:**

- All database models (User, Profile, Preferences, Photo, Like, Prompt, PromptAnswer)
- Field definitions and data types
- Relationships between models (one-to-one, one-to-many, many-to-many)
- Unique constraints and indexes
- Default values and auto-generated fields
- Database enums (Gender, LookingFor, GenderPreference)
- Visual relationship diagrams

**Use this when:**

- Understanding the data structure
- Creating new database migrations
- Querying the database
- Planning new features that require schema changes

---

### 3. **db-structure.md**

**Purpose:** High-level database architecture and design philosophy (Phase-1)

**What it covers:**

- System overview and design principles
- Wallet-based identity model
- Entity relationship explanations
- Database read optimization strategies
- Future scalability considerations
- Phase-1 scope and limitations
- Design decisions and rationale
- How the schema supports swipe/match functionality

**Use this when:**

- Understanding the overall architecture
- Planning future database enhancements
- Making design decisions for new features
- Onboarding new developers to the project

---

## 🚀 Quick Start Guide

### For Developers:

1. Start with **db-structure.md** to understand the architecture
2. Reference **DATABASE_SCHEMA.md** for specific model details
3. Use **API_DOCUMENTATION.md** when implementing features

### For Frontend Developers:

1. Focus on **API_DOCUMENTATION.md** for all API integrations
2. Check **DATABASE_SCHEMA.md** to understand data relationships

### For Database Admins:

1. Review **db-structure.md** for design philosophy
2. Use **DATABASE_SCHEMA.md** for schema details and migrations

---

## 🔗 Related Documentation

- **Main README:** `/README.md` - Project setup and overview
- **Backend README:** `/apps/dating-backend/README.md` - Backend-specific setup
- **Database Package:** `/packages/database/README.md` - Database package details

---

## 📝 Document Maintenance

- All documentation should be kept up-to-date with code changes
- When adding new API endpoints, update `API_DOCUMENTATION.md`
- When modifying Prisma schema, update `DATABASE_SCHEMA.md`
- Major architectural changes should be reflected in `db-structure.md`

---

_Last Updated: December 25, 2025_
