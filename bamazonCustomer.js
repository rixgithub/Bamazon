var mysql = require('mysql');
var inquirer = require('inquirer');
var consoleTable = require('console.table');

var connection = mysql.createConnection ({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'Bamazon'
});

connection.connect(function(err) {
	if(err) throw err;
	// console.log("We have a connection.");
	start();
});

var start = function() {
	connection.query('SELECT * FROM products', function(err, results) {
		if(err) throw err;
		for(var i = 0; i < results.length; i++) {
			console.table([
			  {
			    ID: results[i].item_id,
			    Product: results[i].product_name,
			    Department: results[i].department_name,
			    Price: results[i].price,
			    Quantity: results[i].stock_quantity
			  }
			]);
		}
	});
	setTimeout(buy, 1000);
};

var buy = function() {
	connection.query('SELECT * FROM products', function(err, results) {
		if(err) throw err;
		inquirer.prompt([
			{
			    type: "input",
			    message: "What is the ID of the product you would like to buy?",
			    name: "id",
			    validate: function(value) {
				if (isNaN(value) === false) {
        			return true;
      			}
      				return false;
  				}
		  	},
		  	{
			    type: "input",
			    message: "How many units would you like to buy?",
			    name: "units",
			    validate: function(value) {
				if (isNaN(value) === false) {
        			return true;
      			}
      				return false;
  				}
			}
		]).then(function(answer) {
			answer.id = parseInt(answer.id); // convert to int
			
			var chosenProduct = {};

			for (var i = 0; i < results.length; i++) {
				if(results[i].item_id === answer.id) {
					chosenProduct = results[i];
				}
			}
			if (answer.units > chosenProduct.stock_quantity) {
				console.log("*********************************************");
				console.log("Sorry we don't have enough of that in stock. We have " + chosenProduct.stock_quantity + " in stock at this time.");
				console.log("Please try again.")
				console.log("*********************************************");
				setTimeout(start, 4000);
			} else if (answer.units <= chosenProduct.stock_quantity) {
				var remainStock = chosenProduct.stock_quantity - answer.units;
				var total = answer.units * chosenProduct.price;
				// console.log(remainStock);
				
				connection.query("UPDATE products SET ? WHERE ?", [{
					stock_quantity: remainStock
				}, {
					item_id: chosenProduct.item_id
				}], function(err, res) {
					if (err) throw err;
					console.log("*********************************************");
					console.log("Thanks for your purchase.  Your total is $" + total);
					console.log("*********************************************");
				});
				setTimeout(start, 4000);
			}	
		});
	});
};
