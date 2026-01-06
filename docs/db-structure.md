# 📘 Dating App Database Documentation

## 1. System Overview

This database supports a **wallet-based dating application** with:

* **Wallet-based identity** (Solana public key)
* **Location-based matching** (country/state/city)
* **Swipe tracking** (like/pass to exclude already-seen users)
* **Activity-based suggestions** (recently active users first)

---

## 2. Quick Reference

| Model | Purpose |
|-------|---------|
| **User** | Core account, wallet identity |
| **Profile** | Dating profile info (displayed on cards) |
| **Preferences** | Matching filters |
| **Photo** | Profile images |
| **Prompt** | Admin-created questions |
| **PromptAnswer** | User's answers to prompts |
| **Like** | When user likes someone |
| **Swipe** | All swipe actions (like/pass) |
| **Matches** | Mutual likes |

---

## 3. Entity Details

### 🧑 User

| Field | Type | Description |
|-------|------|-------------|
| `walletPubKey` | String | Unique Solana wallet (identity) |
| `isActive` | Boolean | Account status |
| `isVerified` | Boolean | Verified user badge |
| `isPremium` | Boolean | Premium subscription |
| `lastActiveAt` | DateTime? | For sorting suggestions |

---

### 👤 Profile

| Field | Type | Description |
|-------|------|-------------|
| `displayName` | String | Name shown on cards |
| `age` | Int | User's age |
| `gender` | Enum | MALE, FEMALE, NON_BINARY, OTHER |
| `orientation` | String | Sexual orientation |
| `bio` | String? | Short description |
| `profession` | String? | Job/profession |
| `hobbies` | String[] | Array of interests |
| `religion` | String? | Religious preference |
| `country` | String? | e.g., "India" |
| `state` | String? | e.g., "Maharashtra" |
| `city` | String? | e.g., "Mumbai" |
| `heightCm` | Int? | Height in cm |

---

### ⚙️ Preferences

| Field | Type | Description |
|-------|------|-------------|
| `preferredGenders` | Gender[] | Who to show |
| `ageMin` | Int? | Minimum age |
| `ageMax` | Int? | Maximum age |
| `locationScope` | Enum | SAME_CITY, SAME_STATE, SAME_COUNTRY, ANY |

---

### 👆 Swipe (NEW)

Tracks all swipe actions to prevent re-showing users.

| Field | Type | Description |
|-------|------|-------------|
| `fromUserId` | String | Who swiped |
| `toUserId` | String | Who was swiped on |
| `action` | Enum | LIKE or PASS |
| `createdAt` | DateTime | When swiped |

---

### 🖼️ Photo

| Field | Type | Description |
|-------|------|-------------|
| `url` | String | Image URL |
| `order` | Int | Display order (0 = primary) |

---

### 🧩 Prompt

| Field | Type | Description |
|-------|------|-------------|
| `question` | String | The question text |
| `category` | Enum | FUN, LIFESTYLE, VALUES, ICEBREAKER |
| `isActive` | Boolean | Available to users |
| `order` | Int | Display order |

---

### ✍️ PromptAnswer

| Field | Type | Description |
|-------|------|-------------|
| `promptId` | String | Which prompt |
| `answer` | String | User's answer |

---

### ❤️ Like

| Field | Type | Description |
|-------|------|-------------|
| `fromUserId` | String | Who liked |
| `toUserId` | String | Who was liked |

---

### 💕 Matches

Created when both users like each other (mutual like).

| Field | Type | Description |
|-------|------|-------------|
| `firstPersonId` | String | First user |
| `secondPersonId` | String | Second user |

---

## 4. Enums

### Gender
```
MALE, FEMALE, NON_BINARY, OTHER
```

### LocationScope
```
SAME_CITY     - Match only same city
SAME_STATE    - Match same state (default)
SAME_COUNTRY  - Match anywhere in country
ANY           - No location filter
```

### SwipeAction
```
LIKE, PASS
```

### PromptCategory
```
FUN, LIFESTYLE, VALUES, ICEBREAKER
```

---

## 5. Relationships

```
User (1) ←→ (1) Profile
User (1) ←→ (1) Preferences
User (1) ←→ (N) Photo
User (1) ←→ (N) PromptAnswer
User (1) ←→ (N) Like
User (1) ←→ (N) Swipe
User (1) ←→ (N) Matches
```

---

## 6. Location Validation

Locations are validated against a constants file.

**File:** `apps/dating-backend/src/constants/locations.ts`

**Supported Countries:** India, USA, UK, Canada, Australia

---

## 7. Matching Logic (getNextSuggestion)

1. Get user's preferences and profile
2. Exclude already-swiped users (from Swipe table)
3. Filter by:
   - Preferred genders
   - Age range
   - Location scope
4. Order by: Premium first, then most recently active
5. Return first candidate

---

## 8. File Locations

| Purpose | Path |
|---------|------|
| Schema | `packages/database/prisma/schema.prisma` |
| Client | `packages/database/src/client.ts` |
| Seed Data | `packages/database/prisma/seed-data.json` |
| Migrations | `packages/database/prisma/migrations/` |
