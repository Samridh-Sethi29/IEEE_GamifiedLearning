// English Activities Data — 20 Levels, 3 Activity Types
// Chapters: Greetings & Introductions, Daily Life, Storytelling, Expressing Yourself

export const ENGLISH_CHAPTERS = [
  {
    id: 1,
    title: "Greetings & Introductions",
    emoji: "👋",
    color: "from-blue-400 to-cyan-500",
    levels: [1, 2, 3, 4, 5],
    description: "Learn how to say hello, introduce yourself, and start conversations!"
  },
  {
    id: 2,
    title: "Daily Life & Routines",
    emoji: "🌅",
    color: "from-amber-400 to-orange-500",
    levels: [6, 7, 8, 9, 10],
    description: "Talk about your day, activities, and what you love doing!"
  },
  {
    id: 3,
    title: "Storytelling & Imagination",
    emoji: "📖",
    color: "from-purple-400 to-violet-500",
    levels: [11, 12, 13, 14, 15],
    description: "Read and tell amazing stories using rich vocabulary!"
  },
  {
    id: 4,
    title: "Expressing Yourself",
    emoji: "💬",
    color: "from-rose-400 to-pink-500",
    levels: [16, 17, 18, 19, 20],
    description: "Share your feelings, opinions, and ideas clearly!"
  }
];

// Activity type per level (rotating: dialogue, fill, wordmatch)
export const LEVEL_ACTIVITY_TYPES = {
  1: "dialogue", 2: "wordmatch", 3: "fill",
  4: "dialogue", 5: "wordmatch",
  6: "fill", 7: "dialogue", 8: "wordmatch",
  9: "fill", 10: "dialogue",
  11: "wordmatch", 12: "fill", 13: "dialogue",
  14: "wordmatch", 15: "fill",
  16: "dialogue", 17: "wordmatch", 18: "fill",
  19: "dialogue", 20: "wordmatch"
};

export const ACTIVITY_TYPE_INFO = {
  dialogue: { icon: "💬", label: "Dialogue", color: "bg-blue-500" },
  wordmatch: { icon: "🧩", label: "Word Match", color: "bg-purple-500" },
  fill: { icon: "✍️", label: "Fill Story", color: "bg-amber-500" }
};

// ─────────────────────────────────────────────────
// CHAPTER 1: Greetings & Introductions
// ─────────────────────────────────────────────────

