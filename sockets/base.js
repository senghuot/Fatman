// like a static variable
var myIO;

base = {	
	socket: function(io){
		myIO = io;

		io.on('connection', function(socket){
			console.log('connection established!');

			broacastUserCount(io);
			
			socket.on('message', function(data){
				console.log(data);
			});

			socket.on('disconnect', function(){
				console.log('user is disconnected!');
				broacastUserCount(io);
			});
		});
	},

	// in other module, after require this model, call this method to get
	// myIO object
	getIO: function(){
		return myIO;
	}
};

function broacastUserCount(io){
	io.emit('userCount', io.sockets.sockets.length);
}

module.exports = base;


