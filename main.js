// var host = "cpsc484-02.yale.internal:8888";
var host = "10.67.73.26:8888";

// head: 26
// left hand: 8
// right hand: 15

$(document).ready(function () {
    frames.start();
});

var frames = {
    socket: null,

    start: function () {
        var url = "ws://" + host + "/frames";
        frames.socket = new WebSocket(url);
        frames.socket.onmessage = function (event) {

            frames.show(JSON.parse(event.data));

            let frame = JSON.parse(event.data);
            
            // If a person is seen, start monitoring their movements
            if (frame.people && frame["people"][0]) {
                console.log("Person seen");

                // Head height
                var head = frame["people"][0]["joints"][26]["position"]["y"];
                // LH height
                var left_hand = frame["people"][0]["joints"][8]["position"]["y"];
                // RH height
                var right_hand = frame["people"][0]["joints"][15]["position"]["y"];
                var hand_raised = left_hand < head || right_hand < head;

                // //--- for testing
                // console.log("------");
                // console.log("head: ", head);
                // console.log("left_hand: ", left_hand);
                // console.log("right_hand: ", right_hand);
                // console.log("hand_raised: ", hand_raised);

                // if (frame["people"][0]["joints"][26]["position"]["x"] > 0) {
                //     console.log("standing on left");
                //     standing_on_left = true;
                // } else {
                //     console.log("standing on right");
                // }
                // //---


                // If on the start screen and hand is raised, go to first question
                if (start_flag && hand_raised) {
                    console.log("on start screen, hand is raised");

                    start_flag = false;
                    go_to_next();
                }

                // If not on the start screen (in the quiz) and hand is raised,
                // select the appropriate choice
                if (!start_flag && hand_raised) {
                    console.log("in the quiz, hand is raised");

                    var standing_on_left = false;
                    // Check if standing to the left
                    if (frame["people"][0]["joints"][26]["position"]["x"] > 0) {
                        console.log("standing on left");
                        standing_on_left = true;
                    } else {
                        console.log("standing on right");
                    }

                    // Select the choice based on their position
                    if (standing_on_left) {
                        select_choice(true);
                    } else {
                        select_choice(false);
                    }
                }

                // If on the results screen and hand is raised, go to
                // screen with list of people w/same result
                if (contacts_flag && hand_raised) {
                    console.log("go to contacts");
                    go_to_contacts();
                }

            }
        }
    },

    show: function (frame) {
        console.log(frame);
    }
};

var curr_question = 0;
var results = [];

// Flags to control when to transition to other screens
var start_flag = true;
var contacts_flag = false;

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// Set canvas size to match the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

start();

// Start the game
function start() {
    // Set properties for the blue rectangle
    var rectWidth = 400;
    var rectHeight = 200;
    var rectX = (canvas.width - rectWidth) / 2;
    var rectY = (canvas.height - rectHeight) / 2;

    // The blue rectangle
    ctx.fillStyle = 'blue';
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

    // Set font properties for the text
    var fontSize = 36;
    var font = fontSize + 'px Arial';
    ctx.font = font;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Display the text
    var textLine1 = 'Raise your hand to';
    var textLine2 = 'start your adventure!';
    var textX = canvas.width / 2;
    var textY = canvas.height / 2;
    ctx.fillText(textLine1, textX, textY - fontSize);
    ctx.fillText(textLine2, textX, textY + fontSize);
}

