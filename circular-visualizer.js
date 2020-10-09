$(document).ready(function() {
var canvas, ctx, center_x, center_y, radius, bars, 
    x_end, y_end, bar_height, bar_width,
    frequency_array, source, audio, base_height, bar_multiplier,
    min_dimension, track_progress_percent, frequency_range_percent,
    colorize;
 
bars = 215;
bar_width = 3;
frequency_range_percent = 80;
colorize = true;

$("#play-btn").on("click", function() { start(); });
$("#stop-btn").on("click", function() { stop(); });
// $("#update-btn").on("click", function() { updateSettings(); });
$("#song").on("change", function() { start(); });
$("#numberOfBars").slider({
      orientation: "horizontal",
      min: 10,
      max: 300,
      step: 5,
      value: bars,
      change: updateSettings
    });
$("#barWidth").slider({
      orientation: "horizontal",
      min: 1,
      max: 12,
      value: bar_width,
      change: updateSettings
    });
$("#frequencyPercentage").slider({
      orientation: "horizontal",
      min: 10,
      max: 100,
      step: 5,
      value: frequency_range_percent,
      change: updateSettings
    });
$("#colorize").on("change", function() { updateSettings(); });

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
        audio.pause();
        audio.currentTime = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
 
function animationLooper(){
    track_progress_percent = audio.currentTime / audio.duration;
    
    initCanvas();
    
    analyser.getByteFrequencyData(frequency_array);

    var pointsPerBar = Math.round((analyser.frequencyBinCount * (frequency_range_percent/100)) / bars);
    
    for(var i = 1; i <= bars; i++){
        //divide a circle into equal parts
        rads = Math.PI / bars;
        
        var totalFrequency = 0;
        var avgFrequency = 0;

        for (var j = 0; j <= pointsPerBar; j++) {
            totalFrequency += frequency_array[(i*pointsPerBar)+j];
        }

        avgFrequency = totalFrequency / pointsPerBar;

        bar_height = (avgFrequency*bar_multiplier);

        var centerCircleOffset = bar_width/2 + 1;

        // set coordinates
        x = center_x - Math.cos(rads * i) * (radius + centerCircleOffset);
        y = center_y - Math.sin(rads * i) * (radius + centerCircleOffset);
        x_end = center_x - Math.cos(rads * i)*(radius + centerCircleOffset + bar_height);
        y_end = center_y - Math.sin(rads * i)*(radius + centerCircleOffset + bar_height);

        //draw a bar
        drawBar(x, y, x_end, y_end, bar_width, avgFrequency);
    }
    window.requestAnimationFrame(animationLooper);
}
 
// for drawing a bar
function drawBar(x1, y1, x2, y2, width,frequency){
    
    var colorizedLineColor = "rgb(" + frequency + ",126,255)";
    var monoLineColor = "rgb(" + frequency + "," + frequency + "," + frequency + ")";
    
    ctx.strokeStyle = colorize ? colorizedLineColor : monoLineColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function updateSettings() {
    bars = $("#numberOfBars").slider("value");
    bar_width = $("#barWidth").slider("value");
    frequency_range_percent = $("#frequencyPercentage").slider("value");
    colorize = $("#colorize").prop("checked");
    updateSliderLabels();
}

function updateSliderLabels() {
    $("#barNumberSliderLabel").text($("#numberOfBars").slider("value"));
    $("#barWidthSliderLabel").text($("#barWidth").slider("value"));
    $("#frequencyPercentageSliderLabel").text($("#frequencyPercentage").slider("value"));
}

function initCanvas() {
    // set to the size of device
    canvas = $("#renderer")[0];
    canvas.width =  window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");

    // style the background
    var gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0, "rgb(201, 1, 126)");
    gradient.addColorStop(1, "rgb(16, 4, 86)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // find the center of the window
    center_x = canvas.width / 2;
    center_y = canvas.height * .66;

    min_dimension = (center_x <= center_y ? center_x : center_y);
    radius = min_dimension * .25;
    base_height = min_dimension - (radius * 1.5);
    bar_multiplier = 1 / ((25500/base_height)/100);

    //draw a circle
    var lineColor = "rgb(254,6,259)";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = bar_width;
    ctx.beginPath();
    ctx.arc(center_x,center_y,radius,Math.PI,0);
    ctx.stroke();

    //draw track progress
    var lineColor = "#defe47";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = bar_width * 1.5;
    ctx.beginPath();
    ctx.arc(center_x,center_y,radius,Math.PI, Math.PI + (Math.PI * track_progress_percent));
    ctx.stroke();
}
});