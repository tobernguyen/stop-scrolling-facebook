import $ from 'jquery';
import noty from 'noty';

var isActive;

window.onfocus = function () { 
  isActive = true; 
}; 

window.onblur = function () { 
  isActive = false; 
}; 

var $newsfeedContainer;
var $streamContainer;
let $STOP_SCROLLING_OVERLAY_TEMPLATE = $("<div id=\"ss-newsfeed-overlay\"><div class=\"ss-dialog\"></div></div>")
let OVERLAY_DEFAULT_STYLE = { 
                              'position': 'absolute', 
                              'height': '100%', 
                              'z-index': '100', 
                              'background-color': 'white', 
                              'opacity': '0.98' 
                            }
let STEAM_CONTAINER_SELECTOR = '#stream_pagelet'
let SS_DIALOG_CONTENT = `
    <h1>You've been scrolling Facebook for <span id="scroll-time-count"></span> minutes today!</p>
    <h1>You REALLY want to scroll Facebook newsfeed all day???</h1>
    <a href="#" class="ss-open-nf" data-amount="15"><p>Nooooo! Just 15 secs :)</p></a>
    <a href="#" class="ss-open-nf" data-amount="60"><p>Nah! Just 1 min :D</p></a>
    <a href="#" class="ss-open-nf" data-amount="300"><p>Just 5 mins :(</p></a>
    <hr/>
    <div id="use-with-caution" style="display: none">
      <p><strong>USE WITH CAUTION</strong></p>
      <a href="#" class="ss-open-nf" data-amount="600"><p>I NEED 10 MINUTES !</p></a>
      <a href="#" class="ss-open-nf" data-amount="1800"><p>I AM THIRSTY. GIVE ME 30 MINUTES !!!</p></a>
      <hr/>
    </div>
    <p><strong>Settings</strong></p>
    <div><label><input type="checkbox" id="wait-for-video"><span>Wait for playing video to pause/stop before closing newsfeed</span></label></div>
    <div><label><input type="checkbox" id="enable-use-with-caution"><span class="enable-longer-time-options">Enable longer time options</span></label></div>
    <hr/>
    <p><strong>Coming Features</strong></p>
    <ul>
      <li> - Resume scrolling from the point that we have left</li>
      <li> - Re-design for a better User Experience</li>
      <li> - Faster hiding newsfeed 
      <li> - A button to stop scrolling even the time isn't over yet
    </ul>
    <a href="https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk/support" target="_blank">
      <p>Want new feature? Click here!</p>
    </a>
    <hr/>
    <strong>Helpful links</strong>
    <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=EZ76G2GU3QYT8" target="_blank">
      <p>Like this extension? Buy me a coffee!</p>
    </a>
    <a href="https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk/reviews" target="_blank">
      <p>Rate this application ★★★★★</p>
    </a>
    <a href="https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk/support" target="_blank">
      <p>Ask for support or tell us your suggestion to make this application better</p>
    </a>
    <a href="https://github.com/tobernguyen/stop-scrolling-facebook/blob/master/CHANGELOG.md" target="_blank">
      <p>Change log</p>
    </a>
  `
let NEWSFEED_STREAM_MATCHER = /^topnews_main_stream/
let settings = {
  waitForVideo: true,
  currentCountDate: getTodayTimeString(),
  timeCountToday: 0,
  enableUseWithCation: false
}

function getTodayTimeString() {
  let currentDate = new Date()
  return `${currentDate.getDate()}-${currentDate.getMonth()}-${currentDate.getFullYear()}`
}

const SETTINGS_TEMPLATE = {
  waitForVideo: true,
  currentCountDate: getTodayTimeString(),
  timeCountToday: 0,
  enableUseWithCation: false
}

// GET config from storage
chrome.storage.sync.get(SETTINGS_TEMPLATE, (items) => {
  settings = items;
})

// What to do receive new storage value
chrome.storage.onChanged.addListener(items => {
  console.log('storage changed', items)
  Object.keys(items).forEach(k => {
    if (items[k].newValue !== undefined) settings[k] = items[k].newValue
  })
  if (Object.keys(items).includes('timeCountToday')) {

  }
  console.log('new settings', settings)
})

