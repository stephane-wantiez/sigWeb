function start(){
	console.log("ok");

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
        xp:23,
        hp:100,
        power:42
        });
        
    infoPage.refreshData({
        power:543
        });
}