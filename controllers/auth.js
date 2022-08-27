const crypto=require("crypto");
const ErrorResponse=require("../util/errorResponse");
const asyncHandler=require("../middleware/async");
const sendEmail=require("../util/sendEmail");
const User=require("../models/User");

// @desc     Register User
// @route    POST /api/v1/auth/register
// @access   public
module.exports.register=asyncHandler(async (req,res,next)=>{
    const {name,email,password,role}=req.body;

    //Create user
    const user=await User.create({
        name,
        email,
        password,
        role
    });

    // //Create token
    // const token=user.getSignedJwtToken();

    // res.status(200).json({success:true,token});

    sendTokenResponse(user,200,res);
});


// @desc     Login User
// @route    POST /api/v1/auth/login
// @access   public
module.exports.login=asyncHandler(async (req,res,next)=>{
    const {email,password}=req.body; 

    //Validate email and password
    if(!email || !password){
        return next(new ErrorResponse("Please provide and email and password",400));
    }

    //Check for user
    // const user=await user.findOne({email:email})
    const user=await User.findOne({email}).select("+password");//in user model set select:false so now we want password so now this is how we can include it
                                //but with ES6 syntax 

    if(!user){
        return next(new ErrorResponse("Invalid credentials ",401));
    }

    //check if password matches
    const isMatch=await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse("Invalid credentials ",401)); 
    }
 
    // //Create token
    // const token=user.getSignedJwtToken();

    // res.status(200).json({success:true,token});

    sendTokenResponse(user,200,res);
});


// @desc     Log user out / clear cookie
// @route    GET /api/v1/auth/logout
// @access   Private
exports.logout=asyncHandler(async (req,res,next)=>{
    
    res.cookie("token","none",{
        expires:new Date(Date.now() + 10 * 1000),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        data:{}
    });
});



// @desc     Get Current logged in users
// @route    POST /api/v1/auth/me
// @access   Private
exports.getMe=asyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        data:user
    });
});


// @desc     Update user details
// @route    PUT /api/v1/auth/updatedetails
// @access   Private
exports.updateDetails=asyncHandler(async (req,res,next)=>{

    const fieldsToUpdate={
        name:req.body.name,
        email:req.body.email
    };
    const user=await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new:true,
        runValidators:true
    });

    res.status(200).json({
        success:true,
        data:user
    });
});

// @desc     Update password
// @route    PUT /api/v1/auth/updatepassword
// @access   Private
exports.updatePassword=asyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.user.id).select("+password");

    // Check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse("Password is incorrect",401));
    }

    console.log(req.body.currentPassword,req.body.newPassword);

    user.password=req.body.newPassword;
    await user.save();

    sendTokenResponse(user,200,res);
});

// @desc     Forget password
// @route    POST /api/v1/auth/forgotpassword
// @access   public
exports.forgotPassword=asyncHandler(async (req,res,next)=>{
    const user=await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorResponse(`There is no user with that email`,404));
    }

    //Get reset token
    const resetToken=user.getResetPasswordToken();
    // console.log(resetToken);

    await user.save({validateBeforeSave:false});

    //Create reset url
    const resetUrl=`${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

    const message=`You are receiving this email because you (or someone else) has requested the reset of a password. please make PUT request to: \n \n ${resetUrl}`;

    try{
        await sendEmail({
            email:user.email,
            subject:"Password reset token",
            message
        })
        return res.status(200).json({success:true,data:"Email sent"});
    }
    catch(err){
        console.log(err);
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorResponse(`Email could not be sent`,500));
    }


    // res.status(200).json({
    //     success:true,
    //     data:user
    // });
});

// @desc     Reset password
// @route    PUT /api/v1/auth/resetpassword/:resettoken
// @access   public
exports.resetPassword=asyncHandler(async (req,res,next)=>{
    // console.log(req.body.password);

    // console.log(req.params.resettoken);
    //Get hashed token
    const resetPasswordToken=crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");

        // console.log(resetPasswordToken);

    let user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    // console.log(user);

    if(!user){
        return next(new ErrorResponse("Invalid token",400));
    }

    // console.log(req.body.password);
    // Set new password 
    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();


    sendTokenResponse(user,200,res);

    // res.status(200).json({
    //     success:true,
    //     data:user
    // });
});


//Get token from model,create cookie and send response 
const sendTokenResponse=(user,statusCode,res)=>{
    //Create token
    const token=user.getSignedJwtToken();

    const options={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly:true//we want cookie should be access only through client side script
    };

    if(process.env.NODE_ENV==="production"){
        options.secure=true;//we want cookie when request type should be https
    }

    res
        .status(statusCode)
        .cookie("token",token,options)
        .json({
            success:true,
            token
        })
}