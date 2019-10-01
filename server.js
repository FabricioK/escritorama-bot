const express = require("express");
const app = express();
const path = require("path");

const Discord = require("discord.js");
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const MESSAGE_ID = process.env.MESSAGE_ID;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const manageevent = (eventName, event) => {
  if (event.d.message_id === MESSAGE_ID) {
    const reactionChannel = client.channels.get(event.d.channel_id);
    if (reactionChannel.messages.has(event.d.message_id)) return;
    else {
      reactionChannel
        .fetchMessage(event.d.message_id)
        .then(msg => {
          var msgReaction = msg.reactions.get(
            event.d.emoji.name + ":" + event.d.emoji.id
          );
          if (msgReaction === undefined)
            msgReaction = msg.reactions.get(event.d.emoji.name);

          if (msgReaction !== undefined) {
            var user = client.users.get(event.d.user_id);
            client.emit(eventName, msgReaction, user);
          }
        })
        .catch(console.log);
    }
  }
};

client.on("raw", event => {
  const eventName = event.t;
  switch (eventName) {
    case "MESSAGE_REACTION_REMOVE":
    case "MESSAGE_REACTION_ADD":
      manageevent(eventName, event);
      break;
  }
});

client.on("messageReactionAdd", (messageReaction, user) => {
  var roleName = messageReaction.emoji.name.toLowerCase();
  var role = messageReaction.message.guild.roles.find(
    role => role.name.toLocaleLowerCase() === roleName
  );
  if (role) {
    var member = messageReaction.message.guild.members.find(
      member => member.id === user.id
    );
    member.addRole(role.id);
  }
});

client.on("messageReactionRemove", (messageReaction, user) => {
  var roleName = messageReaction.emoji.name.toLowerCase();
  var role = messageReaction.message.guild.roles.find(
    role => role.name.toLocaleLowerCase() === roleName
  );
  if (role) {
    var member = messageReaction.message.guild.members.find(
      member => member.id === user.id
    );
    member.removeRole(role.id);
  }
});

client.login(TOKEN);

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(process.env.PORT || 4000, function() {
  console.log("Your node js server is running");
});
