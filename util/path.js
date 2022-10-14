//just for more knowledge
const path=require("path");

module.exports.rootDir=path.dirname(process.mainModule.filename);

//
// // module.exports.ROOT=path.join("http" +"://"+"localhost"+"/ecom/public/");
// module.exports.ROOT=path.join(this.rootDir,"public");
// module.exports.ASSETS=path.join(this.rootDir,"public","assets");
// // module.exports.ASSETS="http" +"://"+"localhost"+"/ecom/public/";

// module.exports.ADMIN_DIR=path.join("admin");
// module.exports.CUSTOMER_DIR=path.join("customer");

// // module.exports.pathConstructor=(req,res,next)=>{
// //     // console.log(req.hostname);
//     // PATH=req.protocol +"://"+ req.headers.host+"/ecom/public/";
//     // console.log(PATH);
//     // next();
// // }

// // @desc Logs request to console
// const logger=(req,res,next)=>{
//     console.log(`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`);
//     //req.headers -> .host
//     //req.url
//     //req.orignalUrl
//     //req.headers.authorization too access bearer token in our application
//     next(); 
// }

// https://www.restapitutorial.com/httpstatuscodes.html

// .populate("users", "-password").populate("latestMessage")
//             .populate({
//                 path: "users",
//                 select: "username",
//                 populate: {
//                     path: "latestMessage",
//                     select: "filed",
//                     populate: {
//                         path: "latestMessage",
//                         select: "filed"
//                     }
//                 },
//             })

// console.log("1" + req.headers.user)
//             console.log("2" + req.header("user"));
//             const { user } = req.headers;
//             console.log("3" + user);

// Path for root directory
const rootDir=path.dirname(process.mainModule.filename);

// Load env vars
dotenv.config({path:path.join(rootDir,"config","config.env")});