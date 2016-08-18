var channels =["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];
var responseObjects = [];
var response = { 'response' : responseObjects };


$(document).ready(function(){
	
	var template;

	$(".searchBox").typeahead({ source:channels });

	$.get('block.html', function(templateData){
		template = templateData;
	}, 'html');

	$.each(channels, function(index, channel){
		getChannels(channel, function(responseObject){
			responseObjects.push(responseObject);
		});
	});

	$(document).ajaxStop(function(){
		var html = Mustache.render(template, response);
		$('.responseDiv').html(html);

		*/*$('.channelBtn').hover(function(){
			$(this).css('color', #a5df9c);
	    	$(this).find(".img-responsive").css('border', '3px solid #a5df9c');
	    	
	    }, function(){
	  		$(this).css('color', #FFF);
	    	$(this).find(".img-responsive").css('border', '3px solid #FFF');
	    });*/
		
    });

    $('form').submit(function(event){
		event.preventDefault();
		var input = $('.searchBox').val();
		$('form')[0].reset();
		var channel = responseObjects.filter(function(response){
		    		return input === response.channel;
		    	});
		response['response'] = channel;
		var html = Mustache.render(template, response);
		$('.test').html(html);	
		
	});

    $('.filterButton').click(function(){
    	var button = $(this).html();
    	
    	switch (button) {
    		case 'Online':
    			var online = responseObjects.filter(function(response){
		    		return response.streamStatus !== "Offline";
		    	});
		    	response['response'] = online;
    			break;
    		case 'Offline':
    			var offline = responseObjects.filter(function(response){
		    		return response.streamStatus === "Offline";
		    	});
		    	response['response'] = offline;
    			break;
    		default:
    			response['response'] = responseObjects;
    	}
    	var html = Mustache.render(template, response);
		$('.test').html(html);	
    });

    $('.filterButton').last().css('border-right', 'none');

    
   
    /*$('.btn').last().hover(function(){
    	$(this).css('border-right', '1px solid #a5df9c');
    }, function(){
    	$(this).css('border-right', 'none');
    });*/
    
});

function getChannels(channel, completion){
	var url = 'https://api.twitch.tv/kraken/streams/' + channel +'?callback=?';
	
	$.getJSON(url, function(data) {
		
		if(data.stream !== null){
			var responseObject = {
				streamStatus: data.stream.channel.status,
				logo: data.stream.channel.logo,
				channel: data.stream.channel.display_name,
				url: data.stream.channel.url
			};
			completion(responseObject);
		}
		else {
			var channelURL = data._links.channel;
			getOfflineChannels(channelURL, function(responseObject){
				responseObjects.push(responseObject);
			});
		}
	})
	.done(function(data) {
		//console.log('done');    	
  	})
  	.fail(function(error) {
    	//console.log(error);
  	})
  	.always(function() {
    	//console.log( "complete" );
  	});
}

function getOfflineChannels(url, completion){
	var responseObject = {};
 	$.getJSON(url, function(data) {
 		var responseObject = {
			streamStatus: "Offline",
			logo: data.logo,
			channel: data.display_name,
			url: data.url
		}
		completion(responseObject);
	});
	
}



