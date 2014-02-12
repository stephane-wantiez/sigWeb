/** 
* Script file generated on Wed, 12 Feb 2014 11:39:32 +0000
**/


/** From file C:\workspace\sigWeb\web-static-src\base\AssetManager.js **/

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


/** From file C:\workspace\sigWeb\web-static-src\base\Camera.js **/

var Camera = function(player){
	var self = this;
	
	this.player = player;
	
	this.player.addPositionListener(function(x,y){
        self.refreshView(x,y);
    });
	
	this.x = 0;
	this.y = 0;
	
	this.decalX = 512;
	this.decalY = 300;

};
Camera.SCREEN_WIDTH = 1024;
Camera.SCREEN_HEIGHT = 600;
Camera.SCENE_WIDTH = 4096;
Camera.SCENE_HEIGHT = 2037;
Camera.MIN_X = -Camera.SCENE_WIDTH + Camera.SCREEN_WIDTH;
Camera.MAX_X = 0;
Camera.MIN_Y = -Camera.SCENE_HEIGHT + Camera.SCREEN_HEIGHT;
Camera.MAX_Y = 0;

Camera.prototype.refreshView = function(playerX, playerY){
	var self = this;
	var newX = -playerX + this.decalX;
	var newY = -playerY + this.decalY;
	if(newX < Camera.MIN_X){
		newX = Camera.MIN_X;
	}else if(newX > Camera.MAX_X){
		newX = Camera.MAX_X;
	}
	if(newY < Camera.MIN_Y){
		newY = Camera.MIN_Y;
	}else if(newY > Camera.MAX_Y){
		newY = Camera.MAX_Y;
	}
	
	$.ease({x: this.x, y: this.y}, {x: newX, y: newY}, function(o){
		self.legacyX = Math.round(o.x);
		self.legacyY = Math.round(o.y);
		self.setViewPosition(Math.round(o.x), Math.round(o.y));
	},  {
		duration: 200,
		easing: "easeOutExpo"
	});
};
Camera.SHAKE_SCREEN_DURATION = 200;
Camera.SHAKE_SCREEN_DISTANCE = 1;
Camera.prototype.shake = function(factor){
	var self = this;
	if(!factor){
		factor = 1;
	}
    var from = 0;
    var to = 100;
    $.ease(
        from,
        to,
        function(v){
            //console.log("shake step - v=" + v + " - " + parseInt(v) + " (" + typeof(v) + ")");
            self.setViewPosition( self.legacyX+(Math.random()*2-1)*factor*Camera.SHAKE_SCREEN_DISTANCE,
                                  self.legacyY+(Math.random()*2-1)*factor*Camera.SHAKE_SCREEN_DISTANCE );
        },{duration:Math.round(Camera.SHAKE_SCREEN_DURATION*factor),
        complete:function(){
            //console.log("shake done");
            self.setViewPosition(self.legacyX,self.legacyY);
        }});
};
Camera.prototype.setViewPosition = function(x, y){
	//console.log("Moving camera to "+x+","+y + " (was " + this.x + "," + this.y + ")");
	this.x = parseInt(x);
	this.y = parseInt(y);
};
Camera.prototype.render = function(g)
{
    g.translate(this.x,this.y);
};


/** From file C:\workspace\sigWeb\web-static-src\base\Sprite.js **/

var Sprite = function( id, img, width, height, colCount, rowCount, loop)
{
	this.id = id;
    this.img = img;
	this.loop = loop;
	this.rowCount = rowCount;
	this.colCount = colCount;
	this.frameCount = this.rowCount * this.colCount;
	this.currentFrame = 0;
	this.setFrameRate(16);
	this.invert = false;
	this.invertAnim = false;
    this.revertDirection = false;
	this.scale = 1;
	this.lastUpdateTime = 0;
	this.imgWidth = width;
	this.imgHeight = height;
	this.width = Math.round(this.imgWidth / this.colCount);
	this.height = Math.round(this.imgHeight / this.rowCount);
	this.centerX = 0;
	this.centerY = 0;
};

Sprite.prototype.setUrl = function(url)
{
	if(this.url != url){
		this.url = url;
		this.$img.attr("src", this.url);
	}
};

Sprite.prototype.setRevertDirection = function(v)
{
    this.revertDirection = v;
};

Sprite.prototype.setCenter = function(x, y)
{
	this.centerX = x;
	this.centerY = y;
};

