Tone.Master.mute = true; // this needs to go first to avoid any clicking


var isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var resizeWindow = function(){ // keeping the css height at 100%
	var window_height_px = $(window).outerHeight(true)  + "px";
	$("#wrap").css('height', window_height_px);
}


var osc_count = 2;
var osc_list = [];
var slider_list = []; // stores a list of all sliders in the program. functions may loop through this list to act on all sliders.
var osc_text_list = [];



var initSliders = function(){
	slider_list.forEach(function(input){
		var dom_input = document.getElementById(input) // temporary variable to feed into noUiSlider.create()	
		noUiSlider.create(dom_input, { // generates the slider
			start: [50],
			range: {
				'min': 0,
				'max': 100
			}
		});
	});

}

var resetSlider = function(){
	// console.log('reset slider');
	slider_list.forEach(function(input){
		var dom_input = document.getElementById(input)
		dom_input.noUiSlider.set(50);
	});
}

var initMouseTouchUp = function(){
	$(window).bind('mouseup touchend', function(){ // bind any completion of input to slider reset function
		resetSlider();
	});
}

var generateOscAndPan = function(){

	osc_list.forEach(function(x){
		var this_panner = x + '_pan';

		window[this_panner] = new Tone.Panner(.5).toMaster();
		// console.log(x);
		window[x] = new Tone.Oscillator(440, 'sine').connect(window[this_panner]).start();
		// console.log( window[x] );
	});
}

var initSliderListener = function(){
	// console.log(slider_list)
	console.log('==============================');



	var counter = function(id, value){
		// console.log('bang counter: ' + id + value)
		var func = function(id, value){
			console.log(' inside func  -- ' + id +' --- ' + value )
		}
		return func
	}


	slider_list.forEach(function(input){ // run through all sliders in sliders list

		var dom_input = document.getElementById(input);
		var this_id = dom_input.id;


		var closure_name = this_id + '_counter' // dynamically generate names for each version of closure
		this[closure_name] = counter(closure_name); // creates closures based on name from above

		dom_input.noUiSlider.on('update',function(values, handle){
			var value = values[handle];
			var id = this_id;
			var formatted_value = (value / 50) - 1; // normalize values into a +/-1 float value
			// console.log(value, id)
			// counter(id, value); // send all the nicely formatted data off the the counter function
			this[closure_name](id, formatted_value)

		});
	});
}


var initMuteButton = function(){

	if (Tone.Master.mute === false){ // initial coloring
		$('#mute_button').css('background-color', 'green');
	}else{
		$('#mute_button').css('background-color', 'red');
	};

	$('#mute_button').bind('mousedown touchstart', function(){ // click event handler
		if (Tone.Master.mute === true){
			Tone.Master.mute = false;
			$(this).css('background-color', 'green')
		}else{
			Tone.Master.mute = true;
			$(this).css('background-color', 'red');
		};
	})
};


$(document).ready(function(){
	console.log("document ready");

	var generateOscWorldHTML = function(){

		for(var i = 1; i <= osc_count; i++){  // generate lists of data to be reerenced by other functions
			var osc_name = 'osc_' + i;
			osc_list.push(osc_name);

			var slider_name = 'slider_' + i;
			slider_list.push(slider_name);

			var osc_text = osc_name + '_text';
			osc_text_list.push(osc_text);

			// generate all the html inside osc world div here
			$('#osc_world').append('<div id=' + osc_name + '><div class="freq_input"><input id=' + osc_text + ' type="text"></div><div id=' + slider_name + ' class="h_slider"></div></div>');
		
			initText(osc_text, osc_name);
		};
	}

	var initText = function(osc_text, osc_name){

		var dom_input = document.getElementById(osc_text);
		$(dom_input).val('440'); // set to default frequency
		setMath()

		$(dom_input).bind('change paste keyup', function(){ // bind any change in the text input to a function
			console.log(osc_name);
			var freq = $(this).val();
			setOsc(freq, osc_name);
			setMath(freq, osc_name);
		});

		var setOsc = function(freq, name){ // this needs to be fixed
			if ( $.isNumeric(freq) ){
				console.log('set osc');
				console.log(name);
				console.log(freq);
				window[name].frequency.value = freq; // this needs help here...
			};
		}
	};


	var setMath = function(freq, osc_name){

		if (osc_name === undefined){
			// reset all to 440
			$('#osc_1_math').html(440);
			$('#osc_2_math').html(440);
		}else{
			// reset selected
			console.log(osc_name, freq)
			var this_osc_math_id = '#' + osc_name + '_math';

			if (freq === ''){
				$(this_osc_math_id).html('__?__')
			}else{
				$(this_osc_math_id).html(freq)
			};
		};

		var osc_1_input = parseFloat( $('#osc_1_math').text() );
		var osc_2_input = parseFloat( $('#osc_2_math').text() );

		var result = Math.abs( osc_1_input - osc_2_input ) ;
		$('#result').html(result)

	};




	generateOscWorldHTML();
	initMouseTouchUp();
	initSliders();
	generateOscAndPan();
	initSliderListener();


	initMuteButton();




	// console.log(osc_1.frequency.value);
	// console.log(osc_2);
	// osc_1.frequency.value = 500;




	resizeWindow();
	$(window).resize(function(){
		resizeWindow();
	});
})









