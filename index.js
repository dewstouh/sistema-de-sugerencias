const Discord = require('discord.js');
const Enmap = require('enmap');
const config = require('./config/config.json')

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ],
})

client.login(config.token)

client.setups = new Enmap({
    name: "setups",
    dataDir: "./databases"
})

client.on("ready", () => {
    console.log(`Conectado como ${client.user.tag}`)
})

client.on("messageCreate", async (message) => {
    if(message.author.bot || !message.guild || !message.channel) return;
    client.setups.ensure(message.guild.id, {
        sugchannel: ""
    });
    const args = message.content.slice(config.prefix.length).trim().split(" ");
    const command = args.shift()?.toLowerCase();

    if(command == "ping"){
        return message.reply(`El ping del bot es de \`${client.ws.ping}ms\``)
    }

    if(command == "setup-suggestions" || command == "setup-sugerencia" || command == "setup-sugerencias" || command == "setup-suggestion"){
        const channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();
        if(!channel) return message.reply(`❌ El Canal que has mencionado **NO** es válido!`);
        client.setups.set(message.guild.id, channel.id, "sugchannel");
        return message.reply(`✅ **El canal ${channel} se ha establecido correctamente como el canal de sugerencias!**`)
    }

    const data = client.setups.get(message.guild.id, "sugchannel");
    if(!data || !message.guild.channels.cache.get(data)) return;
    if(message.channel.id == client.setups.get(message.guild.id, "sugchannel")) {
        if(!message.deleted){
            await message.delete();
        }
        message.channel.send({embeds: [
            new Discord.MessageEmbed()
            .setTitle(`💡 Nueva Sugerencia!`)
            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
            .setDescription(message.content)
            .setColor("ORANGE")
            .setTimestamp()
        ]}).then(msg => {
            msg.react("👍")
            msg.react("👎")
        })
    }
})