

//document.querySelector('#cancel').addEventListener('click', function(e) {
//  if (pending_request_id != null) {
//    chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
//  }
//});

//document.querySelector('#startFromBackgroundPage')
//    .addEventListener('click', function(e) {
//      chrome.runtime.sendMessage(
//          {}, function(response) { console.log(response.farewell); });
//    });


(function(exports) {

exports.URL = exports.URL || exports.webkitURL;

exports.requestAnimationFrame = exports.requestAnimationFrame ||
    exports.webkitRequestAnimationFrame || exports.mozRequestAnimationFrame ||
    exports.msRequestAnimationFrame || exports.oRequestAnimationFrame;

exports.cancelAnimationFrame = exports.cancelAnimationFrame ||
    exports.webkitCancelAnimationFrame || exports.mozCancelAnimationFrame ||
    exports.msCancelAnimationFrame || exports.oCancelAnimationFrame;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

var ORIGINAL_DOC_TITLE = document.title;
var video;
var videoGravado;

var rafId = null;
var endTime = null;
var frames = [];

var canvas;
var video;
var width;
var height;
var images = [];
var ctx;
var result;
var capture;
var loopnum;
var startTime;
var capturing = false;
var progress;
var msgdiv;

init();

function gotStream(stream) {
  video.src = URL.createObjectURL(stream);
  localstream = stream;

  stream.onended = function() { console.log("Ended"); };
   startCapture();
}

function getUserMediaError() {
  console.log("getUserMedia() failed.");
}

function onAccessApproved(id) {
  if (!id) {
    console.log("Access rejected.");
    return;
  }
  navigator.webkitGetUserMedia({
      audio:false,
      video: { mandatory: { chromeMediaSource: "desktop",
                            chromeMediaSourceId: id } }
  }, gotStream, getUserMediaError);
}

var pending_request_id = null;

document.querySelector('#record-me').addEventListener('click', function(e) {
  video.style.display = 'block';
  videoGravado.style.display = 'none';
  pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
      ["screen"], onAccessApproved);
});


function $(selector) {
  return document.querySelector(selector) || null;
}

function toggleActivateRecordButton() {
  var b = $('#record-me');
  b.textContent = b.disabled ? 'Gravar' : 'Gravando...';
  b.classList.toggle('recording');
  b.disabled = !b.disabled;
}

function init() {
    video =  $('#video');
    videoGravado = $('#videoGravado');
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    startButton = $('#record-me');
    stopButton = $('#stop-me');
    progress = document.getElementById('progress');
    msgdiv = document.getElementById('informacao');

}

function showProgress(show) {
    progress.style.visibility = show ? 'visible' : 'hidden';
}
 

function nextFrame(){
    if(capturing){
      console.log("capturando");
        var imageData;
        ctx.drawImage(video, 0, 0, width, height);
        imageData = ctx.getImageData(0, 0, width, height);
        images.push({duration : new Date().getTime() - startTime, datas : imageData});
        startTime = new Date().getTime();
        requestAnimationFrame(nextFrame);
    }else{
        requestAnimationFrame(finalizeVideo);
    }
 
}
 
/**
 * Start the encoding of the captured frames.
 */
function finalizeVideo(){
    var capture = new Whammy.Video();
    encodeVideo(capture, 0);
    progress.max = images.length;
    showProgress(true);
}
 
/**
 * Encode the captured frames.
 * 
 * @param capture
 * @param currentImage
 */
function encodeVideo(capture, currentImage) {
    if (currentImage < images.length) {
        ctx.putImageData(images[currentImage].datas, 0, 0);
        capture.add(ctx, images[currentImage].duration);
        delete images[currentImage];
        progress.value = currentImage;
        currentImage++;
        setTimeout(function() {encodeVideo(capture, currentImage);}, 5);
    } else {
        var output = capture.compile();
        videoGravado.src = window.URL.createObjectURL(output);
        showProgress(false);
        images = [];
    }
}
 
/**
 * Initialize the canvas' size with the video's size.
 */
function initSize() {
    width = video.clientWidth;
    height = video.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

 
/**
 * Start the video capture.
 */
function startCapture() {
    initSize();
    capturing = true;
    startTime = new Date().getTime();
    nextFrame();
}
 
/**
 * Stop the video capture.
 */
function stopCapture() {
    capturing = false;
    toggleActivateRecordButton();
    video.style.display = 'none';
    videoGravado.style.display ='block';
}

function enableStopButton(enabled) {
    stopButton.disabled = !enabled;
}

function setMessage(message) {
    msgdiv.innerHTML = message;
}
 

function initEvents() {
  $('#record-me').addEventListener('click', toggleActivateRecordButton);
  $('#stop-me').addEventListener('click', stopCapture);
}

initEvents();

exports.$ = $;

})(window);