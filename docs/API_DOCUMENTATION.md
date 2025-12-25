# Dating App API Documentation

**Base URL:** `http://localhost:3000/api`  
**Server Port:** `3000` (default)  
**Content Type:** `application/json`

---

## Table of Contents

- [API Routes Summary](#api-routes-summary)
- [Key User Flows](#key-user-flows)
  - [Creating a User with Public Key](#creating-a-user-with-public-key)
  - [Getting User Details with Public Key](#getting-user-details-with-public-key)
- [Health Check](#health-check)
- [User Management](#user-management)
  - [Create User](#create-user)
  - [Get All Users](#get-all-users)
  - [Get User by ID or Wallet Public Key](#get-user-by-id-or-wallet-public-key)
- [Profile Management](#profile-management)
  - [Create Profile](#create-profile)
- [Preferences Management](#preferences-management)
  - [Set User Preferences](#set-user-preferences)
  - [Get User Preferences](#get-user-preferences)

---

> **📄 Database Schema:** For detailed database schema documentation, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## API Routes Summary

All routes are prefixed with `/api`.

| Method   | Endpoint                     | Description                              | Auth Required |
| -------- | ---------------------------- | ---------------------------------------- | ------------- |
| **GET**  | `/api/health`                | Server and database health check         | No            |
| **POST** | `/api/create-user`           | Create a new user with wallet public key | No            |
| **POST** | `/api/create-profile`        | Create user profile                      | No            |
| **GET**  | `/api/users`                 | Get all users (basic info only)          | No            |
| **GET**  | `/api/users/:id`             | Get user by ID or wallet public key      | No            |
| **POST** | `/api/users/:id/preferences` | Create/update user preferences           | No            |
| **GET**  | `/api/users/:id/preferences` | Get user preferences                     | No            |

**Note:** Currently, no authentication is implemented. All endpoints are publicly accessible.

---

## Key User Flows

### Creating a User with Public Key

**Purpose:** Register a new user using their Solana wallet public key. This is the entry point for all new users.

**Flow:**

1. User connects their Solana wallet
2. Get the wallet's public key
3. Call `POST /api/create-user` with the public key
4. Receive a `userId` in response
5. Use this `userId` for all subsequent operations

**Example:**

```javascript
// After wallet connection
const walletAddress = await wallet.connect();

const response = await fetch("http://localhost:3000/api/create-user", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    walletPublicKey: walletAddress.toString(),
  }),
});

const result = await response.json();
// result.data.userId -> Save this for future API calls
localStorage.setItem("userId", result.data.userId);
```

**Why This Works:**

- The `walletPubKey` field in the User model is unique and indexed
- Wallet public keys are permanent identifiers
- No need to remember separate username/password
- User can be looked up later using the same wallet address

---

### Getting User Details with Public Key

**Purpose:** Retrieve complete user information using their wallet public key. Useful when a user reconnects their wallet.

**Flow:**

1. User connects their wallet
2. Get the wallet's public key
3. Call `GET /api/users/{walletPublicKey}` directly with the public key
4. Receive complete user data including profile and preferences
5. Check if onboarding is complete

**Example:**

```javascript
// After wallet reconnection
const walletAddress = await wallet.connect();

const response = await fetch(
  `http://localhost:3000/api/users/${walletAddress.toString()}`
);

const result = await response.json();

if (result.success) {
  // User exists
  const user = result.data;
  localStorage.setItem("userId", user.id);

  // Check onboarding status
  if (!user.profile) {
    // Redirect to profile creation
    redirectToProfileSetup();
  } else if (!user.preferences) {
    // Redirect to preferences setup
    redirectToPreferencesSetup();
  } else {
    // User fully onboarded
    redirectToMainApp();
  }
} else {
  // User doesn't exist - create new account
  createNewUser(walletAddress);
}
```

**Why This Works:**

- The API checks both userId and walletPubKey in the same endpoint
- Pass the wallet public key directly as the `:id` parameter
- No need to maintain separate lookup endpoints
- Single API call returns all user data with relations

**Complete Onboarding Flow with Public Key:**

```
1. User connects Solana wallet
   ↓
2. GET /api/users/{walletPublicKey} to check if user exists
   ↓
   ├─ User exists → Load user data, check completion status
   └─ User not found → Continue to step 3
   ↓
3. POST /api/create-user with walletPublicKey → Get userId
   ↓
4. POST /api/create-profile with userId → Create profile
   ↓
5. POST /api/users/{userId}/preferences → Set preferences
   ↓
6. User onboarding complete → Access main app
```

---

## Health Check

### Check Server Health

**Endpoint:** `GET /api/health`

**Purpose:** Verifies server is running and database connection is active.

#### Request Details

**Required Headers:**

- None

**URL Parameters:**

- None

**Query Parameters:**

- None

**Request Body:**

- Not applicable (GET request)

#### Response Details

**Success Response (200):**

```json
{
  "success": true,
  "message": "Server and database are healthy"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful health check |
| message | string | Status message confirming server and database health |

**Error Response (500 - Database Connection Failed):**

```json
{
  "success": false,
  "error": "Database connection failed",
  "details": "Connection timeout"
}
```

**Error Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `false` for errors |
| error | string | High-level error message |
| details | string | Specific error details from database connection attempt |

**When This Endpoint Is Needed:**

- On application startup to verify backend availability
- For monitoring/health check systems
- Before making other API calls to ensure service is up

**Example Usage:**

```javascript
fetch("http://localhost:3000/api/health")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log("✅ Server is healthy");
    } else {
      console.error("❌ Server health check failed:", data.error);
    }
  });
```

---

## User Management

### Create User

**Endpoint:** `POST /api/create-user`

**Purpose:** Creates a new user account using a Solana wallet public key. This is typically the first API call after wallet connection.

#### Request Details

**Required Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- None

**Query Parameters:**

- None

**Request Body:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| walletPublicKey | string | ✅ Yes | Must be valid Solana wallet address | User's Solana wallet public key (44 characters, base58 encoded) |

**Request Example:**

```json
{
  "walletPublicKey": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
}
```

#### Response Details

**Success Response (201 - Created):**

```json
{
  "success": true,
  "data": {
    "userId": "clxyz123456789abcdef",
    "message": "User created successfully"
  }
}
```

**Success Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful creation |
| data.userId | string | Unique identifier (UUID) for the newly created user - **SAVE THIS** |
| data.message | string | Confirmation message |

**Error Response (500 - Creation Failed):**

```json
{
  "success": false,
  "error": "Failed to create user"
}
```

**Possible Error Scenarios:**

- Database connection issue
- Duplicate wallet key (if unique constraint exists)
- Invalid wallet key format
- Server internal error

**When This Endpoint Is Needed:**

- **First-time user registration** after wallet connection
- When user connects their Solana wallet for the first time
- Before creating a profile (userId is required for profile creation)

**Important Notes:**

- The returned `userId` is required for all subsequent operations
- Store the `userId` in your frontend state/localStorage
- User is created with `isActive: true` by default
- Timestamps `createdAt` and `updatedAt` are automatically set

**Typical Onboarding Flow:**

```
1. Connect Wallet → Get wallet address
2. POST /create-user → Get userId ← YOU ARE HERE
3. POST /create-profile → Create user profile
4. POST /users/:id/preferences → Set dating preferences
5. User ready to browse matches
```

**Example Usage:**

```javascript
// After wallet connection
const walletAddress = await wallet.connect();

fetch("http://localhost:3000/api/create-user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    walletPublicKey: walletAddress.toString(),
  }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      // Save userId for future API calls
      localStorage.setItem("userId", data.data.userId);
      console.log("User created:", data.data.userId);
    } else {
      console.error("Failed to create user:", data.error);
    }
  });
```

---

### Get All Users

**Endpoint:** `GET /api/users`

**Purpose:** Retrieves a list of all registered users with their basic information (ID and wallet key only).

#### Request Details

**Required Headers:**

- None

**URL Parameters:**

- None

**Query Parameters:**

- None (no filtering/pagination currently supported)

**Request Body:**

- Not applicable (GET request)

#### Response Details

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123456789abcdef",
      "walletPubKey": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
    },
    {
      "id": "clxyz987654321ghijk",
      "walletPubKey": "2xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusABCD"
    }
  ]
}
```

**Success Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful fetch |
| data | array | Array of user objects |
| data[].id | string | Unique user identifier |
| data[].walletPubKey | string | User's Solana wallet public key |

**Empty Response (200 - No Users):**

```json
{
  "success": true,
  "data": []
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Failed to fetch users"
}
```

**When This Endpoint Is Needed:**

- Admin dashboard to view all registered users
- Analytics/metrics display
- User management interfaces
- Testing/debugging purposes

**Important Notes:**

- Returns ONLY `id` and `walletPubKey` (no profile/preferences data)
- To get full user details, use "Get User by ID" endpoint
- No pagination implemented - returns all users
- Users are returned in database order (creation order)

**Example Usage:**

```javascript
fetch("http://localhost:3000/api/users")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log(`Total users: ${data.data.length}`);
      data.data.forEach((user) => {
        console.log(`User ${user.id}: ${user.walletPubKey}`);
      });
    }
  });
```

---

### Get User by ID or Wallet Public Key

**Endpoint:** `GET /api/users/:id`

**Purpose:** Retrieves complete information for a specific user by either their user ID or wallet public key, including profile and preferences data.

#### Request Details

**Required Headers:**

- None

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ Yes | User identifier (UUID) OR Solana wallet public key |

**Query Parameters:**

- None

**Request Body:**

- Not applicable (GET request)

**Example URLs:**

```
GET /api/users/clxyz123456789abcdef  (by User ID)
GET /api/users/9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin  (by Wallet Public Key)
```

#### Response Details

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clxyz123456789abcdef",
    "walletPubKey": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    "isActive": true,
    "createdAt": "2025-12-24T10:30:00.000Z",
    "updatedAt": "2025-12-24T10:30:00.000Z",
    "profile": {
      "id": "clprf123456789abcdef",
      "userId": "clxyz123456789abcdef",
      "displayName": "Alex Smith",
      "bio": "Love hiking and photography",
      "age": 25,
      "gender": "Male",
      "orientation": "Straight"
    },
    "preferences": {
      "id": "clpref123456789abcdef",
      "userId": "clxyz123456789abcdef",
      "preferredGenders": ["Female"],
      "ageMin": 18,
      "ageMax": 35,
      "maxDistanceKm": 50
    }
  }
}
```

**Success Response Fields:**
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| success | boolean | No | Always `true` for successful fetch |
| data.id | string | No | Unique user identifier |
| data.walletPubKey | string | No | Solana wallet public key |
| data.isActive | boolean | No | Whether user account is active |
| data.createdAt | string (ISO 8601) | No | User account creation timestamp |
| data.updatedAt | string (ISO 8601) | No | Last update timestamp |
| data.profile | object | **Yes** | User profile object (null if not created) |
| data.profile.id | string | No | Profile unique identifier |
| data.profile.userId | string | No | Reference to parent user |
| data.profile.displayName | string | No | User's display name |
| data.profile.bio | string | No | User biography/description |
| data.profile.age | number | No | User's age |
| data.profile.gender | string | No | User's gender |
| data.profile.orientation | string | No | User's sexual orientation |
| data.preferences | object | **Yes** | User preferences object (null if not set) |
| data.preferences.id | string | No | Preferences unique identifier |
| data.preferences.userId | string | No | Reference to parent user |
| data.preferences.preferredGenders | array | No | Array of preferred gender strings |
| data.preferences.ageMin | number | No | Minimum preferred age |
| data.preferences.ageMax | number | No | Maximum preferred age |
| data.preferences.maxDistanceKm | number | No | Maximum distance in kilometers |

**Response When Profile/Preferences Not Created:**

```json
{
  "success": true,
  "data": {
    "id": "clxyz123456789abcdef",
    "walletPubKey": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    "isActive": true,
    "createdAt": "2025-12-24T10:30:00.000Z",
    "updatedAt": "2025-12-24T10:30:00.000Z",
    "profile": null,
    "preferences": null
  }
}
```

**Error Response (404 - User Not Found):**

```json
{
  "success": false,
  "error": "User not found"
}
```

**Error Response (500 - Server Error):**

```json
{
  "success": false,
  "error": "Failed to fetch user"
}
```

**When This Endpoint Is Needed:**

- **Loading user profile page** - Display complete user information
- **After login/wallet connection** - Fetch user data using wallet public key
- **Checking profile completion status** - Determine if profile/preferences are set
- **User onboarding flow** - Check which steps are complete
- **Viewing another user's profile** - Display match candidate information
- **User lookup** - Find user by wallet address without needing user ID

**Important Notes:**

- **Supports both User ID and Wallet Public Key** - API tries ID first, then wallet key
- `profile` and `preferences` will be `null` if not yet created
- Check for `null` values before accessing nested properties
- This endpoint includes ALL user data in one call (efficient)
- Use wallet public key lookup when user connects wallet before having a user ID stored
- Use this after user creation to check if onboarding is needed

**Example Usage:**

```javascript
// Fetch by User ID
const userId = localStorage.getItem("userId");

fetch(`http://localhost:3000/api/users/${userId}`)
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      const user = data.data;

      // Check onboarding status
      if (!user.profile) {
        // Redirect to profile creation
        console.log("⚠️ Profile not created");
        redirectToProfileSetup();
      } else if (!user.preferences) {
        // Redirect to preferences setup
        console.log("⚠️ Preferences not set");
        redirectToPreferencesSetup();
      } else {
        // User fully onboarded
        console.log("✅ User profile complete");
        displayUserProfile(user);
      }
    } else if (data.success === false && data.error === "User not found") {
      console.error("User not found - may need to create account");
    }
  });

// Fetch by Wallet Public Key (useful after wallet connection)
const walletAddress = await wallet.connect();

fetch(`http://localhost:3000/api/users/${walletAddress.toString()}`)
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      // User exists, save their ID
      localStorage.setItem("userId", data.data.id);
      console.log("✅ Existing user found:", data.data.id);
    } else if (data.error === "User not found") {
      // New user, proceed to create account
      console.log("⚠️ New user, creating account...");
      createNewUser(walletAddress);
    }
  });
```

---

## Profile Management

### Create Profile

**Endpoint:** `POST /api/create-profile`

**Purpose:** Creates a user profile with personal information. This is typically the second step after user account creation.

#### Request Details

**Required Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- None

**Query Parameters:**

- None

**Request Body:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| userId | string | ✅ Yes | Must be existing user ID | The user ID returned from `/create-user` endpoint |
| name | string | ✅ Yes | 1-100 characters | Display name for the user profile |
| age | number | ✅ Yes | Integer, must be ≥ 18 | User's age (dating app requirement) |
| bio | string | ✅ Yes | 1-500 characters | User biography/description/interests |
| gender | string | ✅ Yes | Non-empty string | User's gender (e.g., Male, Female, Non-binary, Other) |
| orientation | string | ✅ Yes | Non-empty string | Sexual orientation (e.g., Straight, Gay, Lesbian, Bisexual, Pansexual) |

**Request Example:**

```json
{
  "userId": "clxyz123456789abcdef",
  "name": "Alex Smith",
  "age": 25,
  "bio": "Love hiking and photography. Looking for someone to explore the outdoors with! Coffee enthusiast ☕",
  "gender": "Male",
  "orientation": "Straight"
}
```

#### Response Details

**Success Response (201 - Created):**

```json
{
  "success": true,
  "data": {
    "profileId": "clprf123456789abcdef",
    "message": "Profile created successfully"
  }
}
```

**Success Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful profile creation |
| data.profileId | string | Unique identifier for the created profile |
| data.message | string | Confirmation message |

**Error Response (404 - User Not Found):**

```json
{
  "success": false,
  "error": "User not found"
}
```

**Reason:** The provided `userId` doesn't exist in the database

**Error Response (500 - Creation Failed):**

```json
{
  "success": false,
  "error": "Failed to create profile"
}
```

**Possible Error Scenarios:**

- User ID doesn't exist (404)
- Profile already exists for this user (500)
- Database constraint violation (500)
- Missing required fields (500)
- Invalid data types (500)

**When This Endpoint Is Needed:**

- **First-time onboarding flow** after user account creation
- **Profile setup wizard** - Step 2 of onboarding
- After successful user creation with wallet
- Before allowing user to access main app features

**Important Notes:**

- **Must call `/create-user` first** to get a valid `userId`
- Each user can only have ONE profile (one-to-one relationship)
- If profile already exists, use an update endpoint (not currently available in routes)
- Age must be 18+ (enforce this on frontend as well)
- All fields are stored exactly as provided (no auto-formatting)
- Profile creation is required before setting preferences

**Typical Onboarding Flow:**

```
1. Connect Wallet → Get wallet address
2. POST /create-user → Get userId
3. POST /create-profile → Create user profile ← YOU ARE HERE
4. POST /users/:id/preferences → Set dating preferences
5. User ready to browse matches
```

**Example Usage:**

```javascript
const userId = localStorage.getItem("userId");

// Form data from profile setup form
const profileData = {
  userId: userId,
  name: document.getElementById("displayName").value,
  age: parseInt(document.getElementById("age").value),
  bio: document.getElementById("bio").value,
  gender: document.getElementById("gender").value,
  orientation: document.getElementById("orientation").value,
};

fetch("http://localhost:3000/api/create-profile", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(profileData),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log("✅ Profile created:", data.data.profileId);
      // Move to next step: preferences setup
      navigateToPreferencesSetup();
    } else if (data.error === "User not found") {
      console.error("❌ Invalid user ID - user may need to register first");
      navigateToRegistration();
    } else {
      console.error("❌ Profile creation failed:", data.error);
    }
  })
  .catch((error) => {
    console.error("Network error:", error);
  });
