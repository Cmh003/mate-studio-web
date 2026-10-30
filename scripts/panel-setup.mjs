#!/usr/bin/env node
// Genera las claves del panel privado. Uso: npm run panel:setup
// No guarda nada: imprime las variables para que las pegues en Vercel (Settings → Environment Variables).

import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";
import QRCode from "qrcode";

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else rl.output.write("*");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function base32(buf) {
  const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, value = 0, out = "";
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += a[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += a[(value << (5 - bits)) & 31];
  return out;
}

const password = await ask("Elige la contraseña del panel (mínimo 12 caracteres): ", true);
if (password.length < 12) {
  console.error("\nLa contraseña es demasiado corta. Usa al menos 12 caracteres.");
  process.exit(1);
}
const repeat = await ask("Repítela: ", true);
if (repeat !== password) {
  console.error("\nLas contraseñas no coinciden.");
  process.exit(1);
}

const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32, { N, r, p });
const totp = base32(randomBytes(20));
const otpauth = `otpauth://totp/Mate%20Studio:panel?secret=${totp}&issuer=Mate%20Studio&algorithm=SHA1&digits=6&period=30`;

console.log("\nEscanea este QR con Google Authenticator, Microsoft Authenticator o 1Password:\n");
console.log(await QRCode.toString(otpauth, { type: "terminal", small: true }));
console.log(`Si no puedes escanearlo, añade la clave a mano: ${totp}\n`);
console.log("Copia estas variables en Vercel → Settings → Environment Variables (y en .env.local para probar):\n");
console.log(`SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${hash.toString("base64url")}`);
console.log(`ADMIN_TOTP_SECRET=${totp}`);
console.log(`CRON_SECRET=${randomBytes(32).toString("base64url")}`);
console.log("\nNo compartas estos valores con nadie ni los subas a GitHub.");
