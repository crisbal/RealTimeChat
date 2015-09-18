var socket = io();

isChatting = false;
localUsername = null;
/*listen events*/
socket.on('message', function(author,message){
    message = addEmoticons(message);
    addMessage(author,message,false);
});

socket.on('serverMessage', function(message){
    addMessage("Server",message,false);
});

socket.on('userConnected', function(username,users){
    //createUserList(users);
    addMessage("Server","<span class='messageAuthor'>" + username + "</span> connected to the chat. There are now " + users.length + " users connected.",true);
});

socket.on('userDisconnected', function(username,users){
    //createUserList(users);
    addMessage("Server","<span class='messageAuthor'>" + username + "</span> disconnected from the chat. There are now " + users.length + " users connected.",true);
});

/*edit the ui*/
function createUserList(users){
    userList = $("#userList");

    userList.empty();

    users.forEach(function(element, index, array) {
        userList.append("<div class='username'>" + element + "</div>");
    });
}

function addMessage(author,message,isInfoMessage){
    if(isChatting)
    {
        date = new Date();
        time = date.toLocaleTimeString();
        if(author==localUsername){
            message = '<div class="messageContainer owner" > <div class="message" title="' + time + '"> <span class="messageAuthor">' + author + ':</span> <span class="messageText">' + message +  '</span> </div> </div>'; 
        }else if(isInfoMessage){
            message = '<div class="messageContainer serverInfo" title="' + time + '">' + message + ' </div>'; 
        }else if(author=="Server"){
            message = '<div class="messageContainer server"> <div class="message" title="' + time + '"> <span class="messageAuthor">' + author + ':</span> <span class="messageText">' + message +  '</span> </div> </div>'; 
        }else{
            message = '<div class="messageContainer"> <div class="message" title="' + time + '"> <span class="messageAuthor">' + author + ':</span> <span class="messageText">' + message +  '</span> </div> </div>'; 
        }
        $('#messages').append(message);
        

        if(document[hidden]){
            notification.play();
        }
        
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    }
}


/*emoticons*/
emoticons = {};
socket.on('emoticons', function(emote){
    emoticons = emote;
});


preImgSrc = "<img src='";
postImgSrc = "' class='emoticon' title='"
function addEmoticons(message){
    for(var imageKey in emoticons){
        message = message.split(imageKey).join(preImgSrc + emoticons[imageKey] + postImgSrc + imageKey + "' />");
    }
    return message;
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}


/*submit username*/
$('#formUsername').submit(function(){
    socket.emit('setUsername', $('#username').val());
    return false;
});
socket.on('usernameYes', function(username){
    $("#welcomeDiv").hide();
    $("#chatDiv").toggleClass('hidden');
    localUsername = username;
    isChatting = true;
});
socket.on('usernameNo', function(error){
    $('#message').val('');
    alert(error);
});

/*submit message*/
$('#formSendMessage').submit(function(){
    message = $('#message').val();
    socket.emit('sendMessage', message);
    $('#message').val('');
    return false;
});


/*notification sound*/

notification = new Audio('http://themushroomkingdom.net/sounds/wav/smw/smw_kick.wav');
var hidden; 

if (typeof document.hidden !== "undefined") {
  hidden = "hidden";
} else if (typeof document.mozHidden !== "undefined") { // Firefox up to v17
  hidden = "mozHidden";
} else if (typeof document.webkitHidden !== "undefined") { // Chrome up to v32, Android up to v4.4, Blackberry up to v10
  hidden = "webkitHidden";
}


// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document[hidden] === "undefined") {
  alert("This chat requires a modern browser that supports the Page Visibility API.");
}