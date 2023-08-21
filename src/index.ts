import * as fs from 'fs';
import * as dotenv from "dotenv";
import { ChannelType, Client, Events, GatewayIntentBits, Guild, GuildBasedChannel, VoiceBasedChannel } from "discord.js";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, generateDependencyReport, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import path from 'path';
import { createReadStream } from 'fs';

dotenv.config();

console.log(generateDependencyReport());

const player = createAudioPlayer();


function playSong() {

    const audioFiles = fs.readdirSync(path.resolve(process.cwd(), './audioFilesOpus'));
    // this file will be executed in the build folder
    var randomAudioFilePath = audioFiles[Math.floor(Math.random() * audioFiles.length)];

    let fullPath = path.resolve( process.cwd(), 'audioFilesOpus', randomAudioFilePath);
    
	const resource = createAudioResource(fullPath, {
		inputType: StreamType.Arbitrary,
	});

	player.play(resource);

	/**
	 * Here we are using a helper function. It will resolve if the player enters the Playing
	 * state within 5 seconds, otherwise it will reject with an error.
	 */
	return entersState(player, AudioPlayerStatus.Playing, 5000);
}

async function connectToChannel(channel: VoiceBasedChannel | GuildBasedChannel) {
	/**
	 * Here, we try to establish a connection to a voice channel. If we're already connected
	 * to this voice channel, @discordjs/voice will just return the existing connection for us!
	 */
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
	});
	/**
	 * If we're dealing with a connection that isn't yet Ready, we can set a reasonable
	 * time limit before giving up. In this example, we give the voice connection 30 seconds
	 * to enter the ready state before giving up.
	 */
	try {
		/**
		 * Allow ourselves 30 seconds to join the voice channel. If we do not join within then,
		 * an error is thrown.
		 */
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		/**
		 * At this point, the voice connection is ready within 30 seconds! This means we can
		 * start playing audio in the voice channel. We return the connection so it can be
		 * used by the caller.
		 */
		return connection;
	} catch (error) {
		/**
		 * At this point, the voice connection has not entered the Ready state. We should make
		 * sure to destroy it, and propagate the error by throwing it, so that the calling function
		 * is aware that we failed to connect to the channel.
		 */
		connection.destroy();
		throw error;
	}
}



const client: Client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates]
});

// Client.commands = new Collection();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


// for (const file of commandFiles) {
//     const command = require(`./commands/${file}`);
//     client.commands.set(command.name, command);
// }

// function getAudioFilePaths() {


// }


client.on('ready', async () => {
	console.log('Discord.js client is ready!');

    const guild: Guild = client.guilds.cache.get(process.env.PRIMARY_GUILD!)!;
    let voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);

	/**
	 * Try to get our song ready to play for when the bot joins a voice channel
	 */
	try {
		await playSong();
		console.log('Song is ready to play!');
        let channel = voiceChannels.get("775744348331573322")!;
        const connection = await connectToChannel(channel);

				/**
				 * We have successfully connected! Now we can subscribe our connection to
				 * the player. This means that the player will play audio in the user's
				 * voice channel.
				 */
				connection.subscribe(player);
				console.log('Playing now!');

                

	} catch (error) {
		/**
		 * The song isn't ready to play for some reason :(
		 */
		console.error(error);
	}
});


void client.login(process.env.DISCORD_TOKEN);









// client.once(Events.ClientReady, async client => {
//     console.log('Ready!');

//     var minSeconds: number = 600;
//     var maxSeconds: number = 5000;

//     const guild: Guild = client.guilds.cache.get(process.env.PRIMARY_GUILD!)!;

//     async function loop(): Promise<void> {
//         var intervalId = setTimeout(async () => {
//             try {

//                 var voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);

//                 const connection = joinVoiceChannel({
//                     // channelId: voiceChannels.random()!.id, // if undefined
//                     channelId: voiceChannels.get("775744348331573322")!.id,
//                     guildId: guild.id,
//                     adapterCreator: guild.voiceAdapterCreator
//                 });

//                 connection.on('stateChange', (oldState, newState) => {
//                     console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
//                 });

//                 // connection.on(VoiceConnectionStatus.Signalling, () => {
//                 //     console.log("Signalling...");
//                 // });

//                 // connection.on(VoiceConnectionStatus.Connecting, () => {
//                 //     console.log("Connecting...");
//                 // });

//                 // connection.on(VoiceConnectionStatus.Ready, () => {
//                 //     console.log("Ready <3");
//                 // });

//                 // connection.on(VoiceConnectionStatus.Disconnected, () => {
//                 //     console.log("Disconnecting...");
//                 // });

//                 // connection.on(VoiceConnectionStatus.Destroyed, () => {
//                 //     console.log("Destroyed!");
//                 // });



//                 const audioFiles = fs.readdirSync(path.resolve(process.cwd(), './audioFiles'));
//                 // this file will be executed in the build folder
//                 var randomAudioFilePath = audioFiles[Math.floor(Math.random() * audioFiles.length)];

//                 let stream = createReadStream( path.resolve( process.cwd(), randomAudioFilePath));

//                 const resource = createAudioResource(stream,
//                     {
//                         inputType: StreamType.OggOpus
//                     });

//                 const player = createAudioPlayer();

//                 player.on('stateChange', (oldState, newState) => {
//                     console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
//                 });

//                 const subscription = connection.subscribe(player);

//                 // subscription could be undefined if the connection is destroyed!
//                 if (subscription) {
//                     // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
//                     let sleep = async (ms: number | undefined) => await new Promise(r => setTimeout(r, ms));
//                     await sleep(10000);

//                     console.log("Hallosdsdas");

//                     player.play(resource);

//                     // async () => {
//                     //     await setTimeout(() => subscription.unsubscribe(), 10_000);
//                     // }
//                 }
//                 // 775744348331573322
//                 // connection.destroy();

//             } catch (error) {
//                 console.error(error);
//             }
//             // loop();

//         }, Math.floor(Math.random() * (maxSeconds - minSeconds) + minSeconds
//         ));
//     }

//     loop();

// });

// client.on(Events.Debug, (message) => console.log(message));
// client.on(Events.Warn, (message) => console.log(message));
// client.on(Events.Error, (message) => console.log(message));


// function createDiscordJSAdapter(channel: VoiceBasedChannel): import("@discordjs/voice").DiscordGatewayAdapterCreator {
//     throw new Error('Function not implemented.');
// }

// client.on('message', async message => {
//     if (!message.content.startsWith(prefix) || message.author.bot) return;

//     if (message.content.includes('jiggo')) {
//         return message.channel.send('Muss los lo');
//     }

//     const args = message.content.slice(prefix.length).trim().split(/ +/);
//     const commandName = args.shift().toLowerCase();

//     console.log(message.content);
//     if (!client.commands.has(commandName)) return;

//     const command = client.commands.get(commandName);
//     if (command.args && !args.length) {
//         return message.channel.send(`Jiggo was genau meinst du? ${message.author}!`);
//     }

//     try {
//         await command.execute(fs, message, args);
//     } catch (error) {
//         console.error(error);
//         message.reply('Was Brudi?');
//     }

// });

