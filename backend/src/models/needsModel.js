const mongoose = require("mongoose");

const needsSchema = new mongoose.Schema(
  {
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The NGO requesting the need

    needType: {
      type: String,
      enum: ["money", "material", "service"],
      required: true,
    }, // Type of need

    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    }, // Urgency level

    description: {
      type: String,
      required: true,
      trim: true,
    }, // Description of the need
   // Number of volunteers needed (for service needs)
   
    status: {
      type: String,
      enum: ["Open", "Fulfilled", "Expired", ],
      default: "Open",
    }, // Current status

    beneficiaryInfo: {
   amount:{type:Number,required:true},
   picture:{type:[String]},
location:{latitude:{type:Number,required:true},longitude:{type:Number,required:true}}
    }, // Number of people benefiting from this need
    donors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
       
      },
    ],
   
    //add end date 
    endDate: { type: Date, required: true },
    
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
  {timestamps:true}
);

module.exports = mongoose.model("Needs", needsSchema);
//allow the updation to description
const matterialNeedSchema=new mongoose.Schema(
  {
    need:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:'Needs'
    },
    category:{type:String,required:true},
    subCategory:[{
    name:{
      type:String,
      required:true,
    },
    amount:{
      type:Number,
      required:true,
      min:1
    }
    }],
    amountDonated:[
      {
        name:{type:String,required:true},
        amount:{type:Number,required:true,min:1}
      }
    ]
  },
  {
    timestamps:true
  }
)
module.exports=mongoose.model('MatterialNeed',matterialNeedSchema)
const serviceNeed = new mongoose.Schema({
  need: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Needs",
  },
  category: { type: String, required: true },
  subCategory: [
    {
      name: {
        type: String,
        required: true,
      },
      vacancy: {
        type: Number,
        required: true,
        min: 1,
      },
      application:[{
applicants:{type:mongoose.Schema.Types.ObjectId,ref:"Application"}
      }],
      acceptedApplication:[
        {
          volunter:{type:mongoose.Schema.Types.ObjectId,ref:"Application"
        }}
      ]
    },
  ],
});
module.exports=mongoose.model('Service',serviceNeed)
const moneyNeed=mongoose.Schema(
  {
    
  }
)
