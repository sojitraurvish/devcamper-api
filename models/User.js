const crypto=require("crypto");//node core module to generate token for forgot password
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const { nextTick } = require("process");

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please add a name"]
    },
    email:{
        type:String,
        required:[true,"Please add an email"],
        unique:true,
        match:[//javascript regex email ->https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add valid Email"
        ]
    },
    role:{
        type:String,
        enum:["user","publisher"],
        default:"user"
    },
    password:{
        type:String,
        required:[true,"Please add a password"],
        minlength:6,
        select:false //when we get user this field not going show password 
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
});

//Encrypt password using bcrypt
UserSchema.pre("save",async function(next){
    //if i am saving data without password like in forget password so password will not be there and that's why this function give error so i am checking that password is exists or modified then and only decrypt it otherwise ...
    if(!this.isModified("password")){
        next();
    }

    const salt=await bcrypt.genSalt(10);
    // console.log(salt);
    this.password=await bcrypt.hash(this.password,salt);
    // console.log(this.password);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken=function(){
   return jwt.sign({
    // email:this.email,
    id:this._id.toString()
    },
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRE}
    )
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken=function(){
    // Generate token 
    const resetToken=crypto.randomBytes(20/* No of bytes */).toString("hex");//randomBytes function return buffer therefor to we are converting it to the string

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken=crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    console.log(resetToken,this.resetPasswordToken);

    //Set expire 
    this.resetPasswordExpire=Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports=mongoose.model("User",UserSchema);