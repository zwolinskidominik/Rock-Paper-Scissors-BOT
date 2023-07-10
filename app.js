const Discord = require("discord.js"); //discord.js node module.

//Contains a string that is the token for the discord bot.
const { token } = require("./config.json");

//Intents and partials needed for the bot functioning properly.
const Client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.Guilds
    ], partials: [
        Discord.Partials.Message,
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.User,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.ThreadMember
    ]
});

const { inlineCode } = require('discord.js');

//Ready event captures the state when the bot gets online.
Client.on("ready", (client) => {
    console.log("This bot is now online: " + client.user.tag);
    Client.user.setActivity('HipcioGames', { type: Discord.ActivityType.Playing });
});

//messageCreate event captures data of a message that is created/posted.
Client.on("messageCreate", (message) => {

    //Converting client context to lower case only.
    const userInputTextToLower = message.content.toLocaleLowerCase();

    //Do not respond if author is a bot
    if(message.author.bot) { return; }

    //PC options for answer
    const pcOptions = ["kamien", "papier", "nozyce"];

    //Generates a random number 0, 1 or 2
    const rnd = Math.floor(Math.random() * 3);
    const pcChoice = pcOptions[rnd];

    //If draw
    if(userInputTextToLower == pcChoice) {
        message.reply("Twój wybór: " + userInputTextToLower + "\nWybór komputera: " + pcChoice + "\nRemis!");
        saveGame(message.author.id, message.author.tag, "draw");
    }

    //If user win
    else if(userInputTextToLower == "kamien" && pcChoice == "nozyce" || userInputTextToLower == "nozyce" && pcChoice == "papier" || userInputTextToLower == "papier" && pcChoice == "kamien") {
        message.reply("Twój wybór: " + userInputTextToLower + "\nWybór komputera: " + pcChoice + "\nWygrałeś!");
        saveGame(message.author.id, message.author.tag, "win");
    }

    //If user lose
    else if(userInputTextToLower == "nozyce" && pcChoice == "kamien" || userInputTextToLower == "papier" && pcChoice == "nozyce" || userInputTextToLower == "kamien" && pcChoice == "papier"){
        message.reply("Twój wybór: " + userInputTextToLower + "\nWybór komputera: " + pcChoice + "\nPrzegrałeś!");
        saveGame(message.author.id, message.author.tag, "lose");
    }

    //Display games list command
    else if(userInputTextToLower == "games"){
        message.reply(gamesList());
    }

    //Display a specific game command
    else if (Number(userInputTextToLower)){
        message.reply(displayGame(Number(userInputTextToLower)));
    }

    //Only run if something is wrong
    else {
        message.reply("Zły wybór! Możesz wybrać tylko papier, kamien lub nozyce!");
    }
});

//Display stats of a speceific game
function displayGame(ID){
    const data = returnGameData(); //gamedata.json
    let replyMessage = undefined; // Default undefined if no games are found.
    let found = false; //Default false if the specific ID doesn't exist

    //If we find a game
    if (data.length > 0){
        replyMessage = "";
    }

    for (let i = 0; i < data.length; i++) {
        if (ID == data[i].ID) {
            found = true; //Turned to true since we found a game.
            replyMessage = data[i].name + " vs PC\nWygrane: " + data[i].win + "\nPrzegrane: " + data[i].lose + "\nRemisy: " + data[i].draw + "\nData i godzina: " + data[i].time;
        }
    }

    //Still undefined if no games are found.
    if (replyMessage == undefined){
        return "Nie znaleziono żadnej gry."
    }

    else if (found == false) {
        return "Nie znaleziono konkretnej gry.";
    }

    return replyMessage;
}

function gamesList(){
    const data = returnGameData(); //gamedata.json
    let replyMessage = undefined; // Default undefined if no games are found.

    //If we find a game
    if (data.length > 0){
        replyMessage = "";
    }

    //Loop through all games
    for (let i = 0; i < data.length; i++){
        replyMessage += "Wpisz <" + data[i].ID + "> aby wyświetlić szczegóły tej gry\n";
    }

    //Still undefined if no games are found.
    if (replyMessage == undefined){
        return "Nie znaleziono żadnej gry."
    }

    return replyMessage;
}

//saveGame()
function saveGame(userID, name, gameStatus) {
    let gameData = returnGameData();
    let newGame = true; //Default true unless we find a game by the player with rounds less than 3.

    //Loop through gamedata.json array
    for (let i = 0; i < gameData.length; i++) {
        if (gameData[i].userID == userID && gameData[i].rounds < 3) {
            newGame = false; //Turns to false sice we found a game.

            gameData[i].rounds++; //Increase rounds.
            gameData[i][gameStatus]++; //Increase the property of draw, win or lose.
        }
    }

    if (newGame) {
        let newGameObject = returnNewGameObject(userID, name);
        
        newGameObject.ID = gameData.length + 1;
        newGameObject.rounds++;
        newGameObject[gameStatus]++;

        //If array is empty
        if (gameData.length < 1) {
            gameData = [newGameObject];
        }

        //If array contains objects already
        else if (gameData.length > 0) {
            gameData.push(newGameObject);
        }
    }
    saveGameData(gameData); //Save data
}


//Save gamedata
function saveGameData(data) {
    const fs = require("fs"); //Filesystem
    const path = "./gamedata.json";

    fs.writeFileSync(path, JSON.stringify(data));
}

function returnGameData() {
    const fs = require("fs"); //Filesystem
    const path = "./gamedata.json";
    const encoding = "utf-8"; //Encoding for displaying correct characters

    return JSON.parse(fs.readFileSync(path, encoding));
}

function returnNewGameObject(userID, name) {
    return {
        ID: 0,
        userID: userID,
        name: name,
        draw: 0,
        win: 0,
        lose: 0,
        rounds: 0,
        time: new Date().toLocaleString()
    }
}

//Logs in the discord bot with the token stored in an external file.
Client.login(token);