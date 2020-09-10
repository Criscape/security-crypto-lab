const express = require('express');
const cryptoUtils = require('./src/cryptoUtils');
const repo = require('./src/repository');
const bodyParser = require('body-parser');

const router = express.Router();
const UserCRUD = new repo.UserRepo();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/hash', async (req, res) => {
    const message = req.body.message;
    const username = req.body.username;
    const response = cryptoUtils.hashSHA512(message);
    await UserCRUD.saveUser(username, response.salt, response.hashString);
    res.json({ answer: 'OK' });
});

router.post('/hash/validate', async (req, res) => {
    const message = req.body.message;
    const username = req.body.username;
    const user = await UserCRUD.getUser(username);
    const response = cryptoUtils.hashSHA512(message, user.salt);
    return user.hash === response.hashString ?
     res.json({ answer: 'Válido' }) : res.json({ answer: 'No válido' });
});

router.post('/aes/encrypt', (req, res) => {
    const message = req.body.message;
    const key = req.body.key;
    return res.json({ answer: cryptoUtils.encryptAES(message, key) });
});

router.post('/aes/decrypt', (req, res) => {
    const cipherText = req.body.cipherText;
    const key = req.body.key;
    return res.json({ answer: cryptoUtils.decryptAES(cipherText, key) });
});

router.post('/rsa/encrypt', (req, res) => {
    const message = req.body.message;
    const rsaOutput = cryptoUtils.encryptRSA(message);
    return res.json({ answer: {
        cipherText: rsaOutput.cipherText.toString('base64'),
        privateKey: rsaOutput.privateKey
    } });
});

router.post('/rsa/decrypt', (req, res) => {
    const cipherText = req.body.cipherText;
    const privateKey = req.body.privateKey;
    return res.json({ answer: cryptoUtils.decryptRSA(cipherText, privateKey).toString() });
});

router.post('/ecies/encrypt', async (req, res) => {
    const message = req.body.message;
    const eciesOutput = await cryptoUtils.encryptECIES(message);
    return res.json({ answer: {
        encryptInfo: {
            cipherText: eciesOutput.cipherText.ciphertext.toString('base64'),
            iv: eciesOutput.cipherText.iv.toString('base64'),
            mac: eciesOutput.cipherText.mac.toString('base64'),
            ephemPublicKey: eciesOutput.cipherText.ephemPublicKey.toString('base64')
        },
        privateKey: eciesOutput.privateKey.toString('base64')
    } });
});

router.post('/ecies/decrypt', async (req, res) => {
    const encryptInfo = req.body.encryptInfo;
    const privateKey = req.body.privateKey;
    const eciesOutput = await cryptoUtils.decryptECIES(encryptInfo, privateKey);
    return res.json({ answer: eciesOutput.toString() });
});

router.post('/sign', (req, res) => {
    const message = req.body.message;
    return res.json({ answer: cryptoUtils.generateSignature(message) });
});

router.post('/sign/validate', (req, res) => {
    const message = req.body.message;
    const signature = req.body.signature;
    const publicKey = req.body.publicKey;
    return res.json({ answer: cryptoUtils.validateSignature(message, signature, publicKey) });
});

router.get('/', (req, res) => {
    res.send('Éxito x2');
});

module.exports = router;