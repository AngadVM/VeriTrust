const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const keysDir = path.join(__dirname, "../db/keys");
const privateKeyPath = path.join(keysDir, "private.pem");
const publicKeyPath = path.join(keysDir, "public.pem");

function ensureDirectory() {
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
    console.log("Created keys directory:", keysDir);
  }
}

function generateKeys() {
  console.log("Generating new RSA key pair...");

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  console.log("Keys successfully written to disk.");
}

function initializeKeys() {
  ensureDirectory();

  const privateExists = fs.existsSync(privateKeyPath);
  const publicExists = fs.existsSync(publicKeyPath);

  if (!privateExists || !publicExists) {
    generateKeys();
  } else {
    console.log("Keys already exist. Using existing keys.");
  }
}

function getPrivateKey() {
  return fs.readFileSync(privateKeyPath, "utf8");
}

function getPublicKey() {
  return fs.readFileSync(publicKeyPath, "utf8");
}

module.exports = {
  initializeKeys,
  generateKeys, // change
  getPrivateKey,
  getPublicKey,
};
