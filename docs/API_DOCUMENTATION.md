# API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/user` | Create user |
| `GET` | `/user/:publicKey` | Get user details |
| `POST` | `/user/profile` | Create profile |
| `PUT` | `/user/profile` | Update profile |
| `POST` | `/user/:publicKey/preferences` | Set preferences |
| `GET` | `/user/:publicKey/preferences` | Get preferences |
| `GET` | `/user/:publicKey/prompts` | Get available prompts |
| `POST` | `/user/:publicKey/prompts` | Submit prompt answers |
| `GET` | `/user/:publicKey/next-suggestion` | Get next match suggestion |
| `POST` | `/user/swipe/:publicKey/like` | Like a user |
| `POST` | `/user/swipe/:publicKey/report` | Report/dislike a user |
| `GET` | `/user/swipe/:publicKey/likes` | Get received likes |
| `GET` | `/user/swipe/:publicKey/matches` | Get matches |

---

## Validation

All routes use **Zod** schemas for input validation. Invalid requests return:

```json
{
  "success": false,
  "error": "<validation error message>"
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `publicKey` | Required, non-empty string |
| `age` | Integer, 18-120 |
| `heightCm` | Integer, 50-300 |
| `gender` | Enum: `MALE`, `FEMALE`, `NON_BINARY`, `OTHER` |
| `locationScope` | Enum: `SAME_CITY`, `SAME_STATE`, `SAME_COUNTRY`, `ANY` |
| `preferredGenders` | Array of Gender enums |
| `answers` | Non-empty array with valid `promptId` and `answer` |

---

## User Management

### `POST /api/user`
Create a new user

**Request:**
```json
{ "walletPublicKey": "string" }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "userId": "string", "message": "User created successfully" }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "User already exists"
}
```

---

### `GET /api/user/:publicKey`
Get user with profile and preferences

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "isActive": true,
    "isVerified": false,
    "isPremium": false,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "lastActiveAt": "ISO8601 | null",
    "profile": {
      "id": "string",
      "userId": "string",
      "displayName": "string",
      "age": 25,
      "gender": "MALE | FEMALE | NON_BINARY | OTHER",
      "orientation": "string",
      "bio": "string | null",
      "profession": "string | null",
      "hobbies": ["string"],
      "religion": "string | null",
      "country": "string | null",
      "state": "string | null",
      "city": "string | null",
      "heightCm": 175
    },
    "preferences": {
      "id": "string",
      "userId": "string",
      "preferredGenders": ["MALE", "FEMALE"],
      "ageMin": 21,
      "ageMax": 30,
      "locationScope": "SAME_CITY | SAME_STATE | SAME_COUNTRY | ANY"
    }
  }
}
```

---

## Profile Management

### `POST /api/user/profile`
Create user profile

**Request:**
```json
{
  "publicKey": "string",
  "name": "string",
  "age": 25,
  "bio": "string",
  "gender": "MALE | FEMALE | NON_BINARY | OTHER",
  "orientation": "string",
  "heightCm": 175,
  "hobbies": ["Reading", "Travel"],
  "country": "India",
  "state": "Maharashtra",
  "city": "Mumbai",
  "profession": "Software Engineer",
  "religion": "Hindu"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publicKey` | string | ✅ | User's wallet public key |
| `name` | string | ✅ | Display name |
| `age` | number | ✅ | Age (years) |
| `gender` | Gender | ✅ | Gender enum value |
| `orientation` | string | ✅ | Sexual orientation |
| `bio` | string | ❌ | Profile bio |
| `heightCm` | number | ❌ | Height in centimeters |
| `hobbies` | string[] | ❌ | List of hobbies |
| `country` | string | ❌ | Country (e.g., "India") |
| `state` | string | ❌ | State (e.g., "Maharashtra") |
| `city` | string | ❌ | City (e.g., "Mumbai") |
| `profession` | string | ❌ | Job/profession |
| `religion` | string | ❌ | Religion |

**Response (201):**
```json
{
  "success": true,
  "data": { "profileId": "string", "message": "Profile created successfully" }
}
```

**Errors:** `400` Profile already exists or invalid location, `404` User not found

---

