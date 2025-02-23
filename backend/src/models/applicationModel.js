const { default: mongoose } = require("mongoose");

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Volunteer applying
  service:{type:mongoose.Schema.Types.ObjectId,required:true},
  skills:[{type:String,ref:'Service',required:true} ],
  yearsOfExperience:{type:Number,required:true},

 // Timestamp
},{timestamps:true});

module.exports = mongoose.model("Application", applicationSchema);
