var express = require('express');
var router = express.Router();
var agent_uploadTETV = require('../agent/computeAndUploadTETV.js');
var agent_getTV = require('../agent/getTV.js');

router.post('/smartcontract', async function (req, res, next) {
    await agent_uploadTETV.runAgent(req.body);
    res.send("Success!");
});

router.get('/smartcontract/:address', async function (req, res, next) {
    let result = await agent_getTV.runAgent(req.params.address);
    res.send({ "result": result });
});

module.exports = router;
