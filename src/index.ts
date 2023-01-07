import * as fs from 'fs';
import * as dotenv from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

dotenv.config();

const client: Client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Client.commands = new Collection();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


// for (const file of commandFiles) {
//     const command = require(`./commands/${file}`);
//     client.commands.set(command.name, command);
// }

client.once(Events.ClientReady, c => {
    console.log('Ready!');

});

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
