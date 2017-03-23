import $ from 'jquery';
import noty from 'noty';

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
    <h1>You REALLY want to scroll Facebook newsfeed all day???</h1>
    <a href="#" class="ss-open-nf" data-amount="15"><p>Nooooo! Just 15 secs :)</p></a>
    <a href="#" class="ss-open-nf" data-amount="60"><p>Nah! Just 1 min :D</p></a>
    <a href="#" class="ss-open-nf" data-amount="300"><p>Just 5 mins :(</p></a>
    <hr/>
    <p><strong>USE WITH CAUTION</strong></p>
    <a href="#" class="ss-open-nf" data-amount="600"><p>I NEED 10 MINUTES !</p></a>
    <a href="#" class="ss-open-nf" data-amount="1800"><p>I AM THIRSTY. GIVE ME 30 MINUTES !!!</p></a>
    <hr/>
    <p><strong>Settings</strong></p>
    <label><input type="checkbox" id="wait-for-video"><span>Wait for playing video to pause/stop before closing newsfeed</span></label>
    <hr/>
    <p><strong>Coming Features</strong></p>
    <ul>
      <li> - A counter for the amount of minutes spent scrolling in the day</li>
      <li> - Options to hide/show the longer time options (10 and 30 minutes)</li>
      <li> - Resume scrolling from the point that we have left</li>
      <li> - Re-design for a better User Experience</li>
    </ul>
    <a href="https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk/support" target="_blank">
      <p>Want new feature? Click here!</p>
    </a>
    <hr/>
    <strong>Helpful links</strong>
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
let NEWSFEED_STREAM_MATCHER = /^topnews_main_stream/;
let settings = {
  waitForVideo: true
};

// Interval check for news feed appearant
setInterval(function() {
  checkForNewsfeed(function($newsfeedContainer) {
    hideNewsfeed().promise().done(showStopScrollingDialog)
  })
}, 1000)

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
  
  let $inputWaitForVideo = $stopScrollingDialog.find('input#wait-for-video')
  $inputWaitForVideo.change(function() {
    settings.waitForVideo = $inputWaitForVideo.is(":checked")
    chrome.storage.sync.set({
      waitForVideo: $inputWaitForVideo.is(":checked")
    })
  })

  chrome.storage.sync.get({
    waitForVideo: true
  }, (items) => {
    settings = items;
    $inputWaitForVideo.prop('checked', items.waitForVideo);
  });
}

function openNewsFeed(secToOpen) {
  $STOP_SCROLLING_OVERLAY_TEMPLATE.hide()
  console.log(`Open for ${secToOpen} secs`)

  // Set timer to hide news feed again
  setTimeout(reCloseNewsfeed, secToOpen * 1000)

  // Set timer for reminder
  setTimeout(notifyOutOfTime, (secToOpen - 15) * 1000);
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
        $STOP_SCROLLING_OVERLAY_TEMPLATE.show();
        $streamContainer.find('#ss-newsfeed-overlay').show()
        scrollToTop();
      }
      
      // Check if there are a video playing
      // if yes, wait until it pause/ended
      // otherwise close newsfeed immediately
      let playingVideoElem = getPlayingVideoElem();
      if (settings.waitForVideo && playingVideoElem) {
        playingVideoElem.onpause = () => {
          closeNewsFeed();
          playingVideoElem.onpause = null;
          playingVideoElem.pause();
        };
      } else {
        closeNewsFeed();
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
      let notyTimeOutInSecs = 15;
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
        notyTimeOutInSecs = 10;
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
