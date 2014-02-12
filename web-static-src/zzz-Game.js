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