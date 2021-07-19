const express = require("express");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();


app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs"); 

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-porash:test123@cluster0.ktjka.mongodb.net/todolistDB", {
    useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false

});
 
const itemSchema=new mongoose.Schema({
    name:String
    
});
 
const listSchema=new mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const List=mongoose.model("list",listSchema);

const Item=mongoose.model("item",itemSchema);

const item1=new Item({
    name:"Welcome to your todolist."
});
const item2=new Item({
    name:"Hit the + to add new items."
});
const item3=new Item({
    name:"<-- hit this to delete an item."
});



app.get("/", function(req, res) {
    Item.find({},function(err,elements){
        if(err) console.log(err);
        else{
            if(elements.length===0){
                Item.insertMany([item1,item2,item3],function(err){
                    if(err) console.log(err);
                    else console.log("successfully saved to db");
                });
                res.redirect("/");

            }
            else{
                res.render("list",{listtitle:"Today",
                       newitem:elements});

            }
            

        }
    });
  
    
    

});

app.post("/",function(req,res){
    
const item=req.body.new; 
const list=req.body.list;

const newitem= new Item({
    name:item
});

if(list==="Today"){
    newitem.save();

res.redirect("/");

}
else{
    List.findOne({name:list},function(err,found){
        if(!err){
            found.items.push(newitem);
            found.save(function(){
                res.redirect("/"+list);
            });
        }
    });

}


    
});

app.post("/delete",function(req,res){
   const checked= req.body.checkbox;
   const listname=req.body.listname;
   
   if(listname==="Today"){
    Item.findByIdAndRemove(checked,function(err){
        if(!err) {
            console.log("succesfully remove");
            res.redirect("/");
        }
    });

   }
   else{
       List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checked}}},function(err,response){
           if(!err){
               res.redirect("/"+listname);
           }

       });
   }
   
  

});


app.get("/:dynamic",function(req,res){
   const costumlist=_.capitalize(req.params.dynamic);

   if (req.params.dynamic === "favicon.ico") return;

List.findOne({name:costumlist},function(err,result){
    if(!err){
        if(!result){
            const list=new List({
                name:costumlist,
                items:[item1,item2,item3]
            });
            list.save(function(){
                res.redirect("/"+costumlist);
            });

        }
        else{
            res.render("list",{listtitle: result.name,
            newitem:result.items});
        }
    }
});

  
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

 
app.listen(port, function(){
  console.log("Server started on port: 3000");
});