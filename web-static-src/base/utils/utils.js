window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback, element) {
           window.setTimeout(callback, 1000/60);
         };
})();


$.getTimeMillis = function(){
	return new Date().getTime();
};
$.getTimeFloat = function(){
	return $.getTimeMillis() / 1000;
};
var localTime = Math.floor(new Date().getTime() / 1000);
$.getTime = function(){
	var timeElapsed = Math.floor($.getTimeFloat()) - localTime;
	return serverTime + timeElapsed;
};
$.getElmRegion = function(elm){
	var pos = elm.offset();
	var rootPos = gameManager.root.offset();
	var posX = pos.left - rootPos.left;
	var posY = pos.top - rootPos.top;
	var w = elm.width();
	var h = elm.height();
	return {
		posX: posX,
		posY: posY,
		width: w,
		height: h
	};
};

$.ease = function(from, to, func, options){
	var isObject = true;
	if(typeof from != "object"){
		from = {v: from};
		to = {v: to};
		isObject = false;
	}
	var o = {};
	if(options){
		for(i in options){
			o[i] = options[i];
		}
	}
	o.step = function(f){
		if(isObject){
			var res = {};
			for(i in from){
				res[i] = f * (to[i] - from[i]) + from[i];
			}
			func(res);
		}else{
			func(f * (to.v - from.v) + from.v);
		}
	};
	var listener = $({f:0});
	if(options && options.delay){
		listener.delay(options.delay).animate({f:1}, o);
	}else{
		listener.animate({f:1}, o);
	}
	return listener;
};

$.shuffle = function(list){
	var i, j, t;
	for (i = 1; i < list.length; i++) {
		j = Math.floor(Math.random() * (1 + i));
		if (j != i) {
			t = list[i];
			list[i] = list[j];
			list[j] = t;
		}
	}
};

$.clamp = function(value,min,max)
{
    return Math.max(Math.min(value,max),min);
}

$.distanceBetweenPointsSquared = function(p1x,p1y,p2x,p2y)
{
    return ( p2x - p1x ) * ( p2x - p1x ) + ( p2y - p1y ) * ( p2y - p1y );
};

$.distanceBetweenPoints = function(p1x,p1y,p2x,p2y)
{
    return Math.sqrt($.distanceBetweenPointsSquared(p1x,p1y,p2x,p2y));
};

$.EASE_FACTOR = 3.5;
$.EASE_FACTOR_EXP = 4;

$.easeInCustom = function(timeNorm)
{
    return Math.pow(timeNorm,$.EASE_FACTOR);
};

$.easeOutCustom = function(timeNorm)
{
    return Math.pow(timeNorm,1/$.EASE_FACTOR);
};

$.easeInExpCustom = function(timeNorm)
{
    return Math.pow(timeNorm,$.EASE_FACTOR_EXP);
};

$.easeOutExpoCustom = function(timeNorm)
{
    return Math.pow(timeNorm,1/$.EASE_FACTOR_EXP);
};

$.easeInSinCustom = function(timeNorm)
{
    return Math.sin(-Math.PI/2+timeNorm*Math.PI/2)+1;
};

$.easeOutSinCustom = function(timeNorm)
{
    return Math.sin(timeNorm*Math.PI/2);
};

$.easeInOutSinCustom = function(timeNorm)
{
    return (1 + Math.sin(-Math.PI/2+timeNorm*Math.PI)) / 2;
};

$.showEase = function(g,rect,ease)
{
    g.save();
    
    g.translate(rect.x,rect.y);
    
    g.fillStyle = "black";
    g.fillRect(0,0,rect.width,rect.height);
    
    g.fillStyle = "red";
    
    var nbPoints = 50;
    
    for(var i = 0 ; i <= nbPoints ; ++i)
    {
        var vx = i / nbPoints;
        var px = vx * rect.width;
        
        var vy = ease(vx);
        var py = vy * rect.height;
        
        g.fillRect(px,rect.height-py,1,1);
    }
    
    g.restore();
};
