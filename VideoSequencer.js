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
                if (segments[i].readyState < 3) {
                    metaDataIsLoaded = false;
                }
                //console.log(metaDataIsLoaded);
            }
            if (metaDataIsLoaded === true) {
                that.duration = 0;
                clearInterval(getTotalDuration);
                for (var i = 0; i < segments.length; i++) {
                    that.duration += segments[i].duration;
                    //console.log(segments[i].duration);
                }
                //console.log(that.duration);
            }
        }, 50);

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

    this.play = function () {

    };

    this.pause = function () {

    };

    this.add = function (vid) {
        if (vid) {
            this.segments[this.segments.length] = vid;

        }
    };

    var seek = function () {

    };

} ());
