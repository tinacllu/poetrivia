const app = {};

// generate a random array index number
app.getRandomIndex = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return randomIndex;
};

// fetch poem info from API 
app.getPoemInfo = () => {
  fetch(`https://poetrydb.org/random/${app.totalQuestions * 3 * 2}`)
    .then((response) => {
      if (response.ok === true) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then((data) => {
      app.poemArray = [[]];
      let poemArrayIndex = 0;
      let authorArray = [];
      app.questionNumber = 0; 
      data.forEach((poem) => {
        if (app.poemArray.length <= app.totalQuestions) {
          if (
            app.poemArray[poemArrayIndex].length < 3 &&
            authorArray.indexOf(poem.author) === -1
          ) {
            app.poemArray[poemArrayIndex].push(poem);
            authorArray.push(poem.author);
          } else if (app.poemArray[poemArrayIndex].length === 3) {
            poemArrayIndex = poemArrayIndex + 1;
            app.poemArray.push([]);
            authorArray = [];
          }
        }
      });
      app.poemArray.pop();
    })
    .catch((error) => {
      if (error.message === "Not Found") {
        alert("We're uninspired, no poems today");
      } else {
        alert("Hmmm..we have to fix something. Come back later");
      }
    });
};

const apiPromise = fetch(`https://poetrydb.org/random/${app.totalQuestions * 3 * 2}`)
.then((response) => {
  if (response.ok === true) {
    return response.json();
  } else {
    throw new Error(response.statusText);
  }
})

apiPromise.then(() => {
  app.landingPage.classList.remove("invisible");
  app.footer.classList.remove("invisible");
  const loadingIcon = document.querySelector(".loadingIcon");
  loadingIcon.classList.add("invisible");
});

// reset game trackers to default
app.resetGame = () => {
  app.counter = 0;
  app.numOfNextClicks = 0;
  app.questionNumber = 0;
  app.submitted = false;
  app.removeClassFromOptions();
  document.querySelector(".currentScore").innerHTML = "";
  document.querySelector(".currentScoreHard").innerHTML = "";
  document.getElementById("textBox").value = "";
};

// start game based on difficulty selected by user
app.initializeGameMode = () => {
  const modeSelected = document.querySelector(
    "input[name='gameMode']:checked"
  ).value;

  if (modeSelected === "easy") {
    app.displayEasyQuestion();
    app.displayEasyAnswerOptions(app.poemPool);
    app.nextButton = document.querySelector(".next");
    app.finishButton = document.querySelector(".finish");
    app.finishQuiz(app.easyGame);
    // app.easyNext();
    app.easyGame.classList.remove("invisible");
  } else if (modeSelected === "hard") {
    app.displayHardPoem();
    app.nextButton = document.querySelector(".nextHard");
    app.finishButton = document.querySelector(".finishHard");
    // app.hardNext();
    app.finishQuiz(app.hardGame);
    app.hardGame.classList.remove("invisible");
  }
};

// start quiz
app.startQuiz = () => {
  const modeSelectionForm = document.querySelector(".modeSelection");
  modeSelectionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    app.resetGame();
    app.landingPage.classList.add("invisible");
    app.initializeGameMode();
  });
};

// displays poet name in easy mode
app.displayEasyQuestion = () => {
  app.poemPool = app.poemArray[app.questionNumber];
  app.poemInfo = app.poemPool[app.getRandomIndex(app.poemPool)];
  app.poetName = app.poemInfo.author;
  const poetContainer = document.querySelector(".poetContainer");
  poetContainer.innerHTML = `<h2>${app.poetName}</h2>`;
  document.querySelector(".easySubmit").removeAttribute("disabled", "");
    app.allOptions.forEach((option) => {
      option.removeAttribute("disabled", "");
    });
};

// displays 3 poem titles as answer options in easy mode
app.displayEasyAnswerOptions = (array) => {
  let optionNumber = 0;
  array.forEach((poemInfo) => {
    optionNumber = optionNumber + 1;
    const poemTitle = poemInfo.title;
    const poemTitleLabel = document.querySelector(`label[for="option${optionNumber}"]`);
    poemTitleLabel.textContent = poemTitle;
  });
};

// checks if user selection is correct/incorrect in easy mode
app.checkEasyAnswer = (selectedPoemTitle) => {
  if (selectedPoemTitle.innerText === app.poemInfo.title) {
    app.counter = app.counter + 1;
    selectedPoemTitle.classList.add("correct");
  } else {
    selectedPoemTitle.classList.add("incorrect");
  }
};

// removes correct / incorrect styling class from easy options
app.removeClassFromOptions = () => {
  const poemTitleOptions = document.querySelectorAll("label[name='option']");
  poemTitleOptions.forEach((option) => {
    option.classList.remove("correct", "incorrect");
  });
};

