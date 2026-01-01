import { google } from "googleapis";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.modify"]
});

console.log("\n🔗 ABRE ESTE LINK EN EL NAVEGADOR:\n");
console.log(authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("\n🔑 PEGA AQUÍ EL CÓDIGO QUE TE DA GOOGLE: ", async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("\n✅ REFRESH TOKEN (GUÁRDALO):\n");
    console.log(tokens.refresh_token);
    rl.close();
});
