const axios = require("axios");

const sendMsg91Otp = async (mobile, otp) => {
  try {
    await axios.post(
      "https://api.msg91.com/api/v5/otp",
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${mobile}`,
        otp
      },
      {
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTH_KEY
        }
      }
    );

    console.log("📱 MSG91 OTP sent to:", mobile);
  } catch (error) {
    console.error("❌ MSG91 ERROR:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendMsg91Otp };