Sprite.prototype.show = function(type, options)
{
	if(this.loop){
		this.currentFrame = 0;
		this.play();
	}
};
Sprite.prototype.hide = function(hideType)
{
	this.stop();
};
Sprite.prototype.play = function(onComplete)
{
	var _this = this;
	if(this.player){
		clearTimeout(this.player);
	}
	var frameDuration = this.frameDuration;
	if(this.character && this.character.slowMotion){
		frameDuration = Math.round(frameDuration * 1.5);
	}
	this.player = setTimeout(function(){
		_this.nextFrame();
		if(_this.loop || _this.currentFrame < _this.frameCount - 1){
			_this.play(onComplete);
		}else if((typeof onComplete) == "function"){
			onComplete(_this);
		}
	}, frameDuration);
};
Sprite.prototype.resetAnim = function()
{
	this.stop();
	this.currentFrame = 0;
};
Sprite.prototype.stop = function()
{
	if(this.player){
		clearTimeout(this.player);
		this.player = false;
	}
};
Sprite.prototype.nextFrame = function(frames)
{
	if(!frames){
		frames = 1;
	}
	this.currentFrame = this.currentFrame + frames;
	if(this.currentFrame >= this.frameCount){
		if(this.loop){
			this.currentFrame %= this.frameCount;
		}else{
			this.currentFrame = this.frameCount - 1;
		}
	}
	if(this.currentFrame == this.frameCount - 1 && !this.loop && this.onAnimationComplete){
		this.onAnimationComplete(this);
		this.onAnimationComplete = false;
	}
};
Sprite.prototype.render = function(g)
{
    g.save();

    var frame = this.invertAnim ? ( this.frameCount - this.currentFrame - 1 ) : this.currentFrame;
    
    var currentCol = frame % this.colCount ;
    var currentRow = Math.floor( frame / this.colCount ) ;
    
    if(this.invert)
    {
        currentCol = this.colCount - currentCol - 1 ;
        currentRow = this.rowCount - currentRow - 1 ;
    }
    
    var sx = Math.round( this.width  * currentCol );
    var sy = Math.round( this.height * currentRow );
    
    var currentScaleX = this.scale * ( this.revertDirection ? -1 : 1 );
    g.scale(currentScaleX,this.scale);
    
    g.drawImage( this.img, sx, sy, this.width, this.height, -this.centerX, -this.centerY, this.width, this.height );
    //console.log("sx=" + sx + ", sy=" + sy + ", this.scale=" + this.scale + ", currentScaleX=" + currentScaleX + ", this.width=" + this.width + ", this.height=" + this.height);
    //console.log("this.currentFrame=" + this.currentFrame + ",currentRow=" + currentRow + ",currentCol=" + currentCol + ",this.frameCount=" + this.frameCount + ",this.colCount=" + this.colCount );
    
    g.restore();
};
Sprite.prototype.setFrameRate = function(frameRate)
{
	this.frameRate = frameRate;
	this.frameDuration = 1.0 / this.frameRate * 1000;
};
Sprite.prototype.setScale = function(scale)
{
	if(this.scale != scale){
		this.scale = scale;
	}
};


/** From file C:\workspace\sigWeb\web-static-src\base\utils\utils.js **/

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback, element) {
           window.setTimeout(callback, 1000/60);
         };
})();


$.getTimeMillis = function(){
	return new Date().getTime();
};
$.getTimeFloat = function(){
	return $.getTimeMillis() / 1000;
};
var localTime = Math.floor(new Date().getTime() / 1000);
$.getTime = function(){
	var timeElapsed = Math.floor($.getTimeFloat()) - localTime;
	return serverTime + timeElapsed;
};
$.getElmRegion = function(elm){
	var pos = elm.offset();
	var rootPos = gameManager.root.offset();
	var posX = pos.left - rootPos.left;
	var posY = pos.top - rootPos.top;
	var w = elm.width();
	var h = elm.height();
	return {
		posX: posX,
		posY: posY,
		width: w,
		height: h
	};
};

$.ease = function(from, to, func, options){
	var isObject = true;
	if(typeof from != "object"){
		from = {v: from};
		to = {v: to};
		isObject = false;
	}
	var o = {};
	if(options){
		for(i in options){
			o[i] = options[i];
		}
	}
	o.step = function(f){
		if(isObject){
			var res = {};
			for(i in from){
				res[i] = f * (to[i] - from[i]) + from[i];
			}
			func(res);
		}else{
			func(f * (to.v - from.v) + from.v);
		}
	};
	var listener = $({f:0});
	if(options && options.delay){
		listener.delay(options.delay).animate({f:1}, o);
	}else{
		listener.animate({f:1}, o);
	}
	return listener;
};

