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
        required: true,
        trim: true,
    }
})
const codeTemplateSchema = new mongoose.Schema({
    language:{
        type: String,
        required: true,
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
    required: true,
    trim: true,
  },
  constraints:{
    type: String,
    required: true,
    trim: true,
  },
  timeLimit:{
    type: Number,
    required: true,
    trim: true,
  },
  memoryLimit:{
    type: Number,
    required: true,
    trim: true,
  },
  exmaples:[exmapleSchema],
  codeTemplate:[codeTemplateSchema],
  solution:[solutionSchema],
  functionName:{
    type: String,
    required: true,
    trim: true,
  },
  parameterTypes:{
      types: [String],
      required: true,
      trim: true,
  },
  hints:{
    type:[String],
    required: true,
    trim: true,
  },
  createBy:{
    type: String,
    required: true,
    trim: true,
  },
  updateBy:{
    type: String,
    required: true,
    trim: true,
  },
  createdAt: Date,
  updatedAt: Date,
});

export default mongoose.model("Problem", problemSchema);