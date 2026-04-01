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
  FaBolt,
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
  { label: "Beauty & Personal Care", display: "Beauty" },
  { label: "Toys, Kids & Baby", display: "Kids" },
  { label: "Food & Grocery", display: "Food & Grocery" },
  { label: "Sports & Fitness", display: "Sports" },
  { label: "Automotive Accessories", display: "Auto" },
  { label: "Gifting & Handcrafts", display: "Gifts" },
  { label: "Books & Stationery", display: "Books" },
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

  // AI Search Modal States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const q = params.get("search");
    if (cat) setSelectedCategory(cat);
    if (q) setSearch(q);
    setIsReady(true);
  }, [router]); // Re-run when router/URL changes

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

  // AI Search Handler
  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResults(null);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });

      const data = await res.json();

      if (res.ok) {
        setAiResults(data);
      } else {
        alert(data.error || "AI Search failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to perform AI search");
    } finally {
      setAiLoading(false);
    }
  };

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
            {/* AI Search Button - Redesigned to match image */}
            <button
              onClick={() => setShowAIModal(true)}
              className="group relative flex items-center gap-2 bg-[#0a0a0a] border border-purple-500/30 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FaMagic className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="relative z-10 tracking-tight">AI Search</span>
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

      {/* AI Search Modal - Premium Redesign */}
      <AnimatePresence>
        {showAIModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl md:h-[85vh] bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[70] overflow-hidden flex flex-col"
            >
              {/* Decorative background glow */}
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

              {/* Header */}
              <div className="relative border-b border-white/5 p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-[1px]">
                    <div className="w-full h-full rounded-2xl bg-[#0a0a0a] flex items-center justify-center">
                      <FaMagic className="text-purple-400 text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                      MegaMart AI Search
                    </h2>
                    <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                      Powered by Advanced Intelligence
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90 group"
                >
                  <MdClear className="text-gray-400 text-2xl group-hover:text-white" />
                </button>
              </div>

              {/* Main Search Area */}
              <div className="relative p-8 pb-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
                  <div className="relative flex gap-3">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                        placeholder='Ask AI: "Find me some stylish party wear within 5000"'
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-black border border-white/10 focus:outline-none focus:border-purple-500/50 text-lg text-white placeholder-gray-600 transition-all font-light"
                      />
                    </div>
                    <button
                      onClick={handleAISearch}
                      disabled={aiLoading || !aiQuery.trim()}
                      className="px-10 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                    >
                      {aiLoading ? "Thinking..." : "Search"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Latest Tech', 'Winter Fashion', 'Premium Decor', 'Gifts under 2000'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setAiQuery(tag); }}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-purple-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
                {aiLoading && (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-medium text-white mb-2">Analyzing your request</h4>
                      <p className="text-gray-500 max-w-xs animate-pulse">Our AI is scanning through the collection to find the perfect matches...</p>
                    </div>
                  </div>
                )}

                {aiResults && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* AI Insight Section */}
                    <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-purple-900/10 to-transparent border border-purple-500/10 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="text-[10px] font-bold text-purple-500/50 uppercase tracking-[0.2em]">AI Response</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
                          <FaMagic className="text-purple-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-purple-100">{aiResults.intent}</p>
                          {aiResults.explanation && (
                            <p className="text-sm text-gray-400 leading-relaxed font-light italic">"{aiResults.explanation}"</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Results Grid */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                          Curated Selection ({aiResults.products?.length || 0})
                        </h3>
                      </div>

                      {aiResults.products && aiResults.products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                          {aiResults.products.map((product: any) => (
                            <div key={product._id} className="animate-in fade-in zoom-in-95 duration-500">
                              <UserProductCard product={product} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaSearch className="text-gray-600 text-3xl" />
                          </div>
                          <h4 className="text-xl font-medium text-white mb-2">No matching products</h4>
                          <p className="text-gray-500">Try adjusting your description or searching for something else.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!aiLoading && !aiResults && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="grid grid-cols-2 gap-4 max-w-2xl">
                      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all cursor-default text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                          <FaMagic size={20} />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-3">Natural Language</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Search like you're talking to a personal shopper. Just describe what's on your mind.</p>
                      </div>
                      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all cursor-default text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                          <FaBolt size={20} />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-3">Instant Insights</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Get curated results and explanations why they match your specific lifestyle and needs.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
