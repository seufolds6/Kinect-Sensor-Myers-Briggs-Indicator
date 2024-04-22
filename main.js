var host = "cpsc484-02.stdusr.yale.internal:8888";

$(document).ready(function () {
    frames.start();
});

// Flags to control when to transition to other screens
var start_flag = true;
var q0_flag = false;
var q1_flag = false;
var q2_flag = false;
var q3_flag = false;
var results_flag = false;
var barcode_flag = false;
var finished_flag = false;
var barcode_flag = false;

var countdown;
var curr_question = 0;
var results = [];
var countdownInterval;

const COUNTDOWN_LENGTH = 15;
const DELAY_BEFORE_HAND_RAISE = COUNTDOWN_LENGTH - 3;

var frame;

var hand_raised = false;
var standing_on_left = false;

var offset = 0;
const OFFSET_WAIT = 10;

var frames = {
    socket: null,

    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        // this will get triggered often
        // effectively a while(1) loop
        frames.socket.onmessage = function (event) {

            frames.show(JSON.parse(event.data));

            frame = JSON.parse(event.data);

            hand_raised_and_done_delay = hand_raised && countdown < DELAY_BEFORE_HAND_RAISE;
            
            // If a person is seen, start monitoring their movements
            /*
            State logic is formatted as:
                if state n
                -- if hand up, go next and change state. else, do nothing.
                else if state n - 1
                -- if hand up, go next and change state. else, do nothing.
                ...
                else if state 0
                -- if hand up, change state and start the game
            */
            if (frame && frame.people && frame["people"][0]) {
                people_seen();

                if (barcode_flag) {
                    // console.log("restarting");

                    if (hand_raised_and_done_delay) {
                        // restart the game
                        location.reload();
                    }
                }
                else if (results_flag) {
                    // console.log("go to barcode");

                    if (hand_raised_and_done_delay) {
                        go_to_barcode();
                        barcode_flag = true;
                        resetCountdown();
                    }
                }

                else if (q3_flag) {
                    // console.log("question 3");

                    if (hand_raised_and_done_delay) {
                        perform_question();
                        results_flag = true;
                        resetCountdown();
                    }
                }

                else if (q2_flag) {
                    // console.log("question 2");

                    if (hand_raised_and_done_delay) {
                        perform_question();
                        q3_flag = true;
                        resetCountdown();
                    }
                }

                else if (q1_flag) {
                    // console.log("question 1");

                    if (hand_raised_and_done_delay) {
                        perform_question();
                        q2_flag = true;
                        resetCountdown();
                    }
                }

                else if (q0_flag) {
                    // console.log("question 0");

                    if (hand_raised_and_done_delay) {
                        perform_question();
                        q1_flag = true;
                        resetCountdown();
                    }
                }

                // If on the start screen and hand is raised, go to first question
                else if (start_flag && hand_raised) {
                    // console.log("on start screen, hand is raised");

                    start_flag = false;
                    q0_flag = true;
                    go_to_next();
                    resetCountdown();
                }
            }
            else {
                no_people_seen();
            }
        }
    },

    show: function () {
        // console.log(frame);
        if (offset % OFFSET_WAIT == 0) {
            offset = 0;
            get_side();
            get_hand();

            // Debug: display left/right, hand states
            // drawSignalText("standing on left", standing_on_left, 50);
            // drawSignalText("hands raised", hand_raised, 150);
        }
        offset += 1;
    }
};

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Set canvas size to match the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

start();

// Function to start the countdown
function startCountdown() {
    // console.log("started countdown");
    countdown = COUNTDOWN_LENGTH;

    // Update the countdown
    countdownInterval = setInterval(function() {

        // debug: Display the countdown timer
        // displayCountdown();

        if (countdown > 0) {
            countdown--;
        }

        if (countdown === 5) {
            // If the countdown reaches 5 seconds, display a prompt message
            displaySubmitPrompt();
        }
    }, 1000);
}

// Function to display a prompt message reminding to submit an answer
function displaySubmitPrompt() {
    // Clear previous prompt if any
    ctx.clearRect(0, canvas.height - 50, canvas.width, 50);

    // Display the prompt message
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Please select an answer!", canvas.width / 2, canvas.height - 60);
}


// Function to reset the countdown
function resetCountdown() {
    console.log("resetting");
    clearInterval(countdownInterval);
    startCountdown();
}

// Erase no people seen message if it is there
function people_seen() {
    ctx.clearRect(canvas.width / 4, 0, 1000, 60);
}

