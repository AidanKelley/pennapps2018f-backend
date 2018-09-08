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
app.use((req, res, next) => {
    if(req.hasOwnProperty("query")) {
        if(req.hasOwnProperty("body")) {
            req.body = {...req.query};
        }
        else {
            req.body = {...req.body, ...req.query};
        }
    }

    next();
});
app.use("/api", api);

console.log(require("express-list-endpoints")(app));

app.listen(process.env.PORT || 8081);