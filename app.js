const path=require("path");
const express=require("express");
const dotenv=require("dotenv");
// const logger=require("./middleware/logger");//logger maid by mine
const morgan=require("morgan");//to use third package for logger
const colors=require("colors");//to color console output
const fileupload=require("express-fileupload");
const cookieParser=require("cookie-parser");
const mongoSanitize=require("express-mongo-sanitize");
const helmet=require("helmet");
const xss=require("xss-clean");
const rateLimit=require("express-rate-limit");
const hpp=require("hpp");
const cors=require("cors");
const errorHandler=require("./middleware/error");
const connectDB=require("./config/db");

//Load env vars
dotenv.config({path:"./config/config.env"});

//Connect to database
connectDB();

//Routes files 
const bootcampsRouter=require("./routes/bootcamps");
const coursesRouter=require("./routes/courses");
const authRouter=require("./routes/auth");
const userRouter=require("./routes/users");
const reviewsRouter=require("./routes/reviews");

const app=express();

// Body parser
app.use(express.json());
//before long ago express not contain body parser now now it contain so we can use both the way express body-parser and external package too see bellow for external package
// app.use(bodyParser.urlencoded({extended:false}));
// x-www-form-urlencoded fro <form> submit data
// app.use(bodyParser.json())// application/json

// Cookie Parser
app.use(cookieParser());

// app.use(logger);//logger maid by mine

// Dev logging middleware
if(process.env.NODE_ENV==="development"){//i want to run this if we are into development environment 
    app.use(morgan("dev"));
}

//File uploading  
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent Xss attacks
app.use(xss());

// Rate limiting of request
const limiter=rateLimit({
    windowMs:10 * 60 * 1000,// 10 mins
    max:100
});

app.use(limiter);

// Prevent http param pollution (query params)
app.use(hpp());

// Enable CORS
app.use(cors());

//Set static folder 
app.use(express.static(path.join(__dirname,"public")));

//Mount routers
app.use("/api/v1/bootcamps",bootcampsRouter.routes);
app.use("/api/v1/courses",coursesRouter.routes);
app.use("/api/v1/auth",authRouter.routes);
app.use("/api/v1/users",userRouter.routes);
app.use("/api/v1/reviews",reviewsRouter.routes);

app.use(errorHandler);

const PORT=process.env.PORT || 5000;

const server=app.listen(PORT,()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}!...`.yellow.bold);
});

//Handle unhandled promise rejection ----------> Here .on method listen for unhandled rejections
process.on("unhandledRejection",(err,promise)=>{// specially when database password wrong because at where we haven't handled exceptions
    console.log(`Unhandled Rejection Error: ${err.massage}`.red);
    console.log(`Unhandled Rejection Error: ${err}`.red);
    console.log(`Unhandled Rejection Error: ${err.stack}`.red);
    //Close server & exit process
    server.close(()=>{process.exit(1)});
});