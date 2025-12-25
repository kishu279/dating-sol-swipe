# Database Schema Documentation

## Database Overview

The application uses **PostgreSQL** as the database with **Prisma ORM** for data management. The database is structured to support a complete dating app experience with user profiles, preferences, photos, prompts, and likes.

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

  // Relations
  profile          Profile?                     // One-to-one with Profile
  preferences      Preferences?                 // One-to-one with Preferences
  photos           Photo[]                      // One-to-many with Photos
  likesGiven       Like[]      @relation("UserLikes")       // Likes this user gave
  likesReceived    Like[]      @relation("UserLikedBy")     // Likes this user received
  promptAnswers    PromptAnswer[]               // User's prompt answers
}
```

**Fields:**

- `id`: Unique identifier (CUID)
- `walletPubKey`: Unique Solana wallet address (indexed)
- `isActive`: Account status
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

---

### **Profile Model**

Stores user's personal and dating profile information.

```prisma
model Profile {
  id           String   @id @default(cuid())
  userId       String   @unique              // One-to-one relationship
  user         User     @relation(fields: [userId], references: [id])

  displayName  String                        // Display name
  age          Int                           // Age (indexed for search)
  gender       Gender                        // Gender enum (indexed)
  orientation  String                        // Sexual orientation
  bio          String?                       // Biography (optional)
  profession   String?                       // Job/profession (optional)
  hobbies      String[] @default([])         // Array of hobbies
  religion     String?                       // Religion (optional)
  location     String?                       // Location (indexed)
  heightCm     Int?                          // Height in cm (optional)
}
```

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
  id               String   @id @default(cuid())
  userId           String   @unique              // One-to-one relationship
  user             User     @relation(fields: [userId], references: [id])

  preferredGenders Gender[] @default([])         // Array of preferred genders
  ageMin           Int?                          // Minimum age preference
  ageMax           Int?                          // Maximum age preference
  maxDistanceKm    Int?                          // Max distance in kilometers
}
```

---

### **Photo Model**

Stores user profile photos.

```prisma
model Photo {
  id       String  @id @default(cuid())
  userId   String                               // Many-to-one with User
  user     User    @relation(fields: [userId], references: [id])
  url      String                               // Photo URL
  order    Int                                  // Display order
}
```

---

### **Prompt Model**

Pre-defined prompts/questions for user profiles.

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
```

**Enums:**

```prisma
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

  user       User     @relation(fields: [userId], references: [id])
  prompt     Prompt   @relation(fields: [promptId], references: [id])

  @@unique([userId, promptId])                  // One answer per prompt per user
}
```

---

### **Like Model**

Represents likes between users (matches when mutual).

```prisma
model Like {
  id           String   @id @default(cuid())
  fromUserId   String                           // User who liked
  toUserId     String                           // User who was liked
  createdAt    DateTime @default(now())

  fromUser     User     @relation("UserLikes", fields: [fromUserId], references: [id])
  toUser       User     @relation("UserLikedBy", fields: [toUserId], references: [id])

  @@unique([fromUserId, toUserId])              // Prevent duplicate likes
  @@index([toUserId])                           // Index for received likes
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
Prompt (1) ←→ (N) PromptAnswer
```

### Relationship Details

#### One-to-One Relationships

- **User ↔ Profile**: Each user has exactly one profile
- **User ↔ Preferences**: Each user has exactly one preferences record

#### One-to-Many Relationships

- **User → Photo**: A user can have multiple photos
- **User → PromptAnswer**: A user can answer multiple prompts
- **User → Like (as sender)**: A user can give multiple likes
- **User → Like (as receiver)**: A user can receive multiple likes
- **Prompt → PromptAnswer**: A prompt can have multiple user answers

---

## Indexes

The following fields are indexed for optimal query performance:

- `User.walletPubKey` (unique index) - For fast wallet-based user lookup
- `Profile.age` (index) - For age range queries in matching
- `Profile.gender` (index) - For gender-based filtering
- `Profile.location` (index) - For location-based searches
- `Photo.userId` (index) - For fetching user photos efficiently
- `Like.toUserId` (index) - For fetching received likes

---

## Constraints and Validations

### Unique Constraints

- `User.walletPubKey` - Each wallet can only be registered once
- `Profile.userId` - One profile per user
- `Preferences.userId` - One preferences record per user
- `Like.[fromUserId, toUserId]` - Prevent duplicate likes between same users
- `PromptAnswer.[userId, promptId]` - One answer per prompt per user

### Default Values

- `User.isActive` - Defaults to `true`
- `User.createdAt` - Defaults to current timestamp
- `User.updatedAt` - Auto-updates on record changes
- `Profile.hobbies` - Defaults to empty array `[]`
- `Preferences.preferredGenders` - Defaults to empty array `[]`
- `Prompt.isActive` - Defaults to `true`

---

## Field Types Reference

| Prisma Type    | PostgreSQL Type | Description                            |
| -------------- | --------------- | -------------------------------------- |
| String         | VARCHAR/TEXT    | Text data                              |
| Int            | INTEGER         | Whole numbers                          |
| Boolean        | BOOLEAN         | True/false values                      |
| DateTime       | TIMESTAMP       | Date and time with timezone            |
| String[]       | TEXT[]          | Array of strings                       |
| Gender         | ENUM            | Custom enum type for gender            |
| PromptCategory | ENUM            | Custom enum type for prompt categories |

---

## Enums Reference

### Gender Enum

```prisma
enum Gender {
  MALE
  FEMALE
  NON_BINARY
  OTHER
}
```

**Usage:** Profile gender field and preferences gender array

### PromptCategory Enum

```prisma
enum PromptCategory {
  FUN          // Fun and light-hearted questions
  LIFESTYLE    // Daily life and habits
  VALUES       // Personal values and beliefs
  ICEBREAKER   // Conversation starters
}
```

**Usage:** Categorizing prompts for better organization

---

## Database Access

The database is accessed through Prisma Client, which provides type-safe queries and auto-completion.

**Location:** `packages/database/src/client.ts`

**Schema File:** `packages/database/prisma/schema.prisma`

**Migrations:** `packages/database/prisma/migrations/`
