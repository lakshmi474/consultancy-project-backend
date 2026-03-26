import mongoose from 'mongoose';
const uri = "mongodb+srv://lakshmiil:Laksh@cluster0.wxzoza5.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting...");
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB!");
    
    console.log("Attempting to list collections...");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
}
run();
