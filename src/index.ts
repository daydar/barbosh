import * as fs from 'fs';
import * as dotenv from "dotenv";
import { ChannelType, Client, GatewayIntentBits, Guild, GuildBasedChannel, VoiceBasedChannel } from "discord.js";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, generateDependencyReport, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import path from 'path';

dotenv.config();
console.log(generateDependencyReport());
console.log("Do it now");

const player = createAudioPlayer();
const date: Date = new Date();

function playSong() {

	// this file will be executed in the build folder
	const audioFiles = fs.readdirSync(path.resolve(process.cwd(), './audioFilesOpus'));
	var randomAudioFilePath = audioFiles[Math.floor(Math.random() * audioFiles.length)];
	let fullPath = path.resolve(process.cwd(), 'audioFilesOpus', randomAudioFilePath);
	const resource = createAudioResource(fullPath, {
		inputType: StreamType.OggOpus,
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

client.on('ready', async () => {
	console.log('Discord.js client is ready!');

	const guild: Guild = client.guilds.cache.get(process.env.PRIMARY_GUILD!)!;
	let voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);

	/**
	 * Try to get our song ready to play for when the bot joins a voice channel
	 */
	try {
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

		player.on('stateChange', async (_, newState) => {
			if (newState.status === AudioPlayerStatus.Idle) {
				// Loop the audio with a delay using setTimeout
				setTimeout(() => {
					playSong();
					console.log(`The time is ${date.toLocaleDateString()}`);
				}, 5000);
			}
		});

		await playSong();

	} catch (error) {
		/**
		 * The song isn't ready to play for some reason :(
		 */
		console.error(error);
	}
});


void client.login(process.env.DISCORD_TOKEN);


