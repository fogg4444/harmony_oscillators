// TO DO
// fix frequency to precision error ontext box edit


Tone.Master.mute = true; // this needs to go first to avoid any clicking

var intervals = {

	'Just_Intonation' : {
		'Unison' 		 : '1/1',
		'Minor_Second'   : '16/15',
		'Major_Second'   : '9/8',
		'Minor_Third'    : '6/5',
		'Major_Third'    : '5/4',
		'Perfect_Fourth' : '4/3',
		'Tritone'        : '7/5',
		'Perfect_Fifth'  : '3/2',
		'Minor Sixth'    : '8/5',
		'Major_Sixth'    : '5/3',
		'Minor_Seventh'  : '16/9',
		'Major_Seventh'  : '15/8',
		'Octave'         : '2/1',
	},

	'Other_Temp' : {
		'Unison' 		 : '1/1',
		'Minor_Second'   : '16/15',
		'Major_Second'   : '9/8',
		'Minor_Third'    : '6/5',
		'Major_Third'    : '5/4',
		'Perfect_Fourth' : '4/3',
		'Tritone'        : '7/5',
		'Perfect_Fifth'  : '3/2',
		'Minor Sixth'    : '8/5',
		'Major_Sixth'    : '5/3',
		'Minor_Seventh'  : '16/9',
		'Major_Seventh'  : '15/8',
		'Octave'         : '2/1',
	}
}


var equal_temp_interval_fraction_list = { // little library for keeping track of equal temperment ratios
	'Unison' : '1/1',
	'Minor_Second'   : '16/15',
	'Major_Second'   : '9/8',
	'Minor_Third'    : '6/5',
	'Major_Third'    : '5/4',
	'Perfect_Fourth' : '4/3',
	'Tritone'        : '7/5',
	'Perfect_Fifth'  : '3/2',
	'Minor Sixth'    : '8/5',
	'Major_Sixth'    : '5/3',
	'Minor_Seventh'  : '16/9',
	'Major_Seventh'  : '15/8',
	'Octave'         : '2/1',
}

var current_osc_values = {} // global memory for osc values. enables referencing by other math

var isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
} // end isNumeric

var resizeWindow = function(){ // keeping the css height at 100%
	var window_height_px = $(window).outerHeight(true)  + "px";
	$("#wrap").css('height', window_height_px);
} // end resize Window

// var osc_count = 2;

var osc_generate_array = ['osc_1','osc_2'];

// var osc_list = [];
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
}; // end initSliders

var resetSlider = function(){
	// console.log('reset slider');
	slider_list.forEach(function(input){
		var dom_input = document.getElementById(input)
		dom_input.noUiSlider.set(50);
	});
}; // end resetSlider

var initMouseTouchUp = function(){
	$(window).bind('mouseup touchend', function(){ // bind any completion of input to slider reset function
		resetSlider();
	});
}; // end initMouseTouchUp

var generateOscAndPan = function(){
	// console.log('gen pan')
	// console.log(osc_generate_array)

	osc_generate_array.forEach(function(x){
		// console.log(x)
		var this_panner = x + '_pan';

		window[this_panner] = new Tone.Panner(.5).toMaster();
		// console.log(x);
		window[x] = new Tone.Oscillator(440, 'sine').connect(window[this_panner]).start();
		// console.log( window[x] );
	});
}; // end generateOscAndPan

