const ErrorResponse=require("../util/errorResponse");
const asyncHandler=require("../middleware/async");
const Course=require("../models/Course");
const Bootcamp=require("../models/Bootcamp");


// @desc     Get courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public
module.exports.getCourses=asyncHandler(async (req,res,next)=>{
    // let query;

    if(req.params.bootcampId){
        // query=Course.find({bootcamp:req.params.bootcampId});
        const courses=await Course.find({bootcamp:req.params.bootcampId});

        return res.status(200).json({
            success:true,
            count:courses.length,
            data:courses
        });
    }else{
        // query=Course.find().select("title").populate({
        //     path:"bootcamp", 
        //     select:'name description'
        // });
        res.status(200).json(res.advancedResults);
    }

    // const courses=await query;
    
    // res.status(200).json({
    //     success:true,
    //     count:courses.length,
    //     data:courses
    // });
});


// @desc     Get single course
// @route    GET /api/v1/courses/:id
// @access   Public
module.exports.getCourse=asyncHandler(async (req,res,next)=>{
   
    const course=await Course.findById(req.params.id).populate({
        path:"bootcamp",
        select:"name description"
    });

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`),404);
    }
    
    res.status(200).json({
        success:true,
        data:course
    });
});

// @desc     Add course
// @route    POST /api/v1/bootcamps/:bootcampId/courses
// @access   Private
module.exports.addCourse=asyncHandler(async (req,res,next)=>{
   
    req.body.bootcamp=req.params.bootcampId;
    req.body.user=req.user.id;

    const bootcamp=await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`No Bootcamp with the id of ${req.params.bootcampId}`),404);
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString()!==req.user.id && req.user.role !== "admin"){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,401));
    }
    
    const course=await Course.create(req.body);

    res.status(200).json({
        success:true,
        data:course
    });
});


// @desc     Update course
// @route    PUT /api/v1/courses/:id
// @access   Private
module.exports.updateCourse=asyncHandler(async (req,res,next)=>{
   

    let course=await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No Course with the id of ${req.params.id}`),404);
    }

    // Make sure user is bootcamp owner
    if(course.user.toString()!==req.user.id && req.user.role !== "admin"){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update a course ${course._id} to bootcamp ${bootcamp._id}`,401));
    }
    
    course=await Course.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:course
    });
});

// @desc     Delete course
// @route    DELETE /api/v1/courses/:id
// @access   Private
module.exports.deleteCourse=asyncHandler(async (req,res,next)=>{
   

    const course=await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No Course with the id of ${req.params.id}`),404);
    }

    // Make sure user is bootcamp owner
    if(course.user.toString()!==req.user.id && req.user.role !== "admin"){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete a course ${course._id} to bootcamp ${bootcamp._id}`,401));
    }
    
    await course.remove();

    res.status(200).json({
        success:true,
        data:{}
    });
});
