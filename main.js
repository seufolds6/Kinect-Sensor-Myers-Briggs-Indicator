// Might need to change the HCI display depending on which one
// we're assigned to
// var host = "cpsc484-03.yale.internal:8888";
var host = "10.67.73.26:8888";

// head: 26
// left hand: 8
// right hand: 15

$(document).ready(function () {
    frames.start();
});


// Current question index
var currentQuestion = 0;
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
ctx.fillRect(20, 20, 150, 100);

// function setup() {
    
//     // get the dimensions of the parent HTML element
//     height = document.getElementById('sketch-holder').clientHeight;
//     width = document.getElementById('sketch-holder').clientWidth;

//     // create canvas
//     var canvas = createCanvas(width, height);

//     // stretch canvas to fit dimensions of parent
//     canvas.parent('sketch-holder');
//     canvas.width = width;
//     canvas.height = height;
// }

var frames = {
    socket: null,

    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {

            frames.show(JSON.parse(event.data));

            let frame = JSON.parse(event.data);
            
            if (frame.people && frame["people"][0]) {
                console.log("Person seen");

                // Head height
                var head = frame["people"][0]["joints"][26]["position"]["z"]
                // LH height
                var left_hand = frame["people"][0]["joints"][8]["position"]["z"]
                // RH height
                var right_hand = frame["people"][0]["joints"][15]["position"]["z"]

                // Check if hand is above head
                if (left_hand > head || right_hand > head) {
                    console.log("hand is raised");
                }

                // Check if standing to the left (we should test this)
                if (frame["people"][0]["joints"][26]["position"]["x"] < 0) {
                    console.log("standing to the left");
                } else {
                    console.log("standing to the right");
                }
            }
        }
    },

    show: function (frame) {
        console.log(frame);
    }
};


// Adventure game code
 
let type_result = "";

const resultsDiv = document.getElementById('results');

function displayResults() {
    resultsDiv.innerHTML = `Your personality type is: `;
}

let currentQuestionIndex = 0;

const startBtn = document.getElementById("startBtn");
const questionContainer = document.getElementById("questionContainer");
const choiceButtons = document.querySelectorAll(".choiceBtn");
const choice1Btn = document.getElementById("choice1");
const choice2Btn = document.getElementById("choice2");
choice1Btn.style.display = "none";
choice2Btn.style.display = "none";

// Function to start the game
function startGame() {
    startBtn.style.display = "none"; // Hide the start button
    choice1Btn.style.display = "inline";
    choice2Btn.style.display = "inline";
    loadQuestion(); // Load the first question
}

// Function to load a question
function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionContainer.textContent = currentQuestion.question;

    // Load choices
    for (let i = 0; i < choiceButtons.length; i++) {
        choiceButtons[i].textContent = currentQuestion.choices[i];
        choiceButtons[i].addEventListener("click", checkAnswer);
    }
}

// Function to check the user's answer
function checkAnswer(event) {
    const userAnswer = event.target.textContent;
    const correctAnswer = questions[currentQuestionIndex].choices[0]; // Assuming the correct answer is always the first choice

    if (userAnswer === correctAnswer) {
        alert("Correct!");
    } else {
        alert("Incorrect!");
    }

    // Move to the next question or end the game
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// Function to end the game
function endGame() {
    displayResults();
    // alert("Game Over!");
    // location.reload(); // Reload the page to play again
}

// Event listener for the start button
startBtn.addEventListener("click", startGame);
