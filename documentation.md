Harmony Oscillators
-----------------------

Harmony Oscillators is an educational tool for exploring the fundamentals of music through the interactive comparison of two pure synthesized frequencies.



By precisely modifying the tuning of two sine waves the user is allowed to carefully experiment with theoreticaly perfect harmonic relationships.

Various mathematical relationships between the two frequencies are constantly calculated and fed back to the user.

Text input and tuning sliders allow for careful modification of thw two oscillators.

An oscilliscope helps to create visual understanding of the wave relationships.

---------------------
---------------------

Libraries and Tools
-------------------
Harmony Oscillators is using Tone.js for synthesizing sine waves and controlling pan and volume of these sounds. This library takes the Web Audio API and wraps it up in a code interface which is more conducive to complex audio routing and patching of musical synthesizer applications.

--------------------

HTML Layout Explanation
--------------------

The header div is mostly straight html arrangment.

The div id 'below_header' is where javascript starts generating a lot of what appears on screen.

<div id="math_div">
	math_div contains visualized mathematical relationships between the two frequencies. <span> elements fill ordinary html paragraphs allowing main.js to modify these zones.

<div id="osc_div">
	This div contains the oscillator frequency input and tuning sliders for osc_1 and osc_2.
	<div id="copy_osc_value">
		This div contains a single '>' character. This div acts as a button for copying a frequency value from osc_1 to osc_2.

<div id="interval_selects_div">
	This div contains the various interval seelctions in different temperments.

<div id="oscilliscope_zoom_div">
	Contains the no.UISlider to adjust oscilloscope zoom setting		
<div id="oscilloscope_div">
	Contains an oscilliscope created using the canvas element. This div is cleared and repopulated on each firing of renderCanvas(). I may be able to make this part of the app more eficient by not repeatedly deleting the entire canvas element and re-inserting it on each refresh. Haven't gotten around to that yet and it seems to be working well enough on most devices.


--------------------



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