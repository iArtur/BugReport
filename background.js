
//Event lister que roda em background do chrome.
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('Views/index.html', {
    innerBounds:
    {
      width:500,
      height:675
    },
     outerBounds: {
      maxWidth: 600,
      maxHeight: 776
    }
  });
});

//Chamada da api do google que starta a captura de tela
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  chrome.desktopCapture.chooseDesktopMedia(
      ["screen"],
      function(id) {
        sendResponse({"id": id});
      });
});