var dingUrl = "https://cdn.rawgit.com/halimb/threejs-projects/938241fc/pomodoro/sound/ding.mp3";
var ding = new Audio(dingUrl);
var canvas = document.getElementById("cnv");
var ctx = canvas.getContext("2d");
var outerWidth = window.outerWidth;
var h = window.innerWidth * .5;
var w = window.innerWidth * .75;
canvas.height = h;
canvas.width = w;
ctx.lineWidth = 2;

//CLock 
function Clock() {

	this.startTime = 0;
	this.oldElapsed = 0
	this.elapsed = 0;
	this.running = false;

	this.start = function() {
		if(!this.running){
			this.startTime = Date.now();
			this.running = true;
		}
	}
	this.pause = function() {
		this.running = false;
		this.oldElapsed = this.elapsed;
	}

	this.reset = function() {
		this.running = false;
		this.elapsed = 0;
		this.oldElapsed = 0;
	}

	this.getElapsedTime = function() {
		if(this.running) {
			this.elapsed = (Date.now() - this.startTime) + this.oldElapsed;
		}
		return this.elapsed / 60000;//Math.floor(this.elapsed / 1000);
	}
}

var clear = true;
var work = true;
var workTime = document.getElementById("work-mn").innerHTML;
var restTime = document.getElementById("rest-mn").innerHTML;
var clicked = false;
var timeout = 0;
var delay = 300;

//right and left circles centerS coordinates
var xr = w * 3 / 4;
var xl = w / 4; 
var y = h / 2;
var totRadius =  w / 4;
var minRadius = w / 9;
var maxRadius = w / 5;
var wRadius, rRadius, ringWidth, fRingWidth, totWidth;

var circleColor = "#000000";
var ringColor = "#000000";
var focusColor = "#BADA55";
var bgColor = "#F9F9F9";


var timer, previous, firstIter;
var start = document.getElementById('start');
var pause = document.getElementById('pause');
var reset = document.getElementById('reset');

var fontLoaded = false;
var robotoFont = new FontFace("Roboto-Thin", "url('https://cdn.rawgit.com/halimb/threejs-projects/1ba18e17/pomodoro/models/Roboto-Thin.ttf')");
robotoFont.load().then(
  function(){
    document.fonts.add(robotoFont);
    fontLoaded = true;
  }, 
  function(message) {
    console.log(message);
  });

start.onclick = function() {
	clear = false;
	timer.start();
}

pause.onclick = function() {
	timer.pause();
}

reset.onclick = function() {
	clear = true;
	work = true;
	timer.reset();
	resetCanvas();
}

init();

function init() {
	resetCanvas();
	timer = new Clock();
	refreshText();
	anim();
}

window.onresize = function() {
		outerWidth = window.outerWidth;
		h = window.innerWidth * .5;
		w = window.innerWidth * .75;
		canvas.height = h; 
		canvas.width = w;
		xr = w * 3 / 4;
		xl = w / 4; 
		y = h / 2;
		totRadius =  w / 4; 
		minRadius = w / 9;
		maxRadius = w / 5;
		resetRadius();
}

document.onmouseup = function() {
	clicked = false;
	delay = 300;
}

var workDisplay = document.getElementById("work-mn");
var restDisplay = document.getElementById("rest-mn");
var btnWorkUp =  document.getElementById("work-up");
var btnRestUp = document.getElementById("rest-up");
var btnWorkDown = document.getElementById("work-down");
var btnRestDown = document.getElementById("rest-down");

btnWorkUp.addEventListener("mouseenter", 
		function() { clicked = true; }); 
btnWorkUp.addEventListener("mouseleave", 
		function() { clicked = false;});

btnWorkDown.addEventListener("mouseenter", 
		function() { clicked = true; }); 
btnWorkDown.addEventListener("mouseleave", 
		function() { clicked = false;});

btnRestUp.addEventListener("mouseenter", 
		function() { clicked = true; }); 
