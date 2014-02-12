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