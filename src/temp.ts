import * as fs from 'fs';
import * as dotenv from "dotenv";
import { ChannelType, Client, Events, GatewayIntentBits, Guild } from "discord.js";
import { createAudioPlayer, createAudioResource, generateDependencyReport, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import path from 'path';
import { createReadStream } from 'fs';

dotenv.config();

console.log(generateDependencyReport());

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



client.once(Events.ClientReady, async client => {
    console.log('Ready!');

    var minSeconds: number = 600;
    var maxSeconds: number = 5000;

    const guild: Guild = client.guilds.cache.get(process.env.PRIMARY_GUILD!)!;

    async function loop(): Promise<void> {
        var intervalId = setTimeout(async () => {
            try {

                var voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);

                const connection = joinVoiceChannel({
                    // channelId: voiceChannels.random()!.id,
                    channelId: voiceChannels.get("775744348331573322")!.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator
                });

                connection.on('stateChange', (oldState, newState) => {
                    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
                });

                // connection.on(VoiceConnectionStatus.Signalling, () => {
                //     console.log("Signalling...");
                // });

                // connection.on(VoiceConnectionStatus.Connecting, () => {
                //     console.log("Connecting...");
                // });

                // connection.on(VoiceConnectionStatus.Ready, () => {
                //     console.log("Ready <3");
                // });

                // connection.on(VoiceConnectionStatus.Disconnected, () => {
                //     console.log("Disconnecting...");
                // });

                // connection.on(VoiceConnectionStatus.Destroyed, () => {
                //     console.log("Destroyed!");
                // });



                const audioFiles = fs.readdirSync(path.resolve(process.cwd(), './audioFiles'));
                // this file will be executed in the build folder
                var randomAudioFilePath = audioFiles[Math.floor(Math.random() * audioFiles.length)];

                let stream = createReadStream( path.resolve( process.cwd(), randomAudioFilePath));

                const resource = createAudioResource(stream,
                    {
                        inputType: StreamType.OggOpus
                    });

                const player = createAudioPlayer();

                player.on('stateChange', (oldState, newState) => {
                    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
                });

                const subscription = connection.subscribe(player);

                // subscription could be undefined if the connection is destroyed!
                if (subscription) {
                    // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
                    let sleep = async (ms: number | undefined) => await new Promise(r => setTimeout(r, ms));
                    await sleep(10000);

                    console.log("Hallosdsdas");

                    player.play(resource);

                    // async () => {
                    //     await setTimeout(() => subscription.unsubscribe(), 10_000);
                    // }
                }
                // 775744348331573322
                // connection.destroy();

            } catch (error) {
                console.error(error);
            }
            // loop();

        }, Math.floor(Math.random() * (maxSeconds - minSeconds) + minSeconds
        ));
    }

    loop();

});

client.on(Events.Debug, (message) => console.log(message));
client.on(Events.Warn, (message) => console.log(message));
client.on(Events.Error, (message) => console.log(message));

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

client.login(process.env.DISCORD_TOKEN);