$.shuffle = function(list){
	var i, j, t;
	for (i = 1; i < list.length; i++) {
		j = Math.floor(Math.random() * (1 + i));
		if (j != i) {
			t = list[i];
			list[i] = list[j];
			list[j] = t;
		}
	}
};

$.clamp = function(value,min,max)
{
    return Math.max(Math.min(value,max),min);
}

$.distanceBetweenPointsSquared = function(p1x,p1y,p2x,p2y)
{
    return ( p2x - p1x ) * ( p2x - p1x ) + ( p2y - p1y ) * ( p2y - p1y );
};

$.distanceBetweenPoints = function(p1x,p1y,p2x,p2y)
{
    return Math.sqrt($.distanceBetweenPointsSquared(p1x,p1y,p2x,p2y));
};

$.EASE_FACTOR = 3.5;
$.EASE_FACTOR_EXP = 4;

$.easeInCustom = function(timeNorm)
{
    return Math.pow(timeNorm,$.EASE_FACTOR);
};

$.easeOutCustom = function(timeNorm)
{
    return Math.pow(timeNorm,1/$.EASE_FACTOR);
};

$.easeInExpCustom = function(timeNorm)
{
    return Math.pow(timeNorm,$.EASE_FACTOR_EXP);
};

$.easeOutExpoCustom = function(timeNorm)
{
    return Math.pow(timeNorm,1/$.EASE_FACTOR_EXP);
};

$.easeInSinCustom = function(timeNorm)
{
    return Math.sin(-Math.PI/2+timeNorm*Math.PI/2)+1;
};

$.easeOutSinCustom = function(timeNorm)
{
    return Math.sin(timeNorm*Math.PI/2);
};

$.easeInOutSinCustom = function(timeNorm)
{
    return (1 + Math.sin(-Math.PI/2+timeNorm*Math.PI)) / 2;
};

$.showEase = function(g,rect,ease)
{
    g.save();
    
    g.translate(rect.x,rect.y);
    
    g.fillStyle = "black";
    g.fillRect(0,0,rect.width,rect.height);
    
    g.fillStyle = "red";
    
    var nbPoints = 50;
    
    for(var i = 0 ; i <= nbPoints ; ++i)
    {
        var vx = i / nbPoints;
        var px = vx * rect.width;
        
        var vy = ease(vx);
        var py = vy * rect.height;
        
        g.fillRect(px,rect.height-py,1,1);
    }
    
    g.restore();
};



/** From file C:\workspace\sigWeb\web-static-src\characters\Character.js **/

var Character = function()
{
    this.health = 100;
    this.dead = false;
    this.revertDirection = false;
	this.spriteList = {};
	this.currentSprite = false;
	this.positionListenerList = [];
    this.radius = 1;
};

Character.prototype.addDamage = function(dmg)
{
    this.health -= dmg;
};

Character.prototype.createSprite = function(id,url,width,height,colCount,rowCount,loop)
{
    this.spriteList[id] = new Sprite(id,url,width,height,colCount,rowCount,loop);
};

Character.prototype.setSprite = function(anim, onComplete){
	this.lastAnimId = anim;
	var spriteId = anim;
	if(this.currentSprite != this.spriteList[spriteId]){
		if(!this.currentSprite || this.currentSprite.loop || this.currentSprite.currentFrame == this.currentSprite.frameCount - 1){
			if(this.currentSprite){
				this.currentSprite.stop();
				this.currentSprite.hide();
			}
			this.currentSprite = this.spriteList[spriteId];
			this.currentSprite.resetAnim();
			this.currentSprite.play(onComplete);
			this.currentSprite.show();
        }else{
            this.nextSprite = anim;
        }
	}
};

Character.prototype.addPositionListener = function(listener){
	this.positionListenerList.push(listener);
};

Character.prototype.firePositionChange = function()
{
    for(var listenerIndex in this.positionListenerList)
    {
        this.positionListenerList[listenerIndex](this.x,this.y);
    }
};

Character.prototype.setPosition = function(x, y)
{
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.firePositionChange();
};

