
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
    for(var elem in playerData){
        //$("."+elem).html(playerData[elem]);
        this.attributeList[elem].html(playerData[elem]).effect("pulsate",{times:5,duration:300});
    }
};
InfoPage.prototype.addAttribute = function(id, label){
    var $attrDef = $("<dt>").append(label);
    var $attrValue = $("<dd>").addClass(id);
    this.$attributeContainer.append($attrDef).append($attrValue);
    this.attributeList[id] = $attrValue;
};