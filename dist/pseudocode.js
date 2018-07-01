

<<<<<<< HEAD
if the slider is at 1:

update once every 10 milleseconds

we should update 12 cents per update

after each second we will have increased by an octave


b = a x 2 ^ (n/1200)


a = frequency we know in the text box

n = 12 cents


b = 440 x 2 ^ (12/1200) // if slider is at 1

=======
<div id="osc_1_div">
	<div class="freq_input">
		<input id="osc_1_text" type="text">
	</div>
	<div id="slider_1" class="h_slider"></div>
</div>

<div id="osc_2_div">
	<div class="freq_input">
		<input id="osc_2_text" type="text">
	</div>
	<div id="slider_2" class="h_slider"></div>
</div>




db to float
v = 10 ^ (db / 20)

float to db

db = 20.0 * log( float );
>>>>>>> pre_pierce_slider_meeting