Character.prototype.moveTo = function(x, y)
{
	var self = this;
	if(this.animHandler){
		this.animHandler.stop(false, false);
	}
	this.animHandler = $.ease({
		x: this.x,
		y: this.y
	}, {
		x: x, 
		y: y
	}, function(o){
		self.setPosition(o.x, o.y);
	},
	{
		easing: "easeOutCirc",
		duration: 300
	});
};
Character.prototype.move = function(x, y)
{
	this.moveTo(this.x + x, this.y + y);
};
Character.prototype.render = function(g)
{
    if(this.currentSprite)
    {
        g.save();
        g.translate(this.x,this.y);
        
        this.currentSprite.setRevertDirection(this.revertDirection);
        this.currentSprite.render(g);
        
        g.restore();
    }
};

Character.prototype.update = function(deltaTimeSec)
{
};



/** From file C:\workspace\sigWeb\web-static-src\characters\Ennemy.js **/

var Ennemy = function(assetManager){
	var _this = this;
	Character.call(this);
	
	this.centerX = 64;
	this.centerY = 120;
	
	this.createSprite("idle", assetManager.getImage("mob-idle"), 2048, 128, 16, 1, true);
	this.createSprite("attack", assetManager.getImage("mob-attack"), 1536, 128, 12, 1, false);
	this.createSprite("death", assetManager.getImage("mob-death"), 1792, 128, 14, 1, false);
	this.createSprite("damage", assetManager.getImage("mob-damage"), 1920, 128, 15, 1, false);

	for(var i in this.spriteList){
		this.spriteList[i].setCenter(this.centerX, this.centerY);
	}

	this.setSprite("idle");
	this.setPosition(Ennemy.MIN_X + Math.random() * (Ennemy.MAX_X - Ennemy.MIN_X), Ennemy.MIN_Y + Math.random() * (Ennemy.MAX_Y - Ennemy.MIN_Y));

	var finalScale = this.scale;
	$.ease(0, 1, function(v){
		_this.setScale(v * finalScale);
	}, 1000);

};
Ennemy.MIN_Y = 1550;
Ennemy.MAX_Y = 1920;
Ennemy.MIN_X = 2400;
Ennemy.MAX_X = 4000;
Ennemy.MIN_SCALE = 0.3;
Ennemy.MAX_SCALE = 0.8;

Ennemy.prototype = new Character();
Ennemy.prototype.setPosition = function(x, y){
	var lastY = this.y;
	Character.prototype.setPosition.call(this, x, y);
	
	if(this.y != lastY){
		var factor = (y - Ennemy.MIN_Y) / (Ennemy.MAX_Y - Ennemy.MIN_Y);
		this.setScale(factor * (Ennemy.MAX_SCALE - Ennemy.MIN_SCALE) + Ennemy.MIN_SCALE);
	}
};
Ennemy.prototype.setScale = function(scale){
	this.scale = scale;
	for(var i in this.spriteList){
		this.spriteList[i].setScale(this.scale);
	}
};


/** From file C:\workspace\sigWeb\web-static-src\characters\Mob.js **/

var Mob = function(assetManager,id)
{
	var self = this;
	Character.call(this);
    
    this.id = id;
    
    this.centerX =  64;
    this.centerY = 120;
    this.radius = 60;
    
    this.createSprite("idle",  assetManager.getImage("mob-idle"  ), 2048, 128, 16, 1,  true);
    this.createSprite("attack",assetManager.getImage("mob-attack"), 1536, 128, 12, 1, false);
    this.createSprite("damage",assetManager.getImage("mob-damage"), 1920, 128, 15, 1, false);
    this.createSprite("death", assetManager.getImage("mob-death" ), 1792, 128, 14, 1, false);
    
    for (var i in this.spriteList)
    {
        this.spriteList[i].setCenter(this.centerX,this.centerY);
    }

	this.keyList = {};
	this.revertDirection = false;
	this.setSprite("idle");
};

Mob.MIN_Y = 1550;
Mob.MAX_Y = 1920;
Mob.MIN_X = 2400;
Mob.MAX_X = 4000;
Mob.MIN_SCALE = 0.3;
Mob.MAX_SCALE = 0.8;
Mob.DISAPPEAR_DELAY = 5000;

Mob.sorter = function(mob1,mob2)
{
    return mob1.y - mob2.y; // -x if mob1.y < mob2.y, 0 if =, +x if >
};

Mob.prototype = new Character();
Mob.prototype.init = function(){
};

Mob.prototype.setRandomDir = function()
{
    var rdir = Math.random() < 0.5;
    this.revertDirection = rdir;
};