// Display a message saying that no people were detected
// by the Kinect sensor
function no_people_seen() {
    people_seen();

    // Text style
    ctx.font = '24px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';

    var text = 'You aren\'t detected by the sensor, please come closer';
    var textX = canvas.width / 2;
    var textY = 40;

    // Draw text
    ctx.fillText(text, textX, textY);
}

// Start the game
function start() {
    var fontSize = 36;
    var font = fontSize + "px Arial";
    ctx.font = font;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Display the text
    var instructionsLine1 = "Learn about your MBTI personality ";
    var instructionsLine2 = "profile and your unique strengths,";
    var instructionsLine3 = "by making choices in the context";
    var instructionsLine4 = "of a vacation in Italy!";
    var instructionsTextX = canvas.width / 2;
    var instructionsTextY = canvas.height / 4;
    ctx.fillText(instructionsLine1, instructionsTextX, instructionsTextY - 3 * fontSize);
    ctx.fillText(instructionsLine2, instructionsTextX, instructionsTextY - fontSize);
    ctx.fillText(instructionsLine3, instructionsTextX, instructionsTextY + fontSize);
    ctx.fillText(instructionsLine4, instructionsTextX, instructionsTextY + 3 * fontSize);

    // Set properties for the blue rectangle
    var rectWidth = 400;
    var rectHeight = 100;
    var rectX = (canvas.width - rectWidth) / 2;
    var rectY = (canvas.height - rectHeight / 2) / 2;

    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 10);
    ctx.fill();
    ctx.closePath();

    // Set font properties for the text
    var fontSize = 36;
    var font = fontSize + "px Arial";
    ctx.font = font;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Display the text
    var textLine1 = "Raise your hand to";
    var textLine2 = "start your adventure!";
    var textX = canvas.width / 2;
    var textY = canvas.height / 2;
    ctx.fillText(textLine1, textX, textY + 10);
    ctx.fillText(textLine2, textX, textY + fontSize + 10);
}

// Go to the next question
function go_to_next(previous_answer = "") {
    console.log("called go_to_next, previous_answer:");
    console.log(previous_answer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(canvas.width - 100, 0, 100, 50);

    // If previous_answer is empty, go to the previous question
    if (previous_answer === "") {
        curr_question -= 1;
        if (curr_question < 0) curr_question = 0; // Ensure not to go below the first question
    }

    // Set font properties for the question
    var questionFontSize = 28;
    var questionFont = questionFontSize + "px Arial";
    ctx.font = questionFont;

    // Set properties for the choices
    var rectWidth = 300;
    var rectHeight = 150;
    var rectSpacing = 150;
    var rectY = canvas.height / 2;
    var trueX = canvas.width / 2 - rectSpacing - rectWidth;
    var falseX = canvas.width / 2 + rectSpacing;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Calculate position to center the question
    var question = questions[curr_question].question;
    var textX = canvas.width / 2;
    var textY = canvas.height * 3 / 8;

    // Split the question into three lines
    var lines = question.split(" ");
    var len = lines.length;
    var line1 = lines.slice(0, len / 3).join(" ");
    var line2 = lines.slice(len / 3, len * 2 / 3).join(" ");
    var line3 = lines.slice(len * 2 / 3, len).join(" ");

    // Display the question
    ctx.fillText(line1, textX, textY);
    ctx.fillText(line2, textX, textY + questionFontSize);
    ctx.fillText(line3, textX, textY + 2 * questionFontSize);

    // Display the first choice
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.roundRect(trueX, rectY, rectWidth, rectHeight, 10);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.font = "36px Arial"; // Increase font size for choices
    ctx.fillText(questions[curr_question].choices[0], trueX + rectWidth / 2, rectY + rectHeight / 2);

    // Display the second choice
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.roundRect(falseX, rectY, rectWidth, rectHeight, 10);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fillText(questions[curr_question].choices[1], falseX + rectWidth / 2, rectY + rectHeight / 2);

    // Instructions to select a choice
    var lineText1 = "Walk to the left or right to choose!";
    var lineText2 = "When the countdown reaches 0 it records your choice.";
    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(lineText1, canvas.width / 2, canvas.height - 130);
    ctx.fillText(lineText2, canvas.width / 2, canvas.height - 100);

    // If previous_answer is not empty, display the selected answer
    if (previous_answer !== "") {
        var text = "You selected: ".concat(previous_answer);
        ctx.fillText(text, canvas.width / 2, (textY + 160) / 2 - 14);
        // Update the instructions to include the option to go back
        lineText2 += " Raise your hand in the middle to go to the previous question";
    }

    // Clear the area for the updated instruction
    ctx.clearRect(0, canvas.height - 115, canvas.width, 50);
    // Display the updated instruction
    ctx.fillText(lineText2, canvas.width / 2, canvas.height - 100);
}


// Show the personality test results
function show_results() {
    var result = results.join("");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Display the personality test result
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.fillText(result, canvas.width / 2, 150);

    // Display the box for the strengths
    var boxWidth = 400;
    var boxHeight = 200;
    var boxX = (canvas.width - boxWidth) / 2;
    var boxY = 200;

    // Display the strengths
    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText("Your strengths are:", boxX + 20, boxY + 50);
    ctx.fillText("  1)  " + result_listing[result][0], boxX + 20, boxY + 80);
    ctx.fillText("  2)  " + result_listing[result][1], boxX + 20, boxY + 110);
    ctx.fillText("  3)  " + result_listing[result][2], boxX + 20, boxY + 140);

    var rectWidth = 500;
    var rectHeight = 130;
    var rectX = (canvas.width - rectWidth) / 2;
    var rectY = 500;
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 10);
    ctx.fill();
    ctx.closePath();
    ctx.font = "36px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Raise your hand to access", canvas.width / 2, rectY + 40);
    ctx.fillText("the optional survey!", canvas.width / 2, rectY + rectHeight - 40);
}

