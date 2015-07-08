function resizeWindow(){
	var window_height_px = $(window).outerHeight(true)  + "px"
	$("#wrap").css('height', window_height_px)
}

function initSliders(){
	var slider_1 = document.getElementById('slider_1')
	var slider_2 = document.getElementById('slider_2')
	noUiSlider.create(slider_1, {
		start: [50],
		range: {
			'min': 0,
			'max': 100
		}
	});
	noUiSlider.create(slider_2, {
		start: [50],
		range: {
			'min': 0,
			'max': 100
		}
	});

	function getSliderValue(value, id){
		var new_val = id.noUiSlider.get()
		var slider_name = id.id
		incrementDecrement(slider_name, new_val)
	}

	// this is a mess. I'm in a hurry. this nouislider api is a bit fiddly
	// sections handles updating
	slider_1.noUiSlider.on('update', function(array, x, value){
		getSliderValue(value, slider_1)
	})
	slider_2.noUiSlider.on('update', function(array, x, value){
		getSliderValue(value, slider_2)
	})
}


function incrementDecrement(slider_name, new_val){
	normalized50 = (new_val - 50) / 50 // get down to a -1, +1 float variable
	
	if (normalized50 > 0 || normalized50 < 0) {
		// console.log('greater or less than ' + normalized50)
		counter(slider_name, normalized50)
	} else {
		// console.log('zero')
		counter(slider_name)
	}
}

// Here's the problem spot.
function counter(slider_name, incDecValue){		
	// clearInterval(slider_name)
	console.log('stop: '+ slider_name +" -- " +  incDecValue)
	if (incDecValue !== undefined) {
		console.log('go:   '+ slider_name + " -- " + incDecValue)
		// slider_name = setInterval(function(){ console.log('interval running' + incDecValue)}, 500)
	}
}

function resetSliders(){
	slider_1.noUiSlider.set(50)
	slider_2.noUiSlider.set(50)
}

function initMouseTouchUp(){
	console.log('mouse touch up')
	$(document.body).on('mouseup', function(){
		resetSliders()
	})
	$(document.body).on('touchend', function(){
		resetSliders()
	})
}

function initMuteButton(){ // this will be a mute button
	$('#start').on('mousedown', function(){
		console.log('start')
	})
	$('#stop').on('mousedown', function(){
		console.log('stop')
	})
}

$(document).ready(function(){

	function initText(id){
		$('#osc_1_text').val('440')
		$('#osc_2_text').val('440')

		function setOsc(id, freq){
			var new_freq = freq
			if ( $.isNumeric(new_freq) ) {
				id.frequency.value = new_freq
			}
		}

		$("#osc_1_text").bind("change paste keyup", function() {
			//console.log( $(this).val() )
			setOsc(osc_1, $(this).val())
		});
		$("#osc_2_text").bind("change paste keyup", function() {
			setOsc(osc_2, $(this).val())
		});
	}

	console.log("document ready");

	// add fullscreen button

	resizeWindow()
	initSliders()
	initMouseTouchUp()
	initMuteButton()
	initText()

	// generating oscillators and handling signal flow through panners
	var pan_L = new Tone.Panner(0)
	var pan_R = new Tone.Panner(1)
	var osc_1 = new Tone.Oscillator(440, "sine").connect(pan_L).start()
	var osc_2 = new Tone.Oscillator(440, "sine").connect(pan_R).start()
	pan_L.toMaster()
	pan_R.toMaster()







	// osc_1.frequency.value = 500

	$(window).resize(function(){
		resizeWindow()
	})



})