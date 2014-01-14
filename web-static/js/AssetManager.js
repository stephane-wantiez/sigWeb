var AssetManager = function(){
	this.images = {};
	this.sounds = {};
	this.imagesError = {};
	this.imagesToLoad = {};
	this.soundsToLoad = {};
	this.loadingStarted = false;
    this.renderAlpha = 1;
};
AssetManager.prototype.loadImage = function(url, id){
	var _this = this;
	if(!id){
		id = url;
	}
	var img = this.images[id];
	if(!img){
		this.imagesToLoad[id] = url;
		img = new Image();
		img.onload = function(){
			delete _this.imagesToLoad[id];
			_this.assetLoaded();
		};
		img.onerror = function(){
			delete _this.imagesToLoad[id];
			_this.imagesError[id] = id;
			_this.assetLoaded();
		};
		img.src = url;
		this.images[id] = img;
	}else{
		this.assetLoaded();
	}
	return img;
};
AssetManager.prototype.loadSound = function(url, id, onload){
	var _this = this;
	if(!id){
		id = url;
	}
	if(this.sounds[id])
    {
		this.assetLoaded();
	}
    else
    {
        /**
          HTML :
            <audio id="myAudio">
                <source type="audio/mpeg" url="mySoundUrl"/>
            </audio>
        **/
        
        this.soundsToLoad[id] = url;
    
        var soundElem = new Audio();
        
        soundElem.addEventListener("canplay",function(){
            delete _this.soundsToLoad[id];
            _this.assetLoaded();
        });
        soundElem.addEventListener("stalled",function(){
            delete _this.soundsToLoad[id];
            console.log("Error loading sound " + url);
            _this.assetLoaded();
        });
        
        var sourceElem = document.createElement("source");
        sourceElem.src = url;
        
        switch(url.substring(url.length-3))
        {
            case "mp3" : sourceElem.type = "audio/mpeg"; break;
            case "wav" : sourceElem.type = "audio/wav"; break;
            case "ogg" : sourceElem.type = "audio/ogg"; break;
        }
        
        soundElem.appendChild(sourceElem);
        document.body.appendChild(soundElem);
        
		this.sounds[id] = soundElem;
	}
	return this.sounds[id];
};

AssetManager.prototype.assetLoaded = function(){
	this.totalAssetLoaded++;
	this.loadingTime = Date.now() - this.loadingStartTime;
	this.loadingEndTime = Date.now();
};
AssetManager.prototype.setRenderAlpha = function(a){
    this.renderAlpha = a;
};
AssetManager.prototype.renderLoadingProgress = function(g){
    //console.log("Progress: " + this.getLoadingProgress());
    
    g.save();
    
    g.globalAlpha = this.renderAlpha;
    
    g.fillStyle = "black";
    g.fillRect(0,0,g.canvas.width,g.canvas.height);
    g.translate(g.canvas.width/2-100,g.canvas.height/2-10);
    
    var gradient = g.createLinearGradient(0,0,200,20);
    gradient.addColorStop(0,"#00F");
    gradient.addColorStop(1,"#F00");
    
    g.fillStyle = gradient;
    g.fillRect(0,0,200,20);
    
    g.fillStyle = "rgb(" + parseInt((1-this.getLoadingProgress())*255) + "," + parseInt(this.getLoadingProgress()*255) + ",0)";
    g.fillRect(0,0,this.getLoadingProgress()*200,20);
    
    g.font = "10px gunship";
    g.fillStyle = "black";
    g.fillText("Loading: " + this.getLoadingProgress() * 100 + "%",50,14);
    
    //g.globalAlpha = 1;
    
    g.restore();
};

AssetManager.prototype.isDoneLoading = function(){
	return this.totalAssetCount == this.totalAssetLoaded;
};

AssetManager.prototype.startLoading = function(loadingList, soundLoadingList){
	this.loadingStartTime = Date.now();
	
	this.totalAssetLoaded = 0;
	this.totalAssetCount = 0;
	for(var i in loadingList){
		this.totalAssetCount++;
	}
	for(var i in soundLoadingList){
		this.totalAssetCount++;
	}
	this.loadingStarted = true;
	for(var i in soundLoadingList){
		this.loadSound(soundLoadingList[i], i);
	}
	for(var i in loadingList){
		this.loadImage(loadingList[i], i);
	}
};
AssetManager.prototype.getLoadingProgress = function(){
	if(this.totalAssetCount == 0){
		return 0;
	}else{
		return this.totalAssetLoaded / this.totalAssetCount;
	}
};

AssetManager.prototype.getImage = function(id){
	return this.images[id];
};

AssetManager.prototype.getSound = function(id){
	return this.sounds[id];
};