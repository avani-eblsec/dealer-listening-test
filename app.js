window.speechSynthesis.cancel();

let questions = [];

let selectedQuestions = [];

let currentQuestion = 0;

let answers = [];

let playCount = 0;

let currentSpeech = null;

let timer = 30;

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

    try{

        const res =
        await fetch(
            'questions.json'
        );

        questions =
        await res.json();

        selectedQuestions =
        shuffleArray(questions)
        .slice(0,10);

        showQuestion();
    }
    catch(err){

        console.log(err);

        alert(
            'Failed to load questions.json'
        );
    }
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

        <button
            class="play-btn"
            onclick="toggleSpeech()"
        >

            ▶ Play Audio

        </button>

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

// UPDATE SIDEBAR
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

// PLAY AUDIO
function toggleSpeech(){

    const playBtn =
    document.querySelector(
        '.play-btn'
    );

    // PAUSE
    if(
        speechSynthesis.speaking &&
        !speechSynthesis.paused
    ){

        speechSynthesis.pause();

        playBtn.innerText =
        '▶ Resume Audio';

        return;
    }

    // RESUME
    if(
        speechSynthesis.paused &&
        currentSpeech
    ){

        speechSynthesis.resume();

        playBtn.innerText =
        '⏸ Pause Audio';

        return;
    }

    // MAX 2 TIMES
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
    .replace(/SL/g,' stop loss ')
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

    currentSpeech.volume =
    1;

    const voices =
    speechSynthesis.getVoices();

    const indianVoice =

        voices.find(v =>
            v.lang === 'en-IN'
        ) ||

        voices.find(v =>
            v.name.includes('Google')
        ) ||

        voices[0];

    if(indianVoice){

        currentSpeech.voice =
        indianVoice;
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

// SELECT OPTION
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

// NEXT QUESTION
function nextQuestion(){

    clearInterval(timerInterval);

    speechSynthesis.cancel();

    if(
        currentQuestion ===
        selectedQuestions.length - 1
    ){

        showResults();

        return;
    }

    currentQuestion++;

    showQuestion();
}

nextBtn.addEventListener(
    'click',
    nextQuestion
);

// SHOW RESULTS
function showResults(){

    let score = 0;

    selectedQuestions.forEach(
    (q,index)=>{

        if(
            answers[index] === q.answer
        ){

            score++;
        }
    });

    // SAVE LOCAL RESULT
    localStorage.setItem(

        'dealer_test_result',

        JSON.stringify({

            name:candidateName,

            score:score,

            date:new Date()
        })
    );

    container.innerHTML = '';

    nextBtn.style.display =
    'none';

    resultDiv.innerHTML = `

        <div class="final-score">

            <h1>

                ${score}/10

            </h1>

            <h2>

                ${candidateName}

            </h2>

        </div>
    `;
}
