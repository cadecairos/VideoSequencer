/* 
** VideoSequencer.js
** Created by: Christopher Decairos
** Date: October 15, 2010
*/

(function() {

	var VideoSequencer = this.VideoSequencer = function() {
	
		/* save reference to self */
		var self = this;
		
		/* video tags */
		this.playingVideo;
		this.nextVideo;
	    
		/* video data */
	    this.segments = [];
		this.currentIndex = 0;
		this.width;
		this.height;
	    
	    /* Length of all segments */
	    this.duration = 0;

	    /* Current Time */
	    this.currentTime = 0;

	    /* Target Div for Video tags  */
	    this.divTag;
		
		var swapTo = function(index, time) {
			for (var i = 0; i < segments.length; i++) {
				if (i === index) {
					segments[i].setAttribute("style", "display: inline");
					segments[i].currentTime = time;
					segments[i].play();
				}
				else {
					segments[i].pause();
					segments[i].setAttribute("style", "display: none");
				}
			}
		};
		
		var seek = function(seconds) {
			if (seconds > duration || seconds < 0) { return; }

			for (var i = 0; i < segments.length; i++) {
				if (segments[i].duration > seconds) {
					swapTo(i, seconds);
					break;
				}
				else {
					seconds -= segments[i].duration;
				}
			}
		};
		
        this.init();
    };
	
	VideoSequencer.prototype.calculateDuration = function() {
		for (var i = 0, len = this.segments.length; i < len; i++) {
			this.duration += parseInt(this.segments[i].length);
		}			
	};
	
	VideoSequencer.prototype.swap = function() {
		var that = this;
		this.divTag.removeChild(this.playingVideo);
		delete this.playingVideo;
		this.playingVideo = this.nextVideo;
		delete this.nextVideo;
		this.playingVideo.setAttribute("style", "display: inline");
		this.playingVideo.setAttribute("id", "active");
		this.playingVideo.addEventListener("timeupdate", function() { return that.update(); }, false );
		this.playingVideo.play();		
		this.nextVideo = this.createVideoTag(this.width,this.height,true, true);
	}
	
	VideoSequencer.prototype.init = function() {
		this.playingVideo = document.getElementById('active');
		this.segDta = this.playingVideo.getAttribute("segment-data");
		this.width = this.playingVideo.hasAttribute("width") ? this.playingVideo.getAttribute("width") : null;
		this.height = this.playingVideo.hasAttribute("height") ? this.playingVideo.getAttribute("height") : null;
		this.convertXML(this.getSegmentData(this.playingVideo.getAttribute('segment-data')).responseXML);
		this.calculateDuration();
		this.divTag = document.getElementById("videoDiv");
		this.updateVideos();
	};
		
	VideoSequencer.prototype.updateVideos = function() {
		this.divTag.removeChild(this.playingVideo);
		delete this.playingVideo;
		this.playingVideo = this.createVideoTag(this.width,this.height,true, false);
		this.nextVideo = this.createVideoTag(this.width,this.height,true, true);
	};
		
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
			this.swap();
		}
	};
	
	VideoSequencer.prototype.createVideoTag = function(width, height, controls, hidden) {
		var that = this;
		var newVid = document.createElement("video");
		if (width != null)  newVid.setAttribute("width", width);
		if (height != null) newVid.setAttribute("height", height);
		if (controls) newVid.setAttribute("controls",""); 
		newVid.setAttribute("segment-data", this.segDta);
		if (!hidden) {
			newVid.setAttribute("src", this.segments[this.currentIndex].src);
			newVid.setAttribute("style", "display: inline");
			newVid.setAttribute("id", "active");
			newVid.addEventListener("timeupdate", function() { return that.update(); }, false );
		} else {
			if(this.currentIndex >= this.segments.length) { this.currentIndex = 0; }
			newVid.setAttribute("src", this.segments[this.currentIndex + 1] ? this.segments[this.currentIndex + 1].src : this.segments[0].src);
			newVid.setAttribute("id", "inactive");
			newVid.setAttribute("style", "display: none");
			newVid.autobuffer = true;
			
		}	
		this.divTag.appendChild(newVid);
		return newVid;
	}
	
    VideoSequencer.prototype.play = function() {

    };

    VideoSequencer.prototype.pause = function() {

    };

    VideoSequencer.prototype.add = function(vid) {
    };
} ());
