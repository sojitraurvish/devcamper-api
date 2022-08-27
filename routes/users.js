const express=require("express");

//controllers file
const usersControllers=require("../controllers/users");

const User=require("../models/User");

// if you want to access params from the parent router
const route=express.Router();

const advancedResults=require("../middleware/advancedResult");
const {protect,authorize}=require("../middleware/auth");

route.use(protect);//this way we have to write it just once
route.use(authorize("admin"));

route
    .route("/")
    .get(advancedResults(User),usersControllers.getUsers)
    .post(usersControllers.createUser);


route
    .route("/:id")
    .get(usersControllers.getUser)
    .put(usersControllers.updateUser)
    .delete(usersControllers.deleteUser);
    

module.exports.routes=route;