btnRestUp.addEventListener("mouseleave", 
		function() { clicked = false;});

btnRestDown.addEventListener("mouseenter", 
		function() { clicked = true; }); 
btnRestDown.addEventListener("mouseleave", 
		function() { clicked = false;});

btnWorkUp.onmousedown = function(){clicked = true; workUp()};
btnWorkDown.onmousedown = function(){clicked = true; workDown();}
btnRestUp.onmousedown = function(){clicked = true; restUp();}
btnRestDown.onmousedown = function(){clicked = true; restDown();}

function workUp() {
	if(workTime < 100 && clicked) {
		workTime++;
		workDisplay.innerHTML = workTime;
		resetRadius();
		delay *= (delay > 50) ? .85 : 1;
		timeout = window.setTimeout(workUp, delay);
	}
	else {
		window.clearTimeout(timeout);
	}
}

function workDown() {
	if(workTime > 1 && clicked) {
		workTime--;
		workDisplay.innerHTML = workTime;
		resetRadius();
		if(clicked) {
			delay *= (delay > 50) ? .85 : 1;
			timeout = window.setTimeout(workDown, delay);
		}
		else {
			window.clearTimeout(timeout);
		}
	}
}

function restUp() {
	if(restTime < 100 && clicked) {
		restTime++;
		restDisplay.innerHTML = restTime;
		resetRadius();
		delay *= (delay > 50) ? .85 : 1;
		timeout = window.setTimeout(restUp, delay);
	}
	else {
		window.clearTimeout(timeout);
	}
}

function restDown() {
	if(restTime > 1 && clicked) {	
		restTime--;
		restDisplay.innerHTML = restTime;
		resetRadius();
		delay *= (delay > 50) ? .75 : 1;
		timeout = window.setTimeout(restDown, delay);
	}
	else {
		window.clearTimeout(timeout);
	}	
}

function correctRadius(radius) {
	var res = radius;
	if(radius < minRadius) {
		res = minRadius;
	}
	else if(radius > maxRadius) {
		res = maxRadius;
	}
	return res;
}

function resetRadius() {
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, w, h);
	var wrkExp = Math.sqrt(workTime);
	var rstExp = Math.sqrt(restTime);
	var totExp = wrkExp + rstExp;
	wrkExp /= totExp;
	rstExp /= totExp;
	wRadius = correctRadius(wrkExp * totRadius);
	rRadius = correctRadius(rstExp * totRadius);
	ringWidth = wRadius < rRadius ? wRadius / 9 : rRadius / 9;
	fRingWidth = ringWidth / 2;
	totWidth = ringWidth + fRingWidth;
	drawSide(1);
	drawSide(0); 
}

function fillPie(right, color, angle) {
	var radius = right ? wRadius : rRadius;
	radius = correctRadius(radius);
	var a = right ? xr : xl;
	var b = y;
	ctx.beginPath();
	var theta = angle ? angle : 1;
	ctx.moveTo(a, b);
	ctx.lineTo(a, b + radius);
	ctx.arc(a, b, radius,  - Math.PI / 2,(4 * angle - 1) * Math.PI / 2);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
}

function drawRing(width, padding, color, right) {
	var x = right ? xr : xl;
	var init = right ? wRadius : rRadius;
	init = correctRadius(init);
	init += padding;
	ctx.strokeStyle = color;
	ctx.beginPath();
	for(var i = init; i < init + width; i += .25) {
		ctx.arc(x, y, i, 0, 2 * Math.PI);
	}	
	ctx.closePath();
	ctx.stroke();
}

function getColor(x, work) {
	var r = work ? 180 : 255;
	var g = work ? 210 : 183;
	var b = work ? 85 : 77;
	r = Math.round(Math.abs(r * Math.sin(x * Math.PI)));
	g = Math.round(Math.abs(g * Math.sin(x * Math.PI)));
	b = Math.round(Math.abs(b * Math.sin(x * Math.PI)));
	var color = "rgb(" + r + "," + g + "," + b + ")";
	return color;
}

