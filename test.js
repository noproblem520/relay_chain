let sample_obj =
{
    contractAddress: 0x47B7A6d6dC9aFeF8Ef950DBA10deB1AD59E36B08,
    nodeMetricsValue: [{
        CPU: 9,
        MEMORY: 20
    },
    {
        CPU: 10,
        MEMORY: 20
    },]
};

// console.log(obj[0].length);
let MetricsSigmaObj =
{
    CPU: 5,
    MEMORY: 30
};


// for (let i = 0; i < 2; i++) {
//     for (j in sample_obj.nodeMetricsValue[2]) {
//         console.log(sample_obj.nodeMetricsValue[i][j]);
//         console.log("Sigma=" + MetricsSigmaObj[j]);
//     }
// }

for (i in MetricsSigmaObj) {
    console.log(i);
}