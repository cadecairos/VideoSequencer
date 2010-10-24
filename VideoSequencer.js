/* 
** VideoSequencer.js
** Created by: Christopher Decairos
** Date: October 15, 2010
*/

(function (){

    var VideoSequencer = this.VideoSequencer = function (src){

        for (var i = 0; i < src.length; i++){
            vid = document.getElementById(src[i]);
            vid.addEventListener("ended", swap, false);
            segments.push(vid);
        }

        var getTotalDuration = setInterval(function (){
            for (var i = 0; i < segments.length; i++){
                if (isNaN(segments[i].duration) || segments[i].duration <= 0){
                    return;
                }
            }
            duration = 0;
            clearInterval(getTotalDuration);
            for (var i = 0; i < segments.length; i++){
                duration += segments[i].duration;
            }
        }, 50);

        var submitBtn = document.getElementById("submit");
        submitBtn.addEventListener("click", function (){
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

    /* the currently playing video */
    var currentPlayingVideo;

    /*
    ** functions
    */
    var swap = function (){
        for (var i = 0; i < segments.length; i++){
            if (segments[i].style.display === "inline"){
                segments[i].setAttribute("style", "display: none");
                if (segments[i + 1]){
                    segments[i + 1].setAttribute("style", "display: inline");
                    segments[i + 1].currentTime = 0;
                    segments[i + 1].play();
                    break;
                }
            }
        }
    }

    var swapTo = function (index, time){
        for (var i = 0; i < segments.length; i++){
            if (i === index){
                segments[i].setAttribute("style", "display: inline");
                segments[i].currentTime = time;
                segments[i].play();
            }
            else{
                segments[i].pause();
                segments[i].setAttribute("style", "display: none");
            }
        }
    }

    this.play = function (){

    };

    this.pause = function (){

    };

    this.add = function (vid){
        if (vid){
            this.segments[this.segments.length] = vid;
        }
    };

    var seek = function (seconds){
        if (seconds > duration || seconds < 0){ return }

        for (var i = 0; i < segments.length; i++){
            if (segments[i].duration > seconds){
                swapTo(i, seconds);
                break;
            } else{
                seconds -= segments[i].duration;
            }
        }

    };

} ());
