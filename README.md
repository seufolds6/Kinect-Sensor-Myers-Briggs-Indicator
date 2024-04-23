# *Conoscere Sé* - Know Oneself

Group 13: Sophie Usherwood, David Peng, Nathan Wu, Edward Liau

## Getting Started
To run, copy the `index.html` filepath into your local browser. Make sure you are using TV 2. Alternatively, configure the variable `host` (located in 'main.js') to your desired WebSocket.

## Overview

*Conoscere Sé* is an interactive display that allows users to learn about their [MBTI personality profile](https://www.16personalities.com/personality-types) and unique strengths by making choices in the context of a vacation in Italy!

## Problem Space and Tasks

This project targets the problem space of fostering self-understanding and resilience among students on campus to alleviate stress that derives from imposter syndrome, a feeling of inadequacy, and self-comparison with peers. 

The two tasks address:
- Identifying what one’s greatest strengths are.
- Visualizing pleasant locations/scenarios to take one’s mind off the stressors and anxiety in one’s life.

## Constraints

Our installation is a replayable, single player game. If other people are in the view of the Kinect, our choice-selection mechanism might be less accurate or take more time to recognize the player’s selection. TV 2 has a reasonably accessible space. If there are any space problems and we cannot detect the player, we display a help message telling the player to try moving closer.

## Collaboration Record

David: implemented raising hand to confirm answer, implemented restarting game, integrated teammate’s code, fixed visual bugs, drafted README.
Sophie: implemented HTML canvas elements for each screen that is displayed, implemented logic for switching between the screens. Implemented detecting if there is a person in front of the screen, whether they are raising their hand, and if they are standing on the left or the right.
Edward : Implemented functionality to move back to previous questions if users would like to change their answers. Improved the detection of which side of the screen a person is standing on. 
Nathan: Implemented functionality to display previously selected answer choice, improved aesthetics of the design and spacing of text, revised README.
