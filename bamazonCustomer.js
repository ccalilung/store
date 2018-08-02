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
            choices: ["Search Inventory", "Buy","End Session"]

        }
    ]).then(function (user) {
        if (user.action === "Search Inventory") {
            search();
            // x();
        }

        if (user.action === "Buy") {
            buy();
            // x();
        }

        if (user.action === "End Session") {
            connection.resume();
            connection.end();
        }
    })
}



function buy() {
    var arr = [];
    connection.resume();
    connection.query('SELECT item_id, product_name FROM products', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < 12; i++) {
            arr.push(results[i].product_name)
        }
        inquirer.prompt([{
            type: "list",
            name: "action",
            message: "What would you like to buy?",
            choices: arr
        }]).then(function (user) {
            connection.query('SELECT stock_quantity FROM products WHERE product_name = ?', user.action, function (error, results, fields) {
                console.log(results)
                if (results[0].stock_quantity > 0) {
                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: results[0].stock_quantity - 1
                    }, {
                        product_name: user.action
                    }], function (error, results, fields) {

                    })
                    connection.query('SELECT stock_quantity FROM products WHERE product_name = ?', user.action, function (error, results, fields) {
                        console.log("quantity left: " + results[0].stock_quantity)})
                       x();
                }

                if (results[0].stock_quantity <= 0) {
                    console.log("Our dear apologies, but we're out of that product! Check back soon!")
                    x();

                }



            })

        })
    })
  
};



function search() {
    connection.resume();
    connection.query('SELECT item_id, product_name FROM products', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < 12; i++) {
            console.log("Item ID: " + results[i].item_id + " Product Name: " + results[i].product_name)
           
        }
    })
    x();


}