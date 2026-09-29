const fs = require('fs');
const path = require('path');

const domains = [
  "Vocabulary", "Grammar", "Sentence Skills", "Reading Comprehension", "Spelling", "Literature", "Communication"
];

const questionTemplates = [
  {
    type: "MCQ",
    question: "Choose the correct synonym for '[WORD]'.",
    options: ["[SYNONYM]", "[WRONG1]", "[WRONG2]", "[WRONG3]"],
    explanation: "'[SYNONYM]' is the closest in meaning to '[WORD]'."
  },
  {
    type: "MCQ",
    question: "Identify the noun in the following sentence: 'The [NOUN] was very old.'",
    options: ["[NOUN]", "The", "was", "very"],
    explanation: "'[NOUN]' is a naming word (noun) in this sentence."
  },
  {
    type: "TRUE_FALSE",
    question: "True or False: The word '[WORD]' is an adjective.",
    options: ["True", "False"],
    explanation: "It is an adjective because it describes a noun."
  },
  {
    type: "FILL_IN_THE_BLANK",
    question: "She ___ to school every day.",
    options: ["goes", "go", "going", "gone"],
    explanation: "'goes' is the correct present tense form for a singular subject."
  }
];

const words = ["happy", "fast", "bright", "ancient", "quick", "silent", "giant", "tiny", "clever", "brave"];
const nouns = ["cat", "dog", "house", "tree", "car", "book", "computer", "river", "mountain", "cloud"];

let questions = [];

for (let lvl = 1; lvl <= 50; lvl++) {
  let difficulty = lvl <= 10 ? "easy" : lvl <= 30 ? "medium" : "hard";
  
  for (let q = 1; q <= 10; q++) {
    let tpl = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    let word = words[Math.floor(Math.random() * words.length)];
    let noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    let questionText = tpl.question.replace("[WORD]", word).replace("[NOUN]", noun);
    let optionsText = [...tpl.options];
    if (tpl.type === "MCQ") {
      optionsText[0] = optionsText[0].replace("[SYNONYM]", word + " synonym").replace("[NOUN]", noun);
      optionsText[1] = optionsText[1].replace("[WRONG1]", "wrong_1");
      optionsText[2] = optionsText[2].replace("[WRONG2]", "wrong_2");
      optionsText[3] = optionsText[3].replace("[WRONG3]", "wrong_3");
      
      // shuffle
      for (let i = optionsText.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsText[i], optionsText[j]] = [optionsText[j], optionsText[i]];
      }
    }
    
    let correctAnswer = 0;
    if (tpl.type === "MCQ") {
        correctAnswer = optionsText.findIndex(o => o === word + " synonym" || o === noun);
    } else if (tpl.type === "FILL_IN_THE_BLANK") {
        correctAnswer = 0; // 'goes'
    } else if (tpl.type === "TRUE_FALSE") {
        correctAnswer = 0; // True
    }
    
    let explanation = tpl.explanation.replace("[SYNONYM]", word + " synonym").replace("[WORD]", word).replace("[NOUN]", noun);
    
    questions.push({
      id: `english-lvl-${String(lvl).padStart(2, '0')}-q${String(q).padStart(2, '0')}`,
      level: lvl,
      domain: domains[Math.floor(Math.random() * domains.length)],
      difficulty: difficulty,
      type: tpl.type,
      question: questionText,
      options: optionsText,
      correctAnswer: correctAnswer,
      explanation: explanation,
      points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20
    });
  }
}

const fileContent = `// Automatically generated 500 questions dataset for English Pathway
export const ENGLISH_QUESTIONS = ${JSON.stringify(questions, null, 2)};
`;

fs.mkdirSync(path.join(__dirname, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src/data/englishQuestions.js'), fileContent);
console.log('Successfully generated src/data/englishQuestions.js');