```

---

## Preferences Management

### Set User Preferences

**Endpoint:** `POST /api/users/:id/preferences`

**Purpose:** Creates or updates user's dating preferences (who they want to match with). This is typically the third step in onboarding.

#### Request Details

**Required Headers:**

```
Content-Type: application/json
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ Yes | The user ID for whom to set preferences |

**Query Parameters:**

- None

**Request Body:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| preferredGenders | array of strings | ✅ Yes | Non-empty array | Array of gender preferences (e.g., ["Male"], ["Female"], ["Male", "Female", "Non-binary"]) |
| ageMin | number | ✅ Yes | Integer ≥ 18 | Minimum age of preferred matches |
| ageMax | number | ✅ Yes | Integer, ageMax ≥ ageMin | Maximum age of preferred matches |
| distanceRange | number | ✅ Yes | Positive number | Maximum distance in kilometers for matches |

**Request Example:**

```json
{
  "preferredGenders": ["Female"],
  "ageMin": 18,
  "ageMax": 35,
  "distanceRange": 50
}
```

**Multi-Gender Preference Example:**

```json
{
  "preferredGenders": ["Male", "Female", "Non-binary"],
  "ageMin": 22,
  "ageMax": 40,
  "distanceRange": 100
}
```

**Example URL:**

```
POST /api/users/clxyz123456789abcdef/preferences
```

