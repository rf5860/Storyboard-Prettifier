// ==UserScript==
// @name          StoryBoarder
// @description	  Add colour codes to V1 for Release Notes
// @include       https://www11.v1host.com/VentyxProd/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js
// @require       https://gist.githubusercontent.com/BrockA/2625891/raw/fd02ec05e3079cdd52cf5892a7ba27b67b6b6131/waitForKeyElements.js
// @author        rf5860
// @version       0.7
// @updateURL     https://github.com/rf5860/Storyboard-Prettifier/raw/master/storyboarder.user.js
// @downloadURL   https://github.com/rf5860/Storyboard-Prettifier/raw/master/storyboarder.user.js
// ==/UserScript==
// Style
var COMPLETE_MISSING_COMMENTS = "#CC8D8D";
var COMPLETE_WITH_COMMENTS = "#8A99E2";
var IN_PROGRESS_MISSING_COMMENTS = "#BA58DA";
var IN_PROGRESS_WITH_COMMENTS = "#C0DA58";
var AWAITING_DEPLOY_MISSING_COMMENTS = "#E2C78A";
var AWAITING_DEPLOY_WITH_COMMENTS = "#AAE28A";
var RELEASE_NOTES_LABEL_XPATH = 'div.expandable-text>label:contains("Release Notes:")';
var STATUS_XPATH = 'div.what-fields>div.text>label:contains("Status:")';
var DONE = 'Done';
var IN_PROGRESS = 'In Progress';
var ACCEPTED = 'Accepted';
var COMPLETED = 'Completed';
var DEV_TASK_TEXT = 'Development';
var TASKS_URL = "https://www11.v1host.com/VentyxProd/rest-1.v1/Data/Task?sel=Status.Name&find=" + DEV_TASK_TEXT + "&where=Parent={0}&Accept=application/json";

function addGitHubLinks(c) {
    c.each(function(i, l) {
        v = $(l);
        v.html('<a href="https://github.com/Mincom/ellipse/commit/' + v.text() + '">' + v.text() + "</a>");
    });
}

function addSFDCLinks(s) {
    s.each(function(i, l) {
        var targetDiv = $(l).parent().find('div.value');
        var caseNumber = targetDiv.html();
        targetDiv.html('<a href="http://litsfvm1/sfcaselookup/default.aspx?Case=' + caseNumber + '">' + caseNumber + '</a>');
    });
}

function setStoryCardColors(d) {
    d.each(function(i, l) {
        var defectId = $(l).parent().attr('_v1_asset');
        var detailLink = $(l).find('div.title>a').attr("href");
        var tasksLinks = TASKS_URL.replace("{0}", "'" + defectId + "'");
        $.ajax({
            url: detailLink,
            success: function(data) {
                var devCompleted = true;
                $.ajax({
                    url: tasksLinks,
                    success: function(data) {
                        for (i = 0; i < data.Assets.length; i++) {
                            devCompleted = devCompleted && data.Assets[0].Attributes["Status.Name"].value === COMPLETED;
                        }
                    },
                    async: false,
                    dataType: 'json'
                });

                var releaseNotes = $(data).find(RELEASE_NOTES_LABEL_XPATH).parent().find('.value').text();
                var status = $(data).find(STATUS_XPATH).parent().find('.value').text();
                var parentItem = $(l).find('.bottom-content').parent();
                var bgColor = "";
                var releaseNotesDone = (releaseNotes === "");
                if (status === DONE || status === ACCEPTED) {
                    bgColor = releaseNotesDone ? COMPLETE_MISSING_COMMENTS : COMPLETE_WITH_COMMENTS;
                } else if (status === IN_PROGRESS) {
                    if (devCompleted) {
                        bgColor = (releaseNotes === "") ? AWAITING_DEPLOY_MISSING_COMMENTS : AWAITING_DEPLOY_WITH_COMMENTS;
                    } else {
                        bgColor = (releaseNotes === "") ? IN_PROGRESS_MISSING_COMMENTS : IN_PROGRESS_WITH_COMMENTS;
                    }
                }
                parentItem.css('background-color', bgColor);
            }
        });
    });
}

waitForKeyElements('.story-card', setStoryCardColors, false)
waitForKeyElements('tr[_v1_type="ChangeSet"]>td:nth-child(2)', addGitHubLinks, false);
waitForKeyElements('div.text>label:contains("SFDCCaseNumber:")', addSFDCLinks, false);