// Show the screen with the other people who got the same result
function go_to_barcode() {
    if (finished_flag) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    finished_flag = true;

    // Large centered title
    var titleText = "Scan the barcode to take the survey!";
    var titleFontSize = 36;
    var titleFont = titleFontSize + "px Arial";
    ctx.font = titleFont;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(titleText, canvas.width / 2, canvas.height / 4);

    // Load and draw large square image
    var barcodeImg = new Image();
    barcodeImg.src = "barcode.png";
    barcodeImg.onload = function() {
        var imgSize = canvas.height / 2;
        var imgX = (canvas.width - imgSize) / 2;
        var imgY = canvas.height / 2 - imgSize / 2;
        ctx.drawImage(barcodeImg, imgX, imgY + 50, imgSize, imgSize);
    };
}

function get_side() {
    if (frame && frame.people && frame["people"][0]) {
        if (frame["people"][0]["joints"][26]["position"]["x"] > 0) {
            // console.log("standing on left");
            standing_on_left = true;
        } else {
            // console.log("standing on right");
            standing_on_left = false;
        }
    }
}

function get_hand() {
    if (frame && frame.people && frame["people"][0]) {
        // Head height
        var head = frame["people"][0]["joints"][26]["position"]["y"];
        // LH height
        var left_hand = frame["people"][0]["joints"][8]["position"]["y"];
        // RH height
        var right_hand = frame["people"][0]["joints"][15]["position"]["y"];
        hand_raised = left_hand < head || right_hand < head;
        // if (hand_raised_and_done_delay) {
        //     console.log("hand raised")
        // }
    }
}

function perform_question() {
    console.log("Perform question: ", curr_question);

    // Give them 20 seconds (20000 milliseconds) to choose

    // Select the choice based on their position
    if (standing_on_left) {
        select_choice(true);
    } else {
        select_choice(false);
    }
}

// Select either choice 1 or choice 2
function select_choice(choice_1) {
    if (choice_1) {
        var selected = questions[curr_question].choices[0];
    } else {
        var selected = questions[curr_question].choices[1];
    }
    var letter = questions[curr_question].results[selected];
    results.push(letter);
    curr_question += 1;

    if (curr_question > 3) {
        console.log("Question number out of range")
        show_results()
        return
    }

    go_to_next(selected)
}

