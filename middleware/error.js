const ErrorResponse = require("../util/errorResponse");

const errorHandler=(err,req,res,next)=>{
    let error={...err};
    
    error.message=err.message;

    //Log to console for dev
    // console.log(err.stack.red);
    console.log(err);
  
    //Mongoose bad Object Id
    if(err.name==="CastError"){
        const message=`Resource not found`;
        // const message=`Resource not found with id of ${err.value}`;
        error=new ErrorResponse(message,404);
    }

    //Mongoose duplicate key
    if(err.code===11000){
        const message=`Duplicate filed value entered`;
        error=new ErrorResponse(message,400);
    }

    //Mongoose validation 
    if(err.name==="ValidationError"){
        const message=Object.values(err.errors).map(val => val.message);
        error=new ErrorResponse(message,400);
    }

    res.status(error.statusCode || 500).json({
        success:false,
        err:error.message || "Server Error"
    });

}

module.exports=errorHandler;