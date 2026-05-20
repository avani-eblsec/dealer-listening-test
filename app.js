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

// START
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

// LOAD QUESTIONS.TXT
async function loadQuestions(){

    try{

        const res =
        await fetch(
            './questions.txt'
        );

        const rawText =
        await res.text();

        parseQuestions(rawText);

        selectedQuestions =
        shuffleArray(questions)
        .slice(0,10);

        showQuestion();
    }
    catch(err){

        console.log(err);

        alert(
            'Failed to load questions.txt'
        );
    }
}

// PARSE QUESTIONS
function parseQuestions(rawText){

    const rounds =
    rawText.match(
        /Round\\s+\\d+[\\s\\S]*?(?=Round\\s+\\d+|$)/g
    ) || [];

    questions =
    rounds.map((round,index)=>{

        const audioMatch =
        round.match(
            /Audio Script\\s*[\\r\\n\\s]*[“\"]([\\s\\S]*?)[”\"]/
        );

        const questionMatch =
        round.match(
            /Question\\s*([\\s\\S]*?)\\s*Answer/
        );

        const answerMatch =
        round.match(
            /Answer\\s*([\\s\\S]*)/
        );

        const audioText =
        audioMatch
        ? audioMatch[1].trim()
        : '';

        const question =
        questionMatch
        ? questionMatch[1].trim()
        : '';

        const answer =
        answerMatch
        ? answerMatch[1].trim()
        : '';

        return {

            id:index + 1,

            audioText,

            question,

            answer,

            options:
            generateOptions(answer)
        };
    });
}

// OPTIONS
function generateOptions(correct){

    if(!isNaN(correct)){

        const num =
        parseInt(correct);

        return shuffleArray([

            String(num),

            String(num - 2),

            String(num + 2),

            String(num + 4)
        ]);
    }

    return shuffleArray([

        correct,

        'Nifty 24800 CE',

        'Bank Nifty 55200 PE',

        'Sensex 81200 PE'
    ]);
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

    const voices =
    speechSynthesis.getVoices();

    const voice =

        voices.find(v =>
            v.lang === 'en-IN'
        ) ||

        voices[0];

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

// RESULTS
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
