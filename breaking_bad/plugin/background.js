// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var userId = '3UvP6GeJo4b9y51jKZ1NZQUr2qb2';
var notifIdCounter = 0;

var fireProj;

const configURL = chrome.runtime.getURL('config.json')

fetch(configURL)
  .then((response) => response.json())
  .then((config) => initFirebase(config));


function initFirebase(config) {
  console.log("config:");
  console.log(config);
  fireProj = firebase.initializeApp(config);
}

function fetchConfig() {
  var db = fireProj.database().ref();

  db.on("value", (snapshot) => {
    var dbConfig = snapshot.val()[userId].config
    console.log(dbConfig)
    chrome.storage.sync.set({config: dbConfig}, () => {});
  })
}

function startPolling() {
  function poll() {
    setTimeout(fetchConfig, 5000);
  };

  fetchConfig();
  poll();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function creationCallback(notifId, website) {
  var save = {};
  save[notifId] = website;
  chrome.storage.sync.set(save, () => {
    console.log('popNotification! notifId: ' + notifId + ' website: ' + website);
  })
}

async function createNotification(sleepTime, website) {
  await sleep(sleepTime * 60 * 1000);
  //console.log("sleepTime: " + sleepTime);
  //await sleep(sleepTime * 1000);

  var opt = {
    type: 'basic',
    title: 'Are you procrastinating again?',
    message: 'You\'ve watched ' + website + ' for ' + sleepTime + ' min\nIs everything OK?',
    iconUrl: 'images/tired_face.jpg',
    buttons: [{
      title: 'Oh, I will stop right now!',
    }, {
      title: 'I have to do this, let\'s reschecdule!',
    }],
  };

  chrome.notifications.create(opt, (notifId) => {
    creationCallback(notifId, website);
  });
}

async function ignoreNotification(sleepTime, website) {
  await sleep(sleepTime * 60 * 1000);
  //await sleep(sleepTime * 1000);
  //console.log("IgnoreNotification!");

  chrome.storage.sync.get(website, (items) => {
    if (Object.keys(items).length !== 0) {
      chrome.storage.sync.remove(website, () => {
        const ignoreMessage = {
            websites: website,
            endTime: Date.now(),
        }

        fireProj.database().ref(userId).child("ignore").set(ignoreMessage, () => {
          console.log("ignoreMessage: ");
          console.log(ignoreMessage);
        });

        console.log('Update firebase');
      });
    }
  })
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.sync.get('config', (data) => {
    var dbConfig = data.config

    if (typeof changeInfo.url !== 'undefined') {
      dbConfig.websites.forEach((website) => {
        if (changeInfo.url.includes(website)) {
          console.log("includes: " + website);
          chrome.storage.sync.get(website, (items) => {
            console.log(items.length);
            if (Object.keys(items).length === 0) {
              var save = {};
              save[website] = true;
              chrome.storage.sync.set(save, () => {
                createNotification(dbConfig.first_timeout, website);
                createNotification(dbConfig.sec_timeout, website);
                ignoreNotification(dbConfig.sec_timeout + 1, website);
                //createNotification(1, website);
                //createNotification(10, website);
                //ignoreNotification(11, website);
              })
            }
          })
        }
      })
    }
  });
});

function buttonClickCallback(notifId, btnId) {
  //console.log('button notifId: ' + notifId);
  chrome.storage.sync.get(notifId, (data) => {
    console.log(data);
    var website = data[notifId];
    console.log('website: ' + website);

    chrome.storage.sync.remove(website, () => {
      console.log("notifId: " + notifId);
      console.log("btnId: " + btnId);
      if (btnId === 0) {
        console.log("redirect google");
        chrome.tabs.create({ url: "https://www.google.com" });
      } else if (btnId === 1){
        console.log("redirect google");
        chrome.tabs.create({ url: "https://www.google.com" });
      }
    });
  })
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.clear();

  fetchConfig();
  chrome.notifications.onButtonClicked.addListener(buttonClickCallback)

  startPolling();
});