// tracks the number of questions answered
app.questionTracker = () => {
  app.numOfNextClicks = app.numOfNextClicks + 1;
  if (app.numOfNextClicks === app.totalQuestions - 1) {
    app.displayEasyQuestion();
    app.displayEasyAnswerOptions(app.poemPool);
    app.nextButton.classList.add("hidden");
    app.finishButton.classList.remove("hidden");
  } else if (app.numOfNextClicks < app.totalQuestions) {
    app.displayEasyQuestion();
    app.displayEasyAnswerOptions(app.poemPool);
  }
};

// displays random poem title in hard mode
app.displayHardPoem = () => {
  app.poemPool = app.poemArray[app.questionNumber];
  app.poemInfo = app.poemPool[app.getRandomIndex(app.poemPool)];
  
  const titleContainer = document.querySelector(".titleContainer");
  titleContainer.innerHTML = `<h2>${app.poemInfo.title}</h2>`;

  document.querySelector(".hardSubmit").removeAttribute("disabled", "");
  document.querySelector("input[type='text']").removeAttribute("disabled", "");
};

// event listeners 
app.events = () => {
  // next button in easy mode 
  const nextButtonEasy = document.querySelector(".next");
  nextButtonEasy.addEventListener("click", () => {
    if (app.submitted === true) {
      app.questionNumber = app.questionNumber + 1;
      app.questionTracker();
      app.removeClassFromOptions();
      app.submitted = false;
    } else {
      alert("Please submit your answer")
    }
  });
  
  // submit answer button in easy mode - updates the current score
  const easyResponse = document.querySelector(".easyQuestion");

  easyResponse.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    app.easySubmitButton = document.querySelector(".easySubmit");
    const selectedAnswer = document.querySelector("input[name='option']:checked");
    if (selectedAnswer !== null && submitter === app.easySubmitButton) {
      const selectedPoemTitle = document.querySelector(`label[for="${selectedAnswer.id}"]`);
      app.easySubmitButton.setAttribute("disabled", "");
      app.allOptions.forEach((option) => {
        option.setAttribute("disabled", "");
      });
      app.checkEasyAnswer(selectedPoemTitle);
      const currentScore = document.querySelector(".currentScore");
      currentScore.innerHTML = `Current score: ${app.counter}/${app.totalQuestions}`;
      document.querySelector("input[name='option']:checked").checked = false;
      app.submitted = true;
      }
  });

  // next button in hard mode 
  const nextButtonHard = document.querySelector(".nextHard");
  nextButtonHard.addEventListener("click", () => {
    document.getElementById("textBox").value = "";
    app.questionNumber = app.questionNumber + 1;
    app.textBox.classList.remove("correct", "incorrect");
    app.questionTracker();
    app.displayHardPoem();
  });

  // submit answer button in hard mode - tracks and displays score
  const hardAnswer = document.querySelector(".hardQuestion");
  hardAnswer.addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector(".hardSubmit").setAttribute("disabled", "");
    document.querySelector("input[type='text']").setAttribute("disabled", "");
    const currentScore = document.querySelector(".currentScoreHard");
    const userAnswer = document.getElementById("textBox").value;
    if (userAnswer.toLowerCase() === app.poemInfo.author.toLowerCase()) {
      app.counter = app.counter + 1;
      app.textBox.classList.add("correct");
    } else {
      app.textBox.classList.add("incorrect");
    }
    currentScore.innerHTML = `Current score: ${app.counter}/${app.totalQuestions}`;
    
  });

  // finish quiz
  app.finishQuiz = (gameMode) => {
    app.finishButton.addEventListener("click", () => {
      const finalScore = document.querySelector(".finalScore");
      finalScore.innerHTML = `Your final score is ${app.counter}/${app.totalQuestions}`;
      gameMode.classList.add("invisible");
      app.endPage.classList.remove("invisible");
    });
  };

  // restart quiz
  const restart = document.querySelector(".restart");
  restart.addEventListener("click", () => {
    app.getPoemInfo();
    app.finishButton.classList.add("hidden");
    app.nextButton.classList.remove("hidden");
    app.landingPage.classList.remove("invisible");
    app.easyGame.classList.add("invisible");
    app.hardGame.classList.add("invisible");
    app.endPage.classList.add("invisible");
  });
};

app.init = () => {
  app.landingPage = document.querySelector(".landingPage");
  app.easyGame = document.querySelector(".easyGame");
  app.hardGame = document.querySelector(".hardGame");
  app.endPage = document.querySelector(".endPage");
  app.footer = document.querySelector("footer");
  app.allOptions = document.querySelectorAll("input[name='option']");
  app.textBox = document.querySelector("input[id='textBox']");
  app.totalQuestions = 5;
  
  app.startQuiz();
  app.events();
  app.getPoemInfo();
};

app.init();