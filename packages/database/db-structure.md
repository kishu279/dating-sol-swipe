
---

# 📘 Dating App Database Documentation (Phase-1)

## 1. System Overview

This database supports a **wallet-based dating application** with the following principles:

* **Identity is wallet-based** (Solana public key)
* **All user profile data is stored off-chain**
* **Admin controls personality prompts**
* **Users may optionally answer prompts**
* **Swipes are stored as likes**
* **Mutual likes imply a match**
* Messaging, payments, and AI scoring are intentionally excluded in Phase-1

The schema is designed to be:

* Read-optimized for swipe queries
* Easy to evolve for AI matching
* Compatible with mobile-first UX (Hinge-style)

---

## 2. Identity & Authentication Model

### Key Concept

A **User** is uniquely identified by a **wallet public key**.

* No email
* No password
* No OAuth
* Authentication is done via **signed wallet messages** (outside DB scope)

---

## 3. Entity Definitions

---

## 🧑 User

### Purpose

Represents a unique account tied to a wallet.

### Key Properties

| Field          | Meaning                         |
| -------------- | ------------------------------- |
| `walletPubKey` | Unique identity (Solana wallet) |
| `isActive`     | Soft delete / ban support       |
| `createdAt`    | Account creation timestamp      |

### Rules

* One wallet = one user
* User may exist **without a profile** initially
* User owns all related records

### Relations

* 1 → 1 Profile (optional)
* 1 → 1 Preferences (optional)
* 1 → many Photos
* 1 → many PromptAnswers
* 1 → many Likes (given & received)

---

## 👤 Profile

### Purpose

Stores **public dating profile information**.

### Display Scope

This data is shown on:

* Swipe cards
* Match previews
* Profile view

### Key Properties

| Field         | Meaning             |
| ------------- | ------------------- |
| `displayName` | Public name         |
| `age`         | Used for matching   |
| `gender`      | Enum                |
| `orientation` | Free text (Phase-1) |
| `bio`         | Short description   |
| `hobbies[]`   | Used for matching   |
| `location`    | City / region       |

### Rules

* Each user has **at most one profile**
* Profile must exist before user can swipe
* Indexed for matching queries

---

## ⚙️ Preferences

### Purpose

Defines **who the user wants to see**.

### Matching Scope

Used when generating swipe suggestions.

### Key Properties

| Field                | Meaning         |
| -------------------- | --------------- |
| `preferredGenders[]` | Gender filter   |
| `ageMin / ageMax`    | Age range       |
| `maxDistanceKm`      | Distance filter |

### Rules

* Preferences are optional
* Defaults are applied at API level
* No hard constraints enforced in DB

---

## 🧩 Prompt (Admin-Controlled)

### Purpose

Represents **personality questions**, similar to Hinge.

### Ownership

* Created and managed **only by admin**
* Users cannot create or modify prompts

### Key Properties

| Field      | Meaning            |
| ---------- | ------------------ |
| `question` | Prompt text        |
| `category` | FUN / VALUES / etc |
| `isActive` | Visibility toggle  |
| `order`    | Display ordering   |

### Rules

* Prompts are immutable once published
* Admin may deactivate prompts
* Prompts are reused across all users

---

## ✍️ PromptAnswer

### Purpose

Stores a **user’s answer to a specific prompt**.

### Usage

* Displayed on swipe cards
* Used for conversation starters
* Used later for AI matching

### Key Properties

| Field      | Meaning           |
| ---------- | ----------------- |
| `userId`   | Owner             |
| `promptId` | Referenced prompt |
| `answer`   | Short free text   |

### Constraints

* A user can answer **a prompt only once**
* User may skip prompts
* Max number of answers enforced in API (not DB)

---

## 🖼️ Photo

### Purpose

Stores profile images.

### Display

Used in:

* Swipe cards
* Profile gallery

### Key Properties

| Field   | Meaning        |
| ------- | -------------- |
| `url`   | Image location |
| `order` | Display order  |

### Rules

* At least one photo required to swipe (API rule)
* Order determines primary photo

---

## ❤️ Like

### Purpose

Represents a **swipe right**.

### Matching Logic

* If A likes B AND B likes A → match exists

### Key Properties

| Field        | Meaning       |
| ------------ | ------------- |
| `fromUserId` | Who liked     |
| `toUserId`   | Who was liked |
| `createdAt`  | Time of swipe |

### Constraints

* One like per user pair
* Duplicate likes are prevented

### Rules

* No explicit Match table in Phase-1
* Matches are computed dynamically

---

## 4. Enums

### Gender

```txt
MALE
FEMALE
NON_BINARY
OTHER
```

### PromptCategory

```txt
FUN
LIFESTYLE
VALUES
ICEBREAKER
```

Enums ensure consistency and avoid free-text bugs.

---

## 5. What This Database Does NOT Handle

Intentionally excluded from Phase-1:

* Messaging
* Reactions/comments on prompts
* AI scoring tables
* On-chain data
* Payment/subscription tracking
* Admin authentication tables

These will be layered later.

---

## 6. Data Flow Summary (LLM-Friendly)

1. User connects wallet → User row created
2. User fills profile → Profile row created
3. Admin seeds prompts → Prompt rows exist
4. User answers prompts → PromptAnswer rows created
5. User swipes → Like rows created
6. Mutual likes → Match inferred at query time

---

## 7. Design Guarantees

This schema guarantees:

* No duplicate likes
* No duplicate prompt answers
* Clear admin vs user ownership
* Query-friendly matching
* Safe incremental evolution

---

## 8. Instructions for LLM Usage

When reasoning about this schema, assume:

* Wallet public key is the primary identity
* Profiles are optional but required for swipe
* Prompts are static global data
* Prompt answers are sparse
* Matches are inferred, not stored

---

## 9. Phase-1 Status

**This schema is final for Phase-1.**
No migrations required until:

* Messaging
* AI ranking
* Payments
* On-chain anchoring

---
