
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
	for(var i in playerData){
		switch(i){
		case "name":
			this.$playerName.html(playerData.name);
			break;
		case "title":
			this.$playerTitle.html(playerData.title);
			break;
		case "progress":
			this.$playerProgressIndic.css("width", Math.round(playerData.progress * 100) + '%');
			break;
		default:
			if(typeof(this.attributeList[i]) != "undefined"){
				this.attributeList[i].html(playerData[i]);
			}
		}
	}
};
InfoPage.prototype.addAttribute = function(id, label){
	var dt = $("<dt>").append(label);
	this.$attributeContainer.append(dt);
	
	var dd = $("<dd>").addClass(id);
	this.$attributeContainer.append(dd);
	
	this.attributeList[id] = dd;
};