// lib/razorpay.ts
export const openRazorpayCheckout = ({
  amount,
  name,
  description,
  onSuccess,
}: {
  amount: number; // Amount in INR
  name: string;
  description: string;
  onSuccess: (paymentId: string) => void;
}) => {
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_hackathon_key", 
    amount: amount * 100, // Razorpay expects currency in paise (₹1 = 100 paise)
    currency: "INR",
    name: "venueX B2B Marketplace",
    description: description,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad",
    handler: function (response: any) {
      onSuccess(response.razorpay_payment_id || "rzp_test_" + Math.random().toString(36).substring(7));
    },
    prefill: {
      name: name,
      email: "billing@venuex.b2b",
      contact: "9876543210",
    },
    theme: {
      color: "#2563eb", // Matches Tailwind blue-600 theme
    },
  };

  // @ts-ignore
  if (typeof window !== "undefined" && window.Razorpay) {
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    alert("Razorpay SDK failed to load. Please check your internet connection.");
  }
};