#### Response Details

**Success Response (200 - Created or Updated):**

```json
{
  "success": true,
  "data": {
    "preferencesId": "clpref123456789abcdef",
    "message": "User preferences set successfully"
  }
}
```

**Success Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful operation |
| data.preferencesId | string | Unique identifier for preferences record |
| data.message | string | Confirmation message |

**Error Response (500 - Operation Failed):**

```json
{
  "success": false,
  "error": "Failed to set user preferences"
}
```

**Possible Error Scenarios:**

- User ID doesn't exist (500)
- Invalid data types (500)
- ageMin > ageMax (500)
- Negative distance value (500)
- Empty preferredGenders array (500)
- Database error (500)

**When This Endpoint Is Needed:**

- **Final step of onboarding** after profile creation
- **User preference settings page** - Allow users to update preferences
- When user wants to change their matching criteria
- After location change (update distance preference)

**Important Notes:**

- **UPSERT operation** - Creates new or updates existing preferences
- If preferences exist, they will be REPLACED (not merged)
- `distanceRange` is converted to integer internally (`+distanceRange`)
- Preferences must be set before showing match suggestions
- Can be called multiple times to update preferences

**Behavior:**

- **First time:** Creates new preferences record
- **Subsequent calls:** Updates existing preferences record
- All fields are replaced (not merged)

