const express=require("express");

//controllers file
const coursesControllers=require("../controllers/courses");

const Course=require("../models/Course");

// if you want to access params from the parent router
const route=express.Router({mergeParams:true});

const advancedResults=require("../middleware/advancedResult");
const {protect,authorize}=require("../middleware/auth");

route.route("/")
    .get(advancedResults(Course,{
        path:"bootcamp",
        select:"name description"
    }),coursesControllers.getCourses)
    .post(protect,authorize("publisher","admin"),coursesControllers.addCourse); 

route.route("/:id")
    .get(coursesControllers.getCourse)
    .put(protect,authorize("publisher","admin"),coursesControllers.updateCourse)
    .delete(protect,authorize("publisher","admin"),coursesControllers.deleteCourse);

module.exports.routes=route;