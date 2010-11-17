/* 
** VideoSequencer.js
** Created by: Christopher Decairos
** Date: October 15, 2010
*/

(function () {

	var VideoSequencer = this.VideoSequencer = function () {
	
		/* save reference to self */
		var self = this;
		
		/* video tags */
		this.playingVideo;
		this.nextVideo;
	    
		/* video data */
	    this.segments =[];
	    
	    /* Length of all segments */
	    this.duration = 0;

	    /* Current Time */
	    this.currentTime = 0;

	    /* Target Div for Video tags  */
	    this.divTag;
		
		var swap = function () {
			for (var i = 0; i < segments.length; i++) {
				if (segments[i].style.display === "inline") {
					segments[i].setAttribute("style", "display: none");
					if (segments[i + 1]) {
						segments[i + 1].setAttribute("style", "display: inline");
						segments[i + 1].currentTime = 0;
						segments[i + 1].play();
						break;
					}
				}
			}
		};
		
		var swapTo = function (index, time) {
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
		
		var seek = function (seconds) {
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
		
		this.playingVideo = document.getElementById ("sequencer");
		this.convertXML(this.getSegmentData(this.playingVideo.getAttribute('segment-data')).responseXML);
        this.init();
    };

	VideoSequencer.prototype.init = function () {
		this.videoDiv = document.getElementById("videoDiv");
		this.playingVideo = document.getElementById('sequencer');
		this.segDta = this.playingVideo.getAttribute("segment-data");
		this.videoDiv.removeChild(this.playingVideo);
		delete this.playingVideo;
		this.playingVideo = document.createElement("video");
		this.playingVideo.setAttribute("src", this.segments[0].src);
		this.playingVideo.setAttribute("width", "250px")
		this.playingVideo.setAttribute("segment-data", this.segDta);
		this.videoDiv.appendChild(this.playingVideo);
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
	
	VideoSequencer.prototype.convertXML = function (xmlDoc){
		var self = this;
		var parseNode = function (node) {
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
	
    VideoSequencer.prototype.play = function () {

    };

    VideoSequencer.prototype.pause = function () {

    };

    VideoSequencer.prototype.add = function (vid) {
        // if (vid) {
            // this.segments[this.segments.length] = vid;
        // }
    };
} ());
