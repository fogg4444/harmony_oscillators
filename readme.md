Harmony Oscillators

Brian Fogg


In development


#### TO DO ####

- Get counter() function working with setIntervals.

	Ideally, when you slide the horizontal slider, the pitch will rise and fall at a speed that is a function of how far you have bent the fader. The further the fader is bent, the faster the pitch will adjust.
	When you let go, the lever returns to center and the pitch rests at its new position.

	Currently I'm trying to initiate a setInterval function inside a function called counter(). (around line 54)
	This setInterval function will eventually be banging out little addition or subtraction operations on the current frequency.

	counter() takes two variables, the name of the oscillator it needs to manipulate (slider_name) and a -1/+1 float value to control pitch adjustment speed (incDecValue).

	mouseup and touchend both reset all faders and shut off the counter function.
	The console is giving a pretty good readout of the current data right now.

	Hope i've explained that well enough...

Live version here. might not be the latest though: http://brianfogg.com/sub/harmony_oscillators/