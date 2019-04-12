// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function creationCallback() {
  console.log('popNotification!');
}

async function createNotification(sleepTime) {
  await sleep(sleepTime);
  chrome.notifications.create(opt, creationCallback);
}

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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // alert('tabId: ' + tabId );
  // alert('url: ' + changeInfo.url);
  // alert('title: ' + changeInfo.title);
  // alert('tab: ' + tab);

  if (typeof changeInfo.url !== 'undefined' && changeInfo.url.includes('youtube.com')) {
    createNotification(5000);
  }
});