function resetSide(right) {
	clearSide(right);
	drawSide(right);
}

function drawSide(right) {
	drawRing(ringWidth, 0, ringColor, right);
	if(clear) {
		displayRem(right, 
			(right ? workTime : restTime));
	}
	else {
		clearSide(!work);
		drawRing(ringWidth, 0, ringColor, !work);
		displayRem(!work, work ? restTime : workTime);
	}
}

function clearSide(right) {
	var x, r, a, b, dim;
	var offset = 2;
	if(right) {
		r = wRadius + totWidth + offset;
		x = xr - offset / 2;
	}

	else {
		r = rRadius + totWidth + offset;
		x = xl - offset / 2;
	}

	a = x - r;
	b = y - r;
	dim = 2 * r;

	ctx.fillStyle = bgColor;
	ctx.fillRect(a, b, dim, dim);
}

function resetCanvas() {
	resetRadius();
	resetSide(1);
	resetSide(0); 
	previous = 0;
	firstIter = true
}

function displayRem(wrk, value) {
  var font = fontLoaded ? "Roboto-Thin" : "Arial";
  if (font == "Roboto-Thin") {console.log("loaded ! !  !")}
  else {console.log("not loaded...")}
	var formatted = formatTime(value);
	var fontSize = wrk ? 2 * wRadius / 3 : 2 * rRadius / 3;
	if(formatted.length > 9) {
		fontSize /= 2.5;
	}
	else if(formatted.length >= 6) {
		fontSize /= 2;
	}
  if(font == "Arial") {
    fontSize *= .85;
  }
	var xpos = wrk ? xr : xl;
	ctx.globalCompositeOperation = "difference";
	ctx.fillStyle = "#ffffff";
	ctx.font = fontSize + "px " + font;
	ctx.textAlign = "center";
	ctx.fillText(formatted, xpos, y + fontSize / 4);
	ctx.globalCompositeOperation = "source-over";
}

function formatTime(mins) {
	var hours = Math.floor(mins / 60);
	var minutes = Math.floor(mins % 60);		
	var secs = (mins - Math.floor(mins)) * 60;
	hours = (hours > 0) ? (hours + "h") : "";
	minutes = (minutes > 0) ? (minutes + "mn") : "";
	secs = (secs > 0) ? 
		(parseFloat(secs).toFixed(1) + "s") : "";
	return (hours + minutes + secs);
}

function refreshText() {
	if(fontLoaded) {
		resetSide(1);
		resetSide(0); 
	}
  else {
		timeout = window.setTimeout(refreshText, 1500);
  }
}

function anim() {
	if(timer.running) {
		var elapsed = timer.getElapsedTime();
		var interval = elapsed - previous;
		if(interval > .0001) {
			previous = elapsed;
			var remTime, totalTime, radius, message;

			if(work) {
				radius = wRadius;
				totalTime = workTime;
				message = "remaining work time = " + remTime;
				x = xr;
			}

			else {
				radius = rRadius;
				totalTime = restTime;
				message = "remaining rest time = " + remTime;
				x = xl;
			}

			//reset the inactive side of the canvas
			if(firstIter) {	
					resetSide(!work);
					firstIter = false;
			}

			focusColor = getColor(elapsed * 60, work);
			remTime = totalTime - elapsed;

			if(remTime > 0) {
				resetSide(work);
				fillPie(work, circleColor, elapsed / totalTime);
				drawRing(fRingWidth, ringWidth, focusColor, work);
				displayRem(work, remTime);
			}

			else {
				ding = new Audio(dingUrl);
				ding.play();
				firstIter = true;
				fillPie(work, circleColor, 1);
				previous = 0;
				work = !work;
				timer.reset();
				timer.start();
			}
		}
	}
	requestAnimationFrame(anim);
}
