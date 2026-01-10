/**
 * Dating App Backend API Testing Script
 * ======================================
 * Run with: node api-testing.js
 * Make sure the backend server is running on port 3000
 */

const BASE_URL = "http://localhost:3000/api";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log("\n" + "=".repeat(70));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log("=".repeat(70));
}

function logSubHeader(title) {
  console.log("\n" + "-".repeat(50));
  log(`  ${title}`, colors.yellow);
  console.log("-".repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logResponse(data) {
  console.log(colors.magenta + "Response:" + colors.reset);
  console.log(JSON.stringify(data, null, 2));
}

async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  logInfo(`${method} ${url}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      logSuccess(`Status: ${response.status}`);
    } else {
      logError(`Status: ${response.status}`);
    }

    logResponse(data);
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EXISTING USERS FROM SEED DATA (for testing likes/matches)
// ============================================================================

const SEED_USERS = {
  priya: "wallet_priya_sharma_001", // FEMALE, Mumbai, Heterosexual
  rahul: "wallet_rahul_verma_002", // MALE, Pune, Heterosexual
  ananya: "wallet_ananya_patel_003", // FEMALE, Ahmedabad, Bisexual
  arjun: "wallet_arjun_mehta_004", // MALE, Mumbai, Heterosexual
  sneha: "wallet_sneha_reddy_005", // FEMALE, Bangalore, Heterosexual
  vikram: "wallet_vikram_singh_006", // MALE, Chandigarh, Heterosexual
  kavya: "wallet_kavya_nair_007", // FEMALE, Kochi, Homosexual
  aditya: "wallet_aditya_kumar_008", // MALE, Delhi, Homosexual
  riya: "wallet_riya_sharma_009", // FEMALE, Mumbai, Heterosexual
  karan: "wallet_karan_malhotra_010", // MALE, Mumbai, Heterosexual
};

// Test user for new account creation workflow
const TEST_USER = {
  publicKey: `wallet_test_user_${Date.now()}`,
  profile: {
    name: "Test User",
    age: 28,
    bio: "This is a test user created by the API testing script.",
    gender: "MALE",
    orientation: "Heterosexual",
    heightCm: 175,
    hobbies: ["Testing", "Debugging", "Coding"],
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    profession: "Software Engineer",
    religion: "Hindu",
  },
  preferences: {
    preferredGenders: ["FEMALE"],
    ageMin: 24,
    ageMax: 32,
    locationScope: "SAME_CITY",
  },
  prompts: [
    {
      promptOrder: 1,
      answer:
        "I love testing. I never write bugs. I drink 10 cups of coffee. (Lie: I definitely write bugs!)",
    },
    {
      promptOrder: 6,
      answer: "A perfect Sunday is writing tests and fixing bugs.",
    },
    {
      promptOrder: 16,
      answer: "Clean code and proper documentation.",
    },
  ],
};

// ============================================================================
// INDIVIDUAL API TEST FUNCTIONS
// ============================================================================

/**
 * Health Check API
 */
async function testHealthCheck() {
  logSubHeader("Health Check");
  return await makeRequest("GET", "/health");
}

/**
 * Create User API
 */
async function testCreateUser(publicKey) {
  logSubHeader("Create User");
  return await makeRequest("POST", "/user", { publicKey });
}

/**
 * Get User by PublicKey API
 */
async function testGetUser(publicKey) {
  logSubHeader("Get User");
  return await makeRequest("GET", `/user/${publicKey}`);
}

/**
 * Create Profile API
 */
async function testCreateProfile(publicKey, profileData) {
  logSubHeader("Create Profile");
  return await makeRequest("POST", "/user/profile", {
    publicKey,
    ...profileData,
  });
}

/**
 * Update Profile API
 */
async function testUpdateProfile(publicKey, updateData) {
  logSubHeader("Update Profile");
  return await makeRequest("PUT", "/user/profile", {
    publicKey,
    ...updateData,
  });
}

/**
 * Set User Preferences API
 */
async function testSetPreferences(publicKey, preferences) {
  logSubHeader("Set Preferences");
  return await makeRequest(
    "POST",
    `/user/${publicKey}/preferences`,
    preferences
  );
}

/**
 * Get User Preferences API
 */
async function testGetPreferences(publicKey) {
  logSubHeader("Get Preferences");
  return await makeRequest("GET", `/user/${publicKey}/preferences`);
}

/**
 * Get Prompts API
 */
async function testGetPrompts(publicKey) {
  logSubHeader("Get Prompts");
  return await makeRequest("GET", `/user/${publicKey}/prompts`);
}

/**
 * Answer Prompts API
 */
async function testAnswerPrompts(publicKey, promptAnswers) {
  logSubHeader("Answer Prompts");
  return await makeRequest("POST", `/user/${publicKey}/prompts`, {
    promptAnswers,
  });
}

/**
 * Get Next Suggestion API
 */
async function testGetNextSuggestion(publicKey) {
  logSubHeader("Get Next Suggestion");
  return await makeRequest("GET", `/user/${publicKey}/next-suggestion`);
}

/**
 * Like User API
 */
async function testLikeUser(publicKey, targetPublicKey) {
  logSubHeader("Like User");
  return await makeRequest("POST", `/user/swipe/${publicKey}/like`, {
    targetPublicKey,
  });
}

/**
 * Report User API
 */
async function testReportUser(publicKey, targetPublicKey, reason) {
  logSubHeader("Report User");
  return await makeRequest("POST", `/user/swipe/${publicKey}/report`, {
    targetPublicKey,
    reason,
  });
}

/**
 * Get Likes API
 */
async function testGetLikes(publicKey) {
  logSubHeader("Get Likes (Users who liked me)");
  return await makeRequest("GET", `/user/swipe/${publicKey}/likes`);
}

/**
 * Get Matches API
 */
async function testGetMatches(publicKey) {
  logSubHeader("Get Matches");
  return await makeRequest("GET", `/user/swipe/${publicKey}/matches`);
}

// ============================================================================
// COMPLETE USER WORKFLOW TEST
// ============================================================================

async function runUserWorkflow() {
  logHeader("🚀 COMPLETE USER WORKFLOW TEST");
  console.log(`\nTest User PublicKey: ${TEST_USER.publicKey}`);

  // Step 1: Health Check
  logHeader("STEP 1: Health Check");
  await testHealthCheck();

  // Step 2: Create User Account
  logHeader("STEP 2: Create User Account");
  const createUserResult = await testCreateUser(TEST_USER.publicKey);
  if (!createUserResult.success) {
    logError("Failed to create user. Aborting workflow.");
    return;
  }

  // Step 3: Create Profile
  logHeader("STEP 3: Create Profile");
  const createProfileResult = await testCreateProfile(
    TEST_USER.publicKey,
    TEST_USER.profile
  );
  if (!createProfileResult.success) {
    logError("Failed to create profile. Aborting workflow.");
    return;
  }

  // Step 4: Set Preferences
  logHeader("STEP 4: Set Preferences");
  const setPrefsResult = await testSetPreferences(
    TEST_USER.publicKey,
    TEST_USER.preferences
  );
  if (!setPrefsResult.success) {
    logError("Failed to set preferences. Aborting workflow.");
    return;
  }

  // Step 5: Get Preferences (verify)
  logHeader("STEP 5: Verify Preferences");
  await testGetPreferences(TEST_USER.publicKey);

  // Step 6: Answer Prompts
  logHeader("STEP 6: Answer Prompts");
  const promptsResult = await testAnswerPrompts(
    TEST_USER.publicKey,
    TEST_USER.prompts
  );
  if (!promptsResult.success) {
    logError("Failed to answer prompts. Aborting workflow.");
    return;
  }

  // Step 7: Get Prompts (verify)
  logHeader("STEP 7: Verify Prompts");
  await testGetPrompts(TEST_USER.publicKey);

  // Step 8: Get User (full profile)
  logHeader("STEP 8: Get Complete User Profile");
  await testGetUser(TEST_USER.publicKey);

  // Step 9: Get Next Suggestion
  logHeader("STEP 9: Get Next Suggestion (Find a Match!)");
  const suggestionResult = await testGetNextSuggestion(TEST_USER.publicKey);

  // Step 10: Like a user from seed data
  logHeader("STEP 10: Like User (Priya from seed data)");
  await testLikeUser(TEST_USER.publicKey, SEED_USERS.priya);

  // Step 11: Like another user
  logHeader("STEP 11: Like Another User (Riya from seed data)");
  await testLikeUser(TEST_USER.publicKey, SEED_USERS.riya);

  // Step 12: Simulate mutual like (Priya likes test user back - creates MATCH)
  logHeader("STEP 12: Simulate Mutual Like (Priya likes back = MATCH!)");
  await testLikeUser(SEED_USERS.priya, TEST_USER.publicKey);

  // Step 13: Get Matches
  logHeader("STEP 13: Get Matches");
  await testGetMatches(TEST_USER.publicKey);

  // Step 14: Get Likes (users who liked the test user)
  logHeader("STEP 14: Get Likes Received");
  await testGetLikes(TEST_USER.publicKey);

  // Step 15: Get Next Suggestion again (should exclude liked/matched users)
  logHeader("STEP 15: Get Next Suggestion (After Likes)");
  await testGetNextSuggestion(TEST_USER.publicKey);

  logHeader("✅ WORKFLOW COMPLETE!");
  console.log(`\nTest User PublicKey for cleanup: ${TEST_USER.publicKey}\n`);
}

// ============================================================================
// TEST EXISTING SEED USERS
// ============================================================================

async function testSeedUsers() {
  logHeader("📊 TESTING WITH SEED DATA USERS");

  // Test Priya (Female, Heterosexual)
  logHeader("Testing Priya's Profile & Suggestions");
  await testGetUser(SEED_USERS.priya);
  await testGetPreferences(SEED_USERS.priya);
  await testGetNextSuggestion(SEED_USERS.priya);

  // Test Rahul (Male, Heterosexual)
  logHeader("Testing Rahul's Profile & Suggestions");
  await testGetUser(SEED_USERS.rahul);
  await testGetNextSuggestion(SEED_USERS.rahul);

  // Test Ananya (Bisexual)
  logHeader("Testing Ananya's Suggestions (Bisexual)");
  await testGetNextSuggestion(SEED_USERS.ananya);

  // Test Kavya (Homosexual Female)
  logHeader("Testing Kavya's Suggestions (Homosexual Female)");
  await testGetNextSuggestion(SEED_USERS.kavya);

  // Test Aditya (Homosexual Male)
  logHeader("Testing Aditya's Suggestions (Homosexual Male)");
  await testGetNextSuggestion(SEED_USERS.aditya);
}

// ============================================================================
// TEST ALL INDIVIDUAL APIs
// ============================================================================

async function testAllAPIs() {
  logHeader("🧪 TESTING ALL INDIVIDUAL APIs");

  // Health
  await testHealthCheck();

  // User APIs
  await testGetUser(SEED_USERS.priya);
  await testGetUser(SEED_USERS.rahul);

  // Profile APIs
  await testGetPreferences(SEED_USERS.priya);
  await testGetPreferences(SEED_USERS.rahul);

  // Prompts APIs
  await testGetPrompts(SEED_USERS.priya);
  await testGetPrompts(SEED_USERS.rahul);

  // Suggestion APIs
  await testGetNextSuggestion(SEED_USERS.priya);
  await testGetNextSuggestion(SEED_USERS.rahul);

  // Like/Match APIs with existing users
  logHeader("Testing Like/Match Flow with Seed Users");

  // Arjun likes Priya
  await testLikeUser(SEED_USERS.arjun, SEED_USERS.priya);

  // Get likes for Priya
  await testGetLikes(SEED_USERS.priya);

  // Priya likes Arjun back (should create match)
  await testLikeUser(SEED_USERS.priya, SEED_USERS.arjun);

  // Get matches
  await testGetMatches(SEED_USERS.priya);
  await testGetMatches(SEED_USERS.arjun);
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.clear();
  log(
    `
╔══════════════════════════════════════════════════════════════════════╗
║                 DATING APP BACKEND API TESTING                       ║
║                                                                      ║
║  Base URL: ${BASE_URL}                              ║
║  Started at: ${new Date().toISOString()}                  ║
╚══════════════════════════════════════════════════════════════════════╝
`,
    colors.cyan
  );

  const args = process.argv.slice(2);
  const testType = args[0] || "workflow";

  switch (testType) {
    case "workflow":
      log("\n🎯 Running: Complete User Workflow\n", colors.yellow);
      await runUserWorkflow();
      break;

    case "seed":
      log("\n🎯 Running: Seed Users Test\n", colors.yellow);
      await testSeedUsers();
      break;

    case "all":
      log("\n🎯 Running: All API Tests\n", colors.yellow);
      await testAllAPIs();
      break;

    case "health":
      await testHealthCheck();
      break;

    case "user":
      const userKey = args[1] || SEED_USERS.priya;
      await testGetUser(userKey);
      break;

    case "preferences":
      const prefKey = args[1] || SEED_USERS.priya;
      await testGetPreferences(prefKey);
      break;

    case "prompts":
      const promptKey = args[1] || SEED_USERS.priya;
      await testGetPrompts(promptKey);
      break;

    case "suggestion":
      const suggestKey = args[1] || SEED_USERS.priya;
      await testGetNextSuggestion(suggestKey);
      break;

    case "likes":
      const likesKey = args[1] || SEED_USERS.priya;
      await testGetLikes(likesKey);
      break;

    case "matches":
      const matchesKey = args[1] || SEED_USERS.priya;
      await testGetMatches(matchesKey);
      break;

    default:
      log(
        `
Usage: node api-testing.js [command] [publicKey]

Commands:
  workflow    - Run complete user workflow (default)
  seed        - Test with seed data users
  all         - Run all API tests
  health      - Health check only
  user        - Get user by publicKey
  preferences - Get preferences
  prompts     - Get prompts
  suggestion  - Get next suggestion
  likes       - Get likes received
  matches     - Get matches

Examples:
  node api-testing.js workflow
  node api-testing.js user wallet_priya_sharma_001
  node api-testing.js suggestion wallet_rahul_verma_002
`,
        colors.cyan
      );
  }

  log("\n" + "=".repeat(70), colors.cyan);
  log("  Testing completed at: " + new Date().toISOString(), colors.cyan);
  log("=".repeat(70) + "\n", colors.cyan);
}

// Run the tests
main().catch(console.error);
