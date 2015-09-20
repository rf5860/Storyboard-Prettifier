// ==UserScript==
// @name          StoryBoarder
// @description	  Add colour codes to V1 for Release Notes
// @include       https://www11.v1host.com/VentyxProd/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js
// @require       https://gist.githubusercontent.com/BrockA/2625891/raw/fd02ec05e3079cdd52cf5892a7ba27b67b6b6131/waitForKeyElements.js
// @author        rf5860
// @version       0.3
// ==/UserScript==
// Style
var COMPLETE_MISSING_COMMENTS_COLOUR = "#CC8D8D";
var COMPLETE_WITH_COMMENTS_COLOUR = "#8A99E2";
var IN_PROGRESS_MISSING_COLOUR = "#E2C78A";
var IN_PROGRESS_WITH_COMMENTS_COLOUR = "#CCE28A";
var RELEASE_NOTES_LABEL_XPATH = 'div.expandable-text>label:contains("Release Notes:")';
var STATUS_XPATH = 'div.what-fields>div.text>label:contains("Status:")';
var DONE = 'Done';
var IN_PROGRESS = 'In Progress';
var ACCEPTED = 'Accepted';

function dataLoaded(d) {
    d.each(function(i,l) {
        var detailLink=$(l).find('div.title>a').attr("href");
        $.ajax({
            url: detailLink,
            success: function(data) {
                var releaseNotes = $(data).find(RELEASE_NOTES_LABEL_XPATH).parent().find('.value').text();
                var status = $(data).find(STATUS_XPATH).parent().find('.value').text();
                var parentItem = $(l).find('.bottom-content').parent();
                var bgColor = "";
                if (status === DONE || status === ACCEPTED) {
                    bgColor = ( releaseNotes === "" ) ? COMPLETE_MISSING_COMMENTS_COLOUR : COMPLETE_WITH_COMMENTS_COLOUR;
               } else if (status === IN_PROGRESS) {
                    bgColor = ( releaseNotes === "" ) ? IN_PROGRESS_MISSING_COLOUR : IN_PROGRESS_WITH_COMMENTS_COLOUR;
                }
                parentItem.css('background-color', bgColor);
            }
        });
    });
}

waitForKeyElements('.story-card', dataLoaded, false)
