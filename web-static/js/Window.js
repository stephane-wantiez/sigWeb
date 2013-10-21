var Window = function(id, parent){
	this.id = id;
	this.parent = parent;
	
	this.root = document.createElement("div");
	this.root.className = "window";
    this.root.setAttribute("id",this.id);
	this.parent.appendChild(this.root);
    
    this.menu = document.createElement("div");
    this.menu.className = "menu";
    this.root.appendChild(this.menu);
    
    this.menuList = document.createElement("ul");
    this.menu.appendChild(this.menuList);
    
    this.content = document.createElement("div");
    this.content.className = "content";
    this.root.appendChild(this.content);
	
	this.currentLink = null;
};
Window.prototype.addPage = function(title, page){
	if(!(page instanceof Page)){
		throw page + " is not instanceof Page";
	}
	
	var menuElm = document.createElement("li");
    menuElm.page = page;
    menuElm.innerHTML = title;
    this.menuList.appendChild(menuElm);
    
    var self = this;
    menuElm.addEventListener("click",function(){
        self.showPage(menuElm);
    });
    
    this.content.appendChild(page.root);
    page.setVisible(false);
	
	if(this.currentLink == null){
		this.showPage(menuElm);
	}
};

Window.prototype.showPage = function(menuElm){

    if (this.currentLink){
        this.currentLink.page.setVisible(false);
        this.currentLink.setAttribute("class"," ");
    }
    
	menuElm.page.setVisible(true);
    menuElm.setAttribute("class","selected");
        
    this.currentLink = menuElm;
};