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
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "End Session"]

        }
    ]).then(function (user) {
        if (user.action === "View Products for Sale") {
            search();

        }

        if (user.action === "View Low Inventory") {
            viewLow();

        }

        if (user.action === "Add to Inventory") {
            addInventory();

        }

        if (user.action === "Add New Product") {
            addProduct();

        }

        if (user.action === "End Session") {
            connection.resume();
            connection.end();
        }
    })
}

function addInventory() {
    var arr = [];
    connection.resume();
    connection.query('SELECT item_id, product_name FROM products', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < results.length; i++) {
            arr.push(results[i].product_name)
        }
        inquirer.prompt([{
            type: "list",
            name: "stock",
            message: "What product would you like to stock?",
            choices: arr
        },
    {
        type: "input",
        name: "quantityAdded",
        message: "How many of the product would you like to add?"


    }]).then(function (user) {
            connection.query('SELECT stock_quantity FROM products WHERE product_name = ?', user.stock, function (error, results, fields) {
                
               var stock = user.stock
               var quantity = parseInt(results[0].stock_quantity) + parseInt(user.quantityAdded)
                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: quantity 
                    }, {
                        product_name: stock
                    }], function (error, results, fields) {
                        console.log("You now have " + quantity + " of " + user.stock)
                        x();
                    })
        })}); 
    });
};


function addProduct() {
    connection.resume();
    inquirer.prompt([{
            type: "input",
            name: "product_name",
            message: "New Product Name:"
        },
        {
            type: "input",
            name: "department_name",
            message: "Department Name:"
        },
        {
            type: "input",
            name: "price",
            message: "Price (float only):"
        },
        {
            type: "input",
            name: "stock_quantity",
            message: "Stock Quantity:"
        }

    ]).then(function (user) {
        
        connection.query('INSERT INTO products (product_name,department_name,price,stock_quantity,product_sales) VALUES (?,?,?,?,0.00)', [

                user.product_name, user.department_name, user.price, user.stock_quantity
            ],
            function (error, results, fields) {
                connection.query('SELECT * FROM products', function (error, results, fields) {
                    console.log({item_id: results[results.length-1].item_id,
                        product_name: results[results.length-1].product_name,
                        department_name: results[results.length-1].department_name,
                        price: results[results.length-1].price,
                        stock_quantity: results[results.length-1].stock_quantity, product_sales: 0.00})
                x()

            })
        })
    })
}


function viewLow() {
    var arr = [];
    connection.resume();
    connection.query('SELECT * FROM products', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < results.length; i++) {
            if (results[i].stock_quantity < 6) {

                arr.push({
                    item_id: results[i].item_id,
                    product_name: results[i].product_name,
                    department_name: results[i].department_name,
                    price: results[i].price,
                    stock_quantity: results[i].stock_quantity
                })
            }
        }
        if(arr[0] !== undefined) {
            console.log(arr)
            x()
        }
        if(arr[0] === undefined) {
            console.log("Product stock levels are optimal; no need for replenishments at this time.")
            x();
        }
        
        
       
    })
}



function search() {
    connection.resume();
    connection.query('SELECT * FROM products', function (error, results, fields) {
        var numResults = results.length
            if (error) throw error;
            for (i = 0; i < numResults; i++) {
                console.log("Item ID: " + results[i].item_id + " Product Name: " + results[i].product_name + " Stock Quantity: " + results[i].stock_quantity)

            }
            x();
        });




}