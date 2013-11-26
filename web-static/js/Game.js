var Game = function(){
	var self = this;
	var sleep = 1;
	this.localTime = 0;
	this.globalTime = 0;
	

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
		name: "Johnny",
		title: "be good",
		xp: 200,
		hp: 643,
		power: 65,
		progress: 0.8
	});
    
    $gui = $("#gui");
    scene = $(".scene-view").get(0);
    this.graphics = scene.getContext("2d");
    this.graphics.canvas = scene;
    
    var sleep=5;
    var assetsPath = "/sigWeb-static/";
    var imagesPathPrefix = assetsPath + "img/getImage.php?url=";
    var imagesPathSuffix = "&sleep="+sleep;
    
    imageList = {
        "background"    : imagesPathPrefix +       "forest.jpg" + imagesPathSuffix,
        "player-idle"   : imagesPathPrefix +   "idle-1-2-1.png" + imagesPathSuffix,
        "player_attack" : imagesPathPrefix + "attack-1-2-1.png" + imagesPathSuffix,
        "player-move"   : imagesPathPrefix +   "move-1-2-1.png" + imagesPathSuffix,
        "mob-idle"      : imagesPathPrefix +       "idle-1.png" + imagesPathSuffix,
        "mob-damage"    : imagesPathPrefix +     "damage-1.png" + imagesPathSuffix,
        "mob-attack"    : imagesPathPrefix +     "attack-1.png" + imagesPathSuffix,
        "mob-death"     : imagesPathPrefix +      "death-1.png" + imagesPathSuffix
    };
    var soundList = {};
    
    this.assetManager = new AssetManager();
    this.assetManager.startLoading(imageList,soundList);

	$gui.append($("<div>").button().css({position:"absolute",top:"5px",left:"5px"}).append("Menu").click(function(){
        if($(win.root).hasClass("visible"))
        {
            //console.log("clicked when visible");
            $(win.root).removeClass("visible");
        }
        else
        {
            //console.log("clicked when invisible");
            $(win.root).addClass("visible");
        }
	}));

    player = new Player();
	camera = new Camera(player);

	player.setPosition(3530, 1770);
    //player.setPosition(100, 100);
	player.init();
	
	requestAnimFrame(
		function loop() {
			self.mainLoop();
			requestAnimFrame(loop);
		}					
	);
};
Game.prototype.mainLoop = function()
{
	var now = Date.now();
	var globalTimeDelta = now - this.globalTime;
	var localTimeDelta = Math.min(50, globalTimeDelta);
	this.localTime += localTimeDelta;
    
    this.graphics.drawTimeMillis = now;
    
    this.graphics.clearRect(0,0,scene.width,scene.height);
    
    if(!this.assetManager.isDoneLoading())
    {
        this.assetManager.renderLoadingProgress(this.graphics);
    }
    else
    {
        this.graphics.save();    
        
        camera.render(this.graphics);
        
        this.graphics.drawImage(this.assetManager.getImage("background"),0,0);
        
        this.graphics.restore();
        
    }

	//player.update(localTimeDelta / 1000);
};