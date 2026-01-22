"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail, AiOutlineLock, AiOutlineUser } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { signIn } from "next-auth/react";
import { FaUser, FaStore } from "react-icons/fa";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"user" | "vendor" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      console.log(result.data);
      setLoading(false);
      setName("");
      setEmail("");
      setPassword("");
      router.push("/login");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0a0a0a] via-[#0f0f23] to-[#1a0a1f] text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* LEFT SECTION - BRANDING */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-center items-center w-1/2 relative z-10 p-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-8xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
            Mega Mart
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 mx-auto rounded-full mt-8" />
        </motion.div>
      </motion.div>

      {/* RIGHT SECTION - SIGNUP FLOW */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {/* STEP 1 — Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                  {/* Mobile Logo */}
                  <div className="lg:hidden text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      Mega Mart
                    </h1>
                  </div>

                  <div className="space-y-8">
                    <div className="text-center">
                      <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                      >
                        Get Started
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-gray-400"
                      >
                        How would you like to join us?
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      {[
                        { label: "User", icon: <FaUser className="w-8 h-8" />, value: "user", desc: "Browse & Buy" },
                        { label: "Vendor", icon: <FaStore className="w-8 h-8" />, value: "vendor", desc: "Sell Products" },
                      ].map((item) => (
                        <motion.button
                          key={item.value}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setRole(item.value as "user" | "vendor")}
                          className={`p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col items-center text-center gap-3 ${role === item.value
                              ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-500 shadow-lg shadow-purple-500/30"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                            }`}
                        >
                          <div className={`${role === item.value ? "text-white" : "text-purple-400"}`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{item.label}</div>
                            <div className={`text-xs ${role === item.value ? "text-purple-100" : "text-gray-500"}`}>
                              {item.desc}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      whileHover={{ scale: 1.02, boxShadow: role ? "0 0 30px rgba(168, 85, 247, 0.5)" : undefined }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!role) {
                          alert("Please select a role to continue");
                          return;
                        }
                        setStep(2);
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${role
                          ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg hover:shadow-purple-500/50"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                        }`}
                      disabled={!role}
                    >
                      Continue →
                    </motion.button>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      className="text-center text-sm text-gray-400 pt-4"
                    >
                      Already have an account?{" "}
                      <span
                        onClick={() => router.push("/login")}
                        className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer hover:underline transition"
                      >
                        Log in
                      </span>
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Registration Form */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                  {/* Mobile Logo */}
                  <div className="lg:hidden text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      Mega Mart
                    </h1>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => setStep(1)}
                        className="text-gray-400 hover:text-white transition flex items-center gap-1"
                      >
                        ← Back
                      </motion.button>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Create Account
                      </h2>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                      {/* Name Input */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="relative group"
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors">
                          <AiOutlineUser size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                        />
                      </motion.div>

                      {/* Email Input */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="relative group"
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors">
                          <AiOutlineMail size={20} />
                        </div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                        />
                      </motion.div>

                      {/* Password Input */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="relative group"
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors">
                          <AiOutlineLock size={20} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <AiOutlineEyeInvisible size={22} />
                          ) : (
                            <AiOutlineEye size={22} />
                          )}
                        </button>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? <ClipLoader size={24} color="white" /> : "Complete Registration"}
                        </span>
                      </motion.button>
                    </form>

                    {/* Divider */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="relative my-6"
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-transparent px-4 text-gray-500">Or join with</span>
                      </div>
                    </motion.div>

                    {/* Google Login */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 rounded-xl transition-all duration-300 group hover:border-white/20"
                    >
                      <FcGoogle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
                        Continue with Google
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
