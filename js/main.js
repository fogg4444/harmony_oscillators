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

	scaleLogarithmically : function(input, minIn, maxIn, minOut, maxOut, scale){ // logarithmic scaling function with negative number support
		if (input < 0){ // check if input is negative
			var inputIsNegative = true;
			input = Math.abs(input); // make input a real number so equation will work properly
		};
		var result = (Math.exp(((input-minIn)/(maxIn-minIn)-1)*scale)-1) / (Math.exp(-scale)-1)*(minOut-maxOut)+maxOut

		if (inputIsNegative === true){ // if input is negative, make result negative.
			return -result;
		}else{
			return result; // if input is not negative return positive result
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
	initMuteSetting : true, // true === muted, false === unmuted
	oscGenerateArray : ['osc_1','osc_2'],
	currentOscValues : {}, // global memory for osc values. enables referencing by other math
	sliderList : [], // stores a list of all sliders in the program. functions may loop through this list to act on all sliders.
	osc_text_list : [],
	currentSliderValue : [],

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
			hogn.sliderList.forEach(function(input){ // frequency slider for each oscillator
				var domInput = document.getElementById(input) // temporary variable to feed into noUiSlider.create()	
				noUiSlider.create(domInput, { // generates the slider
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
		this.sliderList.forEach(function(input){
			var domInput = document.getElementById(input)
			domInput.noUiSlider.set(50);
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
		// console.log(oscGenerateArray)


		this.oscGenerateArray.forEach(function(x){
			// console.log(x)
			var this_panner = x + '_pan';

			hogn[this_panner] = new Tone.Panner(.5).connect(hogn.preMasterVolume); // connect this here
			// console.log(x);
			hogn[x] = new Tone.Oscillator(440, 'sine').connect(hogn[this_panner]).start();
			// console.log( window[x] );
		});
	}, // end generateOscAndPan

	initSliderListeners : function(){  // Initiating pitch control slider event listeners and running requisite functions
		var hogn = harmonyOscillatorsGlobalNamespace;

		var initFreqSlidersListener = function(){ // Initiate slider listeners
			var hogn = harmonyOscillatorsGlobalNamespace;
			hogn.sliderList.forEach(function(input){ // initialize all sliders in hogn.sliderList
				var domInput = document.getElementById(input);
				var sliderId = domInput.id;
				var updateFrequencyInterval = null;

				domInput.noUiSlider.on('update',function(values, handle){ // on slider motion, run below code
					var value = values[handle];
					var formatted_value = (value / 50) - 1; // normalize values into a +/-1 float value
					formatted_value = hogn.scaleLogarithmically(formatted_value, 0.0, 1.0, 0.0, 1.0, 9.0) // scale 0.0 to 1.0 on a log curve at a factor of 2

					// editable values
					var updateFrequencyIntervalTime = 30;
					var msPerOctave = 1000;

					var centsPerInterval = (updateFrequencyIntervalTime * (1200 / msPerOctave) ) // assuming one second per 
					hogn.currentSliderValue[sliderId] = formatted_value;

					var updateFrequency = function(){ // Update frequency 
						var currentSliderValue = hogn.currentSliderValue[sliderId];
						var thisOsc = sliderId.slice(0,5);
						var currentOscValue = hogn.currentOscValues[thisOsc];
						var amountToAdd = currentSliderValue * ( (currentOscValue * Math.pow( 2, ( centsPerInterval /1200) ) ) - currentOscValue);
						var newFreq = currentOscValue + amountToAdd;
						hogn.setOsc(newFreq, thisOsc);
					};

					if (formatted_value > 0 || formatted_value < 0) { // slider movement
						if (updateFrequencyInterval === null){ // if timer is NOT yet set
							updateFrequency();
							updateFrequencyInterval = setInterval(updateFrequency, updateFrequencyIntervalTime);
						}
					}else{ // return to zero
						clearInterval(updateFrequencyInterval);
						updateFrequencyInterval = null;
					};
				});

			});
		};

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
			muteButton.css('background-color', 'grey');
		}else{
			// unmute here
			window.Tone.Master.mute = false;
			muteButton.css('background-color', 'green');
		};

		muteButton.bind('touchstart',function(){
			$(this).css('background-color','red');
		});

		muteButton.bind('mousedown touch', function(){ // click event handler
			if (Tone.Master.mute === true){
				Tone.Master.mute = false;
				$(this).css('background-color', 'green')
			}else{
				Tone.Master.mute = true;
				$(this).css('background-color', 'grey');
			};
		})
	}, // end initMuteButton

	initPanButton : function(){
		var panButton = $('#pan_button');
		var hogn = harmonyOscillatorsGlobalNamespace;
		if (this.initPanSetting === false){ // initial coloring
			panButton.css('background-color', 'grey');
		}else{
			panButton.css('background-color', 'green');
		};

		var setPan = function(input){
			if (input === 'pan'){
				// console.log('set pan');
				hogn.osc_1_pan.pan.value = 0;
				hogn.osc_2_pan.pan.value = 1;

			}else if(input === 'off'){
				// console.log('kill pan');
				hogn.osc_1_pan.pan.value = .5;
				hogn.osc_2_pan.pan.value = .5;

			};
		};

		panButton.bind('touchstart',function(){
			$(this).css('background-color','red');
		});

		panButton.bind('mousedown touch', function(){ // click event handler
			if (hogn.initPanSetting === false){
				$(this).css('background-color', 'green');
				hogn.initPanSetting = true;
				// set panning on here
				setPan('pan');

			}else{
				hogn.initPanSetting = false;
				$(this).css('background-color', 'grey');
				// set panning off here
				setPan('off')

			};

		});
	},

	initCopyFreqButton : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;
		var selector = $('#copy_osc_value');
		selector.bind('mousedown touchstart', function(){
			var osc1value = hogn.currentOscValues['osc_1'];
			console.log(osc1value)
			hogn.setOsc(osc1value, 'osc_2');
			$(this).css('background-color','red')
		});
		$(document).bind('mouseup touchend', function(){
			selector.css('background-color','grey');
		});
	},

	initResetButton : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;
		var selector = $('#reset_button');

		selector.bind('mousedown touchstart', function(){
			$(this).css('background-color','red')
			hogn.setOsc(440, 'osc_1');
			hogn.setOsc(440, 'osc_2');
		});
		$(document).bind('mouseup touchend', function(){
			selector.css('background-color','grey');
		});
	},

	initButtons : function(){
		this.initPanButton();
		this.initCopyFreqButton();
		this.initMuteButton();
		this.initResetButton();
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
			var first_osc_value = parseFloat(hogn.currentOscValues['osc_1']);

			var new_osc_2 = first_osc_value * multiplier;
			console.log(new_osc_2);
			hogn.setOsc(new_osc_2, 'osc_2');
			console.log('test ' + selection_index)
			hogn.setInputText();
		}

		var interval_selects_div = $('#interval_selects_div');

		for( var menu in hogn.intervals){
			var temp_menu_sub_div_id = menu + '_sub_div';
			interval_selects_div.append('<div id=' + temp_menu_sub_div_id + ' class="each_temp_sub_div">') // generate a sub div to contain each temperment name and menu line
			var this_temp_sub_div_selector = $('#' + temp_menu_sub_div_id) // define new id for sub div holding this temperment selection menu

			// Generate select menues for each
			this_temp_sub_div_selector.append(menu.replace(/[_]/g, ' '))
			this_temp_sub_div_selector.append('<select class="interval_menu" id=' + menu + ' name=' + menu + '></select>')
			var this_menu = $('#' + menu);
			for( var interval_name in hogn.intervals[menu]){
				var interval_name_no_underscore = interval_name.replace(/[_]/g, " ")
				this_menu
					.append( $("<option></option>")
						.attr('value', interval_name)
						.text(interval_name_no_underscore) );
			}
			interval_selects_div.append('</div>')
			this_menu.change( selectMenuChange ); // event handler
		}
	}, // end initIntervalFractionSelect

	generateOscContainerDiv : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		this.oscGenerateArray.forEach(function(x){
			var osc_name = x;
			var slider_name = osc_name + '_slider';
				hogn.sliderList.push(slider_name);
			var osc_text = osc_name + '_text';
				hogn.osc_text_list.push(osc_text);

				console.log(osc_name)

			$( '#osc_div' ).append('<div id=' + osc_name + ' class="each_osc_div"><div class="freq_input"><input id=' + osc_text + ' class="freq_input_text" type="text"></div><div id=' + slider_name + ' class="h_slider"></div></div>');
			hogn.initText(osc_text, osc_name);
		});
	}, // end generateOscContainerDiv

	setOsc : function(freq, name){ // this needs to be fixed
		var hogn = harmonyOscillatorsGlobalNamespace;

		if ( $.isNumeric(freq) ){
			// console.log('set osc');
			// console.log(name);
			// console.log(freq);
			hogn.currentOscValues[name] = parseFloat(freq); // dump the value into the global variable
			hogn[name].frequency.value = freq; // this needs help here...
			hogn.setMath(freq, name);
			hogn.setInputText(freq, name)
		};
	},  // end setOsc

	setMath : function(freq, osc_name){
		var hogn = harmonyOscillatorsGlobalNamespace;
		var freqLengthTest = freq.toString().length;
		//console.log(freqLengthTest)

		freq = hogn.summarizeLongDecimals(freq);

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

		var result = hogn.summarizeLongDecimals( Math.abs( osc_1_input - osc_2_input ) );
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
		var domInput = document.getElementById(osc_text);

		var textBind = function(value){

			// console.log('firing the text bind');
			var freq = value;
			// console.log(freq);
			hogn.setOsc(freq, osc_name);
			hogn.setInputText(freq, osc_name);
		} // end textBind

		// initial page load listener
		$(document).bind('ready', function(){
			$(domInput).val('440'); // set to default frequency
			textBind( $(domInput).val() );
		});
		// litener for text changes
		$(domInput).bind('change paste keyup', function(){
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
	hogn.initIntervalFractionSelect();

	hogn.testingInitValues(); // set up faders for auto load. this is not how the userw will interact
	
	Tone.Master.mute = true;

	hogn.initButtons();

	// hogn.initMuteButton();

	// console.log(Tone.Master)
	// console.log(Tone.Master)

	hogn.resizeWindow();
	$(window).resize(function(){
		hogn.resizeWindow();
	});
});