const path=require("path");
const ErrorResponse=require("../util/errorResponse");
const asyncHandler=require("../middleware/async");
const geocoder=require("../util/geocoder");
const Bootcamp=require("../models/Bootcamp");

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
module.exports.getBootcamps=asyncHandler(async (req,res,next)=>{

        return res.status(200).json(res.advancedResults);
});

// @desc     Get single bootcamps
// @route    GET /api/v1/bootcamps/:id
// @access   Public
module.exports.getBootcamp=asyncHandler(async (req,res,next)=>{ 
        const bootcamp=await Bootcamp.findById(req.params.id);
        
        // {{URL}}/api/v1/bootcamps/62eba1a96843a7324581b090
        // {{URL}}/api/v1/bootcamps/62eba1a96843a7324581b091 -> in formate
        if(!bootcamp){
            //1
            // res.status(400).json({success:false});
            
            return next(new ErrorResponse(`Botcamp not found with id of ${req.params.id}`,404));
            //or throw new ErrorResponse(`Botcamp not found with id of ${req.params.id}`,404));
        
        }

        res.status(200).json({success:true,data:bootcamp});
    
    
});

// @desc     Create new bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
module.exports.createBootcamp=asyncHandler(async(req,res,next)=>{
        // Add user to req.body
        req.body.user=req.user.id;

        //Check for published bootcamp
        const publishedBootcamp=await Bootcamp.findOne({user:req.user.id});

        // If user is not an admin ,they can only add one bootcamp
        if(publishedBootcamp && req.user.role !== "admin"){
            return next(new ErrorResponse(`The user with Id ${req.user.id} has already published a bootcamp`,400));
        }

        const bootcamp=await Bootcamp.create(req.body);
        return res.status(201).json({
            success:true,
            data:bootcamp
        });
    
});

// @desc     Update bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Private
module.exports.updateBootcamp=asyncHandler(async(req,res,next)=>{
    
        // const bootcamp=await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        //     new:true,//in response we want new updated data
        //     runValidators:true,//we want to run mongoose validators
        // });
        let bootcamp=await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Botcamp not found with id of ${req.params.id}`,404));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString()!==req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,401));
        }

        bootcamp=await Bootcamp.findOneAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        res.status(200).json({success:true,data:bootcamp});
    
});

// @desc     Delete bootcamp
// @route    Delete /api/v1/bootcamps/:id
// @access   Private
module.exports.deleteBootcamp=asyncHandler(async(req,res,next)=>{
    
        const bootcamp=await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Botcamp not found with id of ${req.params.id}`,404));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString()!==req.user.id && req.user.role !== "admin"){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`,401));
        }

        bootcamp.remove(); 

        res.status(200).json({success:true,data:{}});
    
    
});

// @desc     Get bootcamps within radius
// @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
module.exports.getBootcampsRadios=asyncHandler(async(req,res,next)=>{
    
    const{zipcode,distance}=req.params;

    //Get lat/lan from geocoder

    const loc=await geocoder.geocode(zipcode);
    const lat=loc[0].latitude;
    const lag=loc[0].longitude;

    //Calc radius using radius
    //Divide dist by radius of Earth
    // Earth Radius=3,963 mi /6378km

    const radius=distance/3963;

    const bootcamps=await Bootcamp.find({
        location:{
                $geoWithin:{
                    $centerSphere:[[lat,lag],radius]
                }
            }
    });

    res.status(200).json({
        success:true,
        count:bootcamps.length,
        data:bootcamps
    });
});


// @desc     Upload photo for bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
module.exports.bootcampPhotoUpload=asyncHandler(async(req,res,next)=>{
    
    const bootcamp=await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Botcamp not found with id of ${req.params.id}`,404));
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString()!==req.user.id && req.user.role !== "admin"){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,401));
    }

    if(!req.files){
        return next(new ErrorResponse("Please upload a file"),400);
    }

    const file=req.files.file;


    // [Object: null prototype] {
    //     file: {
    //       name: 'me.jpg',
    //       data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff db 00 43 00 03 02 02 03 02 02 03 03 03 03 04 03 03 04 05 08 05 05 04 04 05 0a 07 07 06 ... 
    //   115809 more bytes>,
    //       size: 115859,
    //       encoding: '7bit',
    //       tempFilePath: '',
    //       truncated: false,
    //       mimetype: 'image/jpeg',
    //       md5: '6540cdb4bb00a272cd4be59cf20ce62f',
    //       mv: [Function: mv]
    //     }
    //   }

    //Make sure the image is a photo
    if(!file.mimetype.startsWith("image")){
        return next(new ErrorResponse("Please upload an image file."),400);
    }

    //Check filesize 
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}.`),400);
    }

    //Create custom filename
    file.name=`photo_${bootcamp.id}${path.parse(file.name).ext}`;

    //to move file into public folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
        if(err){
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`),500);
        }

        await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name});

        res.status(200).json({
            success:true,
            data:file.name
        });
    });

    console.log(file.name);
});