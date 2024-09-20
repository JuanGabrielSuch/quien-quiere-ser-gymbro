let currentQuestionIndex = 0;
let questions = [];
let easyQuestions = [];
let mediumQuestions = [];
let hardQuestions = [];
let errorCount = 0; // Contador de errores
const maxErrors = 3; // Número máximo de errores permitidos

let lifelinesUsed = {
    call: false,
    audience: false,
    fiftyFifty: false
};

// Cargar las preguntas desde el archivo JSON y clasificarlas por dificultad
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        classifyQuestionsByDifficulty();
        showQuestion();
        updateCounter();
        updateErrorCounter(); // Inicializa el contador de errores
    })
    .catch(error => console.error('Error al cargar las preguntas:', error));

// Función para clasificar las preguntas según la dificultad
function classifyQuestionsByDifficulty() {
    easyQuestions = questions.filter(question => question.difficulty === "easy");
    mediumQuestions = questions.filter(question => question.difficulty === "medium");
    hardQuestions = questions.filter(question => question.difficulty === "hard");

    // Combinar todas las preguntas en el orden correcto de dificultad
    questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
}

function showQuestion() {
    const questionElement = document.getElementById('question');
    const answerButtons = document.querySelectorAll('.answer-btn');
    const nextButton = document.getElementById('next-question-btn');

    // Limpia los estados previos
    resetState(answerButtons, nextButton);

    // Muestra la pregunta actual
    let currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = currentQuestion.question;
    
    // Muestra las respuestas y añade los eventos de clic
    answerButtons.forEach((button, index) => {
        button.innerText = currentQuestion.answers[index];
        button.disabled = false; // Asegúrate de que los botones estén habilitados
        
        // Elimina cualquier evento anterior para evitar múltiples ejecuciones
        button.removeEventListener('click', handleClick);
        
        // Añade el nuevo evento para la pregunta actual
        button.addEventListener('click', handleClick);
    });

    // Actualiza el contador de preguntas
    updateCounter();
}

// Función para gestionar los clics en los botones de respuesta
function handleClick(event) {
    const selectedButton = event.target;
    let selectedAnswer = selectedButton.innerText;
    let correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const nextButton = document.getElementById('next-question-btn');

    if (selectedAnswer === correctAnswer) {
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('incorrect');
        increaseErrorCount(); // Incrementa el contador de errores
    }

    // Deshabilita los botones de respuesta después de seleccionar una respuesta
    document.querySelectorAll('.answer-btn').forEach(button => {
        button.disabled = true;
    });

    // Habilitar el botón de "Siguiente"
    nextButton.disabled = false;
}

// Función para aumentar el contador de errores y finalizar el juego si hay más de 3 errores
function increaseErrorCount() {
    errorCount++;
    updateErrorCounter();
    if (errorCount >= maxErrors) {
        alert('Has cometido 3 errores. ¡Has perdido el juego!');
        endGame();
    }
}

// Resetea el estado de los botones para la siguiente pregunta
function resetState(buttons, nextButton) {
    buttons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.disabled = true; // Desactiva los botones temporalmente
    });
    nextButton.disabled = true; // Desactiva el botón "Siguiente" hasta que se seleccione una respuesta
}

// Muestra la siguiente pregunta o finaliza el juego
document.getElementById('next-question-btn').addEventListener('click', nextQuestion);

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length && errorCount < maxErrors) {
        showQuestion();
    } else if (errorCount < maxErrors) {
        alert('¡Has completado el juego!');
    }
}

// Función para actualizar el contador de preguntas
function updateCounter() {
    const counterElement = document.getElementById('question-counter');
    counterElement.innerText = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
}

// Función para actualizar el contador de errores
function updateErrorCounter() {
    const errorCounterElement = document.getElementById('error-counter');
    errorCounterElement.innerText = `Errores: ${errorCount} de ${maxErrors}`;
}

// Función para finalizar el juego
function endGame() {
    // Aquí puedes recargar la página, mostrar un mensaje o reiniciar el juego
    window.location.reload(); // Recarga la página para reiniciar el juego
}

// Funciones para los comodines

// Comodín de la llamada
document.getElementById('call-lifeline').addEventListener('click', function() {
    if (!lifelinesUsed.call) {
        alert('Puedes llamar a alguien para pedir ayuda.');
        this.disabled = true; // Deshabilitar el comodín después de su uso
        lifelinesUsed.call = true;
    }
});

// Comodín del público
document.getElementById('audience-lifeline').addEventListener('click', function() {
    if (!lifelinesUsed.audience) {
        alert('Puedes consultar al público.');
        this.disabled = true; // Deshabilitar el comodín después de su uso
        lifelinesUsed.audience = true;
    }
});

// Comodín 50/50
document.getElementById('fifty-lifeline').addEventListener('click', function() {
    if (!lifelinesUsed.fiftyFifty) {
        useFiftyFifty();
        this.disabled = true; // Deshabilitar el comodín después de su uso
        lifelinesUsed.fiftyFifty = true;
    }
});

function useFiftyFifty() {
    const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    // Filtra las respuestas incorrectas
    let incorrectAnswers = answerButtons.filter(button => button.innerText !== correctAnswer);

    // Selecciona dos respuestas incorrectas aleatoriamente
    let answersToRemove = incorrectAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

    // Deshabilita o marca las dos respuestas incorrectas
    answersToRemove.forEach(button => {
        button.disabled = true;
        button.classList.add('incorrect');
    });
}
