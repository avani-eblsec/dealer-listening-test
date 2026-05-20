speechSynthesis.onvoiceschanged = () => {

    speechSynthesis.getVoices();
};

// GET BEST INDIAN VOICE
function getIndianVoice() {

    const voices =
    speechSynthesis.getVoices();

    console.log(
        'Available Voices:',
        voices
    );

    return (

        // EDGE NEURAL INDIA FEMALE
        voices.find(v =>
            v.name.includes('Neerja')
        )

        ||

        // EDGE NEURAL INDIA MALE
        voices.find(v =>
            v.name.includes('Prabhat')
        )

        ||

        // GOOGLE INDIA
        voices.find(v =>
            v.lang === 'en-IN' &&
            v.name.includes('Google')
        )

        ||

        // ANY INDIA VOICE
        voices.find(v =>
            v.lang === 'en-IN'
        )

        ||

        // UK ENGLISH
        voices.find(v =>
            v.lang === 'en-GB'
        )

        ||

        // ANY ENGLISH
        voices.find(v =>
            v.lang.startsWith('en')
        )

        ||

        voices[0]
    );
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

    // MAKE TEXT SOUND HUMAN + INDIAN
    let humanText =
    q.audioText

    .replace(/CE/g,' C E ')
    .replace(/PE/g,' P E ')
    .replace(/SL/g,' stop loss ')
    .replace(/Qty/g,' quantity ')
    .replace(/BN/g,' Bank Nifty ')
    .replace(/Nifty/g,' Niftee ')
    .replace(/,/g,' , ')
    .replace(/\./g,' ... ')
    .replace(/24500/g,' 24 thousand 500 ')
    .replace(/24800/g,' 24 thousand 800 ')
    .replace(/55200/g,' 55 thousand 200 ');

    currentSpeech =
    new SpeechSynthesisUtterance(
        humanText
    );

    // BETTER SETTINGS
    currentSpeech.lang =
    'en-IN';

    currentSpeech.rate =
    0.92;

    currentSpeech.pitch =
    0.96;

    currentSpeech.volume =
    1;

    // GET BEST VOICE
    const voice =
    getIndianVoice();

    if(voice){

        currentSpeech.voice =
        voice;

        console.log(
            'Using Voice:',
            voice.name
        );
    }

    playBtn.innerText =
    '⏸ Pause Audio';

    currentSpeech.onend = ()=>{

        playBtn.innerText =
        '▶ Play Audio';

        startTimer();
    };

    currentSpeech.onerror = (e)=>{

        console.log(
            'Speech Error:',
            e
        );

        playBtn.innerText =
        '▶ Play Audio';
    };

    playCount++;

    updateSidebar();

    // FORCE CLEAN START
    speechSynthesis.cancel();

    setTimeout(()=>{

        speechSynthesis.speak(
            currentSpeech
        );

    },150);
}
