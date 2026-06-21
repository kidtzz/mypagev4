async function loadQuiz() {

  const response = await fetch(
    `/english-quiz/data/${QUIZ_ID}.json`
  );

  const quiz = await response.json();

  document.getElementById("quiz-app").innerHTML =
    `
        <h2>${quiz.title}</h2>
        <p>Total Questions: ${quiz.questions.length}</p>
        `;
}

loadQuiz();