// Interval check for news feed appearant
let firstCheckInterval = setInterval(function() {
  backgroundCheckForNewsfeed(() => {
    clearInterval(firstCheckInterval);
    setInterval(backgroundCheckForNewsfeed, 1000)
  })
}, 50)
let backgroundCheckForNewsfeed = function(cb) {
  checkForNewsfeed(function($newsfeedContainer) {
    hideNewsfeed().promise().done(() => {
      showStopScrollingDialog()
      if (typeof cb === 'function') cb()
    })
  })
}

let timerInterval;

function startTimer() {
  timerInterval = setInterval(countAndUpdateScrollingTime, 12000)
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval)
}

function countAndUpdateScrollingTime() {
  let syncData = {}

  // Don't count if current window is not active
  if (!isActive) return;
  
  if (settings.currentCountDate === getTodayTimeString()) {
    if (typeof settings.timeCountToday === 'number') {
      syncData['timeCountToday'] = settings.timeCountToday + 12
    } else {
      syncData['timeCountToday'] = 12
    }
  } else {
    syncData['currentCountDate'] = getTodayTimeString()
    syncData['timeCountToday'] = 0
  }

  chrome.storage.sync.set(syncData)
}

function checkForNewsfeed(callBackOnNewsFeedFound) {
  $streamContainer = $(STEAM_CONTAINER_SELECTOR);
  let $newsFeedElement = null;

  let findNewsFeedContainer = $streamContainer.children().each(function() {
    if (NEWSFEED_STREAM_MATCHER.test(this.id)) {
      $newsFeedElement = $(this)
    }
  })

  $.when(findNewsFeedContainer).done(function() {
    if ($newsFeedElement != undefined && $newsFeedElement != null && $newsFeedElement.data('injected') != 'true') {
      $newsFeedElement.data('injected', 'true')
      $newsfeedContainer = $newsFeedElement
      console.log('SSF Injected')
      callBackOnNewsFeedFound($newsFeedElement)
    }
  })
}

function hideNewsfeed() {
  scrollToTop()
  $STOP_SCROLLING_OVERLAY_TEMPLATE.css(calculateOverlayCss())
  return prependToNewsFeed($STOP_SCROLLING_OVERLAY_TEMPLATE)
}

function scrollToTop() {
  $("html, body").animate({ scrollTop: 0 }, "medium")
}

function calculateOverlayCss () {
  return $.extend(OVERLAY_DEFAULT_STYLE, { 'width': $newsfeedContainer.width() })
}

function prependToNewsFeed(element) {
  return $newsfeedContainer.prepend(element)
}

function updateTimerText() {
  $newsfeedContainer.find('#ss-newsfeed-overlay span#scroll-time-count').text(Math.round(settings["timeCountToday"] / 60))
}

function showStopScrollingDialog() {
  let $stopScrollingOverlay = $newsfeedContainer.find('#ss-newsfeed-overlay')
  let $stopScrollingDialog = $stopScrollingOverlay.find('.ss-dialog')

  $stopScrollingDialog.html(SS_DIALOG_CONTENT)
  $stopScrollingDialog.find('.ss-open-nf').each(function() {
    $(this).click(function() {
      let secToOpen = parseInt($(this).data('amount'))
      openNewsFeed(secToOpen)
    })
  })

  updateTimerText()
  
  // Wait for video section
  let $inputWaitForVideo = $stopScrollingDialog.find('input#wait-for-video')
  $inputWaitForVideo.prop('checked', settings.waitForVideo)
  $inputWaitForVideo.change(function() {
    settings.waitForVideo = $inputWaitForVideo.is(":checked")
    chrome.storage.sync.set({
      waitForVideo: $inputWaitForVideo.is(":checked")
    })
  })

  // Longer time option (aka Use with caution)
  let $inputShowLongerTimeOptions = $stopScrollingDialog.find("input#enable-use-with-caution")
  $inputShowLongerTimeOptions.prop('checked', settings.enableUseWithCation)
  $inputShowLongerTimeOptions.change(function() {
    if (settings.enableUseWithCation) {
      alert('You made a right choice, and also a brave choice ;) But it will be definitely worth it!')
      chrome.storage.sync.set({
        enableUseWithCation: false
      }, () => location.reload())
    } else {
      let confirm = window.confirm('!!!CAUTION!!!\n\nThis is a VERY VERY VERY DANGEROUS option. You will definitely SPEND MORE TIME on Facebook. Are you sure to do this?')
      if (confirm) {
        chrome.storage.sync.set({
          enableUseWithCation: true
        }, () => location.reload())
      } else {
        $inputShowLongerTimeOptions.prop('checked', settings.enableUseWithCation)
      }
    }
  })
  if (settings.enableUseWithCation) $stopScrollingDialog.find("#use-with-caution").show()
}

