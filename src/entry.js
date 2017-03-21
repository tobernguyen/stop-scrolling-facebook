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
    <hr />
    <strong>Helpful links</strong>
    <a href="https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk/reviews" target="_blank">
      <p>Rate this application ★★★★★</p>
    </a>
    <a href="https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk/support" target="_blank">
      <p>Ask for support or tell us your suggestion to make this application better</p>
    </a>
  `
let NEWSFEED_STREAM_MATCHER = /^topnews_main_stream/;

function scrollToTop() {
  $("html, body").animate({ scrollTop: 0 }, "medium")
}

function flashScreenTimeLeft() {
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
      noty({
        layout: 'top',
        theme: 'metroui',
        text: '<strong>The Newsfeed will be closed in 15 seconds</strong>',
        type: 'warning',
        timeout: 15000,
        progressBar: true
      });
    }
  })
}

function calculateOverlayCss () {
  return $.extend(OVERLAY_DEFAULT_STYLE, { 'width': $newsfeedContainer.width() })
}

function prependToNewsFeed(element) {
  return $newsfeedContainer.prepend(element)
}

function hideNewsfeed() {
  scrollToTop()
  $STOP_SCROLLING_OVERLAY_TEMPLATE.css(calculateOverlayCss())
  return prependToNewsFeed($STOP_SCROLLING_OVERLAY_TEMPLATE)
}

function reShowNewsfeed() {
  $STOP_SCROLLING_OVERLAY_TEMPLATE.show()

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
      $streamContainer.find('#ss-newsfeed-overlay').show()
      scrollToTop()
    }
  })
}

function openNewsFeed(secToOpen) {
  $STOP_SCROLLING_OVERLAY_TEMPLATE.hide()
  console.log(`Open for ${secToOpen} secs`)

  // Set timer to hide news feed again
  setTimeout(reShowNewsfeed, secToOpen * 1000)

  // Set timer for reminder
  setTimeout(flashScreenTimeLeft, (secToOpen - 15) * 1000);
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

// Interval check for news feed appearant
setInterval(function() {
  checkForNewsfeed(function($newsfeedContainer) {
    hideNewsfeed().promise().done(showStopScrollingDialog)
  })
}, 1000)
