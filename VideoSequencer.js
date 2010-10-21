/* 
** VideoSequencer.js
** Created by: Christopher Decairos
** Date: October 15, 2010
*/

(function () {

    var VideoSequencer = this.VideoSequencer = function (src) {

        var that = this;
        for (var i = 0; i < src.length; i++) {
            vid = document.getElementById(src[i]);
            vid.addEventListener("ended", swap, false);
            segments.push(vid);
        }

        var getTotalDuration = setInterval(function () {
            var metaDataIsLoaded = true;
            for (var i = 0; i < segments.length; i++) {
                //console.log("READY STATE: " + i + " : " + segments[i].readyState);
                if (isNaN(segments[i].duration) || segments[i].duration <= 0) {
                    metaDataIsLoaded = false;
                }
                //console.log(metaDataIsLoaded);
            }
            if (metaDataIsLoaded === true) {
                duration = 0;
                clearInterval(getTotalDuration);
                for (var i = 0; i < segments.length; i++) {
                    duration += segments[i].duration;
                    //console.log(segments[i].duration);
                }
                console.log("duration: " + duration);
            }
        }, 50);

        var submitBtn = document.getElementById("submit");
        submitBtn.addEventListener("click", function () {
            var tb = document.getElementById("timeToSeek");
            return seek(toSeconds(tb.value));
        }, false);


        segments[0].setAttribute("style", "display: inline");
        segments[0].play();

    };

    /* Length of all segments */
    this.duration = 0;

    /* Current Time */
    this.currentTime = 0;

    /* video objects */
    var segments = [];

    /* is a video playing*/
    var isPlaying;

    /*
    ** functions
    */
    var swap = function () {
        for (var i = 0; i < segments.length; i++) {
            if (segments[i].style.display === "inline") {
                segments[i].setAttribute("style", "display: none");
                if (segments[i + 1]) {
                    segments[i + 1].setAttribute("style", "display: inline");
                    segments[i + 1].play();
                    break;
                }
            }
        }
    }

    var swapTo = function (vid) {
        for (var i = 0; i < segments.length; i++) {
            if (segments[i] === vid) {
                segments[i].setAttribute("style", "display: inline");
                segments[i].play();
            }
            else if (segments[i].style.display === "inline") {
                segments[i].pause();
                segments[i].setAttribute("style", "display: none");
            }
        }
    }

    this.play = function () {

    };

    this.pause = function () {

    };

    this.add = function (vid) {
        if (vid) {
            this.segments[this.segments.length] = vid;

        }
    };

    var seek = function (seconds) {
        console.log(seconds + " : " + duration)
        if (seconds > duration) { return }

        for (var i = 0; i < segments.length; i++) {
            if (segments[i].duration > seconds) {
                console.log("currentTime (before): " + segments[i].currentTime);
                swapTo(segments[i]);
                segments[i].currentTime = seconds;
                console.log("currentTime (after): " + segments[i].currentTime);
                break;
            } else {
                seconds -= segments[i].duration;
                console.log("seconds left: " + seconds + " : duration=" + segments[i].duration);
            }
        }

    };

} ());
