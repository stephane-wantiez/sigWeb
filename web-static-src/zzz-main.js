var infoPage;

$(document).ready(function(){
	console.log("game started");
	
	$.getScript('//connect.facebook.net/' + LOCALE + '/all.js', function()
	{
		FB.init({
			appId: FB_APP_ID
		});
		FB.getLoginStatus(function(result){
			console.log(result);
		});
	});

	game = new Game();
});