### `PUT /api/user/profile`
Update user profile

**Request:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "data": { "profileId": "string", "message": "Profile updated successfully" }
}
```

---

## Preferences

### `POST /api/user/:publicKey/preferences`
Set matching preferences

**Request:**
```json
{
  "preferredGenders": ["MALE", "FEMALE"],
  "ageMin": 21,
  "ageMax": 30,
  "locationScope": "SAME_STATE"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `preferredGenders` | Gender[] | ❌ | Preferred gender(s) |
| `ageMin` | number | ❌ | Minimum age preference |
| `ageMax` | number | ❌ | Maximum age preference |
| `locationScope` | LocationScope | ❌ | Location matching scope (default: SAME_STATE) |

**locationScope values:**
| Value | Description |
|-------|-------------|
| `SAME_CITY` | Only users in same city |
| `SAME_STATE` | Users in same state (default) |
| `SAME_COUNTRY` | Users anywhere in country |
| `ANY` | No location filter |

**Response (200):**
```json
{
  "success": true,
  "data": { "preferencesId": "string", "message": "User preferences set successfully" }
}
```

**Errors:** `400` Preferences already exist, `404` User not found

---

### `GET /api/user/:publicKey/preferences`
Get user preferences

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "preferredGenders": ["MALE", "FEMALE"],
    "ageMin": 21,
    "ageMax": 30,
    "locationScope": "SAME_STATE"
  }
}
```

---

## Prompts

### `GET /api/user/:publicKey/prompts`
Get all available prompts

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "question": "Two truths and a lie — go.",
      "category": "FUN | LIFESTYLE | VALUES | ICEBREAKER",
      "isActive": true,
      "order": 1,
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### `POST /api/user/:publicKey/prompts`
Submit prompt answers

**Request:**
```json
{
  "answers": [
    { "promptId": "string", "answer": "My answer text" }
  ]
}
```

**Response (200):**
```json
{ "success": true, "message": "Prompts answered successfully" }
```

**Errors:** `400` Invalid answers array, `404` User not found

---

## Suggestions

### `GET /api/user/:publicKey/next-suggestion`
Get next matching user based on preferences

**Matching Logic:**
1. Excludes self and already-swiped users
2. Filters by `preferredGenders` if set
3. Filters by `ageMin`/`ageMax` range if set
4. Filters by location based on `locationScope`
5. Orders by: premium users first, then most recently active
6. Updates requester's `lastActiveAt`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "profile": {
      "id": "string",
      "displayName": "string",
      "age": 25,
      "gender": "FEMALE",
      "orientation": "Heterosexual",
      "bio": "string",
      "profession": "string",
      "hobbies": ["Reading"],
      "religion": "string",
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "heightCm": 165
    },
    "photos": [
      { "id": "string", "url": "https://...", "order": 0 }
    ],
    "promptAnswers": [
      {
        "id": "string",
        "answer": "My answer",
        "prompt": { "id": "string", "question": "Two truths and a lie" }
      }
    ]
  }
}
```

**Response (200) - No more suggestions:**
```json
{
  "success": true,
  "data": null,
  "message": "No more suggestions available"
}
```

**Errors:** `400` User not found or profile not created

---

## Swipe Actions

### `POST /api/user/swipe/:publicKey/like`
Like another user (creates match if mutual)

**Request:**
```json
{ "toWhom": "target_wallet_public_key" }
```

**Response (200) - Like created:**
```json
{
  "success": true,
  "message": "User liked successfully",
  "isMatch": false,
  "swipeId": "string"
}
```

**Response (200) - Match!:**
```json
{
  "success": true,
  "message": "It's a match! 🎉",
  "isMatch": true,
  "swipeId": "string"
}
```

**Errors:** `400` Missing toWhom or trying to like self, `404` User not found, `409` Already swiped

---

