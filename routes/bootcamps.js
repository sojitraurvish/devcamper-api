const express=require("express");

//controllers file
const bootcampControllers=require("../controllers/bootcamps");

const Bootcamp=require("../models/Bootcamp");

//Include other resource routes
const coursesRouters=require("./courses");
const reviewsRouters=require("./reviews");

const route=express.Router();

const advancedResults=require("../middleware/advancedResult");
const {protect,authorize}=require("../middleware/auth");

//Re-route into other resource routes
route.use("/:bootcampId/courses",coursesRouters.routes);
route.use("/:bootcampId/reviews",reviewsRouters.routes);

route.route("/radius/:zipcode/:distance")
    // GET :/api/v1/bootcamps/radius/:zipcode/:distance    
    .get(bootcampControllers.getBootcampsRadios);


route.route("/:id/photo")
    // PUT  :/api/v1/bootcamps/:id/photo  
    .put(protect,authorize("publisher","admin"),bootcampControllers.bootcampPhotoUpload);

route.route("/")
    // GET : /api/v1/bootcamps/
    .get(advancedResults(Bootcamp,"courses"),bootcampControllers.getBootcamps)     
    // POST : /api/v1/bootcamps/  
    .post(protect,authorize("publisher","admin"),bootcampControllers.createBootcamp);  


route.route("/:id")
    // GET : /api/v1/bootcamps/:id 
    .get(bootcampControllers.getBootcamp)
    // PUT : /api/v1/bootcamps/:id
    .put(protect,authorize("publisher","admin"),bootcampControllers.updateBootcamp)
    // PUT : /api/v1/bootcamps/:id
    .delete(protect,authorize("publisher","admin"),bootcampControllers.deleteBootcamp);


module.exports.routes=route;



// // GET : /api/v1/bootcamps/ 
// route.get("/",bootcampControllers.getBootcamps);

// // GET : /api/v1/bootcamps/:id 
// route.get("/:id",bootcampControllers.getBootcamp);

// // POST : /api/v1/bootcamps/ 
// route.post("/",bootcampControllers.createBootcamp);

// // PUT : /api/v1/bootcamps/:id 
// route.put("/:id",bootcampControllers.updateBootcamp);

// // DELETE : /api/v1/bootcamps/:id 
// route.delete("/:id",bootcampControllers.deleteBootcamp);