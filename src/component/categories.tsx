"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaTshirt,
  FaMobileAlt,
  FaCouch,
  FaPumpSoap,
  FaBaby,
  FaCar,
  FaBasketballBall,
  FaBook,
  FaGift
} from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const categories = [
  { label: "Fashion & Lifestyle", icon: <FaTshirt /> },
  { label: "Electronics & Gadgets", icon: <FaMobileAlt /> },
  { label: "Home & Living", icon: <FaCouch /> },
  { label: "Beauty", icon: <FaPumpSoap /> },
  { label: "Kids & Baby", icon: <FaBaby /> },
  { label: "Food & Grocery", icon: <MdFastfood /> },
  { label: "Sports", icon: <FaBasketballBall /> },
  { label: "Automotive", icon: <FaCar /> },
  { label: "Gifting", icon: <FaGift /> },
  { label: "Books", icon: <FaBook /> },
];

export default function CategoriesSlider() {
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();
  const itemsPerPage = 5;

  const nextSlide = () => {
    setStartIndex((prev) => (prev + itemsPerPage) % categories.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) =>
      prev - itemsPerPage < 0 ? categories.length - itemsPerPage : prev - itemsPerPage
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#050505] py-12 px-4 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Shop by Category</h2>
            <p className="text-gray-400">Explore our wide range of premium collections</p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button onClick={prevSlide} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-blue-600 hover:border-blue-500 transition-all">
              <IoIosArrowBack size={20} />
            </button>
            <button onClick={nextSlide} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-blue-600 hover:border-blue-500 transition-all">
              <IoIosArrowForward size={20} />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              {categories.slice(startIndex, startIndex + itemsPerPage).map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-[#111] border border-white/10 hover:border-blue-500/50 p-6 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-blue-900/20"
                  onClick={() =>
                    router.push(
                      `/category?category=${encodeURIComponent(item.label)}`
                    )
                  }
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300"></div>

                  <div className="text-4xl text-gray-400 group-hover:text-blue-400 transition-colors z-10">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors z-10">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
