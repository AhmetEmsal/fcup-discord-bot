import { Client, GatewayIntentBits, Partials, Message } from "discord.js";
import calculate_strength from "./fussballcup/features/calculate_strength/main.js";

// env configuration
import dotenv from "dotenv";
dotenv.config(); // ${PROJECT_DIR}/.env

// date configuration
process.env.TZ = "Europe/Istanbul";

// token extraction
const { DISCORD_BOT_TOKEN } = process.env;
console.log(
    "Bot token: " +
    DISCORD_BOT_TOKEN.substring(0, 5) +
    "..." +
    DISCORD_BOT_TOKEN.slice(-5)
);


(() => {
    // var content = "!güç-hesapla trDeSaatFarkı=1 pozisyon=LM antrenör=10 premiumAntrenman=true beceriler=(0,0,85,998,81,110,61,62,991,80,993.5,61,64,62) gençlikBitisi=15.7.2023 gençAntrenör=10 limit=10";
    // var content = "!güç-hesapla trDeSaatFarkı=1 pozisyon=LM antrenör=10 premiumAntrenman=false beceriler=(0,0,85,998,81,110,61,62,991,80,993.5,61,64,62) limit=10";
    var testContent = "!güç-hesapla trDeSaatFarkı=1 pozisyon=ST antrenör=10 premiumAntrenman=false beceriler=(0,0,85,998,81,110,61,62,991,80,993.5,61,64,62)";
    handleMessageContent(null, testContent);

})();

const bot = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

bot.on("ready", () => {
    console.log(`Logged in as ${bot.user!.tag}!`);
});

bot.on("messageCreate", (message) => {
    if (message.author.bot) return;

    const { content } = message;
    handleMessageContent(message, content)
});


bot.login(DISCORD_BOT_TOKEN);


function handleMessageContent(message: Message | null, content: String) {
    const prefix: string = "!";

    if (!content.startsWith(prefix)) return;

    const messageBody = content.slice(prefix.length),
        args = messageBody.split(/\s+/),
        command = args.shift()?.toLowerCase();

    if (command == "güç-hesapla") {
        calculate_strength(message, args);
    }
}