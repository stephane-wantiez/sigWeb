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