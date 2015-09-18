var express = require('express')
var app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);

sanitize = require('validator');

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
})

users = new Array();

/*emoticons*/
emoticons = {};
emoticons[":sadface:"] = "emoticons/sadface.jpg";
emoticons[":snail:"] = "emoticons/snail.jpg";

io.on('connection', function(socket){

    socket.on('setUsername', function(username){
        username = username.trim();
        if(username.length<=0){
            socket.emit('usernameNo', "Username too short.");
        }else if(username.length>16){
            socket.emit('usernameNo', "Username too long. Max 16 characters.");
        }
        username = sanitize.escape(username);

        if(users.indexOf(username) != -1){
            socket.emit('usernameNo', "Username already in use");
        }else{
            socket.emit('usernameYes', username);

            socket.username = username;
            users.push(username);

            console.log(username + " connected to the chat."); 
            io.emit('userConnected', username, users);

            socket.emit('emoticons',emoticons);
        }
    });

    socket.on('sendMessage', function(message){
        if(socket.username != null && message.length > 0){
            if(message.startsWith("/")){
                handleCommand(socket,message);
            }else{
                message = sanitize.escape(message);
                io.emit('message', socket.username,message);
            }
            
        }
    });

    socket.on('disconnect', function(){
        if(socket.username){
            i = users.indexOf(socket.username);
            users.splice(i,1);

            console.log(socket.username + " disconnected from the chat."); 

            io.emit('userDisconnected', socket.username, users);
        }
    });
});

port = process.env.PORT || 4000; 
http.listen(port, function(){
    console.log('listening on localhost port' + port);
});



function handleCommand(socket,command){
    response = "";
    switch(command)
    {
        case "/list":
            response = "Available commands: list, emoticons, users"; 
            break;
        case "/users":
            response = "Connected users: " + users.join(", "); 
            break;
        case "/emoticons":
            response = "Available emoticons: ";
            for(var key in emoticons){
                response+= (key + "<img src='" + emoticons[key] + "' class='emoticon' title='" + key + "'/>&nbsp;&nbsp;&nbsp;&nbsp;");
            }
            break;

        default:
            response = "Unknown command \"" + command + "\". Use /list to see a list of commands";
    }
    socket.emit('serverMessage',response);
}

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}