var initSliderListener = function(){  // this whole section needs a lot of help... closures and things on the set interval
	// console.log(slider_list)
	console.log('==============================');

	var counter = function(id, value){
		// console.log('bang counter: ' + id + value)
		var func = function(id, value){
			// console.log(' inside func  -- ' + id +' --- ' + value )
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
}; // end initSliderListner


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
}; // end initMuteButton


$(document).ready(function(){
	console.log("document ready");

	var initIntervalFractionSelect = function(){

		var selectMenuChange = function(){

			var selection_key = $(this).val();
			var selection_index = intervals[this.id][selection_key];
			var fraction_format = selection_index
				.split('/')
				.reverse()
				.map(function(x){
					//console.log(x);
					return parseFloat(x);
				});
			fraction_format = fraction_format.map(function(x){ // formatting the fractions into useable arrays for multiplication
				return x / fraction_format[0];
			})
			var multiplier = fraction_format[1];
			console.log(multiplier)
			var first_osc_value = parseFloat(current_osc_values['osc_1']);

			var new_osc_2 = first_osc_value * multiplier;
			console.log(new_osc_2);
			setOsc(new_osc_2, 'osc_2');
			console.log('test ' + selection_index)
			setInputText();
		}

		for( var menu in intervals){
			// Generate select menues for each

			var interval_selects_div = $('#interval_selects_div');
			interval_selects_div.append('<p>' + menu.replace(/[_]/g, ' ') + '</p>')
			interval_selects_div.append('<select class="interval_menu" id=' + menu + ' name=' + menu + '></select>')
			var this_menu = $('#' + menu);
			for( var interval_name in intervals[menu]){
				var interval_name_no_underscore = interval_name.replace(/[_]/g, " ")
				this_menu
					.append( $("<option></option>")
						.attr('value', interval_name)
						.text(interval_name_no_underscore) );
			}

		console.log(this_menu)
		this_menu.change( selectMenuChange );

		}

		// $('#equal_temp').change(function(){ // on equal tempered menu change run this
		// 	var selection_key = $(this).val();
		// 	var selection_index = equal_temp_interval_fraction_list[selection_key];

		// 	console.log(selection_key, selection_index);
		// 	var fraction_format = selection_index
		// 		.split('/')
		// 		.reverse()
		// 		.map(function(x){
		// 			//console.log(x);
		// 			return parseFloat(x);
		// 		});
		// 	fraction_format = fraction_format.map(function(x){ // formatting the fractions into useable arrays for multiplication
		// 		return x / fraction_format[0];
		// 	})
		// 	var multiplier = fraction_format[1];
		// 	console.log(multiplier)
		// 	var first_osc_value = parseFloat(current_osc_values['osc_1']);

		// 	var new_osc_2 = first_osc_value * multiplier;
		// 	console.log(new_osc_2);
		// 	setOsc(new_osc_2, 'osc_2');
		// 	console.log('test ' + selection_index)
		// 	setInputText();
		// });
	} // end initIntervalFractionSelect

	var generateOscWorldHTML = function(){
		osc_generate_array.forEach(function(x){
			var osc_name = x;
			var slider_name = osc_name + '_slider';
				slider_list.push(slider_name);
			var osc_text = osc_name + '_text';
				osc_text_list.push(osc_text);

			$('#osc_world').append('<div id=' + osc_name + '><div class="freq_input"><input id=' + osc_text + ' type="text"></div><div id=' + slider_name + ' class="h_slider"></div></div>');
			initText(osc_text, osc_name);
		});
	} // end GenerateOscWOrldHTML

	var setOsc = function(freq, name){ // this needs to be fixed
		if ( $.isNumeric(freq) ){
			// console.log('set osc');
			// console.log(name);
			// console.log(freq);
			current_osc_values[name] = freq; // dump the value into the global variable
			window[name].frequency.value = freq; // this needs help here...
			setMath(freq, name);
			setInputText(freq, name)
		}; // end setOsc
	};
	var setMath = function(freq, osc_name){
		var freq_length_test = freq.toString().length;
		//console.log(freq_length_test)

		if (freq_length_test > 5){
			// console.log('greater than 5');
			freq = freq.toPrecision(6) + '...';
			// console.log(freq);
		};

		if (osc_name === undefined){
			// reset all to 440
			$('#osc_1_math').html(440);
			$('#osc_2_math').html(440);
		}else{
			// reset selected
			// console.log(osc_name, freq)
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
	};// end setMath

	var setInputText = function(freq, osc_name){
		// console.log('set text')
		var this_osc_text = '#' + osc_name + '_text';
		var this_input = $(this_osc_text);
		// console.log( this_input.val() );

		this_input.val(freq);
		// console.log( this_input.val() );
		// console.log(freq, osc_name, this_input);
	}

	var initText = function(osc_text, osc_name){
		// initial stuff to run on load
		var dom_input = document.getElementById(osc_text);

		var textBind = function(value){
			// console.log('firing the text bind');
			var freq = value;
			// console.log(freq);
			setOsc(freq, osc_name);
			setInputText(freq, osc_name);
		} // end textBind

		// initial page load listener
		$(document).bind('ready', function(){
			$(dom_input).val('440'); // set to default frequency
			textBind( $(dom_input).val() );
		});
		// litener for text changes
		$(dom_input).bind('change paste keyup', function(){
			textBind( $(this).val() );
		});
	}; // End initText

	generateOscWorldHTML();
	initMouseTouchUp();
	initSliders();
	generateOscAndPan();
	initSliderListener();
	initMuteButton();
	initIntervalFractionSelect();



	resizeWindow();
	$(window).resize(function(){
		resizeWindow();
	});
})