function openNewsFeed(secToOpen) {
  startTimer()
  $STOP_SCROLLING_OVERLAY_TEMPLATE.hide()
  console.log(`Open for ${secToOpen} secs`)

  // Set timer to hide news feed again
  setTimeout(reCloseNewsfeed, secToOpen * 1000)

  // Set timer for reminder
  setTimeout(notifyOutOfTime, (secToOpen - 10) * 1000);
}

function reCloseNewsfeed() {
  $streamContainer = $(STEAM_CONTAINER_SELECTOR)
  let $newsFeedElement = null;

  let findNewsFeedContainer = $streamContainer.children().each(function() {
    if (NEWSFEED_STREAM_MATCHER.test(this.id)) {
      $newsFeedElement = $(this)
    }
  })

  // Check if user still on News Feed page, otherwise do nothing
  $.when(findNewsFeedContainer).done(function() {
    if ($newsFeedElement != undefined && $newsFeedElement != null && $newsFeedElement.data('injected') == 'true') {
      let closeNewsFeed = function() {
        $STOP_SCROLLING_OVERLAY_TEMPLATE.show()
        $streamContainer.find('#ss-newsfeed-overlay').show()
        updateTimerText()
        scrollToTop()
        stopTimer()
      }
      
      // Check if there are a video playing
      // if yes, wait until it pause/ended
      // otherwise close newsfeed immediately
      let playingVideoElem = getPlayingVideoElem();
      if (settings.waitForVideo && playingVideoElem) {
        playingVideoElem.onpause = () => {
          closeNewsFeed()
          playingVideoElem.onpause = null
          playingVideoElem.pause()
        };
      } else {
        closeNewsFeed()
      }
    }
  })
}

function getPlayingVideoElem() {
  let playingVideoElem;
  $("video").each(function() {
    if (!this.paused) playingVideoElem = this;
  });
  return playingVideoElem;
}

function notifyOutOfTime() {
  $streamContainer = $(STEAM_CONTAINER_SELECTOR)
  let $newsFeedElement = null;

  let findNewsFeedContainer = $streamContainer.children().each(function() {
    if (NEWSFEED_STREAM_MATCHER.test(this.id)) {
      $newsFeedElement = $(this)
    }
  })

  // Check if user still on News Feed page, otherwise do nothing
  $.when(findNewsFeedContainer).done(function() {
    if ($newsFeedElement != undefined && $newsFeedElement != null && $newsFeedElement.data('injected') == 'true') {
      let notyTimeOutInSecs = 10;
      let notyText;
      let showProgressBar = true;
      // Check if there are a video playing
      // if yes, wait until it pause/ended
      // otherwise close newsfeed immediately
      let playingVideoElem = getPlayingVideoElem();
      if (settings.waitForVideo && playingVideoElem) {
        let videoRemainingSeconds = parseInt(playingVideoElem.duration - playingVideoElem.currentTime);
        notyText = `<strong>Video playing detected</strong><br/>Newsfeed will be close when video is paused or after it is ended - ${videoRemainingSeconds} seconds remaining (click to dismiss)`;
        showProgressBar = false;
      } else {
        notyText = `<strong>The Newsfeed will be closed in ${notyTimeOutInSecs} seconds (click to dismiss)</strong>`;
      }

      noty({
        layout: 'top',
        theme: 'metroui',
        text: notyText,
        type: 'warning',
        timeout: notyTimeOutInSecs * 1000,
        progressBar: showProgressBar
      });
    }
  })
}
