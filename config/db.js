const mongoose=require("mongoose");

const connectDB=async()=>{
    const conn=await mongoose.connect(process.env.MONGO_URI,{ // Here this function returns promise so we can handled with .catch() block (.then().catch()). But, here we are using async await so we can  
        // useNewUrlParser:true,
        // userCreateIndex:true,
        // useFindAndModify:false,
        useUnifiedTopology:true
    });

    console.log(`MongoDB Connected ${conn.connection.host}`.cyan.underline.bold);
}

module.exports=connectDB;