const axios = require("axios");

const sendFast2SmsOtp = async (mobile, otp) => {
  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        variables_values: otp,
        numbers: mobile
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY
        }
      }
    );

    console.log("📱 Fast2SMS OTP sent to:", mobile);
  } catch (error) {
    console.error("❌ Fast2SMS ERROR:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendFast2SmsOtp };