// Button listeners (don"t use this, control via HCI display)
canvas.addEventListener("click", function(event) {
    // Go from the start screen to the first question
    if (start_flag) {
        var mouseX = event.clientX;
        var mouseY = event.clientY;

        var rectWidth = 400;
        var rectHeight = 200;
        var rectX = (canvas.width - rectWidth) / 2;
        var rectY = (canvas.height - rectHeight) / 2;

        // Check if click is inside the start rectangle
        if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            // These two lines make the transition
            start_flag = false;
            go_to_next();
        }
    }

    // Go to the next question or back to the previous question
    if (!start_flag) {
        var mouseX = event.clientX;
        var mouseY = event.clientY;

        var rectWidth = 300;
        var rectHeight = 150;
        var rectSpacing = 150;
        var rectY = canvas.height / 2;
        var trueX = canvas.width / 2 - rectSpacing - rectWidth;
        var falseX = canvas.width / 2 + rectSpacing;

        // Check if the click is within the bounds of the first choice
        if (mouseX >= trueX && mouseX <= trueX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            select_choice(true);
        }

        // Check if the click is within the bounds of the second choice
        if (mouseX >= falseX && mouseX <= falseX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            select_choice(false);
        }

        // Check if the click is between the rectangles (to go back to the previous question)
        if (mouseX >= trueX + rectWidth && mouseX <= falseX && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            go_to_next(""); // Passing an empty string to go back to the previous question
        }
    }

    // Go from the results screen to the barcode screen
    if (barcode_flag) {
        var mouseX = event.clientX;
        var mouseY = event.clientY;

        var rectWidth = 500;
        var rectHeight = 130;
        var rectX = (canvas.width - rectWidth) / 2;
        var rectY = 500;

        // Check if the click is inside the start rectangle
        if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            // This line is what executes the transition
            go_to_barcode();
        }
    }
});

const questions = [
    {
        question: "You are on a vacation in Italy and you see a patisserie shop where you can buy a cannoli and curl up with a novel. Or, you go to your hotel and brush up on your Italian with the check-in person. Which do you choose?",
        choices: ["Patisserie", "Hotel"],
        results: {"Patisserie": "I", "Hotel": "E"}
    },
    {
        question: "The shop is still closed for a while, so you have some time. Would you be more likely to make a detailed bucket list, or to roam the streets looking for hidden gems and souvenirs?",
        choices: ["Bucket list", "The streets"],
        results: {"Bucket list": "N", "The streets": "S"}
    },
    {
        question: "You roam into a pastry shop. At the counter, you realize you forgot cash, so you can't pay for the biscotti. Would you make an arrangement to pay your friend back later, or just miss dessert? ",
        choices: ["Pay back later", "Miss dessert"],
        results: {"Pay back later": "T", "Miss dessert": "F"}
    },
    {
        question: "Your friend is in the area and calls you to meet up. However, it's your last day and you had planned a tour. Wold you cancel your reservation, or make plans to catch up with your friend when you return home?",
        choices: ["Cancel", "Don't cancel"],
        results: {"Cancel": "J", "Don't cancel": "P"}
    }
];

const result_listing = {
    "INTJ": ["great at achieving your goals",
                "see patterns easily",
                "high standards for yourself and others"],
    "INTP": ["come up with logical explanations for everything",
                "great focus and problem solving skills",
                "flexible and adaptable"],
    "INFJ": ["insightful about what motivates people",
                "committed to your values",
                "care about the common good"],
    "INFP": ["loyal to people close to you",
                "care about your values",
                "curious and creative"],
    "ISTJ": ["dependable and thorough",
                "realistic and responsible",
                "loyal to others"],
    "ISTP": ["work quickly to implement solutions",
                "flexible and understanding",
                "efficient and logical"],
    "ISFJ": ["friendly and conscientious",
                "thorough and dependable",
                "care about how other people feel"],
    "ISFP": ["sensitive and kind",
                "enjoy the current moment",
                "committed to your values"],
    "ENTJ": ["assume leadership roles, decisive",
                "great at setting long term goals",
                "present ideas effectively"],
    "ENTP": ["outspoken and quick",
                "great at strategic thinking",
                "adept at understanding people"],
    "ENFJ": ["empathetic and responsible",
                "committed to helping others, loyal",
                "responsive to feedback"],
    "ENFP": ["creative and enthusiastic",
                "show appreciation of others",
                "flexible and spontaneous"],
    "ESTJ": ["realistic and practical",
                "great at organizing projects",
                "effective at planning"],
    "ESTP": ["flexible and tolerant",
                "great at solving problems",
                "live in the moment, spontaneous"],
    "ESFJ": ["cooperative and warm",
                "complete tasks accurately",
                "loyal and always follow through"],
    "ESFP": ["outgoing and accepting",
                "work well in groups",
                "spontaneous and flexible"],
};


// DEBUGGER FUNCTIONS

function displayCountdown() {
    ctx.clearRect((canvas.width / 2) - 50, 0, 150, 150);
    ctx.fillStyle = "black";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(countdown, canvas.width / 2, 100);
}

function drawSignalText(signal_name, signal, y_pos) {
    var x_pos = 100;
    ctx.clearRect(x_pos - 100, y_pos - 50, 250, 150);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(signal_name + ": " + signal, x_pos, y_pos);
}
