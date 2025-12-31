# API Documentation

Base URL: `http://localhost:3000/api`

---

## 1. Create User
**POST** `/user`

**Body:**
```json
{
  "walletPublicKey": "string"
}
```

**Responses:**

201:
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "message": "User created successfully"
  }
}
```

200:
```json
{
  "userId": "string",
  "message": "User already exists"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to create user"
}
```

---

## 2. Create Profile
**POST** `/user/profile`

**Body:**
```json
{
  "publicKey": "string",
  "name": "string",
  "age": number,
  "bio": "string",
  "gender": "MALE | FEMALE | NON_BINARY | OTHER",
  "orientation": "string"
}
```

**Responses:**

201:
```json
{
  "success": true,
  "data": {
    "profileId": "string",
    "message": "Profile created successfully"
  }
}
```

400:
```json
{
  "success": false,
  "error": "publicKey is required"
}
```

404:
```json
{
  "success": false,
  "error": "User not found"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to create profile"
}
```

---

## 3. Update Profile
**PUT** `/user/profile`

**Body:**
```json
{
  "publicKey": "string",
  "name": "string",
  "age": number,
  "bio": "string",
  "gender": "MALE | FEMALE | NON_BINARY | OTHER",
  "orientation": "string"
}
```

**Responses:**

200:
```json
{
  "success": true,
  "data": {
    "profileId": "string",
    "message": "Profile updated successfully"
  }
}
```

404:
```json
{
  "success": false,
  "error": "User not found"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to update profile"
}
```

---

## 4. Get User
**GET** `/user/:publicKey`

**Params:** `publicKey`

**Responses:**

200:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "isActive": boolean,
    "createdAt": "string",
    "updatedAt": "string",
    "profile": {
      "id": "string",
      "displayName": "string",
      "age": number,
      "gender": "string",
      "orientation": "string",
      "bio": "string"
    },
    "preferences": {
      "id": "string",
      "preferredGenders": ["string"],
      "ageMin": number,
      "ageMax": number,
      "maxDistanceKm": number
    }
  }
}
```

404:
```json
{
  "success": false,
  "error": "User not found"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to fetch user"
}
```

---

## 5. Set Preferences
**POST** `/user/:publicKey/preferences`

**Params:** `publicKey`

**Body:**
```json
{
  "preferredGenders": ["MALE | FEMALE | NON_BINARY | OTHER"],
  "ageMin": number,
  "ageMax": number,
  "distanceRange": number
}
```

**Responses:**

200:
```json
{
  "success": true,
  "data": {
    "preferencesId": "string",
    "message": "User preferences set successfully"
  }
}
```

404:
```json
{
  "success": false,
  "error": "User not found"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to set user preferences"
}
```

---

## 6. Get Preferences
**GET** `/user/:publicKey/preferences`

**Params:** `publicKey`

**Responses:**

200:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "preferredGenders": ["string"],
    "ageMin": number,
    "ageMax": number,
    "maxDistanceKm": number
  }
}
```

404:
```json
{
  "success": false,
  "error": "User not found"
}
```

404:
```json
{
  "success": false,
  "error": "User preferences not found"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to fetch user preferences"
}
```

---

## 7. Get Prompts
**GET** `/user/:publicKey/prompts`

**Params:** `publicKey`

**Responses:**

200:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "question": "string",
      "category": "FUN | LIFESTYLE | VALUES | ICEBREAKER",
      "isActive": boolean,
      "order": number,
      "createdAt": "string"
    }
  ]
}
```

500:
```json
{
  "success": false,
  "error": "Failed to fetch prompts"
}
```

---

## 8. Submit Prompt Answers
**POST** `/user/:publicKey/prompts`

**Params:** `publicKey`

**Body:**
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

**Responses:**

200:
```json
{
  "success": true,
  "message": "Prompts answered successfully"
}
```

400:
```json
{
  "success": false,
  "error": "Missing or invalid public key"
}
```

400:
```json
{
  "success": false,
  "error": "Answers must be a non-empty array"
}
```

400:
```json
{
  "success": false,
  "error": "Invalid promptId in answers"
}
```

400:
```json
{
  "success": false,
  "error": "Invalid answer in answers"
}
```

404:
```json
{
  "success": false,
  "error": "User not found"
}
```

500:
```json
{
  "success": false,
  "error": "Failed to ans prompts"
}
```

---

## 9. Get Next Suggestion
**GET** `/user/:publicKey/next-suggestion`

**Params:** `publicKey`

**Responses:**

200:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletPubKey": "string",
    "preferences": {
      "preferredGenders": ["string"],
      "ageMin": number,
      "ageMax": number,
      "maxDistanceKm": number
    }
  },
  "message": "Next suggestion fetched successfully"
}
```
