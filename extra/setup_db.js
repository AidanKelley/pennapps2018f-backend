let AWS = require("aws-sdk"), config = require("../config");

AWS.config.update(config.aws);

let db = new AWS.DynamoDB();

// db.createTable({
//     TableName: "Users",
//     KeySchema: [
//         {AttributeName: "usernameLower", KeyType: "HASH"}
//     ],
//     AttributeDefinitions: [
//         {AttributeName: "usernameLower", AttributeType: "S"}
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 1,
//         WriteCapacityUnits: 1
//     }
// }).promise().then(console.log).catch(console.log);

db.createTable({
    TableName: "Medications",
    KeySchema: [
        {AttributeName: "id", KeyType: "HASH"}
    ],
    AttributeDefinitions: [
        {AttributeName: "id", AttributeType: "S"},
        {AttributeName: "usernameLower", AttributeType: "S"}
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    GlobalSecondaryIndexes: [
        {
            IndexName: "usernameLowerIndex",
            KeySchema: [
                {AttributeName: "usernameLower", KeyType: "HASH"}
            ],
            Projection: {
                ProjectionType: "KEYS_ONLY"
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        }
    ]
}).promise().then(console.log).catch(console.log);