const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

// PORT
const PORT = 5000;

// JSON SUPPORT
app.use(express.json());

// STATIC FRONTEND
app.use(express.static('public'));

// LOAD QUESTIONS FILE
const rawText = fs.readFileSync(
    path.join(__dirname, 'questions.txt'),
    'utf8'
);

// PARSE ROUNDS
const rounds =
rawText.match(
    /Round\s+\d+[\s\S]*?(?=Round\s+\d+|$)/g
) || [];

// GENERATE QUESTIONS
const questions = rounds.map((round,index)=>{

    const audioMatch =
    round.match(
        /Audio Script\s*[\r\n\s]*[“"]([\s\S]*?)[”"]/
    );

    const questionMatch =
    round.match(
        /Question\s*([\s\S]*?)\s*Answer/
    );

    const answerMatch =
    round.match(
        /Answer\s*([\s\S]*)/
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

        id : index + 1,

        audioText,

        question,

        answer,

        options : generateOptions(answer)
    };
});

// GENERATE OPTIONS
function generateOptions(correct){

    // NUMBER TYPE ANSWERS
    if(!isNaN(correct)){

        const num = parseInt(correct);

        return shuffle([

            String(num),
            String(num - 2),
            String(num + 2),
            String(num + 4)
        ]);
    }

    // TEXT TYPE ANSWERS
    return shuffle([

        correct,

        'Nifty 24800 CE',
        'Bank Nifty 55200 PE',
        'Sensex 81200 PE'
    ]);
}

// SHUFFLE ARRAY
function shuffle(arr){

    return [...arr].sort(
        ()=>Math.random() - 0.5
    );
}

// QUESTIONS API
app.get('/api/questions',(req,res)=>{

    res.json(questions);
});

// SUBMIT SCORE
app.post('/submit-score',(req,res)=>{

    try{

        const {
            name,
            score
        } = req.body;

        // VALIDATION
        if(
            !name ||
            score === undefined
        ){

            return res.status(400).json({

                success:false,
                message:'Missing data'
            });
        }

        // DATE & TIME
        const now = new Date();

        const date =
        now.toLocaleDateString();

        const time =
        now.toLocaleTimeString();

        // FORMAT ENTRY
        const entry = `
========================================
Date  : ${date}
Time  : ${time}
Name  : ${name}
Score : ${score}/10
========================================
\n`;

        // SAVE SCORE
        fs.appendFileSync(
            path.join(__dirname,'scores.txt'),
            entry
        );

        console.log(
            `Saved -> ${name} : ${score}/10`
        );

        res.json({

            success:true,
            message:'Score saved successfully'
        });
    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,
            message:'Server error'
        });
    }
});

// ROOT ROUTE
app.get('/',(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            'public',
            'index.html'
        )
    );
});

// START SERVER
app.listen(
    PORT,
    '0.0.0.0',
    ()=>{

        console.log(
            `Server Running On Port ${PORT}`
        );
    }
);
