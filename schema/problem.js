import mongoose from "mongoose";

const exmapleSchema=new mongoose.Schema({
    input:{
        type: String,
        required: true,
        trim: true,
    },
    output:{
        type: String,
        required: true,
        trim: true,
    },
    explanation:{
        type: String,
        trim: true,
    }
})
const codeTemplateSchema = new mongoose.Schema({
    language:{
        type: String,
        required:true,
        trim: true,
    },
    starterCode:{
        type: String,
        required: true,
        trim: true,
    }
})
const solutionSchema = new mongoose.Schema({
    language:{
        type: String,
        required: true,
        trim: true,
    },
    solution:{
        type: String,
        required: true,
        trim: true,
    }
})
const problemSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug:{
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  description:{ 
    type: String,
    required: true,
    trim: true,
  },
  difficulty:{
    type: String,
    required: true,
    trim: true,
    enum: ["easy", "medium", "hard"],
  },
  tags:{
    type: [String],
    trim: true,
  },
  constraints:{
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  timeLimit:{
    type: Number,
    required: true
  },  
  memoryLimit:{
    type: Number,
    required: true,
  },
  exmaples:[exmapleSchema],
  codeTemplate:[codeTemplateSchema],
  solution:[solutionSchema],
  functionName:{
    type: String,
    required: true,
    trim: true,
  },
  returnType: {
      type: String,
      required: true,
      trim: true,
  },
parameters: [
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        }
    }
],
  hints:{
    type:String,
    trim: true,
  },
visibility: {
    type: String,
    enum: ["public", "contest"],
    default: "public",
    required: true,
},
  createBy:{
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: "User",
  },
  updateBy:{
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: "User",
  },
  createdAt: Date,
  updatedAt: Date,
});

export const Problem = mongoose.model("Problem", problemSchema);
