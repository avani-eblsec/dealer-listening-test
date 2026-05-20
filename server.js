const fs = require('fs');

const path = require('path');

const express = require('express');

const app = express();

// JSON SUPPORT
app.use(express.json());

// STATIC FOLDER
app.use(
    express.static('public')
);

// LOAD QUESTIONS
const rawText = fs.readFileSync(

    path.join(
        __dirname,
        'questions.txt'
    ),

    'utf8'
);

// PARSE ROUNDS
const rounds =
rawText.match(

    /Round\s+\d+[\s\S]*?(?=Round\s+\d+|$)/g

) || [];

// CREATE QUESTIONS
const questions =
rounds.map((round,index)=>{

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

        id:index + 1,

        audioText,

        question,

        answer,

        options:
        generateOptions(answer)
    };
});

// GENERATE OPTIONS
function generateOptions(correct){

    if(!isNaN(correct)){

        const num =
        parseInt(correct);

        return shuffle([

            String(num),

            String(num - 2),

            String(num + 2),

            String(num + 4)
        ]);
    }

    return shuffle([

        correct,

        'Nifty 24800 CE',

        'Bank Nifty 55200 PE',

        'Sensex 81200 PE'
    ]);
}

// SHUFFLE
function shuffle(arr){

    return [...arr].sort(

        ()=>Math.random()-0.5
    );
}

// API QUESTIONS
app.get(
'/api/questions',
(req,res)=>{

    res.json(
        questions
    );
});

// SUBMIT SCORE
app.post(
    '/submit-score',
    (req,res)=>{
    
        try{
    
            const {
                name,
                score
            } = req.body;
    
            if(
                !name ||
                score === undefined
            ){
    
                return res.status(400)
                .json({
    
                    success:false,
    
                    message:
                    'Missing data'
                });
            }
    
            // DATE TIME
            const now =
            new Date();
    
            const date =
            now.toLocaleDateString();
    
            const time =
            now.toLocaleTimeString();
    
            // FORMAT
            const entry = `
    
    ========================================
    Date  : ${date}
    Time  : ${time}
    Name  : ${name}
    Score : ${score}/10
    ========================================
    
    `;
    
            // SAVE TO FILE
            fs.appendFileSync(
    
                path.join(
                    __dirname,
                    'scores.txt'
                ),
    
                entry
            );
    
            console.log(
                'Saved:',
                name,
                score
            );
    
            res.json({
    
                success:true
            });
        }
        catch(err){
    
            console.log(err);
    
            res.status(500)
            .json({
    
                success:false
            });
        }
    });
// START SERVER
app.listen(
5000,
'0.0.0.0',
()=>{

    console.log(
        'Server Running On Port 5000'
    );
});