"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineUser, AiOutlineEdit, AiOutlineShop, AiOutlineMail, AiOutlinePhone, AiOutlineClose, AiOutlineCamera } from "react-icons/ai";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { setUserData } from "@/redux/userSlice";
import getCurrentUser from "@/hooks/getCurrentUser";

export default function ProfilePage() {
  const router = useRouter();
  getCurrentUser();
  const user = useSelector((state: RootState) => state.user.userData);
  const dispatch = useDispatch<AppDispatch>();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditShop, setShowEditShop] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const [shopName, setShopName] = useState(user?.shopName || "");
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || "");
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || "");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(
    user?.image || "/default-user.png"
  );

  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);

    if (profileImage) {
      formData.append("image", profileImage);
    }

    setLoading(true);
    try {
      const result = await axios.post("/api/user/edit-user-profile", formData);
      dispatch(setUserData(result.data));
      setShowEditProfile(false);
      setProfileImage(null);
      setLoading(false);
      alert("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Profile update failed ❌");
    }
  };

  const handleEditShopDetails = async () => {
    if (!shopName || !businessAddress || !gstNumber) {
      alert("All fields are required");
      return;
    }
    setShopLoading(true);
    try {
      await axios.post("/api/vendor/verify-again", {
        shopName,
        businessAddress,
        gstNumber,
      });

      alert("Verification request sent again ✅");
      setShopLoading(false);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to send verification ❌");
      setShopLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">My Profile</h1>
            <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
          </div>
          {user.role === 'user' && (
            <button
              onClick={() => router.push("/orders")}
              className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              My Orders
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT: PROFILE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
          >
            {/* Gradient Background Effect */}
            <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-blue-600/20 to-transparent"></div>

            <div className="relative mt-4 mb-4">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500">
                <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-gray-800">
                  {user?.image ? (
                    <Image src={previewImage} alt="profile" width={112} height={112} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AiOutlineUser size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black" title="Active"></div>
            </div>

            <h2 className="text-xl font-bold">{user.name}</h2>
            <span className="px-3 py-1 mt-2 bg-white/10 rounded-full text-xs uppercase tracking-wider font-semibold text-gray-300">
              {user.role}
            </span>

            <div className="w-full mt-6 space-y-3">
              <button
                onClick={() => { setShowEditProfile(true); setShowEditShop(false); }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <AiOutlineEdit /> Edit Profile
              </button>
              {user.role === 'vendor' && (
                <button
                  onClick={() => { setShowEditShop(true); setShowEditProfile(false); }}
                  className="w-full py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <AiOutlineShop /> Shop Details
                </button>
              )}
            </div>
          </motion.div>

          {/* RIGHT: DETAILS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AiOutlineUser className="text-blue-400" /> Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><AiOutlineMail size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400"><AiOutlinePhone size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="font-medium">{user.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Info (Vendor Only) */}
            {user.role === "vendor" && (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AiOutlineShop className="text-purple-400" /> Shop Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400">Shop Name</p>
                    <p className="font-medium">{user.shopName}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400">GST Number</p>
                    <p className="font-medium font-mono">{user.gstNumber}</p>
                  </div>
                  <div className="sm:col-span-2 p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400">Business Address</p>
                    <p className="font-medium">{user.businessAddress}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* EDIT MODALS */}
      <AnimatePresence>
        {(showEditProfile || showEditShop) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">

            {/* EDIT PROFILE MODAL */}
            {showEditProfile && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
              >
                <button onClick={() => setShowEditProfile(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition"><AiOutlineClose /></button>
                <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                    <Image src={previewImage} alt="Preview" width={96} height={96} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                      <AiOutlineCamera size={24} className="text-white" />
                      <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Click to change photo</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold mt-2 transition flex items-center justify-center"
                  >
                    {loading ? <ClipLoader size={20} color="white" /> : "Save Changes"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* EDIT SHOP MODAL */}
            {showEditShop && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
              >
                <button onClick={() => setShowEditShop(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition"><AiOutlineClose /></button>
                <h2 className="text-xl font-bold mb-2">Edit Shop Details</h2>
                <p className="text-yellow-500/80 text-xs mb-6 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  ⚠ Changing details will require re-verification (2-3 hours).
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Shop Name</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition" value={shopName} onChange={e => setShopName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Business Address</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">GST Number</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition" value={gstNumber} onChange={e => setGstNumber(e.target.value)} />
                  </div>
                  <button
                    onClick={handleEditShopDetails}
                    disabled={shopLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold mt-2 transition flex items-center justify-center"
                  >
                    {shopLoading ? <ClipLoader size={20} color="white" /> : "Submit for Verification"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
