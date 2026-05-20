window.speechSynthesis.cancel();

let availableVoices = [];

speechSynthesis.onvoiceschanged = () => {

    availableVoices =
    speechSynthesis.getVoices();
};

let questions = [];

let selectedQuestions = [];

let currentQuestion = 0;

let answers = [];

let playCount = 0;

let currentSpeech = null;

let timer = 15;

let timerInterval = null;

let candidateName = '';

const loginScreen =
document.getElementById(
    'loginScreen'
);

const dashboard =
document.getElementById(
    'dashboard'
);

const startBtn =
document.getElementById(
    'startBtn'
);

const container =
document.getElementById(
    'test-container'
);

const nextBtn =
document.getElementById(
    'nextBtn'
);

const resultDiv =
document.getElementById(
    'result'
);

// START TEST
startBtn.addEventListener(
'click',
async ()=>{

    candidateName =
    document.getElementById(
        'candidateName'
    ).value.trim();

    if(!candidateName){

        alert(
            'Enter your name'
        );

        return;
    }

    loginScreen.style.display =
    'none';

    dashboard.style.display =
    'flex';

    document.getElementById(
        'candidateDisplay'
    ).innerText =
    candidateName;

    await loadQuestions();
});

// LOAD QUESTIONS
async function loadQuestions(){

    const res =
    await fetch(
        '/api/questions'
    );

    questions =
    await res.json();

    selectedQuestions =
    shuffleArray(questions)
    .slice(0,10);

    showQuestion();
}

// SHUFFLE
function shuffleArray(array){

    return [...array]
    .sort(
        ()=>Math.random()-0.5
    );
}

// SHOW QUESTION
function showQuestion(){

    speechSynthesis.cancel();

    clearInterval(timerInterval);

    timer = 30;

    playCount = 0;

    updateSidebar();

    const q =
    selectedQuestions[currentQuestion];

    container.innerHTML = `

        <div class="audio-controls">

            <button
                class="play-btn"
                onclick="toggleSpeech()"
            >

                ▶ Play Audio

            </button>

        </div>

        <div class="question">

            ${q.question}

        </div>

        <div class="options">

            ${q.options.map(option => `

                <div
                    class="option"
                    onclick="
                        selectOption(
                            this,
                            '${option}'
                        )
                    "
                >

                    ${option}

                </div>

            `).join('')}

        </div>
    `;

    if(
        currentQuestion ===
        selectedQuestions.length - 1
    ){

        nextBtn.innerText =
        'Submit Test';
    }
    else{

        nextBtn.innerText =
        'Next Question';
    }
}

// SIDEBAR
function updateSidebar(){

    document.getElementById(
        'progressText'
    ).innerText =
    `${currentQuestion + 1} / 10`;

    document.getElementById(
        'playsLeft'
    ).innerText =
    2 - playCount;

    document.getElementById(
        'timer'
    ).innerText =
    `${timer}s`;
}

// TIMER
function startTimer(){

    clearInterval(timerInterval);

    timerInterval =
    setInterval(()=>{

        timer--;

        updateSidebar();

        if(timer <= 0){

            clearInterval(
                timerInterval
            );

            nextQuestion();
        }

    },1000);
}

// AUDIO
function toggleSpeech(){

    const playBtn =
    document.querySelector(
        '.play-btn'
    );

    if(
        speechSynthesis.speaking &&
        !speechSynthesis.paused
    ){

        speechSynthesis.pause();

        playBtn.innerText =
        '▶ Resume Audio';

        return;
    }

    if(
        speechSynthesis.paused &&
        currentSpeech
    ){

        speechSynthesis.resume();

        playBtn.innerText =
        '⏸ Pause Audio';

        return;
    }

    if(playCount >= 2){

        alert(
            'Audio can only be played twice.'
        );

        return;
    }

    const q =
    selectedQuestions[currentQuestion];

    let humanText =
    q.audioText

    .replace(/CE/g,' C E ')
    .replace(/PE/g,' P E ')
    .replace(/\./g,' ... ')
    .replace(/,/g,' , ');

    currentSpeech =
    new SpeechSynthesisUtterance(
        humanText
    );

    currentSpeech.lang =
    'en-IN';

    currentSpeech.rate =
    0.78;

    currentSpeech.pitch =
    0.82;

    let voice =
    availableVoices.find(v =>
        v.lang === 'en-IN'
    ) || availableVoices[0];

    if(voice){

        currentSpeech.voice =
        voice;
    }

    playBtn.innerText =
    '⏸ Pause Audio';

    currentSpeech.onend = ()=>{

        playBtn.innerText =
        '▶ Play Audio';

        startTimer();
    };

    playCount++;

    updateSidebar();

    speechSynthesis.speak(
        currentSpeech
    );
}

// SELECT
function selectOption(
    element,
    option
){

    document
    .querySelectorAll('.option')
    .forEach(el=>{

        el.classList.remove(
            'selected'
        );
    });

    element.classList.add(
        'selected'
    );

    answers[currentQuestion] =
    option;
}

// NEXT
function nextQuestion(){

    clearInterval(timerInterval);

    speechSynthesis.cancel();

    if(
        currentQuestion ===
        selectedQuestions.length - 1
    ){

        submitTest();

        return;
    }

    currentQuestion++;

    showQuestion();
}

nextBtn.addEventListener(
    'click',
    nextQuestion
);

// SUBMIT
async function submitTest(){

    let score = 0;

    selectedQuestions.forEach(
    (q,index)=>{

        if(
            answers[index] === q.answer
        ){

            score++;
        }
    });

    // SEND TO BACKEND
    await fetch('/submit-score',{

        method:'POST',

        headers:{
            'Content-Type':
            'application/json'
        },

        body:JSON.stringify({

            name:candidateName,

            score:score
        })
    });

    showResults(score);
}

// RESULTS
function showResults(score){

    let html = `

        <div class="final-score">

            <h1>

                ${score}/10

            </h1>

            <h2>

                Test Completed

            </h2>

        </div>
    `;

    resultDiv.innerHTML =
    html;

    container.innerHTML = '';

    nextBtn.style.display =
    'none';
}