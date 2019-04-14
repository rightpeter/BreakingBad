const popNotification = document.getElementById('popNotification');
const opt = {
  type: 'basic',
  title: 'Are you procrastinating again?',
  message: 'You\'ve watched Youtube for 20 min\nIs everything OK?',
  iconUrl: 'images/tired_face.jpg',
  buttons: [{
    title: 'Oh, I will stop right now!',
  }, {
    title: 'I have to do this, let\'s reschecdule!',
  }],
};

function creationCallback() {
  console.log('popNotification!');
}

popNotification.onclick = function(element) {
  chrome.notifications.create(opt, creationCallback);
};
