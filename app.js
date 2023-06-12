const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const URI = "mongodb+srv://2021chb1052:sXaLEuEmMHwjkumV@cluster0.a5sobhs.mongodb.net/todoListDB";

async function connect(){
    try{
        await mongoose.connect(URI);
        console.log("Successfully connected to mongo Database.");
    } catch(err){
        console.log(`Error: ${error}`)
    }
}
connect();
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// let items =["Sleep", "Workout", "Code"];
// let workItems = [];

//** Connection to mongoDB Database */

const itemsSchema = {
    name: {
        type: String,
        reuired: [true, "Please check your input: No name specified!"]
    }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the '+' button to add a new task"
});

const item3 = new Item({
    name: "Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.post("/", function (req, res) {
	const itemName = req.body.new_item;
    const listName = req.body.list;
    
        const item = new Item({
			name: itemName,
		});

    if (listName === "Today"){
        item.save().then(() =>{
                res.redirect("/");
            }).catch((err) => {
                console.log(err);
            });
		
        
    }else{
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save().then(() =>{

            }).catch((err) => {
                console.log(err);
            })
            res.redirect("/" + listName);
        })
        .catch(function (err) {
			console.log(err);
		});
    }

    
    

});
app.post("/delete", function(req, res){
	const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
		    .then(() => {
			    console.log("Successfully deleted checked item");
			    res.redirect("/");
		    })
		    .catch((err) => {
			    console.log(err);
		    });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
			.then(function (foundList) {
				res.redirect("/" + listName);
			})
			.catch((err) => {
				console.log(err);
			});
    }
	
})

app.get("/", function(req, res){
    // res.sendFile(__dirname + "/index.html");
    // let day = date.getDate();

    Item.find({})
		.then(function (foundItems) {

            if(foundItems.length === 0){
                Item.insertMany(defaultItems)
					.then(function () {
						console.log("Successfully added default items to DB.");
                        res.redirect("/");
					})
					.catch(function (err) {
						console.log(err);
					});
            }else{
                res.render("list", { listTitle: "Today", newListItems: foundItems });
            }

		})
		.catch(function (err) {
			console.log(err);
		});
    
});

app.get("/work", function(req, res){
    res.render("list", { listTitle: "Work List", newListItems: workItems });
})

app.get("/about", function(req, res){
    res.render("about");
})

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    if (customListName === "Favicon.ico") return;

    List.findOne({ name: customListName })
    .then(function (foundList) {
				if (!foundList) {
					const list = new List({
						name: customListName,
						items: defaultItems,
					});
					list.save();
					res.redirect("/" + customListName);
				} else {
					res.render("list", {
						listTitle: foundList.name,
						newListItems: foundList.items,
					});
				}
			})
			.catch(function (err) {
				console.log(err);
			});
});
app.listen(3000, function(){
    console.log("server is running on port 3000");
});






// username: 2021chb1052
// password: sXaLEuEmMHwjkumV