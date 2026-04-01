"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaStripe, FaShieldAlt, FaLock, FaTruck, FaCheckCircle, FaUser, FaPhone, FaMapMarkerAlt, FaCity, FaMailBulk, FaArrowLeft } from "react-icons/fa";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();

  const productId = useMemo(() => {
    if (!params?.productId) return null;
    return Array.isArray(params.productId)
      ? params.productId[0]
      : params.productId;
  }, [params]);

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [paymentMode, setPaymentMode] =
    useState<"cod" | "stripe">("cod");

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        // 1. Check Cart First
        const res = await axios.get("/api/cart/get");
        const found = res.data.cart?.find(
          (i: any) => i.product._id === productId
        );

        if (found) {
          setItem(found);
          if (!found.product.payOnDelivery) {
            setPaymentMode("stripe");
          }
          return;
        }

        // 2. If not in cart, fetch product details directly (Direct Buy)
        const prodRes = await axios.get("/api/product/all-products-data");
        const product = prodRes.data?.find((p: any) => p._id === productId);

        if (product) {
          setItem({ product, quantity: 1 });
          if (!product.payOnDelivery) {
            setPaymentMode("stripe");
          }
        } else {
          console.error("Product not found");
          router.replace("/");
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, router]);

  if (!productId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0118] via-black to-[#020617]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!item) return null;

  const productsTotal = item.product.price * item.quantity;
  const deliveryCharge = item.product.freeDelivery ? 0 : 50;
  const serviceCharge = 30;
  const finalTotal =
    productsTotal + deliveryCharge + serviceCharge;

  const codDisabled = !item.product.payOnDelivery;

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address || !city || !pincode) {
      alert("Please fill all address fields");
      return;
    }

    setIsProcessing(true);

    const payload = {
      productId,
      quantity: item.quantity,
      address: { name, phone, address, city, pincode },
      amount: finalTotal,
      deliveryCharge,
      serviceCharge,
    };

    try {
      if (paymentMode === "cod") {
        await axios.post("/api/order/create-cod", payload);
        router.replace("/orders");
      } else {
        const res = await axios.post(
          "/api/order/online-pay",
          payload
        );
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Checkout failed");
      setIsProcessing(false);
    }
  };

  // Estimated delivery date (3-5 days from now)
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 4);
  const formattedDate = estimatedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-black to-[#020617] py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Shopping</span>
        </motion.button>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto overflow-x-auto">
            {[
              { label: "Cart", icon: FaCheckCircle, active: true },
              { label: "Checkout", icon: FaCheckCircle, active: true },
              { label: "Payment", icon: FaLock, active: true },
              { label: "Complete", icon: FaTruck, active: false },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${step.active
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50"
                      : "bg-white/5 border border-white/20"
                      }`}
                  >
                    <step.icon className={`${step.active ? "text-white" : "text-gray-500"} text-xs sm:text-sm md:text-base`} />
                  </motion.div>
                  <span className={`text-[10px] sm:text-xs hidden xs:block ${step.active ? "text-white font-semibold" : "text-gray-500"}`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`w-6 sm:w-10 md:w-16 lg:w-24 h-0.5 mx-1 sm:mx-2 mb-4 sm:mb-5 md:mb-6 ${step.active ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-white/10"
                    }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SECTION - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-400" />
                Delivery Address
              </h2>

              <div className="space-y-5 relative z-10">
                {/* Name */}
                <div className="group">
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10
                        text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        hover:border-white/30 transition-all duration-300"
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10
                        text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        hover:border-white/30 transition-all duration-300"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="group">
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <textarea
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10
                        text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        hover:border-white/30 transition-all duration-300 resize-none"
                      rows={3}
                      placeholder="Complete Address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <div className="relative">
                      <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10
                          text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          hover:border-white/30 transition-all duration-300"
                        placeholder="City"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="group">
                    <div className="relative">
                      <FaMailBulk className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10
                          text-white placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          hover:border-white/30 transition-all duration-300"
                        placeholder="Pincode"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaLock className="text-purple-400" />
                Payment Method
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6 relative z-10">
                {/* Cash on Delivery */}
                <motion.button
                  whileHover={{ scale: codDisabled ? 1 : 1.02 }}
                  whileTap={{ scale: codDisabled ? 1 : 0.98 }}
                  disabled={codDisabled}
                  onClick={() => setPaymentMode("cod")}
                  className={`relative p-6 rounded-2xl font-semibold transition-all duration-300 border-2 ${paymentMode === "cod"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400 shadow-lg shadow-blue-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/30"
                    } ${codDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <FaTruck className="text-3xl" />
                    <span className="text-white">Cash on Delivery</span>
                  </div>
                  {paymentMode === "cod" && (
                    <motion.div
                      layoutId="payment-indicator"
                      className="absolute top-3 right-3"
                    >
                      <FaCheckCircle className="text-white" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Stripe Payment */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMode("stripe")}
                  className={`relative p-6 rounded-2xl font-semibold transition-all duration-300 border-2 ${paymentMode === "stripe"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400 shadow-lg shadow-blue-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <FaStripe className="text-3xl" />
                    <span className="text-white">Card Payment</span>
                  </div>
                  {paymentMode === "stripe" && (
                    <motion.div
                      layoutId="payment-indicator"
                      className="absolute top-3 right-3"
                    >
                      <FaCheckCircle className="text-white" />
                    </motion.div>
                  )}
                </motion.button>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400 relative z-10">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-400" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaLock className="text-blue-400" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SECTION - Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden lg:sticky lg:top-8"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />

              <h2 className="text-2xl font-bold text-white mb-6 relative z-10">
                Order Summary
              </h2>

              {/* Product Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white/10 p-2 flex-shrink-0">
                    <img
                      src={item.product.image1}
                      alt={item.product.title}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-1 line-clamp-2">
                      {item.product.title}
                    </p>
                    <p className="text-sm text-gray-400 mb-2">
                      Quantity: {item.quantity}
                    </p>
                    <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      ₹ {productsTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Estimate */}
              <div className="relative z-10 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaTruck className="text-green-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-300">Estimated Delivery</p>
                    <p className="font-semibold text-white">{formattedDate}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="relative z-10 space-y-3 text-gray-300 mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹ {productsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className={`font-semibold ${deliveryCharge === 0 ? "text-green-400" : ""}`}>
                    {deliveryCharge === 0 ? "FREE" : `₹ ${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span className="font-semibold">₹ {serviceCharge}</span>
                </div>
              </div>

              {/* Total */}
              <div className="relative z-10 flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  ₹ {finalTotal.toLocaleString()}
                </span>
              </div>

              {/* Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="relative z-10 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                  hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500
                  py-4 rounded-2xl font-bold text-lg transition-all duration-300
                  shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-3"
              >
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex text-white items-center gap-3"
                    >
                      <FaLock />
                      <span>
                        {paymentMode === "cod"
                          ? "Place Order"
                          : "Proceed to Payment"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Trust Indicators */}
              <div className="relative z-10 mt-6 text-center text-xs text-gray-400">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
