import mongoose from "mongoose";

import bcrypt from "bcryptjs";

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:[3,'userName atleat 3 characters'],
        maxlength:[50,'userName cannot be exceed 50 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:[50,'name cannot exceed 50charracters'],
    },
    role:{
        type:String,
        enum:{
        values:["admin","user"],
        message:"Role must be either admin or user"
        },
         default:'user'
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password:{
        type:String,
        required:true,
        minlength:[8,'password must be at least 8 charater long'],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'],
        select:false
    },
    avatar:{
        type:String,
        default:null,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v) || /^\/uploads\/.+/.test(v);
            },
            message: 'Avatar must be a valid URL or file path'
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: undefined,
        select: false
    },
    resetPasswordToken: {
        type: String,
        default: undefined,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        default: undefined,
        select: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        default: null,
        select: false
    },
    passwordChangeAt: {
        type: Date,
        default: null,
        select: false
    }
},{timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}); 


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
}); 

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('locked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});



userSchema.methods.incLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    if (this.loginAttempts + 1 >= 5 && !this.Locked) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; 
    }
    
    return this.updateOne(updates);
};


userSchema.methods.resetLoginAttempts = async function() {
   return this.updateOne({
    $set: {
        loginAttempts: 0
    },
    $unset: {
        lockUntil: 1
    }
});
};


userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.verificationToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;
    delete userObject.loginAttempts;
    delete userObject.lockUntil;
    return userObject;
};


export const User = mongoose.model('User', userSchema);




