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
	$scene = $("#main-scene");

	$("#gui").append($("<div>").button().css({position:"absolute",top:"5px",left:"5px"}).append("Menu").click(function(){
		$(win.root).toggle('fade', 200);
	}));
	$(win.root).hide();

	player = new Player($scene);
	camera = new Camera($scene, player);

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
Game.prototype.mainLoop = function(){
	var now = Date.now();
	var globalTimeDelta = now - this.globalTime;
	var localTimeDelta = Math.min(50, globalTimeDelta);
	this.localTime += localTimeDelta;

	player.update(localTimeDelta / 1000);
};