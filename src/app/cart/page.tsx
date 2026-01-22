"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchCartCount } from "@/redux/cartSlice";
import { FaTrash, FaMinus, FaPlus, FaArrowRight, FaShoppingBag, FaOpencart } from "react-icons/fa";

export default function UserCartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const getCart = async () => {
    try {
      const res = await axios.get("/api/cart/get");
      setCart(res.data.cart || []);
      // Sync redux count as well
      dispatch(fetchCartCount());
    } catch (error) {
      console.log("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const handleRemoveFromCart = async (productId: string) => {
    // Optimistic Update
    const oldCart = [...cart];
    setCart((prev) => prev.filter((i) => i.product._id !== productId));

    try {
      await axios.post("/api/cart/remove", { productId });
      dispatch(fetchCartCount());
    } catch (error) {
      console.error(error);
      setCart(oldCart); // Revert on error
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    // Optimistic UI update for smoothness
    setCart(prev => prev.map(item =>
      item.product._id === productId ? { ...item, quantity } : item
    ));

    try {
      await axios.post("/api/cart/update", {
        productId,
        quantity,
      });
      // Background sync to ensure data integrity
      const res = await axios.get("/api/cart/get");
      setCart(res.data.cart || []);
    } catch (error) {
      console.error(error)
      getCart(); // Revert/Refresh on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-500"
        >
          <FaOpencart size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-gray-400 max-w-md">
          Looks like you haven't added anything to your cart yet. Go ahead and explore our latest products.
        </p>
        <button
          onClick={() => router.push('/category')}
          className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition transform hover:scale-105"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-end justify-between border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-gray-400 mt-1">{cart.length} items in your cart</p>
          </div>
        </header>

        <div className="grid gap-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center shadow-lg hover:bg-white/10 transition duration-300"
              >
                {/* Image */}
                <div
                  className="relative w-full md:w-32 h-32 flex-shrink-0 bg-white rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/view-product/${item.product._id}`)}
                >
                  <Image
                    src={item.product.image1}
                    alt={item.product.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 w-full text-center md:text-left space-y-2">
                  <h3
                    className="text-xl font-semibold cursor-pointer hover:text-blue-400 transition"
                    onClick={() => router.push(`/view-product/${item.product._id}`)}
                  >
                    {item.product.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.product.category}</p>
                  <p className="text-lg font-bold text-green-400">₹ {item.product.price}</p>
                </div>

                {/* Actions & Quantity */}
                <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">

                  {/* Quantity Control */}
                  <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                    <button
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/20 transition disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/20 transition"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="font-bold">₹ {item.product.price * item.quantity}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleRemoveFromCart(item.product._id)}
                      className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition text-sm"
                    >
                      <FaTrash size={14} /> Remove
                    </button>

                    <button
                      onClick={() => router.push(`/checkout/${item.product._id}`)}
                      className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      Checked Out <FaArrowRight size={14} />
                    </button>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
