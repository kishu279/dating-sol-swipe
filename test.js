#!/usr/bin/env node

import { PROMPT_ANSWERS, PROMPT_QUESTIONS } from "./constants/prompts";

let BASE_URL = "http://localhost:3000";

// Generate a unique wallet address for each test run
function generateWalletAddress() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let wallet = "";
  for (let i = 0; i < 44; i++) {
    wallet += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return wallet;
}

const SAMPLE_WALLET = generateWalletAddress();

// Colors for terminal output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(
    `\n${colors.bold}${colors.blue}[STEP ${step}] ${description}${colors.reset}`
  );
  log("─".repeat(50), colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.yellow);
}

async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;

  logInfo(`Making ${method} request to: ${url}`);

  if (data) {
    logInfo(`Request body: ${JSON.stringify(data, null, 2)}`);
  }

  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": `test-${Date.now()}`,
        "User-Agent": "DatingApp-Test-Runner",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    log(
      `Status: ${response.status} ${response.statusText}`,
      response.ok ? colors.green : colors.red
    );
    log(`Response: ${JSON.stringify(responseData, null, 2)}`);

    return { response, data: responseData };
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    throw error;
  }
}

async function testHealthCheck() {
  logStep(1, "Health Check");

  try {
    const { response, data } = await makeRequest("GET", "/api/health");

    if (response.ok && data.success) {
      logSuccess("Health check passed - Server and database are healthy");
      return true;
    } else {
      logError("Health check failed");
      return false;
    }
  } catch (error) {
    logError("Health check failed - Server might not be running");
    return false;
  }
}

async function testCreateUser() {
  logStep(2, "Create User");

  try {
    const userData = {
      walletPublicKey: SAMPLE_WALLET,
    };

    const { response, data } = await makeRequest(
      "POST",
      "/api/create-user",
      userData
    );

    if (response.ok && data.success) {
      logSuccess(`User created successfully with ID: ${data.data.userId}`);
      return data.data.userId;
    } else {
      logError("Failed to create user");
      return null;
    }
  } catch (error) {
    logError(`Create user failed: ${error.message}`);
    return null;
  }
}

async function testCreateProfile(userId) {
  logStep(3, "Create Profile");

  try {
    const profileData = {
      userId: userId,
      name: "John Doe",
      age: 25,
      bio: "Love hiking and blockchain technology!",
      gender: "MALE",
      orientation: "STRAIGHT",
    };

    const { response, data } = await makeRequest(
      "POST",
      "/api/create-profile",
      profileData
    );

    if (response.ok && data.success) {
      logSuccess(
        `Profile created successfully with ID: ${data.data.profileId}`
      );
      return data.data.profileId;
    } else {
      logError("Failed to create profile");
      return null;
    }
  } catch (error) {
    logError(`Create profile failed: ${error.message}`);
    return null;
  }
}

async function testGetUser(userId) {
  logStep(4, "Get User by ID");

  try {
    const { response, data } = await makeRequest("GET", `/api/users/${userId}`);

    if (response.ok && data.success) {
      logSuccess("User fetched successfully");
      logInfo(`User details: ${JSON.stringify(data.data, null, 2)}`);
      return true;
    } else {
      logError("Failed to fetch user");
      return false;
    }
  } catch (error) {
    logError(`Get user failed: ${error.message}`);
    return false;
  }
}

// Fetch prompts from the API and log questions
async function testGetPrompts() {
  logStep(7, "Get Prompts from API");
  try {
    const { response, data } = await makeRequest("GET", "/api/prompts");
    if (response.ok && data.success && Array.isArray(data.data)) {
      logSuccess(`Fetched ${data.data.length} prompts from API.`);
      logInfo("Prompt questions received:");
      data.data.forEach((prompt, idx) => {
        log(`  [${idx + 1}] (${prompt.id}) ${prompt.question}`, colors.blue);
      });
      return data.data;
    } else {
      logError("Failed to fetch prompts or invalid response structure.");
      return [];
    }
  } catch (error) {
    logError(`Get prompts failed: ${error.message}`);
    return [];
  }
}

