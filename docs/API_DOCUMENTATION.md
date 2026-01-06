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
| `POST` | `/user/:publicKey/like` | Like a user |
| `GET` | `/user/:publicKey/likes` | Get received likes |
| `GET` | `/user/:publicKey/matches` | Get matches |

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
    "lastActiveAt": "ISO8601",
    "profile": {
      "displayName": "string",
      "age": 25,
      "gender": "MALE | FEMALE | NON_BINARY | OTHER",
      "orientation": "string",
      "bio": "string",
      "profession": "string",
      "hobbies": ["string"],
      "religion": "string",
      "country": "string",
      "state": "string",
      "city": "string",
      "heightCm": 175
    },
    "preferences": {
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

**Response (201):**
```json
{
  "success": true,
  "data": { "profileId": "string", "message": "Profile created successfully" }
}
```

**Errors:** `400` Profile already exists, `404` User not found

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

---

### `GET /api/user/:publicKey/preferences`
Get user preferences

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
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
      "order": 1
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

---

## Suggestions

### `GET /api/user/:publicKey/next-suggestion`
Get next matching user based on preferences

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "profile": {
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
      { "url": "https://...", "order": 0 }
    ],
    "promptAnswers": [
      {
        "answer": "My answer",
        "prompt": { "question": "Two truths and a lie" }
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

---

## Likes

### `POST /api/user/:publicKey/like`
Like another user (creates match if mutual)

**Request:**
```json
{ "toWhom": "target_wallet_public_key" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "User liked successfully",
  "isMatch": false,
  "likeId": "string"
}
```

**Response (200) - Match!:**
```json
{
  "success": true,
  "message": "It's a match! 🎉",
  "isMatch": true,
  "likeId": "string"
}
```

---

### `GET /api/user/:publicKey/likes`
Get all likes received

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "likeId": "string",
      "likedAt": "ISO8601",
      "user": {
        "id": "string",
        "walletPubKey": "string",
        "displayName": "string",
        "profileImage": "https://..."
      }
    }
  ]
}
```

---

## Matches

### `GET /api/user/:publicKey/matches`
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
        "profileImage": "https://...",
        "profile": { ... }
      }
    }
  ]
}
```

---

## Enums Reference

| Field | Values |
|-------|--------|
| `gender` | `MALE`, `FEMALE`, `NON_BINARY`, `OTHER` |
| `locationScope` | `SAME_CITY`, `SAME_STATE`, `SAME_COUNTRY`, `ANY` |
| `promptCategory` | `FUN`, `LIFESTYLE`, `VALUES`, `ICEBREAKER` |

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
