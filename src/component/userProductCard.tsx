"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaShoppingCart,
  FaBolt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IProduct } from "@/models/product.model";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchCartCount } from "@/redux/cartSlice";

export default function UserProductCard({ product }: { product: IProduct }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const images = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
  ].filter(Boolean);

  const [current, setCurrent] = useState(0);

  const openProduct = () => {
    router.push(`/view-product/${product._id}`);
  };

  const next = () =>
    setCurrent((prev) => (prev + 1) % images.length);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await axios.post("/api/cart/add", {
        productId: product._id,
        quantity: 1,
      });
      toast.success(res.data.message || "Added to cart successfully!");
      dispatch(fetchCartCount());
    } catch (err: any) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Add to cart failed ❌"
      );
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/checkout/${product._id}`);
  };
  const reviews = product.reviews ?? [];
  const totalReviews = reviews.length;

  const avgRating =
    totalReviews > 0
      ? (
        reviews.reduce(
          (sum: number, r: { rating: number }) => sum + r.rating,
          0
        ) / totalReviews
      ).toFixed(1)
      : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.03 }}
      className="bg-[#111] rounded-2xl shadow-lg hover:shadow-blue-900/20 overflow-hidden border border-white/10 cursor-pointer group"
      onClick={openProduct}
    >
      {/* ================= ✅ FIXED IMAGE BOX ================= */}
      <div className="relative w-full h-[220px] bg-[#0a0a0a] overflow-hidden flex items-center justify-center border-b border-white/5 group-hover:border-blue-500/30 transition-colors">

        {/* ✅ IMAGE FIXED */}
        <div className="relative w-[90%] h-[90%]">
          <Image
            src={images[current]}
            alt={product.title}
            loading="lazy"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>

        {/* ✅ LEFT BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 p-2 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        >
          <FaChevronLeft size={14} />
        </button>

        {/* ✅ RIGHT BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 p-2 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        >
          <FaChevronRight size={14} />
        </button>

        {/* ✅ DOTS */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${current === i ? "bg-white w-3" : "bg-white/40"
                }`}
            />
          ))}
        </div>
      </div>

      {/* ================= PRODUCT INFO ================= */}
      <div className="p-4 space-y-2.5">
        <div>
          <h3 className="font-semibold text-sm text-gray-200 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {product.category}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <p className="font-bold text-base sm:text-lg text-white">
            ₹{product.price}
          </p>
          {/* ⭐ REVIEWS */}
          <div className="flex items-center gap-1 text-yellow-500 text-xs bg-white/5 px-2 py-1 rounded-full border border-white/5 w-fit">
            <FaStar size={10} />
            <span className="text-gray-300 font-medium">{avgRating}</span>
            <span className="text-gray-600">({totalReviews})</span>
          </div>
        </div>


        {/* 🏪 VENDOR */}

        {/* ✅ BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg flex items-center 
                       justify-center gap-1 sm:gap-1.5 transition text-[10px] sm:text-xs font-medium border border-white/10"
          >
            <FaShoppingCart size={11} className="sm:w-3 sm:h-3" />
            <span>Add</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyNow}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 rounded-lg flex items-center 
                       justify-center gap-1 sm:gap-1.5 transition text-[10px] sm:text-xs font-bold shadow-lg shadow-blue-900/40"
          >
            <FaBolt size={11} className="sm:w-3 sm:h-3" />
            <span>Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
