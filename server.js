const express = require("express"),
    AWS = require("aws-sdk"),
    config = require("./config"),
    bodyParser = require("body-parser"),
    pug = require("pug"),
    mainPage = pug.compileFile("./html/main.pug");

//set up dynamodb
AWS.config.update(config.aws);
let client = new AWS.DynamoDB.DocumentClient();

let app = express();
let api = require("./api/main")(client);

// app.use((req, res, next) => {
//     if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
//         res.redirect('https://' + req.get('Host') + req.url);
//     }
//     else {
//         next();
//     }
// });

app.get("/", (req, res) => {
    res.send(mainPage({title: "Index", file: "index.bundle.js"}));
});
app.get("/register", (req, res) => {
    res.send(mainPage({title: "Register", file: "register.bundle.js"}));
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    if(req.hasOwnProperty("query")) {
        if(req.hasOwnProperty("body")) {
            req.body = {...req.body, ...req.query};
        }
        else {
            req.body = {...req.query};
        }
    }

    next();
});
app.use("/api", api);




// console.log(require("express-list-endpoints")(app));

app.listen(process.env.PORT || 8081);