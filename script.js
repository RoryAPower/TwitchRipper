var channels =["ESL_SC2", "OgamingSC2", "cretetion", "FreeCodeCamp", "storbeck", "Habathcx", "RobotCaleb", "noobs2ninjas", " brunofin", "comster404"];
var responseObjects = [];
var response = { 'response' : responseObjects };
var errorObjects = [];
var errorResponse = { 'errorResponse' : errorObjects };

var blockTemplate = '<div class="row channelRow">';
	blockTemplate += '<div class="col-sm-6 col-sm-offset-3 channelCol">';
	blockTemplate += '<a class="btn btn-block channelBtn" href="{{url}}" role="button" target="_blank">';
	blockTemplate += '<div class="row">';
	blockTemplate += '<div class="col-sm-4 linkInnerCol">';
	blockTemplate += '<img src="{{logo}}" class="img-responsive" alt="Responsive image">';
	blockTemplate += '</div>';
	blockTemplate += '<div class="col-sm-8">';
	blockTemplate += '<h2>{{channel}}</h2>';
	blockTemplate += '<p>{{streamStatus}}</p>';
	blockTemplate += '</div>';
	blockTemplate += '</div>';
	blockTemplate += '</a>';
	blockTemplate += '</div>';
	blockTemplate += '</div>';

var blockSectionTemplate = '{{#response}}' + blockTemplate + '{{/response}}'; 


var errorBlockTemplate = '<div class="row errorRow">';
	errorBlockTemplate += '<div class="col-sm-6 col-sm-offset-3 errorCol text-center" data-toggle="tooltip"';
	errorBlockTemplate += 'title="{{channel}} not available">';
	errorBlockTemplate += '<h2>{{channel}}</h2>';
	errorBlockTemplate += '<p>{{message}}</p>';
	errorBlockTemplate += '</div>';
	errorBlockTemplate += '</div>';

var validationTemplate = '<div class="row">';
	validationTemplate += '<div class="col-sm-6 col-sm-offset-3 errorCol text-center">';
	validationTemplate += '<h2>{{heading}}</h2>';
	validationTemplate += '<p>{{message}}</p>';
	validationTemplate += '</div>';
	validationTemplate += '</div>';





$(document).ready(function(){
	
	var template;
	var errorTemplate;

	$(".searchBox").typeahead({ source: channels });

	/*$.get('block.html', function(templateData){
		template = templateData;
	}, 'html')*/

	/*$.get('errorblock.html', function(errorData){
		errorTemplate = errorData;
	}, 'html');*/

	$.each(channels, function(index, channel){
		getChannels(channel, function(responseObject){
			responseObjects.push(responseObject);
		});
	});


    $('form').submit(function(event){
		event.preventDefault();
		var input = $('.searchBox').val();
		$('form')[0].reset();
		console.log(input);
		console.log(responseObjects);
		var channel = responseObjects.filter(function(response){
		    return input === response.channel;
		});
		console.log(channel);
		if(channel.length === 0){
			var validation = {
				heading: "Your search returned no results",
				message: "Please try again"
			}
			var html = Mustache.render(validationTemplate, validation);
			$('.responseDiv').html(html);
			$('.errorDiv').addClass('hidden');
		}
		else {
			response['response'] = channel;
			var html = Mustache.render(blockSectionTemplate, response);
			$('.responseDiv').html(html);
			$('.errorDiv').addClass('hidden');	
		}

		
	});

    $('.filterButton').click(function(){
    	var button = $(this).html();
    	//new code
    	$('.errorDiv').addClass('hidden');
    	
    	switch (button) {
    		case 'Online':
    			var online = responseObjects.filter(function(response){
		    		return response.streamStatus !== "Offline";
		    	});
		    	response['response'] = online;
		    	//new code
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
    	var html = Mustache.render(blockSectionTemplate, response);
		$('.responseDiv').html(html);
		//if the button is all append the errors again
		if(button === "All"){
			//var error = Mustache.render(errorBlockTemplate, errorResponse);
			//$('.responseDiv').append(error);
			//new code
			$('.errorDiv').removeClass('hidden');
		}	
    });

    $('.filterButton').last().css('border-right', 'none');

    /*$(document).ajaxStop(function(){
		console.log(response);
		var html = Mustache.render(blockTemplate, response);
		$('.responseDiv').html(html);

		var error = Mustache.render(errorBlockTemplate, errorResponse);
		$('.responseDiv').append(error);
    });*/


});






function getChannels(channel, completion){
	var url = 'https://api.twitch.tv/kraken/streams/' + channel +'?callback=?';
	
	$.getJSON(url, function(data) {
		
		if(data.hasOwnProperty('error')){
			var errorObject = {
				channel: channel,
				message: data.message
			};
			errorObjects.push(errorObject);
			//new code
			var error = Mustache.render(errorBlockTemplate, errorObject);
			$('.errorDiv').append(error);
		}
		

		
		if(data.stream !== null){
			var responseObject = {
				streamStatus: data.stream.channel.status,
				logo: data.stream.channel.logo,
				channel: data.stream.channel.display_name,
				url: data.stream.channel.url
			};
			completion(responseObject);
			//new code segment
			var html = Mustache.render(blockTemplate, responseObject);
			$('.responseDiv').append(html);
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
		//new code
		var html = Mustache.render(blockTemplate, responseObject);
		$('.responseDiv').append(html);
	});
	
}



