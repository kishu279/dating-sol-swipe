# API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Health Check

### `GET /api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server and database are healthy"
}
```

---

## User Management

### `POST /api/user`
Create a new user

**Request Body:**
```json
{
  "walletPublicKey": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "message": "User created successfully"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "User already exists"
}
```

---

### `GET /api/user/:publicKey`
Get user details with profile and preferences

**URL Params:** `publicKey` - Wallet public key

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "isActive": true,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "profile": {
      "id": "string",
      "displayName": "string",
      "age": 25,
      "bio": "string",
      "gender": "MALE|FEMALE|NON_BINARY",
      "orientation": "MEN|WOMEN|EVERYONE",
      "heightCm": 175,
      "hobbies": ["string"],
      "location": "string",
      "profession": "string",
      "religion": "string"
    },
    "preferences": {
      "id": "string",
      "preferredGenders": ["MALE|FEMALE|NON_BINARY"],
      "ageMin": 21,
      "ageMax": 30,
      "maxDistanceKm": 50
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Profile Management

### `POST /api/user/profile`
Create user profile

**Request Body:**
```json
{
  "publicKey": "string",
  "name": "string",
  "age": "number",
  "bio": "string",
  "gender": "MALE|FEMALE|NON_BINARY",
  "orientation": "MEN|WOMEN|EVERYONE",
  "heightCm": "number",
  "hobbies": ["string"],
  "location": "string",
  "profession": "string",
  "religion": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "profileId": "string",
    "message": "Profile created successfully"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Profile already exists"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### `PUT /api/user/profile`
Update user profile

**Request Body:** Same as POST `/api/user/profile`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profileId": "string",
    "message": "Profile updated successfully"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Preferences

### `POST /api/user/:publicKey/preferences`
Set user matching preferences

**URL Params:** `publicKey` - Wallet public key

**Request Body:**
```json
{
  "preferredGenders": ["MALE|FEMALE|NON_BINARY"],
  "ageMin": "number",
  "ageMax": "number",
  "distanceRange": "number"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "preferencesId": "string",
    "message": "User preferences set successfully"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Preferences already exist"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### `GET /api/user/:publicKey/preferences`
Get user preferences

**URL Params:** `publicKey` - Wallet public key

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "preferredGenders": ["MALE|FEMALE|NON_BINARY"],
    "ageMin": "number",
    "ageMax": "number",
    "maxDistanceKm": "number",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "User not found or preferences not found"
}
```

---

## Prompts

### `GET /api/user/:publicKey/prompts`
Get all available prompts

**URL Params:** `publicKey` - Wallet public key

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "text": "string",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### `POST /api/user/:publicKey/prompts`
Submit prompt answers

**URL Params:** `publicKey` - Wallet public key

**Request Body:**
```json
{
  "answers": [
    {
      "promptId": "string",
      "answer": "string"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Prompts answered successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Invalid publicKey or answers format"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Next Suggestion (Paid)

### `GET /api/user/:publicKey/next-suggestion`
Get next matching user - requires Solana payment verification

**URL Params:** `publicKey` - Wallet public key

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "preferences": {
      "preferredGenders": ["MALE|FEMALE|NON_BINARY"],
      "ageMin": "number",
      "ageMax": "number",
      "maxDistanceKm": "number"
    }
  },
  "message": "Next suggestion fetched successfully"
}
```

**Error (402):**
```json
{
  "error": "Payment required to access this resource.",
  "message": "Payment verification failed."
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `402` - Payment Required
- `404` - Not Found
- `500` - Server Error
