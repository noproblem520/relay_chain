let Web3 = require('web3');
let smartContractJson = require('../public/smartcontracts/sideChain.json');
let abi = smartContractJson.abi;
require('dotenv').config();

w3 = new Web3(
    // # demo1's blockchain
    // # Web3.HTTPProvider("HTTP://140.118.9.225:23001")
    //  VM blockchain
    process.env.BLOCKCHAIN_RPC
)

let my_address = process.env.PUBLIC_KEY;
let private_key = process.env.PRIVATE_KEY;

// let sample_requestObj_from_client =
// {
//     contractAddress: "0x47B7A6d6dC9aFeF8Ef950DBA10deB1AD59E36B08",
//     nodeMetricsValue: [{
//         CPU: 9,
//         MEMORY: 20
//     },
//     {
//         CPU: 20,
//         MEMORY: 20
//     },
//     {
//         CPU: 10,
//         MEMORY: 20
//     },
//     {
//         CPU: 11,
//         MEMORY: 20
//     },
//     {
//         CPU: 13,
//         MEMORY: 20
//     },]
// };

let MetricsSigmaObj = null;
let NodeAmount = null;
let store_contractAddr = null;
// TE and TV that are on the smart contract
let nodeTEAry = null;
let nodeTVAry = null;
// latest TE TV that computed by this agent
let currentNodeTEAry = null;
let currentNodeTVAry = null;

const init = async (obj) => {
    // NodeAmount
    NodeAmount = obj.nodeMetricsValue.length;

    // TODO:check which smartContract Address to store
    store_contractAddr = process.env.SIDE_CHIAN1_CONTRACT;
    console.log(store_contractAddr);
    // set Metrics Sigma
    MetricsSigmaObj = {
        "CPU": 2
    };

    currentNodeTEAry = new Array();
    currentNodeTVAry = new Array();
    nodeTEAry = new Array();
    nodeTVAry = new Array();

    let contract = new w3.eth.Contract(abi, store_contractAddr);
    // get smart contract's TE and TV
    for (let i = 0; i < NodeAmount; i++) {
        nodeTEAry.push(await contract.methods.retrieveTE(i).call());
        nodeTVAry.push(await contract.methods.retrieveTV(i).call());
    }
}

const RayleighCDF = (metric, sigma) => {
    return 1 - Math.exp(-(metric ** 2) / (2 * sigma ** 2));
}


const computeNodesTE = (obj) => {
    for (let i = 0; i < NodeAmount; i++) {
        let TE = 1.0;

        for (j in obj.nodeMetricsValue[i]) {
            // console.log("retrieving '" + MetricsDataObj[j].name + "' data");
            let metric = obj.nodeMetricsValue[i][j];
            // console.log("metric : " + metric);
            TE *= RayleighCDF(metric, MetricsSigmaObj[j]);
            // console.log(TE);
        }
        // There's no float in smart contract
        currentNodeTEAry.push(TE.toString());
    }
}

const getAvgTE_i = (node_i) => {
    // console.log("getAvgTE_" + node_i + "length = " + nodeTEAry[node_i].length)
    let sumTE = 0.0;

    if (nodeTEAry[node_i].length >= 1) {
        for (let i = 0; i < nodeTEAry[node_i].length; i++) {
            sumTE += parseFloat(nodeTEAry[node_i][i]);
        }
        return sumTE / (nodeTEAry[node_i].length);
    } else {
        return 0;
    }

}



const computeNodesTV = () => {
    let param_x = 0.1
    let e = Math.exp(-param_x) + 1;
    for (let i = 0; i < NodeAmount; i++) {
        // console.log("-------------------------------------------------");
        let latest_TE_i = currentNodeTEAry[i];
        // console.log("latest_TE_" + i + " = " + latest_TE_i);
        let avgTE_i = getAvgTE_i(i);
        // console.log("avgTE_" + i + " => " + avgTE_i);
        let weight = 1 - (Math.abs(latest_TE_i - avgTE_i));
        // console.log("weight = " + weight);
        // console.log("latest_TE_i * weight = " + latest_TE_i * weight);
        let previous_i = nodeTVAry[i].length - 1;
        let TV = 0.0;
        // initial TVi,0 = 0
        if (nodeTVAry[i].length < 1) {
            // TV = (1 / e) * weight + (Math.exp(-2 * param_x) * 0 / e);
            TV = (1 / e) * latest_TE_i + (Math.exp(-2 * param_x) * 1 / e);
        } else {
            TV = (1 / e) * latest_TE_i * weight + (Math.exp(-2 * param_x) * nodeTVAry[i][previous_i] / e);
        }
        currentNodeTVAry.push(TV.toString());
        // console.log("-------------------------------------------------");
    }
}


const start = async (obj) => {
    await init(obj);
    console.log("Start computing TE...");
    computeNodesTE(obj);
    console.log("Start computing TV...");
    computeNodesTV();
    console.log("uploading TE to smart contract...");
    await uploadTETV();
    console.log("TE在下");
    console.log(currentNodeTEAry);
    console.log("TV在下");
    console.log(currentNodeTVAry);
    console.log("Done!");
}

const uploadTETV = async () => {
    let contract = new w3.eth.Contract(abi, store_contractAddr);
    let nonce = await w3.eth.getTransactionCount(my_address)
    // encode transactions to ABI
    let TEdata = await contract.methods.uploadTE(currentNodeTEAry).encodeABI();
    let TVdata = await contract.methods.uploadTV(currentNodeTVAry).encodeABI();
    let txs = [];
    txs.push(await w3.eth.accounts.signTransaction({
        from: my_address,
        to: contract.options.address,
        gas: '500000',
        nonce: nonce,
        data: TEdata
    }, private_key));

    txs.push(await w3.eth.accounts.signTransaction({
        from: my_address,
        to: contract.options.address,
        gas: '500000',
        nonce: nonce + 1,
        data: TVdata
    }, private_key));
    for (tx of txs) {
        await w3.eth.sendSignedTransaction(tx.rawTransaction);
    }
}


// step：getPrevious TE and TV => getMetricsData =>  => computeTE => computeTV => upload TE TV to SmartContract
module.exports = {
    runAgent: async (obj) => {
        console.log("now is uploading");
        await start(obj);
    }
}