**Typical Onboarding Flow:**

```
1. POST /create-user → Get userId
2. POST /create-profile → Create profile
3. POST /users/:id/preferences → Set preferences ← YOU ARE HERE
4. GET /users/:id → Verify complete onboarding
5. User ready to browse matches
```

**Example Usage:**

```javascript
const userId = localStorage.getItem("userId");

// Preferences from form
const preferences = {
  preferredGenders: getSelectedGenders(), // ["Female"] or ["Male", "Female"]
  ageMin: parseInt(document.getElementById("ageMin").value),
  ageMax: parseInt(document.getElementById("ageMax").value),
  distanceRange: parseInt(document.getElementById("distance").value),
};

// Validate before sending
if (preferences.ageMin > preferences.ageMax) {
  alert("Minimum age cannot be greater than maximum age");
  return;
}

if (preferences.ageMin < 18) {
  alert("Minimum age must be at least 18");
  return;
}

fetch(`http://localhost:3000/api/users/${userId}/preferences`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(preferences),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log("✅ Preferences saved:", data.data.preferencesId);
      // Onboarding complete - go to main app
      navigateToMatchBrowsing();
    } else {
      console.error("❌ Failed to save preferences:", data.error);
      showErrorMessage("Unable to save preferences. Please try again.");
    }
  })
  .catch((error) => {
    console.error("Network error:", error);
  });

