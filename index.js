
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));



for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    if (message.content.includes('jiggo')) {
        return message.channel.send('Muss los lo');
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(message.content);
    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);
    if(command.args && !args.length) {
        return message.channel.send(`Jiggo was genau meinst du? ${message.author}!`);
    }

    try {
        await command.execute(fs, message, args);
    } catch (error) {
        console.error(error);
        message.reply('Was Brudi?');
    }

});

client.login(token);