export const ENGLISH_ACTIVITIES = {

  // Level 1 — Dialogue: First day greetings
  1: {
    type: "dialogue",
    title: "First Day at School",
    scenario: "📍 You just arrived at a new school. A friendly student walks up to you.",
    steps: [
      {
        npcSays: "Hi there! I haven't seen you before. Are you new here?",
        options: [
          { text: "Yes, I just joined today! I'm a bit nervous." },
          { text: "Why do you care?" },
          { text: "I don't want to talk." }
        ],
        correctOption: 0,
        explanation: "Responding warmly and honestly is a great way to start a friendship!"
      },
      {
        npcSays: "Oh cool! Welcome! What's your name?",
        options: [
          { text: "None of your business!" },
          { text: "My name is... what's yours?" },
          { text: "I forgot." }
        ],
        correctOption: 1,
        explanation: "Sharing your name AND asking theirs shows good conversation manners!"
      },
      {
        npcSays: "Nice to meet you! Would you like me to show you around?",
        options: [
          { text: "That would be wonderful, thank you so much!" },
          { text: "No thanks, I'll figure it out." },
          { text: "I already know everything." }
        ],
        correctOption: 0,
        explanation: "Accepting help kindly and using 'thank you' shows great communication!"
      },
      {
        npcSays: "Great! By the way, where are you from?",
        options: [
          { text: "I'm from Mumbai. Have you visited there?" },
          { text: "I don't like questions." },
          { text: "Far away." }
        ],
        correctOption: 0,
        explanation: "Answering and asking a follow-up question keeps a conversation going!"
      }
    ]
  },

  // Level 2 — Word Match: Greeting words
  2: {
    type: "wordmatch",
    title: "Greeting Words",
    pairs: [
      { word: "Hello", match: "A warm greeting" },
      { word: "Goodbye", match: "What you say when leaving" },
      { word: "Please", match: "A polite request word" },
      { word: "Sorry", match: "Apologizing for a mistake" },
      { word: "Welcome", match: "Greeting someone who arrives" },
      { word: "Thanks", match: "Showing gratitude" }
    ]
  },

  // Level 3 — Fill in the Story: A new friend
  3: {
    type: "fill",
    title: "A New Friend",
    story: [
      { type: "text", text: "Priya walked into her new classroom feeling very " },
      { type: "blank", blankIndex: 0 },
      { type: "text", text: ". She saw a girl named Ananya and said " },
      { type: "blank", blankIndex: 1 },
      { type: "text", text: ". Ananya smiled and replied, 'Nice to meet you too!' Priya felt " },
      { type: "blank", blankIndex: 2 },
      { type: "text", text: " and sat next to her new friend. Soon they were " },
      { type: "blank", blankIndex: 3 },
      { type: "text", text: " together and sharing stories." }
    ],
    blanks: [
      { correctWord: "nervous", hint: "Feeling anxious" },
      { correctWord: "hello", hint: "A greeting" },
      { correctWord: "happy", hint: "Feeling joyful" },
      { correctWord: "laughing", hint: "Making sounds of joy" }
    ],
    wordBank: ["nervous", "hello", "happy", "laughing", "angry", "goodbye", "silent", "crying"]
  },

  // Level 4 — Dialogue: Asking for directions
  4: {
    type: "dialogue",
    title: "Finding the Library",
    scenario: "📍 You are at school and need to find the library. You see a teacher in the hallway.",
    steps: [
      {
        npcSays: "Hello! Can I help you with something?",
        options: [
          { text: "Excuse me, could you please tell me where the library is?" },
          { text: "Library. Where?" },
          { text: "I need the library I think." }
        ],
        correctOption: 0,
        explanation: "'Excuse me' and 'please' make your request polite and clear!"
      },
      {
        npcSays: "Of course! It's on the second floor, turn left at the stairs.",
        options: [
          { text: "Okay." },
          { text: "Thank you so much! I'll head there right away." },
          { text: "Why is it so far away?" }
        ],
        correctOption: 1,
        explanation: "Saying 'thank you so much' shows you appreciate the help!"
      },
      {
        npcSays: "You're welcome! Are you looking for a particular book?",
        options: [
          { text: "Yes! I'm looking for books about space. Do you have recommendations?" },
          { text: "I don't know." },
          { text: "That's not your problem." }
        ],
        correctOption: 0,
        explanation: "Sharing what you need and asking for recommendations shows confidence!"
      }
    ]
  },

  // Level 5 — Word Match: Polite words
  5: {
    type: "wordmatch",
    title: "Polite Expressions",
    pairs: [
      { word: "Excuse me", match: "Getting someone's attention politely" },
      { word: "May I", match: "Asking permission respectfully" },
      { word: "Certainly", match: "Saying yes in a formal way" },
      { word: "Pardon me", match: "Apologizing for a small mistake" },
      { word: "Of course", match: "Agreeing willingly" },
      { word: "I'd love to", match: "Accepting enthusiastically" }
    ]
  },

  // ─────────────────────────────────────────────────
  // CHAPTER 2: Daily Life & Routines
  // ─────────────────────────────────────────────────

  // Level 6 — Fill in the Story: My Morning
  6: {
    type: "fill",
    title: "Rohan's Morning Routine",
    story: [
      { type: "text", text: "Every morning, Rohan wakes up at 6 o'clock. He " },
      { type: "blank", blankIndex: 0 },
      { type: "text", text: " his teeth and " },
      { type: "blank", blankIndex: 1 },
      { type: "text", text: " a healthy breakfast. Then he " },
      { type: "blank", blankIndex: 2 },
      { type: "text", text: " his school bag and walks to the bus stop. He always feels " },
      { type: "blank", blankIndex: 3 },
      { type: "text", text: " for the day ahead!" }
    ],
    blanks: [
      { correctWord: "brushes", hint: "Cleaning teeth" },
      { correctWord: "eats", hint: "Having a meal" },
      { correctWord: "packs", hint: "Putting things in a bag" },
      { correctWord: "excited", hint: "Full of enthusiasm" }
    ],
    wordBank: ["brushes", "eats", "packs", "excited", "sleeps", "forgets", "ignores", "bored"]
  },

  // Level 7 — Dialogue: Talking about hobbies
  7: {
    type: "dialogue",
    title: "What Do You Like?",
    scenario: "📍 You are talking with your classmate at lunch about what you enjoy doing after school.",
    steps: [
      {
        npcSays: "Hey, what do you usually do after school?",
        options: [
          { text: "I love playing cricket and reading comics! What about you?" },
          { text: "Nothing special." },
          { text: "I go home." }
        ],
        correctOption: 0,
        explanation: "Sharing your interests AND asking a follow-up question makes a great conversation!"
      },
      {
        npcSays: "Oh wow, I love reading too! What kind of books do you like?",
        options: [
          { text: "Boring ones." },
          { text: "I mostly like adventure stories. Have you read any Enid Blyton?" },
          { text: "I don't remember." }
        ],
        correctOption: 1,
        explanation: "Giving a specific answer and referencing something you know creates a real connection!"
      },
      {
        npcSays: "Yes! I love those! Maybe we could read the same book and talk about it?",
        options: [
          { text: "That sounds like a brilliant idea! A book club for two!" },
          { text: "I read alone." },
          { text: "That's a lot of work." }
        ],
        correctOption: 0,
        explanation: "Enthusiastically agreeing and adding your own idea shows great social skills!"
      }
    ]
  },

  // Level 8 — Word Match: Action words (verbs)
  8: {
    type: "wordmatch",
    title: "Action Words",
    pairs: [
      { word: "Run", match: "Move quickly on foot" },
      { word: "Read", match: "Look at written words" },
      { word: "Cook", match: "Prepare food using heat" },
      { word: "Draw", match: "Make pictures with a pencil" },
      { word: "Sing", match: "Make music with your voice" },
      { word: "Build", match: "Construct or create something" }
    ]
  },

  // Level 9 — Fill in the Story: At the Market
  9: {
    type: "fill",
    title: "Meera at the Market",
    story: [
      { type: "text", text: "Meera went to the market with her mother to buy " },
      { type: "blank", blankIndex: 0 },
      { type: "text", text: ". The market was " },
      { type: "blank", blankIndex: 1 },
      { type: "text", text: " and full of colourful stalls. Meera saw fresh " },
      { type: "blank", blankIndex: 2 },
      { type: "text", text: " and pointed to them. Her mother smiled and said they looked " },
      { type: "blank", blankIndex: 3 },
      { type: "text", text: " so they bought a bag full." }
    ],
    blanks: [
      { correctWord: "vegetables", hint: "Healthy food from the ground" },
      { correctWord: "crowded", hint: "Full of people" },
      { correctWord: "mangoes", hint: "A juicy yellow/orange fruit" },
      { correctWord: "delicious", hint: "Tasting very good" }
    ],
    wordBank: ["vegetables", "crowded", "mangoes", "delicious", "furniture", "empty", "stones", "terrible"]
  },

  // Level 10 — Dialogue: Asking for help
  10: {
    type: "dialogue",
    title: "I Need Help!",
    scenario: "📍 You're stuck on a maths problem during class and need to ask your friend for help.",
    steps: [
      {
        npcSays: "(Your friend looks at you) You look confused. Everything okay?",
        options: [
          { text: "Yes, I'm just thinking." },
          { text: "Actually, could you help me understand question 5? I'm stuck." },
          { text: "Mind your own business." }
        ],
        correctOption: 1,
        explanation: "Asking for help clearly and honestly is brave and smart!"
      },
      {
        npcSays: "Sure! So the trick is to break the problem into smaller steps. See?",
        options: [
          { text: "Oh, that makes sense! Thank you for explaining it so well." },
          { text: "That's still confusing." },
          { text: "I knew that already." }
        ],
        correctOption: 0,
        explanation: "Thanking someone specifically ('for explaining it so well') makes them feel appreciated!"
      },
      {
        npcSays: "No problem! Maybe next time you can help me with English?",
        options: [
          { text: "Of course! I'd be happy to help anytime." },
          { text: "Maybe, I'm busy." },
          { text: "Why would I do that?" }
        ],
        correctOption: 0,
        explanation: "Offering help willingly shows you're a great friend!"
      }
    ]
  },

  // ─────────────────────────────────────────────────
  // CHAPTER 3: Storytelling & Imagination
  // ─────────────────────────────────────────────────

  // Level 11 — Word Match: Story words
  11: {
    type: "wordmatch",
    title: "Story Language",
    pairs: [
      { word: "Once upon a time", match: "How fairy tales begin" },
      { word: "Hero", match: "The main brave character" },
      { word: "Villain", match: "The bad character in the story" },
      { word: "Adventure", match: "An exciting journey or experience" },
      { word: "Twist", match: "A surprising turn in the plot" },
      { word: "Happily ever after", match: "A happy story ending" }
    ]
  },

  // Level 12 — Fill in the Story: The Lost Puppy
  12: {
    type: "fill",
    title: "The Lost Puppy",
    story: [
      { type: "text", text: "One rainy evening, Arjun found a small, " },
      { type: "blank", blankIndex: 0 },
      { type: "text", text: " puppy shivering under a bench. It looked very " },
      { type: "blank", blankIndex: 1 },
      { type: "text", text: ". Arjun carefully picked it up and " },
      { type: "blank", blankIndex: 2 },
      { type: "text", text: " it in his warm jacket. He decided he would help the puppy find its " },
      { type: "blank", blankIndex: 3 },
      { type: "text", text: " the next morning. He was determined to do the right thing." }
    ],
    blanks: [
      { correctWord: "tiny", hint: "Very small" },
      { correctWord: "frightened", hint: "Feeling scared" },
      { correctWord: "wrapped", hint: "Covered with something warm" },
      { correctWord: "owner", hint: "The person the pet belongs to" }
    ],
    wordBank: ["tiny", "frightened", "wrapped", "owner", "large", "happy", "dropped", "enemy"]
  },

  // Level 13 — Dialogue: Telling a story
  13: {
    type: "dialogue",
    title: "Story Time!",
    scenario: "📍 Your teacher asks you to share a story about something exciting that happened to you.",
    steps: [
      {
        npcSays: "Would anyone like to share an interesting experience?",
        options: [
          { text: "I have one! Last summer, I went to the mountains with my family." },
          { text: "Not me." },
          { text: "I don't have anything to say." }
        ],
        correctOption: 0,
        explanation: "Volunteering to share shows confidence and enthusiasm!"
      },
      {
        npcSays: "Oh how exciting! What was the most memorable part?",
        options: [
          { text: "Everything was good." },
          { text: "The best part was when we spotted a wild deer by the river — it was breathtaking!" },
          { text: "I don't remember." }
        ],
        correctOption: 1,
        explanation: "Using vivid words like 'breathtaking' makes your story come alive!"
      },
      {
        npcSays: "Wow! How did that make you feel?",
        options: [
          { text: "Good." },
          { text: "I felt amazed and grateful — it reminded me how beautiful nature is." },
          { text: "Normal." }
        ],
        correctOption: 1,
        explanation: "Expressing feelings and reflecting on them is powerful storytelling!"
      }
    ]
  },

  // Level 14 — Word Match: Describing words
  14: {
    type: "wordmatch",
    title: "Adjectives — Describing Words",
    pairs: [
      { word: "Enormous", match: "Very, very large" },
      { word: "Tiny", match: "Very, very small" },
      { word: "Ancient", match: "Very, very old" },
      { word: "Brilliant", match: "Very clever or bright" },
      { word: "Mysterious", match: "Strange and unknown" },
      { word: "Cheerful", match: "Happy and lively" }
    ]
  },

  // Level 15 — Fill in the Story: A Magical Forest
  15: {
    type: "fill",
    title: "The Magical Forest",
    story: [
      { type: "text", text: "Deep in the " },
      { type: "blank", blankIndex: 0 },
      { type: "text", text: " forest, there lived a young girl named Zara. She was " },
      { type: "blank", blankIndex: 1 },
      { type: "text", text: " and always " },
      { type: "blank", blankIndex: 2 },
      { type: "text", text: " about the world around her. One day, she discovered a glowing " },
      { type: "blank", blankIndex: 3 },
      { type: "text", text: " hidden beneath a silver tree. Inside it was a map to a secret garden." }
    ],
    blanks: [
      { correctWord: "enchanted", hint: "Filled with magic" },
      { correctWord: "curious", hint: "Eager to learn and explore" },
      { correctWord: "wondering", hint: "Thinking and asking questions" },
      { correctWord: "chest", hint: "A box for storing things" }
    ],
    wordBank: ["enchanted", "curious", "wondering", "chest", "dark", "bored", "sleeping", "stone"]
  },

  // ─────────────────────────────────────────────────
  // CHAPTER 4: Expressing Yourself
  // ─────────────────────────────────────────────────

  // Level 16 — Dialogue: Expressing feelings
  16: {
    type: "dialogue",
    title: "How Are You Feeling?",
    scenario: "📍 Your school counselor checks in with you after you had a tough day.",
    steps: [
      {
        npcSays: "Hey, I noticed you seemed a little down today. Want to talk?",
        options: [
          { text: "I'm fine." },
          { text: "Yes, actually. Today was really hard for me." },
          { text: "Please leave me alone." }
        ],
        correctOption: 1,
        explanation: "Opening up when asked shows emotional intelligence and trust!"
      },
      {
        npcSays: "I'm sorry to hear that. What happened?",
        options: [
          { text: "I got my test results back and I didn't do as well as I hoped. I feel disappointed." },
          { text: "Nothing. Just bad." },
          { text: "You wouldn't understand." }
        ],
        correctOption: 0,
        explanation: "Expressing exactly what happened AND naming your feeling is healthy communication!"
      },
      {
        npcSays: "That's completely understandable. What do you think would help you feel better?",
        options: [
          { text: "I think if I made a study plan and asked my teacher for help, I'd feel more confident." },
          { text: "Nothing will help." },
          { text: "I don't know." }
        ],
        correctOption: 0,
        explanation: "Suggesting solutions shows self-awareness and a positive mindset!"
      }
    ]
  },

  // Level 17 — Word Match: Emotion words
  17: {
    type: "wordmatch",
    title: "Feelings & Emotions",
    pairs: [
      { word: "Frustrated", match: "Upset because something is difficult" },
      { word: "Proud", match: "Feeling great about an achievement" },
      { word: "Anxious", match: "Worried about what might happen" },
      { word: "Grateful", match: "Thankful for something good" },
      { word: "Inspired", match: "Feeling motivated to create or do" },
      { word: "Lonely", match: "Feeling sad from being alone" }
    ]
  },

  // Level 18 — Fill in the Story: The Big Presentation
  18: {
    type: "fill",
    title: "Aarav's Big Moment",
    story: [
      { type: "text", text: "Aarav stood before the class feeling very " },
      { type: "blank", blankIndex: 0 },
      { type: "text", text: ". He took a deep breath and began to speak in a clear, " },
      { type: "blank", blankIndex: 1 },
      { type: "text", text: " voice. He talked about climate change and why we should " },
      { type: "blank", blankIndex: 2 },
      { type: "text", text: " our planet. When he finished, the class gave him a big " },
      { type: "blank", blankIndex: 3 },
      { type: "text", text: ". He felt proud of himself." }
    ],
    blanks: [
      { correctWord: "nervous", hint: "Anxious before doing something" },
      { correctWord: "confident", hint: "Sure of yourself" },
      { correctWord: "protect", hint: "Keep safe from harm" },
      { correctWord: "applause", hint: "Clapping from an audience" }
    ],
    wordBank: ["nervous", "confident", "protect", "applause", "excited", "quiet", "destroy", "silence"]
  },

  // Level 19 — Dialogue: Disagreeing politely
  19: {
    type: "dialogue",
    title: "I See It Differently",
    scenario: "📍 During a class discussion, your classmate says something you disagree with.",
    steps: [
      {
        npcSays: "I think we should never have any rules at school. Rules are just annoying!",
        options: [
          { text: "You're completely wrong!" },
          { text: "That's an interesting point, but I see it differently. Rules help keep everyone safe." },
          { text: "Yeah, rules are the worst." }
        ],
        correctOption: 1,
        explanation: "'I see it differently' is a respectful way to disagree without being rude!"
      },
      {
        npcSays: "But rules just stop us from having fun!",
        options: [
          { text: "I understand your frustration, but without rules, things could get chaotic, don't you think?" },
          { text: "You're wrong again!" },
          { text: "Yes, rules are terrible." }
        ],
        correctOption: 0,
        explanation: "Acknowledging the other person's feeling before presenting your view is persuasive and kind!"
      },
      {
        npcSays: "Hmm... I hadn't thought of it that way. Maybe some rules are okay.",
        options: [
          { text: "Yes! Fair rules decided together can make school better for everyone." },
          { text: "See, I was right all along." },
          { text: "Finally you agree." }
        ],
        correctOption: 0,
        explanation: "Finding common ground and building on it is what great communicators do!"
      }
    ]
  },

  // Level 20 — Word Match: Advanced vocabulary
  20: {
    type: "wordmatch",
    title: "Power Words",
    pairs: [
      { word: "Persuade", match: "Convince someone to believe something" },
      { word: "Empathy", match: "Understanding another person's feelings" },
      { word: "Eloquent", match: "Speaking in a clear and expressive way" },
      { word: "Collaborate", match: "Work together with others" },
      { word: "Reflect", match: "Think deeply about something" },
      { word: "Articulate", match: "Express thoughts clearly in words" }
    ]
  }
};
