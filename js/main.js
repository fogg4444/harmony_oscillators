// TO DO
// fix frequency to precision error ontext box edit


var harmonyOscillatorsGlobalNamespace = {

	floatToDb : function(input){
		// console.log(input);
		if ( this.isNumeric(input) ){
			// console.log( 20.0 * Math.log(input) )
			return 20.0 * Math.log(input)
		};
	},

	summarizeLongDecimals : function(input){
		return parseFloat(input).toPrecision(6) + '...';
	},
	
	isNumeric : function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}, // end isNumeric

	resizeWindow : function(){ // keeping the css height at 100%
		var window_height_px = $(window).outerHeight(true)  + "px";
		$("#wrap").css('height', window_height_px);
	}, // end resize Window
	
	intervals : {
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
	},

	initPanSetting : false, // true === binaural, false === matched - used for testing.
	initMuteSetting : false, // true === muted, false === unmuted
	osc_generate_array : ['osc_1','osc_2'],
	current_osc_values : {}, // global memory for osc values. enables referencing by other math
	slider_list : [], // stores a list of all sliders in the program. functions may loop through this list to act on all sliders.
	osc_text_list : [],

	initSliders : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		var initMasterVolumeSlider = function(){
			var masterVolumeDiv = $('#master_volume_div')
			noUiSlider.create(master_volume_div, { // initiate master volume slider.
				start : [0],
				range : {
					'min' : 0,
					'max' : 100
				},
				orientation : 'vertical',
				direction : 'rtl'
			});
		};

		var initFreqSliders = function(){
			hogn.slider_list.forEach(function(input){ // frequency slider for each oscillator
				var dom_input = document.getElementById(input) // temporary variable to feed into noUiSlider.create()	
				noUiSlider.create(dom_input, { // generates the slider
					start: [50],
					range: {
						'min': 0,
						'max': 100
					}
				});
			});
		}; // end initFreqSliders

		initMasterVolumeSlider();
		initFreqSliders();
	},

	resetSlider : function(){
		// console.log('reset slider');
		this.slider_list.forEach(function(input){
			var dom_input = document.getElementById(input)
			dom_input.noUiSlider.set(50);
		});
	}, // end resetSlider

	initMouseTouchUp : function(){
		$(window).bind('mouseup touchend', function(){ // bind any completion of input to slider reset function
			harmonyOscillatorsGlobalNamespace.resetSlider();
		});
	}, // end initMouseTouchUp

	generateOscAndPan : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		hogn.preMasterVolume = new Tone.Volume(0).toMaster();

		// console.log('gen pan')
		// console.log(osc_generate_array)


		this.osc_generate_array.forEach(function(x){
			// console.log(x)
			var this_panner = x + '_pan';

			hogn[this_panner] = new Tone.Panner(.5).connect(hogn.preMasterVolume); // connect this here
			// console.log(x);
			hogn[x] = new Tone.Oscillator(440, 'sine').connect(hogn[this_panner]).start();
			// console.log( window[x] );
		});
	}, // end generateOscAndPan

	initSliderListeners : function(){  // this whole section needs a lot of help... closures and things on the set interval

		var hogn = harmonyOscillatorsGlobalNamespace;

		// var counter = function(id, value){
		// 	// console.log('bang counter: ' + id + value)
		// 	var func = function(id, value){
		// 		// console.log(' inside func  -- ' + id +' --- ' + value )
		// 	}
		// 	return func
		// }

		var initFreqSlidersListener = function(){
			hogn.slider_list.forEach(function(input){ // run through all sliders in sliders list
				var dom_input = document.getElementById(input);
				var this_id = dom_input.id;

				var closure_name = this_id + '_counter' // dynamically generate names for each version of closure
				// this[closure_name] = counter(closure_name); // creates closures based on name from above

				dom_input.noUiSlider.on('update',function(values, handle){
					var value = values[handle];
					var id = this_id;
					var formatted_value = (value / 50) - 1; // normalize values into a +/-1 float value
					// console.log(value, id)
					// counter(id, value); // send all the nicely formatted data off the the counter function
					// this[closure_name](id, formatted_value)
				});
			});
		}

		var initMasterVolumeSliderListener = function(){
			var masterVolumeFader = document.getElementById('master_volume_div');
			masterVolumeFader.noUiSlider.on('update', function(values, handle){
				var normalized_slider_value = hogn.floatToDb( values / 100 );
				hogn.preMasterVolume.volume.value = normalized_slider_value;
			});
		};

		initFreqSlidersListener();
		initMasterVolumeSliderListener();
	}, // end initSliderListeners

	initMuteButton : function(){
		var muteButton = $('#mute_button');

		if (this.initMuteSetting === true){
			// mute here
			window.Tone.Master.mute = true;
			muteButton.css('background-color', 'red');
		}else{
			// unmute here
			window.Tone.Master.mute = false;
			muteButton.css('background-color', 'green');
		};

		muteButton.bind('mousedown touchstart', function(){ // click event handler
			if (Tone.Master.mute === true){
				Tone.Master.mute = false;
				$(this).css('background-color', 'green')
			}else{
				Tone.Master.mute = true;
				$(this).css('background-color', 'red');
			};
		})
	}, // end initMuteButton

	initPanButton : function(){
		var panButton = $('#pan_button');
		var hogn = harmonyOscillatorsGlobalNamespace;
		if (this.initPanSetting === false){ // initial coloring
			panButton.css('background-color', 'red');
		}else{
			panButton.css('background-color', 'green');
		};

		// console.log(hogn)

		var setPan = function(input){
			if (input === 'pan'){
				console.log('set pan');
				hogn.osc_1_pan.pan.value = 0;
				hogn.osc_2_pan.pan.value = 1;

			}else if(input === 'off'){
				console.log('kill pan');
				hogn.osc_1_pan.pan.value = .5;
				hogn.osc_2_pan.pan.value = .5;

			};
		};


		panButton.bind('mousedown touchstart', function(){ // click event handler
			if (hogn.initPanSetting === false){
				$(this).css('background-color', 'green');
				hogn.initPanSetting = true;
				// set panning on here
				setPan('pan');

			}else{
				hogn.initPanSetting = false;
				$(this).css('background-color', 'red');
				// set panning off here
				setPan('off')

			};

		});
	},

	initIntervalFractionSelect : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		var selectMenuChange = function(){
			var selection_key = $(this).val();
			var selection_index = hogn.intervals[this.id][selection_key];
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
			var first_osc_value = parseFloat(hogn.current_osc_values['osc_1']);

			var new_osc_2 = first_osc_value * multiplier;
			console.log(new_osc_2);
			hogn.setOsc(new_osc_2, 'osc_2');
			console.log('test ' + selection_index)
			hogn.setInputText();
		}

		for( var menu in hogn.intervals){
			// Generate select menues for each

			var interval_selects_div = $('#interval_selects_div');
			interval_selects_div.append('<p>' + menu.replace(/[_]/g, ' ') + '</p>')
			interval_selects_div.append('<select class="interval_menu" id=' + menu + ' name=' + menu + '></select>')
			var this_menu = $('#' + menu);
			for( var interval_name in hogn.intervals[menu]){
				var interval_name_no_underscore = interval_name.replace(/[_]/g, " ")
				this_menu
					.append( $("<option></option>")
						.attr('value', interval_name)
						.text(interval_name_no_underscore) );
			}

		// console.log(this_menu)
		this_menu.change( selectMenuChange );
		}
	}, // end initIntervalFractionSelect

	generateOscContainerDiv : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		this.osc_generate_array.forEach(function(x){
			var osc_name = x;
			var slider_name = osc_name + '_slider';
				hogn.slider_list.push(slider_name);
			var osc_text = osc_name + '_text';
				hogn.osc_text_list.push(osc_text);

			$('#osc_container_div').append('<div id=' + osc_name + '><div class="freq_input"><input id=' + osc_text + ' type="text"></div><div id=' + slider_name + ' class="h_slider"></div></div>');
			hogn.initText(osc_text, osc_name);
		});
	}, // end generateOscContainerDiv

	setOsc : function(freq, name){ // this needs to be fixed
		var hogn = harmonyOscillatorsGlobalNamespace;

		if ( $.isNumeric(freq) ){
			// console.log('set osc');
			// console.log(name);
			// console.log(freq);
			hogn.current_osc_values[name] = freq; // dump the value into the global variable
			hogn[name].frequency.value = freq; // this needs help here...
			hogn.setMath(freq, name);
			hogn.setInputText(freq, name)
		};
	},  // end setOsc

	setMath : function(freq, osc_name){
		var hogn = harmonyOscillatorsGlobalNamespace;
		var freq_length_test = freq.toString().length;
		//console.log(freq_length_test)

		if (freq_length_test > 5){
			// console.log('greater than 5');
			console.log('test')
			console.log('freq', freq)
			console.log('parse test', freq );
			freq = hogn.summarizeLongDecimals(freq);
			console.log('freq after parse', freq);
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
	},// end setMath

	setInputText : function(freq, osc_name){
		// console.log('set text')
		var this_osc_text = '#' + osc_name + '_text';
		var this_input = $(this_osc_text);
		// console.log( this_input.val() );

		this_input.val(freq);
		// console.log( this_input.val() );
		// console.log(freq, osc_name, this_input);
	},

	initText : function(osc_text, osc_name){
		// initial stuff to run on load
		var hogn = harmonyOscillatorsGlobalNamespace;
		var dom_input = document.getElementById(osc_text);

		var textBind = function(value){

			// console.log('firing the text bind');
			var freq = value;
			// console.log(freq);
			hogn.setOsc(freq, osc_name);
			hogn.setInputText(freq, osc_name);
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
	}, // End initText

	testingInitValues : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		var masterVolumeFader = document.getElementById('master_volume_div');
		masterVolumeFader.noUiSlider.set(100); // set fader to max

		Tone.Master.mute = false; // forces audio to be unmuted for testing purposes
	}

}; // End harmonyOscillatorsGlobalNamespace


$(document).ready(function(){
	console.log("document ready");
	var hogn = harmonyOscillatorsGlobalNamespace;


	Tone.Master.mute = true;


	hogn.generateOscContainerDiv();
	hogn.initMouseTouchUp();
	hogn.initSliders();
	hogn.generateOscAndPan();
	hogn.initSliderListeners();
	hogn.initPanButton();
	hogn.initIntervalFractionSelect();

	hogn.testingInitValues(); // set up faders for auto load. this is not how the userw will interact
	Tone.Master.mute = true;

	hogn.initMuteButton();

	// console.log(Tone.Master)
	// console.log(Tone.Master)

	hogn.resizeWindow();
	$(window).resize(function(){
		hogn.resizeWindow();
	});
});