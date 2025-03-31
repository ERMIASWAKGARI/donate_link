const Chapa = require("chapa").default || require("chapa");
const axios=require('axios')
const chapa = new Chapa(process.env.CHAPA_SECRET_KEY);

exports.initializePayment = async (data) => {
  try {
    const response = await chapa.initialize({
      amount: data.amount,
      currency: data.currency,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      tx_ref: data.tx_ref,
      callback_url: data.callback_url,
      customization: {
        title: "Donation Payment",
        description: "Supporting NGO initiatives",
      },
      meta: data.meta,
    });

    return response;
  } catch (error) {
    console.error("Chapa Payment Error:", error);
    throw error; // Ensure the calling function handles errors
  }
};

exports.verifyPayment = async (tx_ref) => {
  return await chapa.verify(tx_ref);
};

exports.transferToBank = async (data) => {
  try {
   
    if (!data.account_number || !data.bank_code || !data.amount || !data.beneficiary_name) {
      throw new Error("Missing required fields for bank transfer.");
    }
    const response = await axios.post(
      "https://api.chapa.co/v1/transfers",
      {
        account_name: "Israel Goytom",
        account_number: "32423423",
        amount: data.amount,
        bank_code: 656,
        currency: "ETB",
        reference: data.reference,
        
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Transfer Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Bank transfer failed");
  }
};

exports.validateBankAccount = async (account_number, bank_code) => {
  return await chapa.validateBankAccount({
    account_number,
    bank_code,
  });
};
