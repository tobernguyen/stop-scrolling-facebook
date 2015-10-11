import $ from 'jquery';

var $newsfeedContainer;
var $streamContainer;
let $STOP_SCROLLING_OVERLAY_TEMPLATE = $("<div id=\"ss-newsfeed-overlay\"><div class=\"ss-dialog\"></div></div>")
let OVERLAY_DEFAULT_STYLE = { 
                              'position': 'absolute', 
                              'height': '100%', 
                              'z-index': '1', 
                              'background-color': 'white', 
                              'opacity': '0.98' 
                            }
let STEAM_CONTAINER_SELECTOR = '#stream_pagelet'
let SS_DIALOG_CONTENT = `
    <h1>You REALLY want to scroll Facebook newsfeed all day???</h3>
    <a href="#" class="ss-open-nf" data-amount="5"><p>Nooooo! Just 5 mins :)</p></a>
    <a href="#" class="ss-open-nf" data-amount="15"><p>Nah! Just 15 mins :D</p></a>
    <a href="#" class="ss-open-nf" data-amount="30"><p>Just 30 mins :(</p></a>
  `
let NEWSFEED_STREAM_MATCHER = /^topnews_main_stream/;

function calculateOverlayCss () {
  return $.extend(OVERLAY_DEFAULT_STYLE, { 'width': $newsfeedContainer.width() })
}

function prependToNewsFeed(element) {
  return $newsfeedContainer.prepend(element)
}

function hideNewsfeed() {
  $STOP_SCROLLING_OVERLAY_TEMPLATE.css(calculateOverlayCss())
  return prependToNewsFeed($STOP_SCROLLING_OVERLAY_TEMPLATE)
}

function openNewsFeed(minuteToOpen) {
  $STOP_SCROLLING_OVERLAY_TEMPLATE.hide()
  setTimeout(function() {
    $STOP_SCROLLING_OVERLAY_TEMPLATE.show()
    $("html, body").animate({ scrollTop: 0 }, "medium")
  }, minuteToOpen * 60 * 1000)
  console.log(`Open for ${minuteToOpen}`)
}

function showStopScrollingDialog() {
  let $stopScrollingOverlay = $newsfeedContainer.find('#ss-newsfeed-overlay')
  let $stopScrollingDialog = $stopScrollingOverlay.find('.ss-dialog')

  $stopScrollingDialog.html(SS_DIALOG_CONTENT)
  $stopScrollingDialog.find('.ss-open-nf').each(function() {
    $(this).click(function() {
      let minuteToOpen = parseInt($(this).data('amount'))
      openNewsFeed(minuteToOpen)
    })
  })
}

// Start script
setTimeout(function() {
  $streamContainer = $(STEAM_CONTAINER_SELECTOR);
  let findNewsFeedContainer = $streamContainer.children().each(function() {
    if (NEWSFEED_STREAM_MATCHER.test(this.id)) {
      $newsfeedContainer = $(this);
    }
  })

  $.when(findNewsFeedContainer).done(function() {
    if ($newsfeedContainer != undefined || $newsfeedContainer != null) {
      hideNewsfeed().promise().done(showStopScrollingDialog);
    }
  })
}, 1000);
