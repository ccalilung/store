var mysql = require("mysql");
require("dotenv").config();
var keys = require("./keys")
var inquirer = require('inquirer')


var connection = mysql.createConnection({
    host: keys.theKeys.host,
    port: keys.theKeys.port,
    user: keys.theKeys.user,
    password: keys.theKeys.password,
    database: keys.theKeys.database,
});

connection.connect(function (err) {
    if (err) throw err;
    x();
    connection.pause();
});

function x() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View Product Sales by Department","Create New Department"]

        }
    ]).then(function (user) {
        if (user.action === "View Product Sales by Department") {
            productSalesByDept();
        }
        if (user.action === "Create New Department") {
            viewLow();
        }
        if (user.action === "End Session") {
            connection.resume();
            connection.end();
        }
    })
}
