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
            choices: ["Search Inventory", "Buy", "End Session"]

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
        for (i = 0; i < results.length; i++) {
            arr.push(results[i].product_name)
        }
        inquirer.prompt([{
                type: "list",
                name: "action",
                message: "What would you like to buy?",
                choices: arr
            },
            {
                type: "input",
                name: "quantityRequested",
                message: "How many of the product would you like to purchase?"


            }
        ]).then(function (user) {
            connection.query('SELECT stock_quantity, price, product_sales FROM products WHERE product_name = ?', user.action, function (error, results, fields) {

                if ((results[0].stock_quantity > 0) && (results[0].stock_quantity - user.quantityRequested >= 0)) {
                    var stockQuantity = results[0].stock_quantity - user.quantityRequested
                    var price = parseFloat(user.quantityRequested * results[0].price)
                    var productSalesIndiv = parseFloat(results[0].product_sales) 
                    var productSales = productSalesIndiv+ price
                    
                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: stockQuantity
                    }, {
                        product_name: user.action
                    }], function (error, results, fields) {
                        console.log("Price: " + price)

                    })

                    connection.query('UPDATE products SET ? WHERE ?', [{
                        product_sales: productSales
                    }, {
                        product_name: user.action
                    }], function (error, results, fields) {
                        x();
                    })


                }

                else {
                    console.log("Our dear apologies, but we're out of that product! Check back soon!")
                    x();
                }



            })

        });
    })

};



function search() {
    connection.resume();
    connection.query('SELECT * FROM products', function (err, res, fields) {
        var numResults = res.length

        connection.query('SELECT * FROM products', function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < numResults; i++) {
                console.log("Item ID: " + results[i].item_id + " Product Name: " + results[i].product_name + " Price: $" + results[i].price)

            }
            x();
        });
    });



}