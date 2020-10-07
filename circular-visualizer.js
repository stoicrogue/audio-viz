$(document).ready(function() {
var canvas, ctx, center_x, center_y, radius, bars, 
    x_end, y_end, bar_height, bar_width,
    frequency_array, source, audio, base_height, bar_multiplier,
    min_dimension;
 
bars = 215;
bar_width = 3;
// radius = 150;

$("#play-btn").on("click", function() { start(); });
$("#stop-btn").on("click", function() { stop(); });
// $("#update-btn").on("click", function() { updateSettings(); });
$("#song").on("change", function() { start(); });
$("#numberOfBars").slider({
      orientation: "horizontal",
      range: 10,
      max: 300,
      step: 5,
      value: bars,
      change: updateSettings
    });
$("#barWidth").slider({
      orientation: "horizontal",
      range: 1,
      max: 12,
      value: bar_width,
      change: updateSettings
    });

initCanvas();
 
function start(){
    stop();
    updateSettings();
    
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    context = new (window.AudioContext || window.webkitAudioContext)();
    analyser = context.createAnalyser();
    audio.src = "songs/" + $("#song").val(); // the source path
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
 
    frequency_array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequency_array);
    
    audio.play();
    animationLooper();
}

function stop() {
    if (!!audio) {
        console.log(frequency_array);
        audio.pause();
        audio.currentTime = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
 
function animationLooper(){
    initCanvas();
    
    analyser.getByteFrequencyData(frequency_array);

    var pointsPerBar = Math.floor(analyser.frequencyBinCount / bars);
    
    for(var i = 0; i <= bars; i++){
        //divide a circle into equal parts
        rads = Math.PI * 2 / bars;
        
        var totalFrequency = 0;
        var avgFrequency = 0;

        for (var j = 0; j <= pointsPerBar; j++) {
            totalFrequency += frequency_array[(i*pointsPerBar)+j];
        }

        avgFrequency = totalFrequency / pointsPerBar;

        bar_height = (avgFrequency*bar_multiplier);

        // set coordinates
        x = center_x + Math.cos(rads * i) * (radius);
        y = center_y + Math.sin(rads * i) * (radius);
        x_end = center_x + Math.cos(rads * i)*(radius + bar_height);
        y_end = center_y + Math.sin(rads * i)*(radius + bar_height);

        //draw a bar
        drawBar(x, y, x_end, y_end, bar_width,frequency_array[i]);
    }
    window.requestAnimationFrame(animationLooper);
}
 
// for drawing a bar
function drawBar(x1, y1, x2, y2, width,frequency){
    
    var lineColor = "rgb(" + frequency + ",126,255)";
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function updateSettings() {
    bars = $("#numberOfBars").slider("value");
    bar_width = $("#barWidth").slider("value");
    updateSliderLabels();
    //radius = $("#radius").val();
}

function updateSliderLabels() {
    $("#barNumberSliderLabel").text($("#numberOfBars").slider("value"));
    $("#barWidthSliderLabel").text($("#barWidth").slider("value"));
}

function initCanvas() {
    // set to the size of device
    canvas = $("#renderer")[0];
    canvas.width = window.innerWidth * .70;
    canvas.height = window.innerHeight - 60;
    ctx = canvas.getContext("2d");

    // style the background
    var gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0, "rgba(201, 1, 126, 1)");
    gradient.addColorStop(1, "rgba(16, 4, 86, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // find the center of the window
    center_x = canvas.width / 2;
    center_y = canvas.height / 2;

    min_dimension = (center_x <= center_y ? center_x : center_y);
    radius = min_dimension * .25;
    base_height = min_dimension - (radius * .75);
    bar_multiplier = 1 / ((25500/base_height)/100);

    //draw a circle
    var lineColor = "rgb(254,6,259)";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(center_x,center_y,radius,0,2*Math.PI);
    ctx.stroke();
}
});