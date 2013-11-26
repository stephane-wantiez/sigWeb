var Player = function(){
	var self = this;
	Character.call(this);
    
    //TODO: bind event
    $(document).keyup(function(e){ self.onKeyUp(e.which);});
    $(document).keydown(function(e){ lastEvent = e; self.onKeyDown(e.which);});
	
	this.speed = {
		x: 600,
		y: 200
	};

	this.spriteList = {/*
		"idle-left": new Sprite(this.$elm, "idle-left", "/sigWeb-static/img/sprite/revert-idle-1-2-1.png", 2048, 256, 16, 2, true),
		"idle-right": new Sprite(this.$elm, "idle-right", "/sigWeb-static/img/sprite/idle-1-2-1.png", 2048, 256, 16, 2, true),
		"attack-left": new Sprite(this.$elm, "attack-left", "/sigWeb-static/img/sprite/revert-attack-1-2-1.png", 2048, 128, 16, 1, false),
		"attack-right": new Sprite(this.$elm, "attack-right", "/sigWeb-static/img/sprite/attack-1-2-1.png", 2048, 128, 16, 1, false),
		"move-left": new Sprite(this.$elm, "move-left", "/sigWeb-static/img/sprite/revert-move-1-2-1.png", 896, 128, 7, 1, true),
		"move-right": new Sprite(this.$elm, "move-right", "/sigWeb-static/img/sprite/move-1-2-1.png", 896, 128, 7, 1, true)*/
	};

	this.keyList = {};/*
	this.spriteList["move-left"].frameCount = 6;
	this.spriteList["move-right"].frameCount = 6;
	this.revertDirection = false;
	this.setSprite("idle");*/
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

Player.MOVE_UP_KEY     = 90 ; // Z
Player.MOVE_DOWN_KEY   = 83 ; // S
Player.MOVE_LEFT_KEY   = 81 ; // Q
Player.MOVE_RIGHT_KEY  = 68 ; // D
Player.MOVE_ATTACK_KEY = 32 ; // Space

Player.prototype.update = function(deltaTime){

    //console.log(this.keyList);
    
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

Player.prototype.isKeyDown = function(k)
{
    return this.keyList[k];
}

Player.prototype.onKeyDown = function(k){
    this.keyList[k] = true;
};
Player.prototype.onKeyUp = function(k){
    this.keyList[k] = false;

};