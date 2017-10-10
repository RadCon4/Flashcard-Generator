
var BasicFlashcard = require('./BasicCard.js');

var ClozeFlashcard = require('./ClozeCard.js');

var inquirer = require('inquirer');

var fs = require('fs');

inquirer.prompt([{
    name: 'command',
    message: 'Here are your choices:',
    type: 'list',
    choices: [{
        name: 'add a flashcard!'
    }, {
        name: 'show all of your flashcards'
    }]
}]).then(function(answer) {
    if (answer.command === 'add a flashcard!') {
        addCard();
    } else if (answer.command === 'show all of your flashcards') {
        showCards();
    }
});

var addCard = function() {
  
    inquirer.prompt([{
        name: 'cardType',
        message: 'What kind of flashcard would you like to create?',
        type: 'list',
        choices: [{
            name: 'A basic flashcard (you fill out a question for the front of the card, and an answer for the back of the card)'
        }, {
            name: 'a cloze flashcard (you fill out a complete statement.  Then decide what keyword(s) you would like redacted from the front of the card and placed on the back'
        }]
   
    }]).then(function(answer) {
        if (answer.cardType === 'A basic flashcard (you fill out a question for the front of the card, and an answer for the back of the card)') {
            inquirer.prompt([{
                name: 'front',
                message: 'What is the question?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide a question');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'back',
                message: 'What is the answer?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide an answer');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var newBasic = new BasicFlashcard(answer.front, answer.back);
                newBasic.create();
                whatsNext();
            });
        } else if (answer.cardType === 'a cloze flashcard (you fill out a complete statement.  Then decide what keyword(s) you would like redacted from the front of the card and placed on the back') {
            inquirer.prompt([{
                name: 'text',
                message: 'What is the full text?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide the full text');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'cloze',
                message: 'What is the cloze portion?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide the cloze portion');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var text = answer.text;
                var cloze = answer.cloze;
                if (text.includes(cloze)) {
                    var newCloze = new ClozeFlashcard(text, cloze);
                    newCloze.create();
                    whatsNext();
                } else {
                    console.log('The cloze portion you provided is not found in the full text. Please try again.');
                    addCard();
                }
            });
        }
    });
};

var whatsNext = function() {
   
    inquirer.prompt([{
        name: 'nextAction',
        message: 'What would you like to do next?',
        type: 'list',
        choices: [{
            name: 'create a new flashcard'
        }, {
            name: 'show all of your flashcards'
        }, {
            name: 'nothing, I am done'
        }]
    
    }]).then(function(answer) {
        if (answer.nextAction === 'create a new flashcard') {
            addCard();
        } else if (answer.nextAction === 'show all of your flashcards') {
            showCards();
        } else if (answer.nextAction === 'nothing, I am done') {
            return;
        }
    });
};

var showCards = function() {

    fs.readFile('./log.txt', 'utf8', function(error, data) {
     
        if (error) {
            console.log('Error occurred: ' + error);
        }
        var questions = data.split(';');
        var notBlank = function(value) {
            return value;
        };
        questions = questions.filter(notBlank);
        var count = 0;
        showQuestion(questions, count);
    });
};

var showQuestion = function(array, index) {
    question = array[index];
    var parsedQuestion = JSON.parse(question);
    var questionText;
    var correctReponse;
    if (parsedQuestion.type === 'basic') {
        questionText = parsedQuestion.front;
        correctReponse = parsedQuestion.back;
    } else if (parsedQuestion.type === 'cloze') {
        questionText = parsedQuestion.clozeDeleted;
        correctReponse = parsedQuestion.cloze;
    }
    inquirer.prompt([{
        name: 'response',
        message: questionText
    }]).then(function(answer) {
        if (answer.response === correctReponse) {
            console.log('Correct!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        } else {
            console.log('Wrong!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        }
    });
};