async function testAnsPrompts(userId) {
  logStep(7, "Post ans prompts to API");

  try {
    const ans = PROMPT_QUESTIONS.map((item) => {
      const ansArr = PROMPT_ANSWERS[item.id];

      return {
        promptId: item.id,
        answer:
          ansArr[Math.floor(Math.random() * ansArr.length)] ||
          "No answer provided",
      };
    });

    console.log({ ans });

    const { response, data } = await makeRequest(
      "POST",
      `/api/user/${userId}/prompts`,
      { answers: ans }
    );

    if (response.ok && data.success) {
      logSuccess(data.message);
      logSuccess("Answered prompts successfully");
    } else {
      logError("Failed to answer prompts");
    }
  } catch (error) {
    logError(`Ans prompts failed: ${error.message}`);
  }
}

async function testGetAllUsers() {
  logStep(5, "Get All Users");

  try {
    const { response, data } = await makeRequest("GET", "/api/users");

    if (response.ok && data.success) {
      logSuccess(`Fetched ${data.data.length} users`);
      return true;
    } else {
      logError("Failed to fetch users");
      return false;
    }
  } catch (error) {
    logError(`Get all users failed: ${error.message}`);
    return false;
  }
}

async function testUserPreferences(userId) {
  logStep(6, "User Preferences");

  try {
    // Set preferences
    const prefData = {
      preferredGenders: ["FEMALE"],
      ageMin: 18,
      ageMax: 30,
      distanceRange: 50,
    };

    logInfo("Setting user preferences...");
    const setRes = await makeRequest(
      "POST",
      `/api/users/${userId}/preferences`,
      prefData
    );

    if (!setRes.response.ok || !setRes.data.success) {
      logError("Failed to set user preferences");
      return false;
    }
    logSuccess("User preferences set successfully");

    // Get preferences
    logInfo("Fetching user preferences...");
    const getRes = await makeRequest("GET", `/api/users/${userId}/preferences`);

    if (getRes.response.ok && getRes.data.success) {
      logSuccess("User preferences fetched successfully");
      logInfo(`Preferences: ${JSON.stringify(getRes.data.data, null, 2)}`);
      return true;
    } else {
      logError("Failed to fetch user preferences");
      return false;
    }
  } catch (error) {
    logError(`User preferences test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log(`${colors.bold}${colors.blue}🚀 Starting API Tests${colors.reset}`);
  log("=".repeat(50), colors.blue);

  let userId = null;
  let profileId = null;

  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    logError("Stopping tests - Server is not healthy");
    process.exit(1);
  }

  // Test 2: Create User
  userId = await testCreateUser();
  if (!userId) {
    logError("Stopping tests - Could not create user");
    process.exit(1);
  }

  // Test 3: Create Profile
  profileId = await testCreateProfile(userId);
  if (!profileId) {
    logError("Profile creation failed, but continuing with other tests");
  }

  // Test 4: Get User by ID
  await testGetUser(userId);

  // Test 5: Get All Users
  await testGetAllUsers();

  // Test 6: User Preferences
  await testUserPreferences(userId);

  // Test 7: Get Prompts from API
  await testGetPrompts();

  // Test 8: Ans Prompts to API
  await testAnsPrompts(userId);

  // Summary
  log(`\n${colors.bold}${colors.green}🎉 Test Suite Completed!${colors.reset}`);
  log("=".repeat(50), colors.green);
  logSuccess(`Generated wallet address: ${SAMPLE_WALLET}`);
  logSuccess(`User ID: ${userId}`);
  if (profileId) {
    logSuccess(`Profile ID: ${profileId}`);
  }
}

// Check if server is specified
if (process.argv[2]) {
  const customUrl = process.argv[2];
  BASE_URL = customUrl.startsWith("http") ? customUrl : `http://${customUrl}`;
  logInfo(`Using custom server URL: ${BASE_URL}`);
}

// Run the tests
runTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});