// Helper function to get selected genders from checkboxes
function getSelectedGenders() {
  const checkboxes = document.querySelectorAll('input[name="gender"]:checked');
  return Array.from(checkboxes).map((cb) => cb.value);
}
```

---

### Get User Preferences

**Endpoint:** `GET /api/users/:id/preferences`

**Purpose:** Retrieves the dating preferences for a specific user. Used to display current preferences or check if preferences have been set.

#### Request Details

**Required Headers:**

- None

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ Yes | The user ID whose preferences to fetch |

**Query Parameters:**

- None

**Request Body:**

- Not applicable (GET request)

**Example URL:**

```
GET /api/users/clxyz123456789abcdef/preferences
```

#### Response Details

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clpref123456789abcdef",
    "userId": "clxyz123456789abcdef",
    "preferredGenders": ["Female"],
    "ageMin": 18,
    "ageMax": 35,
    "maxDistanceKm": 50
  }
}
```

**Success Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` when preferences found |
| data.id | string | Unique preferences record identifier |
| data.userId | string | Reference to the user these preferences belong to |
| data.preferredGenders | array | Array of preferred gender strings |
| data.ageMin | number | Minimum preferred age |
| data.ageMax | number | Maximum preferred age |
| data.maxDistanceKm | number | Maximum distance for matches in kilometers |

**Error Response (404 - Preferences Not Found):**

```json
{
  "success": false,
  "error": "User preferences not found"
}
```

**Reason:** User hasn't set preferences yet (needs to call POST preferences endpoint first)

**Error Response (500 - Fetch Failed):**

```json
{
  "success": false,
  "error": "Failed to fetch user preferences"
}
```

**When This Endpoint Is Needed:**

- **Loading preferences settings page** - Pre-fill form with current values
- **Checking onboarding status** - Verify if preferences are set
- **Before showing matches** - Get criteria for filtering
- **User profile view** - Display what user is looking for
- **After user creation/login** - Check if onboarding is complete

**Important Notes:**

- Returns 404 if preferences never created (check for this!)
- `maxDistanceKm` field (not `distanceRange` like in POST)
- Use this before displaying preferences form to pre-fill values
- If 404, redirect user to preferences setup

**Example Usage:**

```javascript
const userId = localStorage.getItem("userId");

