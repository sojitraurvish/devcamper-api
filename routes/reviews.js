const express=require("express");

//controllers file
const reviewsControllers=require("../controllers/reviews");

const Review=require("../models/Review");

// if you want to access params from the parent router
const route=express.Router({mergeParams:true});

const advancedResults=require("../middleware/advancedResult");
const {protect,authorize}=require("../middleware/auth");

route.route("/")
    .get(advancedResults(Review,{
        path:"bootcamp",
        select:"name description"
    }),reviewsControllers.getReviews)
    .post(protect,authorize("user","admin"),reviewsControllers.addReview);
    
route.route("/:id")
    .get(reviewsControllers.getReview)
    .put(protect,authorize("user","admin"),reviewsControllers.updateReview)
    .delete(protect,authorize("user","admin"),reviewsControllers.deleteReview)

module.exports.routes=route;