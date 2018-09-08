const express = require("express"),
    AWS = require("aws-sdk"),
    config = require("./config"),
    bodyParser = require("body-parser");

//set up dynamodb
AWS.config.update(config.aws);
let client = new AWS.DynamoDB.DocumentClient();

let app = express();
let api = require("./api/main")(client);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/api", api);

console.log(require("express-list-endpoints")(app));

app.listen(process.env.PORT || 8081);