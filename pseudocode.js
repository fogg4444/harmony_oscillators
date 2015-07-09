

// associating slider names with oscillator names
var map = {
	'slider_1': 'osc_1',
	'slider_2': 'osc_2'
}



function counter(slider_name, incDecValue){

	var osc_name = map.slider_name // associating the slider name with the osc it should control
	
	slider_name = clearInterval() // clearing the last timer that was set

	if (incDecValue !== undefined){                  // if there is a value present in incDecValue, generate the addition interval
		slider_name = setInterval(function(){
			slider_name.frequency.value += ( 500 * incDecValue )  // bit of math to increase or decrease the tune
		}, 500)													  // do it every 500ms. can be adjusted to taste
	}
}


// I think I want this function to regenerate the setInterval anew each time
// you move the sliders. If you hold the slider say 50% to the right of center,
// it should be constantly sending a incDecValue of .5 .  This would then be multiplied
// by 500 leading to an oscillator tone shift of +250 hz. If the slider is held in exactly this
// position for another 500ms it will send another +250hz.

// setting frequcncies is done like this: slider_1.frequency.value = x
// 
// just realizing that my frequency variables are in the $(document).ready  scope...
// that's probably a problem for this function if it's out in the general scope
//
// I also have not yet installed the map variable. 