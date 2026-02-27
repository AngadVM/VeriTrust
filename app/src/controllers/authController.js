const { generateRSAKeyPair } = require('./utils/keygen');
const { derivePublicKey, isKeyRegistered, generateJWT } = require('./utils/auth');
const fs = require('fs/promises');
const path = require('path');

const KEYS_FILE = path.join(__dirname, '../db/keys');

const authController = {
  onRegister: async (req, res) => {
    try {
      const { publicKey, privateKey } = await generateRSAKeyPair();
      await fs.appendFile(KEYS_FILE, `${publicKey}\n`);
      res.set('Cache-Control', 'no-store');
      res.status(200).json({ success: true, data: { publicKey, privateKey } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to generate key pair', error: error.message });
    }
  },

  onLogin: async (req, res) => {
    try {
      const { privateKey } = req.body;
      if (!privateKey) {
        return res.status(400).json({ success: false, message: 'Private key is required' });
      }

      const publicKey = await derivePublicKey(privateKey);
      const registered = await isKeyRegistered(publicKey);

      if (!registered) {
        return res.status(401).json({ success: false, message: 'Not registered' });
      }

      const token = generateJWT(publicKey);
      res.status(200).json({ success: true, token });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  }
};

module.exports = authController;