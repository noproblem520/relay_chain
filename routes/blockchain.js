var express = require('express');
var router = express.Router();
var agent_uploadTETV = require('../agent/computeAndUploadTETV.js');
var agent_getTV = require('../agent/getTV.js');
var ellipticcurve = require("@starkbank/ecdsa");
var Ecdsa = ellipticcurve.Ecdsa;
let public_key = null;

router.get('/smartcontract/:address', async function (req, res, next) {

    let result = await agent_getTV.runAgent(req.params.address);
    res.send({ "result": result });
});


router.post('/smartcontract', async function (req, res, next) {
    let msg = req.body.msg;
    let apikey = req.body.apikey;
    let signature = ellipticcurve.Signature.fromBase64(req.body.signature);
    let contractAddr = null;
    // register the public key here, it is not a good practice, just for convenience
    if (apikey === "sideChain1") {
        contractAddr = process.env.SIDE_CHIAN1_CONTRACT;
        public_key = ellipticcurve.PublicKey.fromPem("-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE8PJ19JL3SonmYaAoGB259ETeVXIX4a3I\nW3es3PlrfsutkHs4apZeP2xW4zqAxxyIqQnWnwI+HnKxZSY5DukuxQ==\n-----END PUBLIC KEY-----");
    } else {
        contractAddr = process.env.SIDE_CHAIN2_CONTRACT;
        public_key = ellipticcurve.PublicKey.fromPem("-----BEGIN PUBLIC KEY-----MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEA8OnCk5cFs4A6AFS1FiGmBSdUmxX58l97v1+OJKeXHAjthlLhPM9IG70u6yLSiiiCDpV0hSZuJNSk2NIXgyEYA==-----END PUBLIC KEY-----");
    }
    if (Ecdsa.verify(JSON.stringify(msg), signature, public_key)) {
        await agent_uploadTETV.runAgent(msg, contractAddr);
        res.send("Success!");
    } else {
        res.send("signature verification process error!");
    }
});

module.exports = router;
