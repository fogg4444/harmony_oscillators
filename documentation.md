Harmony Oscillators
-------------------

Harmony Oscillators is an educational tool for exploring the fundamentals of music through the interactive comparison of two pure synthesized frequencies.



By precisely modifying the tuning of two sine waves the user is allowed to carefully experiment with theoreticaly perfect harmonic relationships.

Various mathematical relationships between the two frequencies are constantly calculated and fed back to the user.

Text input and tuning sliders allow for careful modification of thw two oscillators.

An oscilliscope helps to create visual understanding of the wave relationships.

---------------------
---------------------
List of Functions, Variables and their meaning

var hogn = harmonyOscillatorsGlobalNamespace;

initResetButton

initButtons

clearIntervalMath

initIntervalFractionSelect

resetIntervalSelectMenu

generateOscContainerDiv

setOsc

setMath

setInputText

initText

testingInitValues

oscCanvas

oscContext

initCanvasZoomSlider

renderCanvas


Tone.Master.mute = true;
hogn.generateOscContainerDiv();
hogn.initMouseTouchUp();
hogn.initSliders();
hogn.generateOscAndPan();
hogn.initIntervalFractionSelect();
hogn.initCanvasZoomSlider();
hogn.initSliderListeners();
hogn.testingInitValues(); // set up faders for auto load. this is not how the users will interact
Tone.Master.mute = true;
hogn.initButtons();
	

hogn.resizeWindow();
$(window).resize(function(){
	hogn.resizeWindow();
});