Mob.prototype.setRandomPosition = function()
{
    var rx = Mob.MIN_X + Math.random() * (Mob.MAX_X - Mob.MIN_X);
    var ry = Mob.MIN_Y + Math.random() * (Mob.MAX_Y - Mob.MIN_Y);
    this.setPosition(rx,ry);
};

Mob.prototype.setPosition = function(x, y)
{
	var lastY = this.y;
	Character.prototype.setPosition.call(this, x, y);
	
	if(this.y != lastY){
		var factor = (y - Mob.MIN_Y) / (Mob.MAX_Y - Mob.MIN_Y);
        this.setScale(factor * (Mob.MAX_SCALE - Mob.MIN_SCALE) + Mob.MIN_SCALE);
	}
};

Mob.prototype.setScale = function(scale)
{
        this.scale = scale;
        for(var i in this.spriteList){
                this.spriteList[i].setScale(this.scale);
        }
};

Mob.prototype.kill = function()
{
    this.dead = true;
};

Mob.prototype.addDamage = function(dmg)
{
    if (this.health <= 0) return;
    
    Character.prototype.addDamage.call(this,dmg);
    
    if (this.health <= 0)
    {
        this.setSprite("death");
        var self = this;
        setTimeout( function(){self.kill();}, Mob.DISAPPEAR_DELAY );
    }
    else
    {
        this.setSprite("damage");
    }
};


/** From file C:\workspace\sigWeb\web-static-src\characters\Player.js **/

var Player = function(assetManager)
{
	var self = this;
	Character.call(this);
    
    this.centerX =  64;
    this.centerY = 120;
    this.radius = 60;
    
    //TODO: bind event
    $(document).keyup(function(e){ self.onKeyUp(e.which);});
    $(document).keydown(function(e){ lastEvent = e; self.onKeyDown(e.which);});
	
	this.speed = {
		x: 600,
		y: 200
	};

	/*this.spriteList = {
		"idle-left": new Sprite(this.$elm, "idle-left", "/sigWeb-static/img/sprite/revert-idle-1-2-1.png", 2048, 256, 16, 2, true),
		"idle-right": new Sprite(this.$elm, "idle-right", "/sigWeb-static/img/sprite/idle-1-2-1.png", 2048, 256, 16, 2, true),
		"attack-left": new Sprite(this.$elm, "attack-left", "/sigWeb-static/img/sprite/revert-attack-1-2-1.png", 2048, 128, 16, 1, false),
		"attack-right": new Sprite(this.$elm, "attack-right", "/sigWeb-static/img/sprite/attack-1-2-1.png", 2048, 128, 16, 1, false),
		"move-left": new Sprite(this.$elm, "move-left", "/sigWeb-static/img/sprite/revert-move-1-2-1.png", 896, 128, 7, 1, true),
		"move-right": new Sprite(this.$elm, "move-right", "/sigWeb-static/img/sprite/move-1-2-1.png", 896, 128, 7, 1, true)
	};*/
    
    this.shootShound = assetManager.getSound("sound");
    
    this.createSprite("idle",  assetManager.getImage("player-idle"  ), 2048, 256, 16, 2,  true);
    this.createSprite("attack",assetManager.getImage("player-attack"), 2048, 128, 16, 1, false);
    this.createSprite("move",  assetManager.getImage("player-move"  ),  896, 128,  7, 1,  true);
    
    for (var i in this.spriteList)
    {
        this.spriteList[i].setCenter(this.centerX,this.centerY);
    }

	this.keyList = {};
	this.spriteList["move"].frameCount = 6;
	this.revertDirection = false;
	this.setSprite("idle");
};
Player.MIN_Y = 1455;
Player.MAX_Y = 1920;
Player.MIN_SCALE = 0.5;
Player.MAX_SCALE = 1.3;

Player.prototype = new Character();
Player.prototype.init = function(){
};
Player.prototype.setPosition = function(x, y){
	var lastY = this.y;
	Character.prototype.setPosition.call(this, x, y);
	
	if(this.y != lastY){
		var factor = (y - Player.MIN_Y) / (Player.MAX_Y - Player.MIN_Y);
        this.setScale(factor * (Player.MAX_SCALE - Player.MIN_SCALE) + Player.MIN_SCALE);
	}
};

Player.prototype.setScale = function(scale){
        this.scale = scale;
        for(var i in this.spriteList){
                this.spriteList[i].setScale(this.scale);
        }
};

