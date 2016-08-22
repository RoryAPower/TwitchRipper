var channels =["ESL_SC2", "OgamingSC2", "cretetion", "FreeCodeCamp", "storbeck", "Habathcx", "RobotCaleb", "noobs2ninjas", " brunofin", "comster404"];
var responseObjects = [];
var response = { 'response' : responseObjects };
var errorObjects = [];
var errorResponse = { 'errorResponse' : errorObjects };
var template, errorTemplate, validationTemplate;


$(document).ready(function(){

	$(".searchBox").typeahead({ source: channels });
	
	$.get('block.html', function(templateData){
		template = templateData;
	}, 'html');

	$.get('errorblock.html', function(errorData){
		errorTemplate = errorData;
	}, 'html');

	$.get('validationBlock.html', function(validationData){
		validationTemplate = validationData;
	}, 'html')

	$.each(channels, function(index, channel){
		getChannels(channel, function(responseObject){
			responseObjects.push(responseObject);
		});
	});

    $('form').submit(function(event){
		event.preventDefault();
		var input = $('.searchBox').val();
		$('form')[0].reset();
		
		var html = getChannel(input);
		$('.responseDiv').html(html);
		$('.errorDiv').addClass('hidden');	

		
	});

    $('.filterButton').click(function(){
    	var button = $(this).html();
    	$('.errorDiv').addClass('hidden');
    	getFilteredResponse(button);
    	var html = Mustache.render(template, response);
		$('.responseDiv').html(html);
		
		if(button === "All"){ $('.errorDiv').removeClass('hidden'); }	
    });

    $('.filterButton').last().css('border-right', 'none');

    $(document).ajaxStop(function(){

		var html = Mustache.render(template, response);
		$('.responseDiv').html(html);

		var error = Mustache.render(errorTemplate, errorResponse);
		$('.errorDiv').html(error);
    });


});

function getChannel(input){
	var channel = responseObjects.filter(function(response){
		    return input === response.channel;
	});
		
	if(channel.length === 0){
		var html = getValidation();
	}
	else {
		response['response'] = channel;
		var html = Mustache.render(template, response);	
	}
	return html;
}

function getValidation(){
	var validation = {
			heading: "Your search returned no results",
			message: "Please try again"
		};
	var html = Mustache.render(validationTemplate, validation);
	return html;
}

function getFilteredResponse(button){
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
    return response['response'];
}


function getChannels(channel, completion){
	var url = 'https://api.twitch.tv/kraken/streams/' + channel +'?callback=?';
	
	$.getJSON(url, function(data) {

		if(data.stream === undefined) {
			if(data.hasOwnProperty('error')){
				var errorObject = {
					channel: channel,
					message: data.message
				};
				errorObjects.push(errorObject);
			}
		}
		else {
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
		}
	})
	.done(function(data) {
		//console.log('done');    	
  	})
  	.fail(function(error) {
    	console.log(error);
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