### `GET /api/user/swipe/:publicKey/likes`
Get all likes received (users who swiped LIKE on you)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "swipeId": "string",
      "likedAt": "ISO8601",
      "user": {
        "id": "string",
        "walletPubKey": "string",
        "displayName": "string",
        "profileImage": "https://... | null"
      }
    }
  ]
}
```
---

### `POST /api/user/swipe/:publicKey/report`
Report/dislike a user (prevents them from appearing in suggestions)

**Request:**
```json
{ "toWhom": "target_wallet_public_key_or_id" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "User reported successfully",
  "swipeId": "string"
}
```

**Notes:**
- If user was previously liked, swipe is **updated** to DISLIKE
- Reported users won't appear in suggestions

**Errors:** `400` Missing toWhom or trying to report self, `404` User not found

---

## Matches

### `GET /api/user/swipe/:publicKey/matches`
Get all mutual matches

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "matchId": "string",
      "matchedAt": "ISO8601",
      "user": {
        "id": "string",
        "walletPubKey": "string",
        "displayName": "string",
        "profileImage": "https://... | null",
        "profile": {
          "id": "string",
          "displayName": "string",
          "age": 25,
          "gender": "FEMALE",
          "orientation": "string",
          "bio": "string",
          "profession": "string",
          "hobbies": ["string"],
          "religion": "string",
          "country": "string",
          "state": "string",
          "city": "string",
          "heightCm": 170
        }
      }
    }
  ]
}
```

---

## TypeScript Types for Frontend

```typescript
// Enums
type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER';
type LocationScope = 'SAME_CITY' | 'SAME_STATE' | 'SAME_COUNTRY' | 'ANY';
type PromptCategory = 'FUN' | 'LIFESTYLE' | 'VALUES' | 'ICEBREAKER';
type SwipeAction = 'LIKE' | 'PASS';

// Request Types
interface CreateUserRequest {
  walletPublicKey: string;
}

interface CreateProfileRequest {
  publicKey: string;
  name: string;
  age: number;
  gender: Gender;
  orientation: string;
  bio?: string;
  heightCm?: number;
  hobbies?: string[];
  country?: string;
  state?: string;
  city?: string;
  profession?: string;
  religion?: string;
}

interface SetPreferencesRequest {
  preferredGenders?: Gender[];
  ageMin?: number;
  ageMax?: number;
  locationScope?: LocationScope;
}

interface AnswerPromptsRequest {
  answers: Array<{
    promptId: string;
    answer: string;
  }>;
}

interface LikeUserRequest {
  toWhom: string;
}

// Response Types
interface User {
  id: string;
  walletPubKey: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
  profile: Profile | null;
  preferences: Preferences | null;
}

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  gender: Gender;
  orientation: string;
  bio: string | null;
  profession: string | null;
  hobbies: string[];
  religion: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  heightCm: number | null;
}

interface Preferences {
  id: string;
  userId: string;
  preferredGenders: Gender[];
  ageMin: number | null;
  ageMax: number | null;
  locationScope: LocationScope;
}

interface Photo {
  id: string;
  userId: string;
  url: string;
  order: number;
}

interface Prompt {
  id: string;
  question: string;
  category: PromptCategory;
  isActive: boolean;
  order: number | null;
  createdAt: string;
}

interface PromptAnswer {
  id: string;
  userId: string;
  promptId: string;
  answer: string;
  createdAt: string;
  prompt?: Prompt;
}

interface Suggestion {
  id: string;
  walletPubKey: string;
  profile: Profile;
  photos: Photo[];
  promptAnswers: PromptAnswer[];
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}
```

---

## Enums Reference

| Field | Values |
|-------|--------|
| `gender` | `MALE`, `FEMALE`, `NON_BINARY`, `OTHER` |
| `locationScope` | `SAME_CITY`, `SAME_STATE`, `SAME_COUNTRY`, `ANY` |
| `promptCategory` | `FUN`, `LIFESTYLE`, `VALUES`, `ICEBREAKER` |
| `swipeAction` | `LIKE`, `PASS` |

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `404` | Not Found |
| `409` | Conflict (duplicate) |
| `500` | Server Error |

---

## Validation Schemas

All validation schemas are defined in `apps/dating-backend/lib/validation-schema.ts` and export TypeScript types:

```typescript
import { 
  createUserBodySchema, 
  createProfileBodySchema,
  setUserPreferencesBodySchema,
  // ... other schemas
  type CreateUserBody,
  type CreateProfileBody
} from '../lib/validation-schema';
```
