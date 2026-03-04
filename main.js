const myVideoContainer = document.getElementById("myVideoContainer");
const myVideoElement = document.getElementById("myVideo");

myVideoContainer.addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    }) // it returns a promise either we can put this in to try catch block or handle by then catch methods
    .then((stream) => {
      myVideoElement.srcObject = stream;
    //   console.log("hii");
    })
    .catch((err) => {
      console.log(
        "There is an error while capturing your video and audio",
        err,
      );
      getMediadevices();
    });
});
function getMediadevices() {
  navigator.mediaDevices.enumerateDevices().then((deviceArray) => {
    deviceArray.forEach((device) => {
      console.log(device);
    });
  });
}
