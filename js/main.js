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
		var hogn = harmonyOscillatorsGlobalNamespace;
		var window_height_px = $(window).outerHeight(true)  + "px";
		$("#wrap").css('height', window_height_px);
		
		hogn.renderCanvas();
	}, // end resize Window
	
	intervals : {
		'Just_Intonation' : {
			'Unison' 		 : ['1/1',   1/1   ],
			'Minor_Second'   : ['16/15', 16/15 ],
			'Major_Second'   : ['9/8',   9/8   ],
			'Minor_Third'    : ['6/5',   6/5   ],
			'Major_Third'    : ['5/4',   5/4   ],
			'Perfect_Fourth' : ['4/3',   4/3   ],
			'Tritone'        : ['7/5',   7/5   ],
			'Perfect_Fifth'  : ['3/2',   3/2   ],
			'Minor Sixth'    : ['8/5',   8/5   ],
			'Major_Sixth'    : ['5/3',   5/3   ],
			'Minor_Seventh'  : ['16/9',  16/9  ],
			'Major_Seventh'  : ['15/8',  15/8  ],
			'Octave'         : ['2/1',   2/1   ]
		},
		'Equal_Temperment' : {
			'Unison' 		 : ['2^(0/12)',  Math.pow( 2, (0/12)  ) ],
			'Minor_Second'   : ['2^(1/12)',  Math.pow( 2, (1/12)  ) ],
			'Major_Second'   : ['2^(2/12)',  Math.pow( 2, (2/12)  ) ],
			'Minor_Third'    : ['2^(3/12)',  Math.pow( 2, (3/12)  ) ],
			'Major_Third'    : ['2^(4/12)',  Math.pow( 2, (4/12)  ) ],
			'Perfect_Fourth' : ['2^(5/12)',  Math.pow( 2, (5/12)  ) ],
			'Tritone'        : ['2^(6/12)',  Math.pow( 2, (6/12)  ) ],
			'Perfect_Fifth'  : ['2^(7/12)',  Math.pow( 2, (7/12)  ) ],
			'Minor Sixth'    : ['2^(8/12)',  Math.pow( 2, (8/12)  ) ],
			'Major_Sixth'    : ['2^(9/12)',  Math.pow( 2, (9/12)  ) ],
			'Minor_Seventh'  : ['2^(10/12)', Math.pow( 2, (10/12) ) ],
			'Major_Seventh'  : ['2^(11/12)', Math.pow( 2, (11/12) ) ],
			'Octave'         : ['2^(12/12)', Math.pow( 2, (12/12) ) ]
		}
	},

	initPanSetting : false, // true === binaural, false === matched - used for testing.
	initMuteSetting : true, // true === muted, false === unmuted
	oscGenerateArray : ['osc_1','osc_2'], // initiates creation of oscillators and divs to contain them
	currentOscValues : {}, // global memory for osc values. enables referencing by other math
	sliderList : [], // stores a list of all sliders in the program. functions may loop through this list to act on all sliders.
	oscTextList : [],
	currentSliderValue : [],
	intervalSelectMenuList : [],
	// colors for the first two waveforms
	oscColors : ['#FF0000','#0099FF'],
	willRenderCanvas : true,

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

						hogn.resetIntervalSelectMenu(); // finally, reset all the interval select menus as they are no longer theoretically correct
						hogn.clearIntervalMath();
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

				}); // end domInput.noUiSlider.on('update'...
			}); // end hogn.sliderList.forEach(...
		}; // end initFreqSlidersListener()

		var initMasterVolumeSliderListener = function(){
			var masterVolumeFader = document.getElementById('master_volume_div');
			masterVolumeFader.noUiSlider.on('update', function(values, handle){
				var normalized_slider_value = hogn.floatToDb( values / 100 );
				hogn.preMasterVolume.volume.value = normalized_slider_value;
			});
		};

		initFreqSlidersListener();
		initMasterVolumeSliderListener();
		// initCanvasZoomSliderListener();
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
			hogn.clearIntervalMath();
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

	clearIntervalMath : function(){
		$('#interval_math').html('');
	},

	initIntervalFractionSelect : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		var selectMenuChange = function(){

			var thisMenuId = $(this).context.id;
			var selectionKey = $(this).val();
			var selectionIndexString = hogn.intervals[this.id][selectionKey][0];
			var intervalMultiplicationFactor = hogn.intervals[this.id][selectionKey][1];
			var firstOscValue = parseFloat(hogn.currentOscValues['osc_1']); // get and store value of osc_1

			console.log('selectionIndexString: ', selectionIndexString);
			console.log('intervalMultiplicationFactor: ', intervalMultiplicationFactor);
			console.log('thisMenuId: ', thisMenuId);
			console.log('selectionKey: ', selectionKey);
			console.log('firstOscValue: ',firstOscValue);

			// multiply firstOscValue by intervalMultiplicationFactor
			var newOsc2Value = firstOscValue * intervalMultiplicationFactor;
			console.log(newOsc2Value)

			// drop selection index string into interval math display
			$('#interval_math').html(firstOscValue + ' * ' + '( ' + selectionIndexString + ' ) = ' +  newOsc2Value);


			// set the oscillator
			hogn.setOsc(newOsc2Value, 'osc_2');

			// reset all menus except 'thisMenuId'
			hogn.resetIntervalSelectMenu(thisMenuId);
		}

		var interval_selects_div = $('#interval_selects_div'); // choose where to put these selection menus

		for( var menu in hogn.intervals){ // Generate sub_div to contain each temperment selection menu line
			var temp_menu_sub_div_id = menu + '_sub_div';
			interval_selects_div.append('<div id=' + temp_menu_sub_div_id + ' class="each_temp_sub_div">') // generate a sub div to contain each temperment name and menu line
			var this_temp_sub_div_selector = $('#' + temp_menu_sub_div_id) // define new id for sub div holding this temperment selection menu

			// append each menu id into global intervalSelectMenuList
			hogn.intervalSelectMenuList.push(menu);

			// Generate select menues for each
			this_temp_sub_div_selector.append(menu.replace(/[_]/g, ' '))
			this_temp_sub_div_selector.append('<select class="interval_menu" id=' + menu + ' name=' + menu + '></select>')
			var this_menu = $('#' + menu);

			// append 'seelct interval' text as first entry in drop down'
			this_menu.append( $("<option></option>").text('Select Interval'));

			// append values from 'intervals' object into select respective menus
			for( var interval_name in hogn.intervals[menu]){
				var interval_name_no_underscore = interval_name.replace(/[_]/g, " ")
				this_menu
					.append( $("<option value='initial_value' ></option>")
						.attr('value', interval_name)
						.text(interval_name_no_underscore) );
			}
			interval_selects_div.append('</div>')
			this_menu.change( selectMenuChange ); // event handler
		}
	}, // end initIntervalFractionSelect

	resetIntervalSelectMenu : function(selected_menu){ // incoming variable is usually the menu making the selection. reset all others. if no variable, reset all.
		var hogn = harmonyOscillatorsGlobalNamespace;
		var menusToReset = hogn.intervalSelectMenuList.slice(0); // clone intervalSelecMenuList into new local variable

		if (selected_menu !== undefined){
			// we are passed an argument. Reset all menus but the 'selected_menu'
			// eliminate 'selected_menu' from 'menusToReset'
			var indexOfSelectedMenu = menusToReset.indexOf(selected_menu);
			// delete selected_menu from menusToReset using indexOfSelectedMenu index number
			menusToReset.splice(indexOfSelectedMenu, 1); // splice at indexOfSelectedMenu position. only splice out one array entry
		};

		for(var menu in menusToReset){ // iterate through the array and reset menus
			var this_menu = menusToReset[menu]; // shortcut
			document.getElementById(this_menu).selectedIndex = 0; // find all menus and reset them to first index position value
		};
	},// end resetIntervalSelectMenu

	generateOscContainerDiv : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;

		var i = 0;
		this.oscGenerateArray.forEach(function(x){
			var osc_name = x;
			var slider_name = osc_name + '_slider';
				hogn.sliderList.push(slider_name);
			var osc_text = osc_name + '_text';
				hogn.oscTextList.push(osc_text);

			$( '#osc_div' ).append('<div id=' + osc_name + ' class="each_osc_div"><div class="freq_input"><input id=' + osc_text + ' class="freq_input_text" type="text"></div><div id=' + slider_name + ' class="h_slider"></div></div>');
			$('#' + osc_text).css('border', 'solid 2px' + hogn.oscColors[i]);
			console.log(hogn.oscColors[i]);
			i = i + 1; // increment counter
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
			hogn.renderCanvas();
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
	},

	oscCanvas : 0,
	oscContext : 0,

	initCanvasZoomSlider : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;
		// console.log('init canvas slider');
		$('#oscilliscope_zoom_div').append('<div id="canvasZoomSlider"></div>');
		// hogn.sliderList.push()
		var zoomSlider = document.getElementById('canvasZoomSlider');
		noUiSlider.create(zoomSlider, {
			start: [50],
			connect: false,
			range: {
				'min': 0,
				'max': 100
			}
		});

		var initCanvasZoomSliderListener = function(){
			var canvasZoomSlider = document.getElementById('canvasZoomSlider');
			console.log(canvasZoomSlider);
			canvasZoomSlider.noUiSlider.on('update', function(values, handle){
				console.log('test zoom resonse');
				console.log(values, handle);
				
			});
		};
		initCanvasZoomSliderListener();
	},

	renderCanvas : function(){
		var hogn = harmonyOscillatorsGlobalNamespace;
		
		if (hogn.willRenderCanvas === true){

			// don't run unless there are two values in currentOscValues
			var currentOscValuesArray = [];
			for (var osc in hogn.currentOscValues){
				currentOscValuesArray.push(hogn.currentOscValues[osc]);
			}
			if (currentOscValuesArray.length < 2){
				return;
			};

			// assign oscDiv to specified dom element with jquery
			var oscDiv = $('#oscilloscope_div');

			// clear canvas from oscilliscope div
			oscDiv.empty();
			
			// easier names for canvas positions
			var canvasWidth = oscDiv[0].scrollWidth;
			var canvasHeight = oscDiv[0].scrollHeight;
			var canvasVerticalCenter = (canvasHeight / 2);
			var canvasHorizontalCenter = (canvasWidth / 2);
			var canvasTop = 0;
			var canvasBottom = canvasHeight;
			var canvasLeft = 0;
			var canvasRight = canvasWidth;
			var canvasCurveHeignt = ((canvasHeight / 2) * .9) ;

			// insert canvas element into oscilliscope_div
			oscDiv.html('<canvas width='+ canvasWidth +' height='+ canvasHeight +' id="oscilloscope_canvas"></div>');

			// init canvas
			hogn.oscCanvas = document.getElementById('oscilloscope_canvas');
			hogn.oscContext = hogn.oscCanvas.getContext("2d");

			hogn.oscContext.clearRect(0, 0, canvasWidth, canvasHeight);
			hogn.oscContext.fillRect(0, 0, canvasWidth, canvasHeight); // black background

			// white horizontal centerline
			hogn.oscContext.beginPath();
			hogn.oscContext.moveTo(canvasLeft, canvasVerticalCenter);
			hogn.oscContext.lineTo(canvasRight, canvasVerticalCenter);
			hogn.oscContext.strokeStyle = "#FFFFFF";
			hogn.oscContext.stroke();

			// function to draw a waveform
			var drawWaveShape = function(numberOfCompleteWaves, color){
				var numberOfAmplitudePeaks = numberOfCompleteWaves * 2;
				var numberOfLoopRuns = Math.ceil(numberOfAmplitudePeaks);
				var pointsPerAplitudePeak = canvasWidth / numberOfAmplitudePeaks;
				var waveCanvasXStartPosition = 0; // initiate starting position at
				var waveAmplitude = .8;

				hogn.oscContext.beginPath();
				hogn.oscContext.moveTo(canvasLeft, canvasVerticalCenter); // start all waves at canvas left on zero line

				var drawQuadraticCurve = function(posOrNeg){
					hogn.oscContext.beginPath();
					hogn.oscContext.moveTo(waveCanvasXStartPosition, canvasVerticalCenter);
					
					var controlX = waveCanvasXStartPosition + (pointsPerAplitudePeak / 2);
					if (posOrNeg === true){ // wave peak is positive
						var controlY = (-canvasVerticalCenter) * waveAmplitude;
					}else{ // wave peak is negative
						var controlY = canvasHeight + (canvasVerticalCenter * waveAmplitude)
					};
					var endX = waveCanvasXStartPosition + pointsPerAplitudePeak;
					var endY = canvasVerticalCenter;

					hogn.oscContext.quadraticCurveTo(controlX, controlY, endX, endY);
					hogn.oscContext.strokeStyle = color;
					hogn.oscContext.stroke();

					waveCanvasXStartPosition = waveCanvasXStartPosition + pointsPerAplitudePeak;
				};

				for(var i = 1; i <= numberOfLoopRuns; i++){ // run for loop for each aplitude peak. idexed at 1.
					if ( (i % 2)===0 ){ // check if divisible by two
						drawQuadraticCurve(false) // draw negative peak wave
					}else{
						drawQuadraticCurve(true) // draw positive peak wave
					};
				};
			};

			// // Put smaller frequency on top visual layer
			// take currentOscValuesArray and put it into sortable array 'sortableOscValues'
			var sortableOscValues = [];

			for (var osc in hogn.currentOscValue){
				console.log(hogn.currentOscValues)

				sortableOscValues.push( hogn.currentOscValues );
			};
			// sort this arrray by numerical value of the oscillator value.
			sortableOscValues.sort( function(a,b){return a[1] - b[1]} );
			// console.log(sortableOscValues);

			// Factor osc values
			var oscValue1 = currentOscValuesArray[0];
			var oscValue2 = currentOscValuesArray[1];
			var osc1DivByosc2 = oscValue1 / oscValue2;

			// TODO

			// the waveforms need to correspond in color to their appropriate oscValue.
			// collect osc name and osc value together in one sub array. should be in sortableOscValues.

			// process these together and associate colors with oscName somehow in the for loop below.

			var loopIndex = 0;
			for (var oscName in hogn.currentOscValues){
				var oscValue = hogn.currentOscValues[oscName];
				var thisColor = hogn.oscColors[loopIndex];
				drawWaveShape(oscValue, thisColor) // This is the command which draws the colored waveform
				loopIndex = loopIndex + 1;
			}; // end drawWaveShap loop
		};// end if_statement on whole function
	}, // end renderCanvas
}; // End harmonyOscillatorsGlobalNamespace


$(document).ready(function(){
	// console.log("document ready");
	var hogn = harmonyOscillatorsGlobalNamespace;

	Tone.Master.mute = true;

	hogn.generateOscContainerDiv();
	hogn.initMouseTouchUp();
	hogn.initSliders();
	hogn.generateOscAndPan();
	hogn.initIntervalFractionSelect();
	hogn.willRenderCanvas = false;
	// hogn.initCanvasZoomSlider();
	hogn.initSliderListeners();

	hogn.testingInitValues(); // set up faders for auto load. this is not how the users will interact
	Tone.Master.mute = true;
	hogn.initButtons();
	

	hogn.resizeWindow();

	$(window).resize(function(){
		hogn.resizeWindow();
	});
});