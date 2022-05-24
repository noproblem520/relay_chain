var express = require('express');
var router = express.Router();
var agent_uploadTETV = require('../agent/computeAndUploadTETV.js');
var agent_getTV = require('../agent/getTV.js');
var ellipticcurve = require("@starkbank/ecdsa");
var Ecdsa = ellipticcurve.Ecdsa;
var public_key_Side_chain_1 = ellipticcurve.PublicKey.fromPem("-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE8PJ19JL3SonmYaAoGB259ETeVXIX4a3I\nW3es3PlrfsutkHs4apZeP2xW4zqAxxyIqQnWnwI+HnKxZSY5DukuxQ==\n-----END PUBLIC KEY-----")

router.post('/smartcontract', async function (req, res, next) {

    let msg = req.body.msg;
    let signature = ellipticcurve.Signature.fromBase64(req.body.signature);

    if (Ecdsa.verify(JSON.stringify(msg), signature, public_key_Side_chain_1)) {
        await agent_uploadTETV.runAgent(req.body.msg);
        res.send("Success!");
    } else {
        res.send("signature verification process error!");
    }

});

router.get('/smartcontract/:address', async function (req, res, next) {
    let result = await agent_getTV.runAgent(req.params.address);
    res.send({ "result": result });
});

module.exports = router;
