document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("question-text");
  const choicesList = document.getElementById("choices-list");
  const resultContainer = document.getElementById("result-container");
  const scoreDisplay = document.getElementById("score");
  const progressDisplay = document.getElementById("progress"); // NEW
  const timerDisplay = document.getElementById("timer"); // NEW
  const highScoreDisplay = document.getElementById("high-score"); // NEW

  const questions = [
    {
      question: "What is the capital of France?",
      choices: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      choices: ["Mars", "Venus", "Jupiter", "Saturn"],
      answer: "Mars",
    },
    {
      question: "Who wrote 'Hamlet'?",
      choices: [
        "Charles Dickens",
        "Jane Austen",
        "William Shakespeare",
        "Mark Twain",
      ],
      answer: "William Shakespeare",
    },
  ];

  let currentQuestionIndex = 0;
  let score = 0;
  let timer;
  let timeLimit = 10; // 10 sec per question

  startBtn.addEventListener("click", startQuiz);

  function startQuiz() {
    shuffleArray(questions); //Shuffles the question array every time
    score = 0;
    currentQuestionIndex = 0;
    startBtn.classList.add("hidden");
    resultContainer.classList.add("hidden");
    questionContainer.classList.remove("hidden");
    showQuestion();
  }

  function showQuestion() {
    resetState();
    startTimer();

    const currentQuestion = questions[currentQuestionIndex]; //writing the question text inside the <h2>
    questionText.textContent = currentQuestion.question;

    progressDisplay.textContent = `Question ${currentQuestionIndex + 1} of ${
      //it will show Question 1 of 3. since indexing starts with 0 ---->added 1
      questions.length
    }`;

    let shuffledChoices = [...currentQuestion.choices];
    shuffleArray(shuffledChoices);

    /**. The line:
     let shuffledChoices = [...currentQuestion.choices];
     currentQuestion.choices → is the array of choices for the current question.

     Example:
     ["Paris", "London", "Berlin", "Madrid"]
     [...] → this is the spread operator. It takes all elements of the array and puts them into a new array.
     
     Without it:
     let shuffledChoices = currentQuestion.choices;
     Here, both variables point to the same array in memory (changing one changes the other).
     
     With [...]:
     let shuffledChoices = [...currentQuestion.choices];
     This creates a shallow copy of the array → a new independent array with the same elements.
     So now, shuffledChoices is a separate copy of choices. */

    shuffledChoices.forEach((choice) => {
      const li = document.createElement("li");
      li.textContent = choice;
      li.addEventListener("click", () => selectAnswer(li, choice));
      choicesList.appendChild(li);
    });
  }

  function selectAnswer(li, choice) {
    clearInterval(timer);

    const correctAnswer = questions[currentQuestionIndex].answer;

    if (choice === correctAnswer) {
      li.classList.add("correct"); //Add the "correct" css class inside the ----> li
      score++;
    } else {
      li.classList.add("wrong"); ////Add the "wrong" css class inside the ----> li
      // Highlight correct answer too
      Array.from(choicesList.children).forEach((child) => {
        //
        if (child.textContent === correctAnswer) {
          child.classList.add("correct");
        }
      });
    }

    // Disable further clicks
    Array.from(choicesList.children).forEach((child) => {
      child.style.pointerEvents = "none";
    });

    nextBtn.classList.remove("hidden");
  }

  /**Code block 1: Highlight the correct answer
Array.from(choicesList.children).forEach((child) => {
  if (child.textContent === correctAnswer) {
    child.classList.add("correct");
  }
});

choicesList.children → gives you a live HTMLCollection of all <li> elements (answer choices) inside the choices list.
Example:
<ul id="choices-list">
  <li>Paris</li>
  <li>London</li>
  <li>Berlin</li>
  <li>Madrid</li>
</ul>

→ choicesList.children = [<li>Paris</li>, <li>London</li>, ...]
Array.from(...) → converts this HTMLCollection into a normal JavaScript array, so you can use array methods like .forEach.
.forEach((child) => { ... }) → loops over each <li> element.
if (child.textContent === correctAnswer)
→ compares the text inside the <li> (like "Paris") with the stored correctAnswer.
child.classList.add("correct");
→ adds the CSS class correct to highlight the right answer (usually green).
👉 This is used when the user clicks the wrong answer → so the app still shows which one was actually correct.

Code block 2: Disable further clicks
Array.from(choicesList.children).forEach((child) => {
  child.style.pointerEvents = "none";
});

Again, we loop through all <li> elements (answer choices).
child.style.pointerEvents = "none";
→ disables mouse interaction on that element.
You cannot click it anymore.
The cursor ignores it.
✅ Purpose: After the user selects an answer, we don’t want them to change their answer or keep clicking other options. */

  nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  });

  function showResult() {
    questionContainer.classList.add("hidden");
    nextBtn.classList.add("hidden");
    resultContainer.classList.remove("hidden");

    scoreDisplay.textContent = `${score} out of ${questions.length}`;

    // Save & show high score
    let highScore = parseInt(localStorage.getItem("quizHighScore")) || 0;
    if (score > highScore) {
      //JavaScript will convert the string into a number automatically during comparison.
      localStorage.setItem("quizHighScore", score);
      highScore = score;
    }
    highScoreDisplay.textContent = `🏆 High Score: ${highScore}`; //JS automatically converts number back into string so it can show on screen.
  }

  /**We are storing highScore in localStorage because we want the high score to persist even after the user refreshes or closes the page.
    👉 Here’s why:
    score is just a variable in memory (RAM). Once the page is refreshed, it resets to 0 (or disappears).
    localStorage is like a tiny browser database that stores key–value pairs (always in string form). Unlike normal variables, its data doesn’t vanish on refresh or browser close (it only clears if the user manually deletes it or clears site data).
    So, when the user comes back, we can fetch (getItem) the old high score and show it again, instead of starting fresh every time.
    
    ✅ Example:
    Without localStorage: You score 50, refresh → score resets → high score lost.
    With localStorage: You score 50, refresh → high score is still 50 because it was saved in the browser storage.
    That’s why we store highScore in localStorage — it makes the high score "permanent" for that browser. */

  /**1. How localStorage stores values
localStorage can only store strings.
So if you do:
localStorage.setItem("quizHighScore", 50);
It actually stores "50" (a string).

2. When you read it back
let highScore = localStorage.getItem("quizHighScore");
highScore will be "50" (string).
Not 50 (number).

3. Comparison problem
If you compare directly:
if (score > highScore) { ... }
Here, score is a number (e.g., 60).
highScore is a string ("50").
JavaScript will convert the string into a number automatically during comparison.
"50" → 50
So 60 > 50 works correctly. ✅
But if you tried adding them:
console.log(score + highScore); // 60 + "50"
You’d get "6050" (string concatenation) ❌, not 110.

4. Best practice → convert explicitly
To avoid confusion, we often convert right after reading:
let highScore = parseInt(localStorage.getItem("quizHighScore")) || 0;
Now highScore is always a number.
Comparisons and math are safe.

5. String form vs number form in your code
Stored in localStorage → "50" (string form).
When comparing (score > highScore) → JS auto-converts "50" → 50 (number form).
When displaying (textContent = ...) → JS automatically converts number back into string so it can show on screen.
So:

In storage → string.
In logic (comparison, math) → number.
In display → string. */

  restartBtn.addEventListener("click", startQuiz);

  // Helper Functions
  function resetState() {
    clearInterval(timer); ///It’s a built-in JavaScript function,
    timerDisplay.textContent = ""; //clear the previous timer content
    nextBtn.classList.add("hidden"); //hides nextBtn
    choicesList.innerHTML = ""; //clear prevoius choices.
  }

  /**clearInterval() is not written by you in your code.
It’s a built-in JavaScript function, provided by the Web API (browser itself, not your script).
When you call setInterval(fn, 1000), the browser:
runs fn every 1000ms (1 second),
and returns an ID (a number) that identifies this timer.
When you call clearInterval(timer), the browser looks up that ID and stops the repeating execution.
So, the functionality lives inside the JavaScript engine + browser runtime (like Chrome V8, Firefox SpiderMonkey, etc.), not inside your JS file.

Why do we need it?
Without clearInterval(timer), each call to setInterval() would keep stacking timers. For example:
Question 1 → Timer starts.
Move to Question 2 → Another timer starts (but old one is still running).
Now both timers update the display at once = buggy behavior.
So clearInterval(timer) makes sure only one active timer exists at any time. ✅*/

  function startTimer() {
    let timeLeft = timeLimit;
    timerDisplay.textContent = `⏳ Time: ${timeLeft}s`;

    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `⏳ Time: ${timeLeft}s`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        selectAnswer(null, ""); // Auto submit (wrong)
      }
    }, 1000);
  }

  /**clearInterval() is not written by you in your code.
It’s a built-in JavaScript function, provided by the Web API (browser itself, not your script).
When you call setInterval(fn, 1000), the browser:
runs fn every 1000ms (1 second),
and returns an ID (a number) that identifies this timer.
When you call clearInterval(timer), the browser looks up that ID and stops the repeating execution.
So, the functionality lives inside the JavaScript engine + browser runtime (like Chrome V8, Firefox SpiderMonkey, etc.), not inside your JS file. */

  //*******************This is Fisher–Yates shuffle algorithm*********************** */
  //It randomly rearranges the elements of an array in place (meaning it changes the same array, not returning a new one).
  function shuffleArray(array) {
    //This code is written for shuffling the array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; //This is array destructuring assignment → it swaps two elements without a temporary variable.
    }
  }
});
