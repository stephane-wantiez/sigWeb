
var FriendsPage = function(friends)
{	
	Page.call(this, "");
	
	this.$friendsList = $("<div>").addClass("friends-list");
	this.append(this.$friendsList);
	
	for(var friendId in friends)
	{
		var friend = friends[friendId];
		
		var friendInfo = $("<div>").addClass("friend-info");
		this.$friendsList.append(friendInfo);
		
		var friendId = $("<div>").addClass("friend-id").html(friend.id);
		friendInfo.append(friendId);
		
		var friendName = $("<div>").addClass("friend-name").html(friend.name);
		friendInfo.append(friendName);
		
		var friendXp = $("<div>").addClass("friend-xp").html(friend.xp);
		friendInfo.append(friendXp);
		
		var friendPicture = $("<img/>").addClass("friend-picture").attr("src","http://graph.facebook.com/" + friend.id + "/picture");
		friendInfo.append(friendPicture);
		
		friendInfo.data('fbId',friend.id);
		friendInfo.click(function(){
			FB.ui({
				method: 'apprequests',
				message: 'Kado!',
				to: $(this).data('fbId'),
				data: { val1: 'test' }
			});
		});
	}
};
FriendsPage.prototype = new Page();