fetch(`http://localhost:3000/api/users/${userId}/preferences`)
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log("✅ Preferences loaded");
      const prefs = data.data;

      // Pre-fill preferences form
      document.getElementById("ageMin").value = prefs.ageMin;
      document.getElementById("ageMax").value = prefs.ageMax;
      document.getElementById("distance").value = prefs.maxDistanceKm;

      // Check gender checkboxes
      prefs.preferredGenders.forEach((gender) => {
        const checkbox = document.querySelector(`input[value="${gender}"]`);
        if (checkbox) checkbox.checked = true;
      });

      // Display preferences info
      console.log(`Looking for: ${prefs.preferredGenders.join(", ")}`);
      console.log(`Age range: ${prefs.ageMin}-${prefs.ageMax}`);
      console.log(`Distance: ${prefs.maxDistanceKm}km`);
    } else if (data.error === "User preferences not found") {
      console.log("⚠️ Preferences not set yet");
      // Show preferences setup form
      showPreferencesSetupForm();
    } else {
      console.error("❌ Error loading preferences:", data.error);
    }
  })
  .catch((error) => {
    console.error("Network error:", error);
  });
```

---

## Error Handling

All API endpoints follow a consistent error response structure.

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description"
}
```

Some endpoints include additional details:

```json
{
  "success": false,
  "error": "Database connection failed",
  "details": "Connection timeout after 5000ms"
}
```

### HTTP Status Codes

| Code    | Meaning               | When It Occurs                                                |
| ------- | --------------------- | ------------------------------------------------------------- |
| **200** | OK                    | Successful GET request, successful update                     |
| **201** | Created               | Successful POST request creating new resource                 |
| **404** | Not Found             | Requested resource doesn't exist (user, profile, preferences) |
| **500** | Internal Server Error | Database error, validation error, server crash                |

### Common Error Scenarios

#### 1. User Not Found (404)

```json
{
  "success": false,
  "error": "User not found"
}
```

