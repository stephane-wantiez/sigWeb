var Page = function(content){
	this.root = document.createElement("div");
	this.root.innerHTML = content;
};
Page.prototype.append = function(content){
	if(typeof(content) == "string"){
		this.root.innerHTML += content;
	}else{
		this.root.appendChild(content.get(0));
	}
};
Page.prototype.setVisible = function(visible){
	//this.root.style.display = visible?"block":"none";
    if(visible){
        $(this.root).show(/*"slide"*/"fade");
    } else {
        $(this.root).hide();
    }
};