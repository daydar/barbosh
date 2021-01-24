var globalDispatcher = null;
var path = require("path");

module.exports = {
	name: 'barbosh',
	description: 'play audio file',
	args: true,

	async execute(fs, message, args) {
		const audioFiles = fs.readdirSync('./audioFiles');
		let selectedFile = null;

		if (args[0] === 'hilfe') {
			let helpList = audioFiles.map(file => path.parse(file).name)
			return message.channel.send('Lak versuchs mal damit: '+ helpList.join(", "));
		}
		if (args[0] === 'lak') {
			return message.channel.send('sho');
		}
		if (args[0] === 'pause'){
			// globalDispatcher.connection.end();
		}

		if (!message.member.voice.channel) {
			return message.channel.send('Du musst in einem Voice Channel sein jiggo ');
		}

		for (var file of audioFiles){
			fileName = path.parse(file).name;
			if(fileName === args[0]){
				selectedFile = file;
			}
		}

		if(!selectedFile){
			return message.channel.send(`Jiggo kenne ich nicht lo ${message.author}`);
		}
		let localFilePath = './audioFiles/'+selectedFile;
		let absoluteFilePath = require("path").join(__dirname,localFilePath);

		const connection = await message.member.voice.channel.join();
		const dispatcher = connection.play(localFilePath, { volume: 0.7 });
		// globalDispatcher = dispatcher;


		dispatcher.on('start', () => {
			console.log('file is now playing!');
		});
		
		dispatcher.on('finish', () => {
			console.log('file has finished playing!');
		});
		
		dispatcher.on('error', () => {
			console.error;
			message.member.voice.channel.leave();
		});


		// message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};