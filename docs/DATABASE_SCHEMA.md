# Database Schema Documentation

## Database Overview

The application uses **PostgreSQL** as the database with **Prisma ORM** for data management. The database is structured to support a complete dating app experience with user profiles, preferences, photos, prompts, likes, and swipe tracking.

---

## Models and Relationships

### **User Model**

Primary entity representing a registered user in the system.

```prisma
model User {
  id               String      @id @default(cuid())
  walletPubKey     String      @unique           // Solana wallet public key
  isActive         Boolean     @default(true)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  lastActiveAt     DateTime?                     // For sorting suggestions by activity

  isVerified       Boolean     @default(false)   // Verified user status
  isPremium        Boolean     @default(false)   // Premium subscription status

  // Relations
  profile          Profile?                      // One-to-one with Profile
  preferences      Preferences?                  // One-to-one with Preferences
  photos           Photo[]                       // One-to-many with Photos
  likesGiven       Like[]      @relation("UserLikes")       // Likes this user gave
  likesReceived    Like[]      @relation("UserLikedBy")     // Likes this user received
  promptAnswers    PromptAnswer[]                // User's prompt answers
  matchesAsFirst   Matches[]   @relation("MatchFirst")      // Matches where user is first
  matchesAsSecond  Matches[]   @relation("MatchSecond")     // Matches where user is second
  swipesGiven      Swipe[]     @relation("UserSwipes")      // Swipes this user made
  swipesReceived   Swipe[]     @relation("UserSwipedOn")    // Swipes received
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `walletPubKey` | String | Unique Solana wallet address (indexed) |
| `isActive` | Boolean | Account status |
| `lastActiveAt` | DateTime? | Last activity timestamp (for suggestion sorting) |
| `isVerified` | Boolean | User verification status |
| `isPremium` | Boolean | Premium subscription status |

---

### **Profile Model**

Stores user's personal and dating profile information.

```prisma
model Profile {
  id           String   @id @default(cuid())
  userId       String   @unique              // One-to-one relationship
  user         User     @relation(...)

  displayName  String                        // Display name
  age          Int                           // Age (indexed for search)
  gender       Gender                        // Gender enum (indexed)
  orientation  String                        // Sexual orientation
  bio          String?                       // Biography (optional)
  profession   String?                       // Job/profession (optional)
  hobbies      String[] @default([])         // Array of hobbies
  religion     String?                       // Religion (optional)
  country      String?                       // Country (indexed) e.g., "India"
  state        String?                       // State/Region (indexed) e.g., "Maharashtra"
  city         String?                       // City (optional) e.g., "Mumbai"
  heightCm     Int?                          // Height in cm (optional)
}
```

**Location Fields:**
- `country` - User's country (validated against constants)
- `state` - User's state/region (validated against country)
- `city` - User's city (optional, for display)

**Enums:**

```prisma
enum Gender {
  MALE
  FEMALE
  NON_BINARY
  OTHER
}
```

---

### **Preferences Model**

Stores user's matching preferences and filters.

```prisma
model Preferences {
  id               String        @id @default(cuid())
  userId           String        @unique
  user             User          @relation(...)

  preferredGenders Gender[]      @default([])     // Array of preferred genders
  ageMin           Int?                           // Minimum age preference
  ageMax           Int?                           // Maximum age preference
  locationScope    LocationScope @default(SAME_STATE)  // Location matching scope
}
```

**Location Scope Enum:**

```prisma
enum LocationScope {
  SAME_CITY     // Match only users in same city
  SAME_STATE    // Match users in same state (default)
  SAME_COUNTRY  // Match users in same country
  ANY           // No location filtering
}
```

---

### **Swipe Model** (NEW)

Tracks all swipe actions (likes and passes) to prevent re-showing users.

```prisma
model Swipe {
  id         String      @id @default(cuid())
  fromUserId String                           // User who swiped
  toUserId   String                           // User who was swiped on
  action     SwipeAction                      // LIKE or PASS
  createdAt  DateTime    @default(now())

  fromUser   User        @relation("UserSwipes", ...)
  toUser     User        @relation("UserSwipedOn", ...)

  @@unique([fromUserId, toUserId])            // One swipe per user pair
  @@index([toUserId])
}

