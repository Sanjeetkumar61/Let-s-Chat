import mongoose from "mongoose"

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

  } catch (error) {
    console.log("MongoDB Connection Error:", error.message);

  }
}

export default connectDb;