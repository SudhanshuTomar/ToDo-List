//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemSchema = {
  name : String
};
const Item = mongoose.model("Item",itemSchema); 

const item1 = new Item({
  name : "complete one module of webd"
});
const item2 =new Item({
  name:"click + to add new item"
});
const defaultitems = [item1,item2];

const listschema = {
  name:String,
  items:[itemSchema]
};
const List =mongoose.model("List",listschema);


app.get("/", function(req, res) {

const day = date.getDate();
Item.find({},function(err,founditems){
  if(founditems.length===0){
    Item.insertMany(defaultitems,function(err){
      if(err){
        console.log("error");
      }
      else{
        console.log("Successfully created db");
      }
    });
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: founditems});
  }

});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete",function(req,res){
  const checkeditemid=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkeditemid,function(err){
      if(!err){
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemid}}},function(err,found){
      if(!err){
        res.redirect("/"+customlistname);
      }
    });
  }
  
});

app.get("/:customlistname", function(req,res){
  const customlistname = _.capitalize(req.params.customlistname);
  List.findOne({name:customlistname},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name:customlistname,
          items:defaultitems
        });
        list.save();
        res.redirect("/"+customlistname);
      }
      else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }

    }
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