**Occurs when:**

- Fetching user that doesn't exist
- Creating profile for non-existent user
- Invalid user ID in URL

**How to handle:**

- Verify user ID is correct
- Check if user was created successfully
- Redirect to registration if needed

#### 2. Preferences Not Found (404)

```json
{
  "success": false,
  "error": "User preferences not found"
}
```

**Occurs when:**

- User hasn't set preferences yet
- Fetching preferences before they're created

**How to handle:**

- Check if user completed onboarding
- Redirect to preferences setup
- Don't treat as critical error

#### 3. Database Connection Failed (500)

```json
{
  "success": false,
  "error": "Database connection failed",
  "details": "Connection timeout"
}
```

**Occurs when:**

- Database server is down
- Network issues
- Connection pool exhausted

**How to handle:**

- Show user-friendly error message
- Implement retry logic
- Check server health endpoint first

#### 4. Generic Creation/Update Failed (500)

```json
{
  "success": false,
  "error": "Failed to create user"
}
```

**Occurs when:**

- Data validation fails
- Database constraints violated
- Duplicate entries
- Missing required fields

**How to handle:**

- Validate data on frontend before sending
- Check console logs for specific error
- Provide clear error messages to user

### Error Handling Best Practices

#### Frontend Error Handling Template

```javascript
fetch("http://localhost:3000/api/endpoint", options)
  .then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      // HTTP error (404, 500, etc.)
      throw new Error(data.error || "Request failed");
    }

    if (!data.success) {
      // API returned success: false
      throw new Error(data.error);
    }

    return data;
  })
  .then((data) => {
    // Success handling
    console.log("✅ Success:", data);
  })
  .catch((error) => {
    // Error handling
    console.error("❌ Error:", error.message);

    // Show user-friendly message
    if (error.message.includes("not found")) {
      showError("Resource not found. Please try again.");
    } else if (error.message.includes("Database")) {
      showError("Server temporarily unavailable. Please try again later.");
    } else {
      showError("An error occurred. Please try again.");
    }
  });
```

#### Checking Response Success

Always check the `success` field:

```javascript
if (data.success) {
  // Handle success
} else {
  // Handle error - data.error contains message
}
```

#### Network Error vs API Error

```javascript
fetch(url)
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      // API success
    } else {
      // API returned error
      console.error("API Error:", data.error);
    }
  })
  .catch((error) => {
    // Network error or JSON parse error
    console.error("Network Error:", error);
  });
```

---

## Complete Usage Example: User Onboarding Flow

Here's a complete example showing all API calls in sequence for user onboarding:

