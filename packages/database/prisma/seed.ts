import { prisma } from "../src/client.js";

const seed = async () => {
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
};

seed().then(async () => {
  await prisma.$disconnect();
  console.log("[DEBUG] Seed data inserted successfully.");
});
