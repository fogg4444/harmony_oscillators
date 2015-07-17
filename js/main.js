

	function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function resizeWindow(){ // keeping the css height at 100%
		var window_height_px = $(window).outerHeight(true)  + "px";
		$("#wrap").css('height', window_height_px);
	}


	var osc_count = 2;
	var osc_list = [];
	var slider_list = []; // stores a list of all sliders in the program. functions may loop through this list to act on all sliders.
	var osc_text_list = [];



	function initSliders(){
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

	function resetSlider(){
		console.log('reset slider');
		slider_list.forEach(function(input){
			var dom_input = document.getElementById(input)
			dom_input.noUiSlider.set(50);
		});
	}

	function initMouseTouchUp(){
		$(document.body).bind('mouseup touchend', function(){ // bind any completion of input to slider reset function
			resetSlider();
		});
	}

	function generateOscAndPan(){
		osc_list.forEach(function(x){
			var this_panner = x + '_pan';

			window[this_panner] = new Tone.Panner(.5).toMaster();
			// console.log(x);
			window[x] = new Tone.Oscillator(440, 'sine').connect(window[this_panner]).start();
			// console.log( window[x] );
		});
	}

	function initSliderListener(){
		// console.log(slider_list)
		slider_list.forEach(function(input){ // run through all sliders in sliders list
			// console.log(input);
			var dom_input = document.getElementById(input)
			// console.log(dom_input);
			var this_id = dom_input.id

			dom_input.noUiSlider.on('update',function(values, handle){
				var value = values[handle];
				var id = this_id;
				value = (value / 50) - 1; // normalize values into a +/-1 float value
				// console.log(value, id)
				// counter(id, value); // send all the nicely formatted data off the the counter function
			});
		});
	}

	function counter(id, value){
		console.log(id, value);

	}


$(document).ready(function(){
	console.log("document ready");

	function generateOscWorldHTML(){

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

	function initText(osc_text, osc_name){

		var dom_input = document.getElementById(osc_text);
		$(dom_input).val('440'); // set to default frequency

		$(dom_input).bind('change paste keyup', function(){ // bind any change in the text input to a function
			console.log(osc_name);
			var freq = $(this).val();
			setOsc(freq, osc_name);
		});

		function setOsc(freq, name){ // this needs to be fixed
			if ( $.isNumeric(freq) ){
				console.log('set osc');
				console.log(name)
				console.log(freq)
				window[name].frequency.value = freq; // this needs help here...
			};
		}
	}

	generateOscWorldHTML();

	initMouseTouchUp();
	initSliders();
	generateOscAndPan();
	initSliderListener();

	console.log(osc_1.frequency.value);
	// console.log(osc_2);

	// osc_1.frequency.value = 500;

	resizeWindow();
	$(window).resize(function(){
		resizeWindow();
	});
})









