const {
  initializeKeys,
  generateKeys, // change
  getPrivateKey,
  getPublicKey,
} = require("./utils/key-utils");

const crypto = require("crypto"); // change

const auth_controllers = {
  register: async (req, res) => {
    try {
      // Temporarily use direct generation since generateKeys returns nothing
      // We'll return full details generated here and let key-utils handle disk writes separately if needed.
      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      res.json({
        Message: "Keys Generated",
        "publicKey": publicKey,
        "privateKey": privateKey,
        WARNING:
          "Store your private key securely, if lost, your data will be lost too",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => { // change
    try {
      const { private_key } = req.body;

      if (!private_key) {
        return res.status(400).json({ message: "Private key is required" });
      }

      // 1. In a complete application, we would use the private key to sign a message
      // and verify it against a known public key stored in the database for this user.
      // 2. We'll verify the key format by attempting to create a sign object.
      // 3. Since we don't have a DB yet, we just validate it is a valid RSA private key.
      try {
        const sign = crypto.createSign('SHA256');
        sign.update('test_message');
        sign.sign(private_key, 'hex');
      } catch (keyError) {
        return res.status(401).json({ message: "Invalid private key format. Authentication failed." });
      }

      // Valid key, issue JWT
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { role: "freelancer", authenticated_at: Date.now() },
        "veritrust_super_secret_key_123", // In production, move to environment variables
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token: token,
        user: { role: "freelancer" } // Dummy user info
      });

    } catch (error) {
      res.status(500).json({ message: "Internal server error during login", error: error.message });
    }
  }
};

module.exports = auth_controllers;