Player.MOVE_UP_KEY     = 38 ; // up arrow
Player.MOVE_DOWN_KEY   = 40 ; // down arrow
Player.MOVE_LEFT_KEY   = 37 ; // left arrow
Player.MOVE_RIGHT_KEY  = 39 ; // right arrow
Player.MOVE_ATTACK_KEY = 32 ; // Space

Player.prototype.update = function(deltaTime)
{
	var move = {x: 0, y: 0};    
    if (this.isKeyDown(Player.MOVE_LEFT_KEY )) move.x = -this.speed.x * deltaTime * this.scale;
    if (this.isKeyDown(Player.MOVE_RIGHT_KEY)) move.x =  this.speed.x * deltaTime * this.scale;
    if (this.isKeyDown(Player.MOVE_UP_KEY   )) move.y = -this.speed.y * deltaTime * this.scale;
    if (this.isKeyDown(Player.MOVE_DOWN_KEY )) move.y =  this.speed.y * deltaTime * this.scale;
    
    var isMoving = move.x || move.y;
    var isAttacking = this.isKeyDown(Player.MOVE_ATTACK_KEY);
    
    if (move.x) this.revertDirection = move.x < 0;
    if (isMoving) this.move(move.x, move.y);
        
	this.setSprite(isAttacking?"attack":(isMoving?"move":"idle"));
};

Player.prototype.attack = function()
{
    this.shootShound.currentTime = 0;
    this.shootShound.play();

    //console.log("attack");
    game.checkCollisionWithEnemies(function(enemy)
    {
        enemy.addDamage(50);
    });
};

Player.prototype.isKeyDown = function(k)
{
    return this.keyList[k];
}

Player.prototype.onKeyDown = function(k){
    //console.log("Key down: " + k);
    this.keyList[k] = true;
    
    if (k == Player.MOVE_ATTACK_KEY) this.attack();
};
Player.prototype.onKeyUp = function(k){
    //console.log("Key up: " + k);
    this.keyList[k] = false;

};


/** From file C:\workspace\sigWeb\web-static-src\ui\0-Page.js **/

var Page = function(content){
	this.root = document.createElement("div");
	this.root.innerHTML = content;
};
Page.prototype.append = function(content){
	if(typeof(content) == "string"){
		this.root.innerHTML += content;
	}else{
		this.root.appendChild(content.get(0));
	}
};
Page.prototype.setVisible = function(visible){
	//this.root.style.display = visible?"block":"none";
    if(visible){
        $(this.root).show(/*"slide"*/"fade");
    } else {
        $(this.root).hide();
    }
};


/** From file C:\workspace\sigWeb\web-static-src\ui\InfoPage.js **/


var InfoPage = function(){
	Page.call(this, "");
	
	this.$playerPreview = $("<div/>").addClass("player-preview");
	this.append(this.$playerPreview);

	this.$playerName = $("<div>").addClass("player-name").append("nom");
	this.append(this.$playerName);
	
	this.$playerTitle = $("<div>").addClass("player-title").append("title");
	this.append(this.$playerTitle);

	this.$playerProgress = $('<div class="player-progress"/>');
	this.$playerProgressIndic = $('<div class="player-progress-indic"/>');
	this.$playerProgress.append(this.$playerProgressIndic);
	this.append(this.$playerProgress);
	
	this.$attributeContainer = $("<dl>");
	this.append(this.$attributeContainer);

	this.attributeList = {};
	this.addAttribute("xp", "XP");
	this.addAttribute("hp", "HP");
	this.addAttribute("power", "Puissance");
};
InfoPage.prototype = new Page();

InfoPage.prototype.refreshData = function(playerData){
	for(var i in playerData){
		switch(i){
		case "name":
			this.$playerName.html(playerData.name);
			break;
		case "title":
			this.$playerTitle.html(playerData.title);
			break;
		case "progress":
			this.$playerProgressIndic.css("width", Math.round(playerData.progress * 100) + '%');
			break;
		default:
			if(typeof(this.attributeList[i]) != "undefined"){
				this.attributeList[i].html(playerData[i]);
			}
		}
	}
};
InfoPage.prototype.addAttribute = function(id, label){
	var dt = $("<dt>").append(label);
	this.$attributeContainer.append(dt);
	
	var dd = $("<dd>").addClass(id);
	this.$attributeContainer.append(dd);
	
	this.attributeList[id] = dd;
};


/** From file C:\workspace\sigWeb\web-static-src\ui\Window.js **/

