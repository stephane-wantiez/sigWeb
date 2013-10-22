
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
    /*if (playerData.xp   ) $(".xp"   ).html(playerData.xp   );
    if (playerData.hp   ) $(".hp"   ).html(playerData.hp   );
    if (playerData.power) $(".power").html(playerData.power);*/
    //console.log("Refreshing player data: " + playerData.toString());
    if (playerData["name"]) {
        this.$playerName.html(playerData["name"]).effect("shake");;
    }
    if (playerData["title"]) {
        this.$playerTitle.html(playerData["title"]).effect("shake");;
    }
    if (playerData["progress"]) {
        var progress = parseFloat(playerData["progress"]);
        if (progress>1) progress=1;
        else if (progress<0) progress=0;
        var progressPercent = progress * 100;
        this.$playerProgressIndic.css("width",progressPercent+"%").effect("bounce");
        //console.log("Changed progress to " + progressPercent);
    }
    
    for(var elem in playerData){
        //$("."+elem).html(playerData[elem]);
        if (this.attributeList[elem]){
            this.attributeList[elem].html(playerData[elem]).effect("pulsate",{times:5,duration:300});
        }
    }
};
InfoPage.prototype.addAttribute = function(id, label){
    var $attrDef = $("<dt>").append(label);
    var $attrValue = $("<dd>").addClass(id);
    this.$attributeContainer.append($attrDef).append($attrValue);
    this.attributeList[id] = $attrValue;
};