```javascript
class DatingAppAPI {
  constructor(baseUrl = "http://localhost:3000/api") {
    this.baseUrl = baseUrl;
  }

  async checkHealth() {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }

  async createUser(walletPublicKey) {
    const res = await fetch(`${this.baseUrl}/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletPublicKey }),
    });
    return res.json();
  }

  async createProfile(userId, profileData) {
    const res = await fetch(`${this.baseUrl}/create-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...profileData }),
    });
    return res.json();
  }

  async setPreferences(userId, preferences) {
    const res = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    return res.json();
  }

  async getUser(userIdOrWallet) {
    const res = await fetch(`${this.baseUrl}/users/${userIdOrWallet}`);
    return res.json();
  }

  async getUserByWallet(walletPublicKey) {
    const res = await fetch(`${this.baseUrl}/users/${walletPublicKey}`);
    return res.json();
  }

  async getPreferences(userId) {
    const res = await fetch(`${this.baseUrl}/users/${userId}/preferences`);
    return res.json();
  }
}

// Check if user exists by wallet address
async function checkExistingUser(walletAddress) {
  const api = new DatingAppAPI();

  try {
    console.log("🔍 Checking for existing user...");
    const result = await api.getUserByWallet(walletAddress);

    if (result.success) {
      console.log("✅ Existing user found:", result.data.id);
      // Save user ID for future use
      localStorage.setItem("userId", result.data.id);
      return {
        exists: true,
        userId: result.data.id,
        userData: result.data,
      };
    } else {
      console.log("⚠️ No existing user found");
      return { exists: false };
    }
  } catch (error) {
    console.error("❌ Error checking user:", error);
    return { exists: false };
  }
}

// Complete onboarding flow with existing user check
async function onboardUser(walletAddress, profileData, preferences) {
  const api = new DatingAppAPI();

  try {
    // Step 1: Check server health
    console.log("📡 Checking server health...");
    const health = await api.checkHealth();
    if (!health.success) {
      throw new Error("Server not available");
    }
    console.log("✅ Server healthy");

    // Step 2: Check if user already exists
    const existingUser = await checkExistingUser(walletAddress);
    let userId;

    if (existingUser.exists) {
      console.log("👤 Using existing user account");
      userId = existingUser.userId;

      // Check if onboarding is complete
      if (existingUser.userData.profile && existingUser.userData.preferences) {
        console.log("✅ User already fully onboarded");
        return {
          success: true,
          userId,
          userData: existingUser.userData,
          alreadyOnboarded: true,
        };
      }
    } else {
      // Step 3: Create new user account
      console.log("👤 Creating new user account...");
      const userResult = await api.createUser(walletAddress);
      if (!userResult.success) {
        throw new Error("Failed to create user");
      }
      userId = userResult.data.userId;
      localStorage.setItem("userId", userId);
      console.log("✅ User created:", userId);
    }

    // Step 4: Create profile (if not exists)
    console.log("📝 Creating profile...");
    const profileResult = await api.createProfile(userId, {
      name: profileData.name,
      age: profileData.age,
      bio: profileData.bio,
      gender: profileData.gender,
      orientation: profileData.orientation,
    });
    if (!profileResult.success) {
      throw new Error("Failed to create profile");
    }
    console.log("✅ Profile created:", profileResult.data.profileId);

    // Step 5: Set preferences
    console.log("⚙️ Setting preferences...");
    const prefsResult = await api.setPreferences(userId, {
      preferredGenders: preferences.preferredGenders,
      ageMin: preferences.ageMin,
      ageMax: preferences.ageMax,
      distanceRange: preferences.distanceRange,
    });
    if (!prefsResult.success) {
      throw new Error("Failed to set preferences");
    }
    console.log("✅ Preferences set:", prefsResult.data.preferencesId);

    // Step 6: Verify complete user data
    console.log("🔍 Verifying user data...");
    const userData = await api.getUser(userId);
    if (!userData.success) {
      throw new Error("Failed to fetch user data");
    }

    if (userData.data.profile && userData.data.preferences) {
      console.log("🎉 Onboarding complete!");
      return {
        success: true,
        userId,
        userData: userData.data,
        alreadyOnboarded: false,
      };
    } else {
      throw new Error("Onboarding incomplete");
    }
  } catch (error) {
    console.error("❌ Onboarding failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Usage example with existing user check
const walletAddress = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

const result = await onboardUser(
  walletAddress,
  {
    name: "Alex Smith",
    age: 25,
    bio: "Love hiking and photography",
    gender: "Male",
    orientation: "Straight",
  },
  {
    preferredGenders: ["Female"],
    ageMin: 18,
    ageMax: 35,
    distanceRange: 50,
  }
);

if (result.success) {
  if (result.alreadyOnboarded) {
    console.log("Welcome back! Loading your profile...");
    navigateToMainApp(result.userId);
  } else {
    console.log("Onboarding complete! Welcome!");
    navigateToMainApp(result.userId);
  }
} else {
  console.error("Onboarding failed:", result.error);
  showErrorMessage(result.error);
}
```

---

## Notes

1. **Authentication:** Currently, no authentication/authorization is implemented. In production, add JWT tokens or session management.

2. **Wallet-Based User Lookup:** The API now supports fetching users by wallet public key, eliminating the need to store user IDs before checking if a user exists.

3. **Request Tracking:** Include `x-request-id` header for request tracking in logs:

   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'x-request-id': generateUUID()
   }
   ```

4. **CORS:** Ensure backend allows your frontend origin if hosting on different domains.

5. **Validation:** Always validate data on frontend before sending to reduce 500 errors.

6. **Timestamps:** All timestamps are in ISO 8601 format (UTC timezone).

7. **IDs:** All IDs are UUIDs (Prisma cuid format starting with "cl").

8. **Data Persistence:** All data is stored in PostgreSQL database via Prisma ORM.

9. **Rate Limiting:** No rate limiting currently implemented - consider adding in production.

10. **User Lookup Flow:** New recommended flow:
    - User connects wallet
    - Check if user exists by wallet address (`GET /api/users/{walletAddress}`)
    - If exists: Load user data and proceed to app
    - If not exists: Create new user and proceed with onboarding