var Window = function(id,parent){
	this.id = id;
	
	this.root = document.createElement("div");
	this.root.className = "window";
    this.root.setAttribute("id",this.id);
    
    this.menu = document.createElement("div");
    this.menu.className = "menu";
    this.root.appendChild(this.menu);
    
    this.menuList = document.createElement("ul");
    this.menu.appendChild(this.menuList);
    
    this.content = document.createElement("div");
    this.content.className = "content";
    this.root.appendChild(this.content);
    
    parent.appendChild(this.root);
	
	this.currentLink = null;
};
Window.prototype.addPage = function(title, page){
	if(!(page instanceof Page)){
		throw page + " is not instanceof Page";
	}
	
	var menuElm = document.createElement("li");
    menuElm.page = page;
    menuElm.innerHTML = title;
    this.menuList.appendChild(menuElm);
    
    var self = this;
    menuElm.addEventListener("click",function(){
        self.showPage(menuElm);
    });
    
    this.content.appendChild(page.root);
    page.setVisible(false);
	
	if(this.currentLink == null){
		this.showPage(menuElm);
	}
};

Window.prototype.showPage = function(menuElm){

    if (this.currentLink){
        this.currentLink.page.setVisible(false);
        this.currentLink.setAttribute("class"," ");
    }
    
	menuElm.page.setVisible(true);
    menuElm.setAttribute("class","selected");
        
    this.currentLink = menuElm;
};


/** From file C:\workspace\sigWeb\web-static-src\zzz-Game.js **/

var Game = function()
{
	var self = this;
	var sleep = 1;
	this.localTime = 0;
	this.globalTime = 0;
	this.timeSinceLoadingEnd = 0;

	//var win = new Window('main-window', document.getElementById("gui"));
	var win = new Window('main-window', document.getElementById("gui"));
	
	infoPage = new InfoPage();
	try{
		win.addPage("info", infoPage);
		win.addPage("description", new Page("<strong>hello</strong> world"));
		win.addPage("equipement", new Page("lorem ipsum"));
	}catch(e){
		console.log("New Exception : " + e);
	}
	
	infoPage.refreshData({
		name: user.login,
		title: "dummy title",
		xp: user.xp,
		hp: user.hp,
		power: user.power,
		progress: 0.8
	});
    
    $gui = $("#gui");
    scene = $(".scene-view").get(0);
    this.graphics = scene.getContext("2d");
    this.graphics.canvas = scene;
    
    var sleep=0;
    var assetsPath = "/sigWeb-static/";
    var imagesPathPrefix = assetsPath + "img/getImage.php?url=";
    var imagesPathSuffix = "&sleep="+sleep;
    var soundsPath = assetsPath + "sounds/";
    
    imageList = {
        "background"    : imagesPathPrefix +              "forest.jpg" + imagesPathSuffix,
        "player-idle"   : imagesPathPrefix +   "sprite/idle-1-2-1.png" + imagesPathSuffix,
        "player-attack" : imagesPathPrefix + "sprite/attack-1-2-1.png" + imagesPathSuffix,
        "player-move"   : imagesPathPrefix +   "sprite/move-1-2-1.png" + imagesPathSuffix,
        "mob-idle"      : imagesPathPrefix +       "sprite/idle-1.png" + imagesPathSuffix,
        "mob-damage"    : imagesPathPrefix +     "sprite/damage-1.png" + imagesPathSuffix,
        "mob-attack"    : imagesPathPrefix +     "sprite/attack-1.png" + imagesPathSuffix,
        "mob-death"     : imagesPathPrefix +      "sprite/death-1.png" + imagesPathSuffix
    };
    var soundList = {
        "music" : soundsPath + "test.mp3",
        "sound" : soundsPath + "test.wav"
    };
    
    this.assetManager = new AssetManager();
    this.assetManager.startLoading(imageList,soundList);

	$gui.append($("<div>").button().css({position:"absolute",top:"5px",left:"5px"}).append("Menu").click(function(){
        if($(win.root).hasClass("visible"))
        {
            console.log("clicked when visible");
            $(win.root).removeClass("visible");
        }
        else
        {
            console.log("clicked when invisible");
            $(win.root).addClass("visible");
        }
	}));
	$gui.append($("<div>").button().css({position:"absolute",top:"5px",right:"80px"}).append("Logout").click(function(){
        location.href="?logout";
	}));
	$gui.append($("<div>").button().css({position:"absolute",top:"5px",right:"5px"}).append("Delete User").click(function(){
        location.href="?delete";
	}));

    player = new Player(this.assetManager);
	camera = new Camera(player);

	player.setPosition(3530, 1770);
    //player.setPosition(100, 100);
	player.init();
    
    this.enemyList = [];
    setInterval( function(){game.generateEnemy();}, 1000 );
	
	requestAnimFrame(
		function loop() {
			self.mainLoop();
			requestAnimFrame(loop);
		}					
	);
};