enum SwipeAction {
  LIKE    // User liked the profile
  PASS    // User passed/rejected the profile
}
```

**Purpose:**
- Prevents showing already-swiped users in suggestions
- Distinguishes between likes and passes for analytics
- Used by `getNextSuggestion` to filter candidates

---

### **Photo Model**

Stores user profile photos.

```prisma
model Photo {
  id       String  @id @default(cuid())
  userId   String                               // Many-to-one with User
  user     User    @relation(...)
  url      String                               // Photo URL
  order    Int                                  // Display order (1 = primary)
}
```

---

### **Prompt Model**

Pre-defined prompts/questions for user profiles (admin-controlled).

```prisma
model Prompt {
  id          String         @id @default(cuid())
  question    String                            // The prompt question
  category    PromptCategory                    // Category enum
  isActive    Boolean        @default(true)     // Active status
  order       Int?                              // Display order
  createdAt   DateTime       @default(now())

  answers     PromptAnswer[]                    // User answers
}

enum PromptCategory {
  FUN
  LIFESTYLE
  VALUES
  ICEBREAKER
}
```

---

### **PromptAnswer Model**

User's answers to profile prompts.

```prisma
model PromptAnswer {
  id         String   @id @default(cuid())
  userId     String
  promptId   String
  answer     String                             // User's answer
  createdAt  DateTime @default(now())

  user       User     @relation(...)
  prompt     Prompt   @relation(...)

  @@unique([userId, promptId])                  // One answer per prompt per user
}
```

---

### **Like Model**

Represents likes between users.

```prisma
model Like {
  id           String   @id @default(cuid())
  fromUserId   String                           // User who liked
  toUserId     String                           // User who was liked
  createdAt    DateTime @default(now())

  fromUser     User     @relation("UserLikes", ...)
  toUser       User     @relation("UserLikedBy", ...)

  @@unique([fromUserId, toUserId])              // Prevent duplicate likes
  @@index([toUserId])                           // Index for received likes
}
```

---

### **Matches Model**

Stores mutual matches between users. Created when both users like each other.

```prisma
model Matches {
  id             String   @id @default(cuid())
  firstPersonId  String                         // First user in the match
  secondPersonId String                         // Second user in the match
  createdAt      DateTime @default(now())

  firstPerson    User     @relation("MatchFirst", ...)
  secondPerson   User     @relation("MatchSecond", ...)

  @@unique([firstPersonId, secondPersonId])     // One match per user pair
}
```

---

## Database Relationships Diagram

```
User (1) ←→ (1) Profile
User (1) ←→ (1) Preferences
User (1) ←→ (N) Photo
User (1) ←→ (N) PromptAnswer
User (1) ←→ (N) Like (as fromUser)
User (1) ←→ (N) Like (as toUser)
User (1) ←→ (N) Swipe (as fromUser)
User (1) ←→ (N) Swipe (as toUser)
User (1) ←→ (N) Matches (as firstPerson)
User (1) ←→ (N) Matches (as secondPerson)
Prompt (1) ←→ (N) PromptAnswer
```

---

## Indexes

| Model | Field | Purpose |
|-------|-------|---------|
| User | `walletPubKey` | Fast wallet-based lookup |
| User | `lastActiveAt` | Sorting by activity |
| Profile | `age` | Age range queries |
| Profile | `gender` | Gender-based filtering |
| Profile | `country` | Location-based searches |
| Profile | `state` | Location-based searches |
| Profile | `orientation` | Orientation filtering |
| Photo | `userId` | Fetching user photos |
| Like | `toUserId` | Fetching received likes |
| Swipe | `toUserId` | Filtering already-swiped users |

---

## Enums Reference

| Enum | Values | Usage |
|------|--------|-------|
| `Gender` | MALE, FEMALE, NON_BINARY, OTHER | Profile gender, preferences |
| `PromptCategory` | FUN, LIFESTYLE, VALUES, ICEBREAKER | Categorizing prompts |
| `LocationScope` | SAME_CITY, SAME_STATE, SAME_COUNTRY, ANY | Matching scope |
| `SwipeAction` | LIKE, PASS | Tracking swipe actions |

---

## Location Validation

Location fields are validated against a constants file. See `apps/dating-backend/src/constants/locations.ts`.

**Supported Countries:** India, USA, UK, Canada, Australia

**Validation Functions:**
- `validateLocation(country, state)` - Validates country/state combination
- `getStates(country)` - Returns valid states for a country
- `isValidCountry(country)` - Checks if country is valid

---

## Database Access

**Prisma Client:** `packages/database/src/client.ts`

**Schema File:** `packages/database/prisma/schema.prisma`

**Migrations:** `packages/database/prisma/migrations/`
