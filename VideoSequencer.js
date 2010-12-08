/* 
** VideoSequencer.js
** Created by: Christopher Decairos
** Date: Nov 22 , 2010
*/

(function() {

  var VideoSequencer = this.VideoSequencer = function() {

    /* save reference to self */
    var self = this;
	
    /* Event Listeners */
    this.events = {};

     /* Current Time */
    this.currentTime = 0;
	
    /* set up video data */
    this.playingVideo = document.getElementById('active');
    this.segments = [];
    this.convertXML(this.getSegmentData(this.playingVideo.getAttribute('segment-data')).responseXML);
    this.nextVideo;
    this.segDtaPath = this.playingVideo.getAttribute("segment-data");
    this.currentIndex = 0;
    this.width = this.playingVideo.hasAttribute("width") ? this.playingVideo.getAttribute("width") : null;
    this.height = this.playingVideo.hasAttribute("height") ? this.playingVideo.getAttribute("height") : null;

    /* Length of all segments */
    this.duration = this.calculateDuration();

    /* Target Div for Video tags  */
    this.divTag = document.getElementById("videoDiv");
    this.divTag.removeChild(this.playingVideo);
 
    this.playingVideo = this.createVideoTag(this.width,this.height,false, false);
    this.addEventListener("timeupdate", function() { return self.update(); });
    this.nextVideo = self.createVideoTag(this.width,this.height,false, true);

    /* Time bar div */
    this.timeDiv = { tag : document.getElementById("controlDiv"),
                     width: document.getElementById("controlDiv").getAttribute("width"),
                     height: document.getElementById("controlDiv").getAttribute("height") };
    
    /* Time bar (from soda.js) */
    this.timeBar = new (function (seq) {

      var parent = seq;
      var state = "paused";
      var totalDuration = parent.duration;
      var duration = parent.duration;
      var buffer;
      var bar;
      var pauseButton   = this.pauseButton   = document.createElement("button");
      var playButton    = this.playButton    = document.createElement("button");
      var buffer        = this.buffer        = document.createElement("div");
      var ellapsedTime  = this.ellapsedTime  = document.createElement("div");
      var totalDuration = this.totalDuration = document.createElement("span");

    
      var pause = function () {
        parent.pause()
        playButton.style.display = "inline";
        pauseButton.style.display = "none";
      };
      
      var play = function (){
        parent.play()
        pauseButton.style.display = "inline";
        playButton.style.display = "none";
      };
      
      var updateSeekable = function(){
        var endVal = parent.playingVideo.seekable && parent.playingVideo.seekable.length ? parent.playingVideo.seekable.end() : 0;
        //FF has a buffered event
        /*if (endVal === 0) {
          videoElement.buffered;
          for (var i=0; i<r.length; i++) {
          {
          }
        }*/
        buffer.style.width = (100 / (duration || 1) * endVal) + '%';
      };
      
      var updateEllapsedTime = function(){
        var totalTimeElapsed = 0;
        var segments = parent.segments;
        for (var i = 0, len = segments.length; i < parent.currentIndex; i++)
        {
          totalTimeElapsed += parseInt(segments[i].length);
        };
        
        totalTimeElapsed += parent.playingVideo.currentTime;
        var c = totalDuration.style.width.split("p")[0];
        ellapsedTime.style.left = ( ( totalTimeElapsed / duration  ) * parseInt(c)) +"px";
      }
      this.draw = function() {
        var p = parent;
        p.addEventListener('timeupdate', updateEllapsedTime, false);
        //buffer bar for progress
        p.addEventListener('progress', updateSeekable, false);
        //Firefox in its video element that causes the video.seekable.end() value not to be the same as the duration. 
        //To work around this issue, we can also listen for the durationchange event
        p.addEventListener('durationchange', updateSeekable, false);
    
        playButton.title = "play";
        playButton.value = "play";
        playButton.innerHTML = "&#x25BA;";
        playButton.style.display = "inline";
        playButton.style.width = "45px";
        playButton.onclick = play;
    
        pauseButton.title = "pause";
        pauseButton.value  = "pause";
        pauseButton.innerHTML  = "&#x2590;&#x2590;";
        pauseButton.style.display = "inline";
        pauseButton.style.width = "45px";
        pauseButton.onclick = pause;
    
        buffer.title = "Preloaded";
        buffer.setAttribute("style","width:0px;height:15px; position:absolute; -moz-opacity: 0.5; opacity: 0.5; background-color: grey;");
         
        ellapsedTime.title = "Ellapsed Time";
        ellapsedTime.setAttribute("style","width:3px;height:15px; position:absolute; background-color: black ;");

        totalDuration.title ="total";
        totalDuration.setAttribute("style","width:"+ (p.timeDiv.width - 50) +"px;height:15px; position:absolute; border-style:solid;border-width:3px;position: absolute; border-radius:10px; -moz-border-radius: 10px;-webkit-border-radius: 10px;");
        totalDuration.addEventListener("mousedown", function(e){         
          var x = e.screenX;
          var w = parseInt(totalDuration.style.width.split("p")[0]);
          var seekTime = ( ( (x - 50) / w ) * duration );
          p.seek(seekTime);
        }, false);
        
        //add buffered and ellapsedTime to the total duration div so they stay on top of each other
        totalDuration.appendChild(buffer);
        totalDuration.appendChild(ellapsedTime);
        //put the bars in a separate div
        var barContainer = document.createElement("span");
        barContainer.appendChild(totalDuration);
        
        var container = document.createElement("span");
        container.style.width="100%";
        container.appendChild(playButton);
        container.appendChild(pauseButton);
        container.appendChild(barContainer);
      
        parent.timeDiv.tag.appendChild(container);
        play();
      }   
    }
    )(this);
    this.timeBar.draw();
  };

  VideoSequencer.prototype.calculateDuration = function() {
    var dur = 0;
    for (var i = 0, len = this.segments.length; i < len; i++) {
      dur += parseInt(this.segments[i].length);
    }		
    return dur;
  };

  VideoSequencer.prototype.swap = function(seeking) {
    this.divTag.removeChild(this.playingVideo);
    if (!seeking) {
      this.playingVideo = this.nextVideo;
      this.playingVideo.setAttribute("style", "display: inline");
      this.playingVideo.setAttribute("id", "active");
    } else {
      this.playingVideo = this.createVideoTag(this.width, this.height, false, false);
	  this.divTag.removeChild(this.nextVideo);
    }
    this.addListenersToCurrentVideo("timeupdate");		
    this.nextVideo = this.createVideoTag(this.width,this.height,false, true);
  }

  VideoSequencer.prototype.getSegmentData = function(segDataFile) {
    var xhttp = new XMLHttpRequest();
    if (xhttp) {
      xhttp.open("GET", segDataFile, false);
      xhttp.send();
      return xhttp;
    } else {
      return false;
    }
  };

  VideoSequencer.prototype.convertXML = function(xmlDoc){
    var self = this;
    var parseNode = function(node) {
      var childNodes = node.childNodes;
      var aSource = {};
      for (var i = 0; i < childNodes.length; i++) {
        var child = childNodes[i];
        if (child.nodeType === 1 ) {
          if (child.nodeName === "source") {
            aSource.src = child.textContent;
          } else if (child.nodeName === "length") {
            aSource.length = child.textContent;
          }
        }
      }
      self.segments.push(aSource);
    }

    var xml = xmlDoc.documentElement.childNodes;
    for (var i = 0, xmlLen = xml.length; i < xmlLen; i++) {
      if (xml[i].nodeType === 1){
        if (xml[i].nodeName === "vid"){
          parseNode(xml[i]);
        }
      }
    }	
  };

  VideoSequencer.prototype.update = function() {
    var vid = this.playingVideo;
    if (vid.currentTime >= vid.duration - 0.05){
      this.currentIndex+=1;
      this.swap(false);
	  this.play();
    }
  };

  VideoSequencer.prototype.createVideoTag = function(width, height, controls, hidden) {
    
    var newVid = document.createElement("video");
    if (width != null)  newVid.setAttribute("width", width);
    if (height != null) newVid.setAttribute("height", height);
    if (controls) newVid.setAttribute("controls",""); 
    newVid.setAttribute("segment-data", this.segDtaPath);
    if (!hidden) {
      newVid.setAttribute("src", this.segments[this.currentIndex].src);
      newVid.setAttribute("style", "display: inline");
      newVid.setAttribute("id", "active");
    } else {
      if(this.currentIndex >= this.segments.length) { this.currentIndex = 0; }
      newVid.setAttribute("src", this.segments[this.currentIndex + 1] ? this.segments[this.currentIndex + 1].src : this.segments[0].src);
      newVid.setAttribute("id", "inactive");
      newVid.setAttribute("style", "display: none");
      newVid.setAttribute("preload", "auto");
    }	
    this.divTag.appendChild(newVid);
    return newVid;
  };

  VideoSequencer.prototype.play = function() {
    this.playingVideo.play();
  };

  VideoSequencer.prototype.togglePlay = function() {
    if (this.playingVideo.paused) {
      this.playingVideo.play();
    } else {
    this.playingVideo.pause();
    }
  };

  VideoSequencer.prototype.pause = function() {
    this.playingVideo.pause();
  };

  VideoSequencer.prototype.add = function(src, len, index) {
    var newSource = {};
    newSource.src = src || "";
    newSource.length = len || 0;
    var l = this.segments.length;
    this.segments.splice((len >= 0 && len < l ? len : l),0,{ src: src || "" , length : len || 0 });
	this.duration = calculateDuration();
  };

  VideoSequencer.prototype.addEventListener = function(event, callback, useCapture) {
    var callbackExists = false;
    var queue = this.events[event] = this.events[event] || [];
    for (var i = 0, l = queue.length; i < l; i++) {
      if (event === queue[i]) {
        callbackExists = true
        break;
      }
    }
    if (!callbackExists) { 
      queue.push(callback);
      this.playingVideo.addEventListener(event, callback, useCapture); 
    }
  };
  
  VideoSequencer.prototype.addListenersToCurrentVideo = function(listener) {
    var that = this;
    if ( this.events[listener]) {
      for (var i=0, l = this.events[listener].length; i < l; i++) {
        this.playingVideo.addEventListener(listener, that.events[listener][i], false);
      }
    }
  };
  
  VideoSequencer.prototype.removeEventListener = function(event, callback, useCapture) {
    var queue = this.events[event];
    if (queue) {
      for (var i = 0, len = queue.length; i < len; i++) {
        if (queue[i] === callback) {
          this.playingVideo.removeEventListener (event, queue[i], useCapture);
          queue.splice(i,1);
        }
      }
    }
  };

  VideoSequencer.prototype.seek = function(time) {
    self = this;
    var duration = this.duration;
    if (!(time >= 0 && time <= duration)) { return; }
    segments = this.segments;
    for (var i = 0, l = segments.length; i < l; i++) {
      segLen = segments[i].length;
      if (time > segLen) {
        time = time - segLen;
        continue;
      }
      if (!(this.currentIndex == i)) {
            this.currentIndex = i;
            this.swap(true);
          } 
      if (!this.playingVideo.paused) this.pause();
      
      var seekIntoVid = function (t) {
        if (self.playingVideo.readyState >= 2) {
          self.playingVideo.currentTime = t;
          self.play();
          clearInterval(seekWhenReady);
        }
      };
      var seekWhenReady = setInterval( function(){ seekIntoVid(time)} ,50);
      break;
    }
  };	
} ());