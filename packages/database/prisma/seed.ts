import { prisma } from "../src/client.js";
import seedData from "./seed-data.json" with { type: "json" };

type Gender = "MALE" | "FEMALE" | "NON_BINARY" | "OTHER";

const seed = async () => {
  console.log("[SEED] Starting database seed...\n");

  // Step 1: Seed Prompts
  console.log("[SEED] Creating prompts...");
  await prisma.prompt.createMany({
    data: [
      // FUN
      {
        category: "FUN",
        question: "Two truths and a lie — go.",
        isActive: true,
        order: 1,
      },
      {
        category: "FUN",
        question: "The most spontaneous thing I've ever done is…",
        isActive: true,
        order: 2,
      },
      {
        category: "FUN",
        question: "My most irrational fear is…",
        isActive: true,
        order: 3,
      },
      {
        category: "FUN",
        question: "I'm weirdly competitive about…",
        isActive: true,
        order: 4,
      },
      {
        category: "FUN",
        question: "The last thing that made me laugh way too hard was…",
        isActive: true,
        order: 5,
      },

      // ICEBREAKER
      {
        category: "ICEBREAKER",
        question: "A perfect Sunday for me looks like…",
        isActive: true,
        order: 6,
      },
      {
        category: "ICEBREAKER",
        question: "I'll fall for you if…",
        isActive: true,
        order: 7,
      },
      {
        category: "ICEBREAKER",
        question: "The quickest way to my heart is…",
        isActive: true,
        order: 8,
      },
      {
        category: "ICEBREAKER",
        question: "The best first message I've ever received was…",
        isActive: true,
        order: 9,
      },
      {
        category: "ICEBREAKER",
        question: "One thing you should know about me is…",
        isActive: true,
        order: 10,
      },

      // LIFESTYLE
      {
        category: "LIFESTYLE",
        question: "My ideal way to unwind after a long day is…",
        isActive: true,
        order: 11,
      },
      {
        category: "LIFESTYLE",
        question: "A habit I'm trying to build right now is…",
        isActive: true,
        order: 12,
      },
      {
        category: "LIFESTYLE",
        question: "My relationship with my phone is best described as…",
        isActive: true,
        order: 13,
      },
      {
        category: "LIFESTYLE",
        question: "If we were stranded on an island, I'd be responsible for…",
        isActive: true,
        order: 14,
      },
      {
        category: "LIFESTYLE",
        question: "My go-to comfort activity is…",
        isActive: true,
        order: 15,
      },

      // VALUES
      {
        category: "VALUES",
        question: "A value I won't compromise on is…",
        isActive: true,
        order: 16,
      },
      {
        category: "VALUES",
        question: "A green flag I look for in people is…",
        isActive: true,
        order: 17,
      },
      {
        category: "VALUES",
        question: "Something I'm genuinely grateful for is…",
        isActive: true,
        order: 18,
      },
      {
        category: "VALUES",
        question: "The hallmark of a healthy relationship is…",
        isActive: true,
        order: 19,
      },
      {
        category: "VALUES",
        question: "Something I'm currently working on about myself is…",
        isActive: true,
        order: 20,
      },
    ],
  });
  console.log("[SEED] ✓ Prompts created\n");

  // Step 2: Get all prompts to map order -> id
  const prompts = await prisma.prompt.findMany();
  const promptOrderToId = new Map<number, string>();
  prompts.forEach((prompt) => {
    if (prompt.order !== null) {
      promptOrderToId.set(prompt.order, prompt.id);
    }
  });

  // Step 3: Seed Users with all related data
  console.log("[SEED] Creating users with profiles, preferences, photos, and prompt answers...\n");

  for (const userData of seedData.users) {
    console.log(`[SEED] Creating user: ${userData.profile.displayName}`);

    // Create user with all related data in a single transaction
    const user = await prisma.user.create({
      data: {
        walletPubKey: userData.walletPubKey,
        isActive: true,
        isVerified: userData.isVerified ?? false,
        isPremium: userData.isPremium ?? false,
        lastActiveAt: new Date(),
        profile: {
          create: {
            displayName: userData.profile.displayName,
            age: userData.profile.age,
            gender: userData.profile.gender as Gender,
            orientation: userData.profile.orientation,
            bio: userData.profile.bio,
            profession: userData.profile.profession,
            hobbies: userData.profile.hobbies,
            religion: userData.profile.religion,
            country: userData.profile.country,
            state: userData.profile.state,
            city: userData.profile.city,
            heightCm: userData.profile.heightCm,
          },
        },
        preferences: {
          create: {
            preferredGenders: userData.preferences.preferredGenders as Gender[],
            ageMin: userData.preferences.ageMin,
            ageMax: userData.preferences.ageMax,
            locationScope: userData.preferences.locationScope as "SAME_CITY" | "SAME_STATE" | "SAME_COUNTRY" | "ANY",
          },
        },
        photos: {
          createMany: {
            data: userData.photos.map((photo) => ({
              url: photo.url,
              order: photo.order,
            })),
          },
        },
      },
    });

    // Create prompt answers for this user
    for (const promptAnswer of userData.promptAnswers) {
      const promptId = promptOrderToId.get(promptAnswer.promptOrder);
      if (promptId) {
        await prisma.promptAnswer.create({
          data: {
            userId: user.id,
            promptId: promptId,
            answer: promptAnswer.answer,
          },
        });
      } else {
        console.warn(
          `[SEED] Warning: Prompt with order ${promptAnswer.promptOrder} not found for user ${userData.profile.displayName}`
        );
      }
    }

    console.log(`[SEED] ✓ Created user with profile, preferences, ${userData.photos.length} photos, and ${userData.promptAnswers.length} prompt answers`);
  }

  console.log(`\n[SEED] ✓ Successfully created ${seedData.users.length} users with complete profiles!`);
};

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n[SEED] Database seed completed successfully!");
  })
  .catch(async (e) => {
    console.error("[SEED] Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