Game.prototype.tween = function(from, to, startTime, duration, easing)
{
    var now = Date.now();
    if (now - startTime < duration)
    {
        var normValue = (now - startTime) / duration;
        if (typeof(easing) != "undefined") normValue = $.clamp(easing(normValue),0,1);
        return from + (to-from) * normValue;
    }
    return to;
};

Game.MAX_NB_ENEMIES = 100;

Game.prototype.generateEnemy = function()
{
    if (this.enemyList.length==Game.MAX_NB_ENEMIES) return;
    var enemyId = "mob-" + Date.now();
    var enemy = new Mob(this.assetManager,enemyId);
    enemy.setRandomPosition();
    enemy.setRandomDir();
    this.enemyList.push(enemy);
    this.enemyList.sort(Mob.sorter);
};

Game.prototype.managePlayer = function(deltaSec) 
{
    player.update(deltaSec);
    player.render(this.graphics);
};

Game.prototype.manageCharacters = function(deltaSec)
{
    var playerHandled = false;
    var enemiesToDelete = [];

    for(var enemyId in this.enemyList)
    {
        var enemy = this.enemyList[enemyId];
        
        if (enemy.dead)
        {
            enemiesToDelete.push(enemyId);
            continue;
        }
        
        if ( !playerHandled && (enemy.y > player.y))
        {
            this.managePlayer(deltaSec);
            playerHandled = true;
        }
        
        enemy.update(deltaSec);
        enemy.render(this.graphics);
    }
    
    for(var enemiesToDeleteId in enemiesToDelete)
    {
        delete this.enemyList[enemiesToDelete[enemiesToDeleteId]];
    }
    
    if (!playerHandled)
    {
        this.managePlayer(deltaSec);
    }
};

Game.prototype.checkCollisionWithEnemies = function(collisionCallback)
{
    for(var enemyId in this.enemyList)
    {
        var enemy = this.enemyList[enemyId];
        var distPlayerEnemySquared = $.distanceBetweenPointsSquared(enemy.x,enemy.y,player.x,player.y);
        var playerRadiusSquared = player.radius * player.radius;
        
        if (distPlayerEnemySquared < playerRadiusSquared)
        {
            collisionCallback(enemy);
        }
    }
};

Game.prototype.mainLoop = function()
{
	var now = Date.now();
	var globalTimeDelta = now - this.globalTime;
	var localTimeDelta = Math.min(50, globalTimeDelta);
	this.localTime += localTimeDelta;
    var deltaSec = localTimeDelta / 1000;
    
    this.graphics.drawTimeMillis = now;
    
    this.graphics.clearRect(0,0,scene.width,scene.height);
    
    var doneLoading = this.assetManager.isDoneLoading();
    
    var alphaLoad = 1;
    
    if(doneLoading)
    {
        if (this.timeSinceLoadingEnd == 0) this.timeSinceLoadingEnd = now;
        alphaLoad = this.tween(1,0,this.timeSinceLoadingEnd,1000,$.easeOutExpoCustom);
        
        if (typeof(this.music) == "undefined")
        {
            this.music = this.assetManager.getSound("music");
            this.music.loop = true;
            this.music.play();
        }
    
        this.graphics.save();    
        
        camera.render(this.graphics);
        
        this.graphics.drawImage(this.assetManager.getImage("background"),0,0);
        
        this.manageCharacters(deltaSec);
        
        /*player.x += 100;
        player.render(this.graphics);
        player.x -= 100;
        
        this.graphics.fillStyle = "red";
        this.graphics.fillRect(player.x,player.y,10,10);*/
        
        this.graphics.restore();
        
    }
    if(!doneLoading || alphaLoad > 0)
    {
        this.assetManager.setRenderAlpha(alphaLoad);
        this.assetManager.renderLoadingProgress(this.graphics);
    }

};


/** From file C:\workspace\sigWeb\web-static-src\zzz-main.js **/

var infoPage;

$(document).ready(function(){
	console.log("game started");

	game = new Game();
});

