require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const ADMIN_EMAILS = [
  "ajjangid660@gmail.com",
  "pratikkhode1122@gmail.com",
  "mastervedant05@gmail.com",
  "ovpatil1121@gmail.com",
  "sumitvyadav47@gmail.com"
];

const ADMIN_PASSWORD = "774926"; // same as frontend

const run = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    for (const email of ADMIN_EMAILS) {
      const user = await User.findOne({ email });

      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      user.password = hashedPassword;
      user.role = "admin";
      user.isVerified = true;
      user.forceOtpOnNextLogin = false;
      user.lastOtpVerifiedAt = new Date();

      await user.save();
      console.log(`✅ Admin password set for: ${email}`);
    }

    console.log("🎉 ALL ADMINS UPDATED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

run();
