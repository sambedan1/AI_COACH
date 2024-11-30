import mongoose from 'mongoose';
const database_connect=async ()=>{
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI || "").then(()=>{
      console.log("Connected to MongoDB");
    }).catch((err)=>{
      console.log(err);
    })
  
}
export default database_connect;