// Go to the next question
function go_to_next() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font properties for the question
    var questionFontSize = 28;
    var questionFont = questionFontSize + 'px Arial';
    ctx.font = questionFont;

    // Set properties for the choices
    var rectWidth = 200;
    var rectHeight = 100;
    var rectSpacing = 100;
    var rectY = (canvas.height / 3) * 2;
    var trueX = canvas.width / 2 - rectSpacing - rectWidth;
    var falseX = canvas.width / 2 + rectSpacing;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate position to center the question
    var question = questions[curr_question].question
    var textX = canvas.width / 2;
    var textY = canvas.height / 4;
    
    // Split the question into three lines
    var lines = question.split(' ');
    var len = lines.length;
    var line1 = lines.slice(0, len/3).join(' ');
    var line2 = lines.slice(len/3, len * 2/3).join(' ');
    var line3 = lines.slice(len * 2/3, len).join(' ');
    
    // Display the question
    ctx.fillText(line1, textX, textY);
    ctx.fillText(line2, textX, textY + questionFontSize);
    ctx.fillText(line3, textX, textY + 2 * questionFontSize);
    
    // Display the first choice
    ctx.fillStyle = 'blue';
    ctx.fillRect(trueX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(questions[curr_question].choices[0], trueX + rectWidth / 2, rectY + rectHeight / 2);
    
    // Display the second choice
    ctx.fillStyle = 'blue';
    ctx.fillRect(falseX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(questions[curr_question].choices[1], falseX + rectWidth / 2, rectY + rectHeight / 2);    

    // Instructions to select a choice
    var lineText = "Tip: Walk to the left or the right and raise your hand to select the option";
    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(lineText, canvas.width / 2, canvas.height - 100);

}

// Show the personality test results
function show_results() {
    contacts_flag = true;

    var result = results.join("");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Display the personality test result
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.fillText(result, canvas.width / 2, 100);

    // Display the box for the strengths
    var boxWidth = 400;
    var boxHeight = 200;
    var boxX = (canvas.width - boxWidth) / 2;
    var boxY = 200;

    // Display the strengths
    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText("Your strengths are:", boxX + 20, boxY + 40);
    ctx.fillText("  1)  " + result_listing[result][0], boxX + 20, boxY + 70);
    ctx.fillText("  2)  " + result_listing[result][1], boxX + 20, boxY + 100);
    ctx.fillText("  3)  " + result_listing[result][2], boxX + 20, boxY + 130);

    // Display the rectangle with instructions about how to see contacts
    var rectWidth = 400;
    var rectHeight = 90;
    var rectX = (canvas.width - rectWidth) / 2;
    var rectY = 500;
    ctx.fillStyle = "blue";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Raise your hand to see other", canvas.width / 2, rectY + 25);
    ctx.fillText("people with the same result", canvas.width / 2, rectY + rectHeight - 25);
}

// Show the screen with the other people who got the same result
function go_to_contacts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var titleText = "Yalies with the same result";
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(titleText, canvas.width / 2, 100);

    // Calculate box dimensions for the list of names
    var boxWidth = 500;
    var boxHeight = 140;
    var boxX = (canvas.width - boxWidth) / 2;
    var boxY = 200;

    // Display the list of names
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    var lineHeight = 40;
    var startY = boxY + 30;
    for (var i = 0; i < contacts.length; i++) {
        ctx.fillText(String(contacts[i]["name"] + ", " + contacts[i]["email"]), boxX + 20, startY + i * lineHeight);
    }

    // Placeholder for the barcode
    var squareWidth = 200;
    var squareHeight = 200;
    var squareX = (canvas.width - squareWidth) / 2;
    var squareY = boxY + boxHeight + 50;
    ctx.fillStyle = "#888888";
    ctx.fillRect(squareX, squareY, squareWidth, squareHeight);

    // Display instructions about what the barcode is for
    var lineText = "Scan this barcode to fill out the survey!";
    ctx.font = "28px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(lineText, canvas.width / 2, squareY + squareHeight + 50);
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
        show_results();
        return
    }
    go_to_next()
}

// Button listeners (don't use this, control via HCI display)
canvas.addEventListener('click', function(event) {
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

    // Go to the next question
    if (!start_flag) {
        var mouseX = event.clientX;
        var mouseY = event.clientY;
    
        var rectWidth = 200;
        var rectHeight = 100;
        var rectSpacing = 100;
        var rectY = (canvas.height / 3) * 2;
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
    }

    // Go from the results screen to the statistics screen
    if (contacts_flag) {
        var mouseX = event.clientX;
        var mouseY = event.clientY;

        var rectWidth = 400;
        var rectHeight = 90;
        var rectX = (canvas.width - rectWidth) / 2;
        var rectY = 500;

        // Check if the click is inside the start rectangle
        if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
            // This line is what executes the transition
            go_to_contacts();
        }
    }
});

const questions = [
    {
        question: "You see a patisserie shop where you can buy a cannoli and curl up with a novel. Or, you go to your hotel and brush up on your Italian with the check-in person. Which do you choose?",
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

const contacts = [
    {
        name: "Jane Doe",
        email: "jane.doe@yale.edu"
    },
    {
        name: "Alicia Jones",
        email: "alicia.jones@yale.edu"
    },
    {
        name: "Jack Downs",
        email: "jack.downs@yale.edu"
    },
]
