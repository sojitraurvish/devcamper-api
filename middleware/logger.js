
// @desc Logs request to console
const logger=(req,res,next)=>{
    console.log(`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`);
    //req.headers -> .host
    //req.url
    //req.orignalUrl
    //req.headers.authorization too access bearer token in our application
    next(); 
}

module.exports=logger;