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
    
    // Aquí cambiamos el texto que se pasa a la función speak
    speak(currentQuestion.question); // Solo la pregunta en texto
    
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
// Inicializamos la variable de control de reproducción de voz
let canPlayVoice = false;

// Función para alternar la reproducción de la voz
function toggleVoice() {
    canPlayVoice = !canPlayVoice;
    const voiceButton = document.getElementById('voice-btn');
    
    if (canPlayVoice) {
        voiceButton.innerText = "Reproducir Voz";
        speak(questions[currentQuestionIndex].question); // Reproducir la pregunta
    } else {
        voiceButton.innerText = "Activar Voz";
    }
}

// Elemento del menú principal
const mainMenu = document.getElementById('main-menu');
// Elemento del contenedor de preguntas
const gameContainer = document.getElementById('game');
// Contadores y comodines
const errorCounter = document.getElementById('error-counter');
const questionCounter = document.getElementById('question-counter');
const lifelines = document.getElementById('lifelines');

// Función para empezar el juego
document.getElementById('play-btn').addEventListener('click', function() {
    mainMenu.style.display = 'none'; // Oculta el menú principal
    gameContainer.style.display = 'block'; // Muestra el contenedor de preguntas
    errorCounter.style.display = 'block'; // Muestra el contador de errores
    questionCounter.style.display = 'block'; // Muestra el contador de preguntas
    lifelines.style.display = 'flex'; // Muestra los comodines
    showQuestion(); // Llama a la función que muestra la primera pregunta
});


// Obtener elementos del DOM
const backgroundMusic = document.getElementById('background-music');
const settingsMenu = document.getElementById('settings-menu');
const muteBtn = document.getElementById('mute-btn');
let isMuted = true; // Variable para controlar si la música está silenciada


// Control de volumen de la música
document.getElementById('music-volume').addEventListener('input', function() {
    if (!isMuted) {
        backgroundMusic.volume = this.value; // Cambia el volumen de la música si no está en mute
    }
});

// Función para silenciar y reactivar la música
muteBtn.addEventListener('click', function() {
    if (isMuted) {
        backgroundMusic.muted = false; // Reactivar la música
        muteBtn.innerText = 'Mute'; // Cambiar el texto del botón 
    } else {
        backgroundMusic.muted = true; // Silenciar la música
        muteBtn.innerText = 'Unmute'; // Cambiar el texto del botón
    }
    isMuted = !isMuted; // Alternar el estado de mute
});

// Función para mostrar el menú de ajustes
document.getElementById('options-btn').addEventListener('click', function() {
    mainMenu.style.display = 'none'; // Oculta el menú principal
    settingsMenu.style.display = 'flex'; // Muestra el menú de ajustes
});

// Función para volver al menú principal desde ajustes
document.getElementById('back-btn').addEventListener('click', function() {
    settingsMenu.style.display = 'none'; // Oculta el menú de ajustes
    mainMenu.style.display = 'flex'; // Muestra el menú principal
});



// Función para leer el texto de la pregunta
function speak(text) {
    if (canPlayVoice && 'speechSynthesis' in window) {
        let synth = window.speechSynthesis;
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; // Idioma catalán xD

        utterance.onstart = function() {
            console.log('La síntesis de voz ha comenzado.');
        };
        utterance.onend = function() {
            console.log('La síntesis de voz ha terminado.');
        };
        utterance.onerror = function(event) {
            console.error('Error en la síntesis de voz:', event.error);
        };

        synth.speak(utterance); // Iniciar la reproducción
    } else {
        console.log('La voz está desactivada o el navegador no soporta speechSynthesis.');
    }
}

function handleClick(event) {

    const selectedButton = event.target




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
        alert('Menudo craack -> 4926');
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
