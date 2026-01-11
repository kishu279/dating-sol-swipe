# 💕 Pairly - Web3 Dating App

A decentralized dating application built on Solana, featuring wallet-based authentication, profile matching, and swipe mechanics.

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp apps/dating-backend/.env.example apps/dating-backend/.env

# Run database migrations
cd packages/database && bunx prisma migrate dev

# Seed the database (optional)
bunx prisma db seed

# Start development
bun dev
```

The app will be running at:
- **Backend API**: http://localhost:3000
- **Mobile App**: Expo Go on your device

---

## 📦 Project Structure

```
dating-sol-swipe/
├── apps/
│   ├── dating-app/          # React Native (Expo) mobile app
│   └── dating-backend/      # Express.js API server
│
├── packages/
│   ├── database/            # Prisma ORM + PostgreSQL schema
│   ├── ui/                  # Shared React components
│   ├── eslint-config/       # ESLint configurations
│   └── typescript-config/   # TypeScript configurations
│
└── docs/                    # Project documentation
    ├── API_DOCUMENTATION.md
    ├── DATABASE_SCHEMA.md
    └── MONOREPO_ARCHITECTURE.md
```

---

## ✨ Features

### 🔐 Wallet Authentication
- Solana wallet-based login (no passwords)
- Works with Phantom, Solflare, and other wallets

### 👤 User Profiles
- Customizable profiles with photos, bio, hobbies
- Prompt-based Q&A for personality matching
- Location-based matching (city, state, country)

### 💘 Matching System
- Swipe-based discovery (Like/Pass/Report)
- Mutual likes create matches
- Preference filters: age, gender, location scope

### ⚡ Premium Features
- Premium users appear first in suggestions
- Verified badge support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native, Expo, TypeScript |
| **Backend** | Express.js, TypeScript, Zod |
| **Database** | PostgreSQL, Prisma ORM |
| **Blockchain** | Solana, @solana/web3.js |
| **Monorepo** | Turborepo, Bun |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user` | Create user |
| `GET` | `/api/user/:publicKey` | Get user profile |
| `POST` | `/api/user/profile` | Create profile |
| `PUT` | `/api/user/profile` | Update profile |
| `POST` | `/api/user/:publicKey/preferences` | Set preferences |
| `GET` | `/api/user/:publicKey/prompts` | Get prompts |
| `POST` | `/api/user/:publicKey/prompts` | Answer prompts |
| `GET` | `/api/user/:publicKey/next-suggestion` | Get match suggestion |
| `POST` | `/api/user/swipe/:publicKey/like` | Like user |
| `POST` | `/api/user/swipe/:publicKey/report` | Report user |
| `GET` | `/api/user/swipe/:publicKey/likes` | Get received likes |
| `GET` | `/api/user/swipe/:publicKey/matches` | Get matches |

📖 Full API documentation: [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

---

## 🗄 Database Models

| Model | Description |
|-------|-------------|
| **User** | Wallet address, activity status, premium/verified flags |
| **Profile** | Name, age, gender, bio, location, hobbies |
| **Preferences** | Preferred genders, age range, location scope |
| **Photo** | Profile photos with ordering |
| **Prompt** | Dating prompts/questions |
| **PromptAnswer** | User answers to prompts |
| **Swipe** | Like/Pass/Dislike actions |
| **Matches** | Mutual likes between users |

📖 Full schema docs: [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

---

## 🔧 Development

### Commands

```bash
# Start all services
bun dev

# Backend only
bun dev --filter=dating-backend

# Mobile app only  
bun dev --filter=dating-app

# Database studio
cd packages/database && bunx prisma studio

# Run migrations
cd packages/database && bunx prisma migrate dev

# Generate Prisma client
cd packages/database && bunx prisma generate
```

### Environment Variables

Create `apps/dating-backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pairly"
PORT=3000
```

---

## 📱 Mobile App

The mobile app is built with Expo and React Native.

```bash
# Start Expo
cd apps/dating-app
bun start

# Run on iOS simulator
bun ios

# Run on Android emulator
bun android
```

---

## 🧪 Validation

All API routes use **Zod** schemas for input validation:

- Request body and URL params are validated
- Type-safe with exported TypeScript types
- Consistent error responses

Schemas: `apps/dating-backend/lib/validation-schema.ts`

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [API Documentation](./docs/API_DOCUMENTATION.md) | Complete API reference |
| [Database Schema](./docs/DATABASE_SCHEMA.md) | Database models & relationships |
| [Monorepo Architecture](./docs/MONOREPO_ARCHITECTURE.md) | Project structure guide |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is private and proprietary.

---

<p align="center">
  Built with ❤️ using Solana, React Native & Express
</p>
