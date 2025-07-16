(async () => {
	// default imports
	const events = require('events');
	const { exec } = require("child_process")
	const logs = require("discord-logs")
	const Discord = require("discord.js")
	const {
		MessageEmbed,
		MessageButton,
		MessageActionRow,
		Intents,
		Permissions,
		MessageSelectMenu
	} = require("discord.js")
	const fs = require('fs');
	let process = require('process');
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	// block imports
	let https = require("https")

	// define s4d components (many may be unused)
	let s4d = {
		Discord,
		fire: null,
		joiningMember: null,
		reply: null,
		player: null,
		manager: null,
		Inviter: null,
		message: null,
		notifer: null,
		checkMessageExists() {
			if (!s4d.client) throw new Error('You cannot perform message operations without a Discord.js client')
			if (!s4d.client.readyTimestamp) throw new Error('You cannot perform message operations while the bot is not connected to the Discord API')
		}
	};

	// check if discord.js is v13
	if (!require('./package.json').dependencies['discord.js'].startsWith("^13.")) {
		let file = JSON.parse(fs.readFileSync('package.json'))
		file.dependencies['discord.js'] = '^13.16.0'
		fs.writeFileSync('package.json', JSON.stringify(file, null, 4))
		exec('npm i')
		throw new Error("Seems you aren't using discord.js v13. Please re-run or run `npm i discord.js@13.16.0`");
	}

	// check if discord-logs is v2
	if (!require('./package.json').dependencies['discord-logs'].startsWith("^2.")) {
		let file = JSON.parse(fs.readFileSync('package.json'))
		file.dependencies['discord-logs'] = '^2.0.0'
		fs.writeFileSync('package.json', JSON.stringify(file, null, 4))
		exec('npm i')
		throw new Error("discord-logs must be v2.0.0. Please re-run or run `npm i discord-logs@2.0.0` then re-run");
	}

	// create a new discord client
	s4d.client = new s4d.Discord.Client({
		intents: [
			Object.values(s4d.Discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)
		],
		partials: [
			"REACTION",
			"CHANNEL"
		]
	});

	// when the bot is connected
	s4d.client.on('ready', () => {
		console.log(s4d.client.user.tag + " is alive!")
	})

	// error handling
	process.on('uncaughtException', function (err) {
		console.log('Error!');
		console.log(err);
	});

	// give client to discord-logs
	logs(s4d.client);

	// pre blockly code

	// blockly code
	var mod_channel_id, logMessagesQ;

	// login with token from environment variable
	await s4d.client.login(process.env.BOT_TOKEN).catch((e) => {
		if (e.toString().toLowerCase().includes("token")) {
			throw new Error("An invalid bot token was provided!")
		} else {
			throw new Error("Privileged Gateway Intents are not enabled! Please go to https://discord.com/developers and turn on all of them.")
		}
	});

	s4d.client.on('messageCreate', async (s4dmessage) => {
		if (String((s4dmessage.content)).includes('~~set mod channel')) {
			if (String((s4dmessage.guild).ownerId) === s4dmessage.author.id) {
				mod_channel_id = s4dmessage.channel;
			}
		}
		if (String((s4dmessage.content)).includes('~~start log')) {
			if (String((s4dmessage.guild).ownerId) === s4dmessage.author.id) {
				logMessagesQ = 1;
			}
		}
		if (String((s4dmessage.content)).includes('~~stop log')) {
			if (String((s4dmessage.guild).ownerId) === s4dmessage.author.id) {
				logMessagesQ = 0;
			}
		}
	});

	s4d.client.on('messageCreate', async (s4dmessage) => {
		if (logMessagesQ === 1) {
			if (mod_channel_id) {
				mod_channel_id.send({ content: `Author: ${s4dmessage.author.tag}` });
				mod_channel_id.send({ content: `Channel: ${s4dmessage.channel.name}` });
				mod_channel_id.send({ content: `Timestamp: ${s4dmessage.createdTimestamp}` });
				mod_channel_id.send({ content: `Message: ${s4dmessage.content}` });
			}
		}
	});

	s4d.client.on('messageUpdate', async (oldMessage, newMessage) => {
		s4dmessage = newMessage;
		if (logMessagesQ === 1) {
			if (mod_channel_id) {
				mod_channel_id.send({ content: `Author: ${s4dmessage.author.tag}` });
				mod_channel_id.send({ content: `Channel: ${s4dmessage.channel.name}` });
				mod_channel_id.send({ content: `Edit Time: ${newMessage.editedTimestamp}` });
				mod_channel_id.send({ content: `Old: ${oldMessage.content}` });
				mod_channel_id.send({ content: `New: ${newMessage.content}` });
			}
		}
	});

	return s4d;
})();
