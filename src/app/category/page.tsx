"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import UserProductCard from "@/component/userProductCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilter,
  FaSortAmountDown,
  FaSearch,
  FaStar,
  FaTshirt,
  FaMobileAlt,
  FaCouch,
  FaPumpSoap,
  FaBaby,
  FaCar,
  FaBasketballBall,
  FaBook,
  FaGift,
  FaMagic,
  FaChevronDown
} from "react-icons/fa";
import { MdFastfood, MdClear } from "react-icons/md";

// Icon mapping
const categoryIcons: { [key: string]: any } = {
  "Fashion & Lifestyle": <FaTshirt />,
  "Electronics & Gadgets": <FaMobileAlt />,
  "Home & Living": <FaCouch />,
  "Beauty": <FaPumpSoap />,
  "Kids & Baby": <FaBaby />,
  "Food & Grocery": <MdFastfood />,
  "Sports": <FaBasketballBall />,
  "Automotive": <FaCar />,
  "Gifting": <FaGift />,
  "Books": <FaBook />,
  "all": "🗂️"
};

const categoryList = [
  { label: "all", display: "All" },
  { label: "Fashion & Lifestyle", display: "Fashion & Lifestyle" },
  { label: "Electronics & Gadgets", display: "Electronics & Gadgets" },
  { label: "Home & Living", display: "Home" },
  { label: "Beauty", display: "Beauty" },
  { label: "Kids & Baby", display: "Kids" },
  { label: "Food & Grocery", display: "Food & Grocery" },
  { label: "Sports", display: "Sports" },
  { label: "Automotive", display: "Auto" },
  { label: "Gifting", display: "Gifts" },
  { label: "Books", display: "Books" },
];

export default function CategoriesPage() {
  const { allVendorData } = useSelector((state: RootState) => state.vendor);
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedShop, setSelectedShop] = useState("all");
  const [search, setSearch] = useState("");

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minPriceInput, setMinPriceInput] = useState<number | "">("");
  const [maxPriceInput, setMaxPriceInput] = useState<number | "">("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  // UI States
  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const [showRatingMenu, setShowRatingMenu] = useState(false);

  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
    setIsReady(true);
  }, []);

  // Handle category change - updates both state and URL
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(window.location.search);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const newUrl = params.toString() ? `/category?${params.toString()}` : "/category";
    router.push(newUrl, { scroll: false });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Search is client side mostly now based on UI request to move it,
      // but let's keep fetching logic if categorical
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setApiProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    fetchProducts();
  }, [selectedCategory, isReady]);

  // Filtering
  useEffect(() => {
    let result = [...apiProducts];

    // Search
    if (search) {
      result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }

    // Shop
    if (selectedShop !== "all") {
      result = result.filter((p: any) => String(p.vendor?._id) === String(selectedShop));
    }

    // Price
    if (minPriceInput !== "") {
      result = result.filter(p => p.price >= Number(minPriceInput));
    }
    if (maxPriceInput !== "") {
      result = result.filter(p => p.price <= Number(maxPriceInput));
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p: any) => {
        const totalReviews = p.reviews?.length || 0;
        const avgRating = totalReviews > 0
          ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews
          : 0;
        return avgRating >= minRating;
      });
    }

    // Sort
    if (sortBy === "price_low") {
      result.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "price_high") {
      result.sort((a: any, b: any) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a: any, b: any) => (b.createdAt || b._id > a._id ? 1 : -1));
    }

    setDisplayProducts(result);
  }, [apiProducts, search, selectedShop, minPriceInput, maxPriceInput, minRating, sortBy]);

  const activeFiltersCount = (minPriceInput !== "" ? 1 : 0) + (maxPriceInput !== "" ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* 1️⃣ TOP CONTROLS: Categories & Search */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#111] border border-white/5 p-3 rounded-2xl top-20 z-40 shadow-xl backdrop-blur-md bg-opacity-90">

          {/* Categories (Horizontal) */}
          <div className="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
            <div className="flex gap-2">
              {categoryList.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryChange(cat.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.label
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <span className="">{categoryIcons[cat.label]}</span>
                  <span>{cat.display}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Area */}
          <div className="w-full lg:w-auto flex gap-2">
            <div className="relative flex-1 lg:w-80">
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black border border-white/10 focus:outline-none focus:border-blue-500 text-sm text-white placeholder-gray-500"
              />
            </div>
            {/* AI Search Button */}
            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-900/30 transition-all hover:scale-105 active:scale-95">
              <FaMagic />
              <span>AI Search</span>
            </button>
          </div>
        </div>

        {/* 2️⃣ FILTERS ROW */}
        <div className="flex flex-wrap gap-2 items-center justify-between">

          {/* Left: Filters */}
          <div className="flex gap-2">

            {/* Price Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPriceMenu(!showPriceMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all ${minPriceInput !== "" || maxPriceInput !== "" ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#111] border-white/10 text-gray-300 hover:bg-white/5'}`}
              >
                Price <FaChevronDown size={10} />
              </button>
              {showPriceMenu && (
                <div className="absolute top-12 left-0 w-64 bg-[#111] border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number" placeholder="Min"
                      value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value ? Number(e.target.value) : "")}
                      className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <span>-</span>
                    <input
                      type="number" placeholder="Max"
                      value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value ? Number(e.target.value) : "")}
                      className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <button onClick={() => setShowPriceMenu(false)} className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500 mt-2">Apply</button>
                </div>
              )}
              {showPriceMenu && <div className="fixed inset-0 z-40" onClick={() => setShowPriceMenu(false)}></div>}
            </div>

            {/* Rating Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRatingMenu(!showRatingMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all ${minRating > 0 ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#111] border-white/10 text-gray-300 hover:bg-white/5'}`}
              >
                Rating {minRating > 0 && `(${minRating}+)`} <FaChevronDown size={10} />
              </button>
              {showRatingMenu && (
                <div className="absolute top-12 left-0 w-48 bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
                  {[4, 3, 2, 1].map(r => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(r); setShowRatingMenu(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300"
                    >
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => i < r ? <FaStar key={i} /> : <FaStar key={i} className="text-gray-700" />)}
                      </div>
                      <span>& Up</span>
                    </button>
                  ))}
                  <button onClick={() => { setMinRating(0); setShowRatingMenu(false); }} className="w-full text-center text-xs text-gray-500 py-2 hover:text-white">Clear</button>
                </div>
              )}
              {showRatingMenu && <div className="fixed inset-0 z-40" onClick={() => setShowRatingMenu(false)}></div>}
            </div>
          </div>

          {/* Right: Sort & Count */}
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden sm:block">{displayProducts.length} Products</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#111] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 3️⃣ PRODUCT GRID */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading premium collection...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center text-gray-500">
            <FaSearch size={40} className="mb-4 opacity-50" />
            <p>No products found fitting your criteria.</p>
            <button onClick={() => { setSearch(""); setMinPriceInput(""); setMaxPriceInput(""); setMinRating(0); setSelectedCategory("all"); }} className="mt-4 text-blue-500 font-semibold hover:underline">Clear Filters</button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 pb-20">
            <AnimatePresence>
              {displayProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <UserProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
}
