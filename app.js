window.speechSynthesis.cancel();

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

    

        if(
            questions.length === 0
        ){

            alert(
                'No questions loaded'
            );

            return;
        }

        selectedQuestions =
        shuffleArray(questions)
        .slice(0,10);

        currentQuestion = 0;

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
    rawText.split(
        /Round\s+\d+/g
    )
    .filter(r => r.trim());

    questions =
    rounds.map((round,index)=>{

        // AUDIO
        const audioMatch =
        round.match(
            /Audio Script\s*([\s\S]*?)\s*Question/
        );

        let audioText =
        audioMatch
        ? audioMatch[1]
            .replace(/[“”"]/g,'')
            .trim()
        : '';

        // QUESTION
        const questionMatch =
        round.match(
            /Question\s*([\s\S]*?)\s*Answer/
        );

        const question =
        questionMatch
        ? questionMatch[1].trim()
        : '';

        // ANSWER
        const answerMatch =
        round.match(
            /Answer\s*([\s\S]*)/
        );

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

// GENERATE OPTIONS
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

    if(!q){

        alert(
            'Question loading failed'
        );

        return;
    }

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

    // LIMIT
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
async function showResults(){

    let score = 0;

    selectedQuestions.forEach(
    (q,index)=>{

        if(
            answers[index] === q.answer
        ){

            score++;
        }
    });

    const now =
    new Date();

    const date =
    now.toLocaleDateString();

    const time =
    now.toLocaleTimeString();

    // SEND DATA TO GOOGLE SHEET
    try{

        await fetch(

            'https://script.google.com/a/macros/eblsec.com/s/AKfycbx941-fP_baIutHzCF4ZJ-GwSBE3HReDoH-XnFHiVFUUkLeig62a8FV2JkOooAjKSo3/exec',

            {

                method:'POST',

                mode:'no-cors',

                headers:{

                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    date,

                    time,

                    name:candidateName,

                    score:`${score}/10`
                })
            }
        );

        console.log(
            'Result Saved'
        );
    }
    catch(err){

        console.log(
            'Sheet Error:',
            err
        );
    }

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

            <p
                style="
                    margin-top:15px;
                    color:#94a3b8;
                "
            >

                Result Submitted Successfully

            </p>

        </div>
    `;
}

document.addEventListener(
    'contextmenu',
    e => e.preventDefault()
);

document.onkeydown = function(e){

    if(e.keyCode == 123){

        return false;
    }

    if(
        e.ctrlKey &&
        e.shiftKey &&
        e.keyCode == 'I'.charCodeAt(0)
    ){

        return false;
    }
};
