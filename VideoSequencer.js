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
 
    this.playingVideo = this.createVideoTag(this.width,this.height,true, false);
    this.addEventListener("timeupdate", function() { return self.update(); });
    this.nextVideo = self.createVideoTag(this.width,this.height,true, true);
  };

  VideoSequencer.prototype.calculateDuration = function() {
    var dur = 0;
    for (var i = 0, len = this.segments.length; i < len; i++) {
      dur += parseInt(this.segments[i].length);
    }		
    return dur;
  };

  VideoSequencer.prototype.swap = function(seeking) {
    var that = this;
    this.divTag.removeChild(this.playingVideo);
    if (!seeking) {
      this.playingVideo = this.nextVideo;
      this.playingVideo.setAttribute("style", "display: inline");
      this.playingVideo.setAttribute("id", "active");
    } else {
      this.playingVideo = this.createVideoTag(this.width, this.height, true, false);
    }
    this.addListenersToCurrentVideo("timeupdate");
    this.playingVideo.play();		
    this.nextVideo = this.createVideoTag(this.width,this.height,true, true);
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
    if (vid.currentTime >= vid.duration - 0.05 && vid.readyState >= 3){
      this.currentIndex+=1;
      this.swap(false);
    }
  };

  VideoSequencer.prototype.createVideoTag = function(width, height, controls, hidden) {
    var that = this;
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
    this.playingVideo.Play();
  };

  VideoSequencer.prototype.togglePlay = function() {
    if (this.playingVideo.paused) {
      this.playingVideo.play();
    } else {
    this.playingVideo.pause();
    }
  };

  VideoSequencer.prototype.pause = function() {
    this.playingVideo.Pause();
  };

  VideoSequencer.prototype.add = function(src, len, index) {
    var newSource = {};
    newSource.src = src || "";
    newSource.length = len || 0;
    var l = this.segments.length;
    this.segments.splice((len >= 0 && len < l ? len : l),0,{ src: src || "" , length : len || 0 })
  };

  VideoSequencer.prototype.addEventListener = function(event, callback) {
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
      this.playingVideo.addEventListener(event, callback, false); 
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
		console.log("index: " + i, " :: seglen: " + segLen);
		console.log(this.currentIndex + " : " + i);
		if (!(this.currentIndex == i)) {
          this.currentIndex = i;
          this.swap(true);
        }  
        var seekWhenReady = setInterval( function (t) {
          if (self.playingVideo.readyState == 4) {
            self.playingVideo.currentTime = t;
			console.log("time: " + self.playingVideo.currentTime);
            clearInterval(seekWhenReady);
          }
        },1);
		break;
    }
  };	
} ());