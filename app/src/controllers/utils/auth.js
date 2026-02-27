const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const KEYS_FILE = path.join(__dirname, "../../db/keys");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

async function derivePublicKey(privateKeyB64) {
  const privateKeyObj = crypto.createPrivateKey({
    key: Buffer.from(privateKeyB64, "base64"),
    format: "der",
    type: "pkcs8",
  });
  const publicKeyObj = crypto.createPublicKey(privateKeyObj);
  const derivedPublicKey = publicKeyObj.export({ type: "spki", format: "der" });
  return Buffer.from(derivedPublicKey).toString("base64");
}

async function isKeyRegistered(publicKeyB64) {
  const fileContents = await fs.readFile(KEYS_FILE, "utf8");
  const knownKeys = fileContents
    .split("\n")
    .map((k) => k.trim())
    .filter(Boolean);
  return knownKeys.includes(publicKeyB64);
}

function generateJWT(publicKeyB64) {
  return jwt.sign({ publicKey: publicKeyB64 }, JWT_SECRET, { expiresIn: "1h" });
}

module.exports = { derivePublicKey, isKeyRegistered, generateJWT };
