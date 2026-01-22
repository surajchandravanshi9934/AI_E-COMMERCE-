"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { FaStar, FaRegStar, FaOpencart, FaMoneyBillWave, FaTruck, FaShieldAlt, FaUndo } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { AiOutlineUser, AiOutlineCamera } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import UserProductCard from "@/component/userProductCard";
import { IProduct } from "@/models/product.model";
import getAllProductsData from "@/hooks/getAllProductsData";
import { fetchCartCount } from "@/redux/cartSlice";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

export default function ProductViewPage() {
  const params = useParams();
  const id = params.id;
  getAllProductsData();
  const router = useRouter();
  const dispatch = useDispatch<any>();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addToCartLoading, setAddToCartLoading] = useState(false);

  const { allProductsData } = useSelector((state: RootState) => state.vendor);
  const [activeImage, setActiveImage] = useState(0);

  // ✅ DIRECT FIND
  const product: IProduct | undefined = allProductsData?.find(
    (p: IProduct) => String(p._id) === String(id)
  );

  // ✅ Loading State
  if (!allProductsData || allProductsData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader color="#3b82f6" size={50} />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // ✅ Not Found State
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <h1 className="text-3xl font-bold text-red-500">Product Not Found</h1>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
          Go Home
        </button>
      </div>
    );
  }

  const images = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
  ].filter(Boolean);

  const totalReviews = product.reviews?.length ?? 0;
  const avgRating = totalReviews > 0
    ? (product.reviews!.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0";

  const relatedProducts = allProductsData?.filter(
    (p) => p?.category === product?.category && p?._id !== product?._id
  ) || [];

  const handleAddToCart = async () => {
    if (!product?._id) return;
    setAddToCartLoading(true);
    try {
      await axios.post("/api/cart/add", {
        productId: product._id,
        quantity: 1,
      });
      // Update cart count immediately
      dispatch(fetchCartCount());
      toast.success("Added to cart! 🛒");
    } catch (err: any) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Add to cart failed ❌");
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    router.push(`/checkout/${product._id}`);
  };

  const submitReview = async () => {
    if (!reviewRating || !reviewComment) {
      toast.warn("Rating and comment are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("productId", String(product._id));
      formData.append("rating", String(reviewRating));
      formData.append("comment", reviewComment);

      if (reviewImage) {
        formData.append("image", reviewImage);
      }

      await axios.post("/api/product/add-review", formData);
      toast.success("Review added successfully ✅");

      // Reset form
      setReviewRating(0);
      setReviewComment("");
      setReviewImage(null);
      setPreview(null);

      // Ideally we should refetch product data here, 
      // but router.refresh() might work depending on Next.js setup
      // For now we'll reload the window or rely on props update if centralized
      window.location.reload();

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ================== MAIN PRODUCT SECTION ================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* LEFT: IMAGE GALLERY */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Main Image */}
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#111] rounded-3xl border border-white/5 overflow-hidden group">
              <Image
                src={images[activeImage]}
                alt={product.title}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                priority
              />

              {product.stock <= 0 && (
                <div className="absolute top-4 left-4 bg-red-500/10 backdrop-blur border border-red-500/30 text-red-500 px-3 py-1 rounded-full text-sm font-bold">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-xl bg-[#111] border cursor-pointer overflow-hidden transition-all duration-300 ${activeImage === i ? "border-blue-500 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-black" : "border-white/10 hover:border-white/30"}`}
                >
                  <Image src={img} alt="thumbnail" fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: PRODUCT INFO */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h4 className="text-blue-500 font-medium tracking-wide text-sm mb-2 uppercase">{product.category}</h4>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-yellow-500 text-lg">
                {[1, 2, 3, 4, 5].map((i) => i <= Math.round(Number(avgRating)) ? <FaStar key={i} /> : <FaRegStar key={i} />)}
              </div>
              <span className="text-gray-400 border-l border-white/10 pl-3 ml-2">{totalReviews} Reviews</span>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-white mb-6">
              ₹ {new Intl.NumberFormat('en-IN').format(product.price)}
              <span className="text-base font-normal text-gray-500 ml-3 line-through">₹ {new Intl.NumberFormat('en-IN').format(product.price * 1.2)}</span>
              <span className="text-base font-medium text-green-500 ml-3">20% OFF</span>
            </div>

            <p className="text-gray-400 text-lg leading-relaxed mb-8 border-b border-white/10 pb-8">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition text-lg flex items-center justify-center gap-2"
              >
                <FaMoneyBillWave /> Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={addToCartLoading || product.stock <= 0}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToCartLoading ? <ClipLoader size={24} color="white" /> : <><FaOpencart /> Add to Cart</>}
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><FaTruck size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400">Delivery</p>
                  <p className="text-sm font-semibold">{product.freeDelivery ? "Free Shipping" : "Standard"}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-400 rounded-lg"><FaUndo size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400">Returns</p>
                  <p className="text-sm font-semibold">{product.replacementDays} Days</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><FaShieldAlt size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400">Warranty</p>
                  <p className="text-sm font-semibold">{product.warranty || "No"} Warranty</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg"><IoMdCheckmarkCircleOutline size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400">Authentic</p>
                  <p className="text-sm font-semibold">100% Genuine</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>


        {/* ================== DETAILS & REVIEWS ================== */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT COLUMN: Highlights & Sizes */}
          <div className="lg:col-span-1 space-y-8">
            {/* Sizes */}
            {product.isWearable && product.sizes && product.sizes.length > 0 && (
              <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-white">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <span key={s} className="px-5 py-2 rounded-lg bg-black border border-white/20 text-gray-300 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {product.detailsPoints && product.detailsPoints.length > 0 && (
              <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-white">Product Highlights</h3>
                <ul className="space-y-3">
                  {product.detailsPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Reviews */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              Customer Reviews <span className="text-sm font-normal text-gray-400 bg-white/10 px-2 py-1 rounded-md">{totalReviews}</span>
            </h2>

            {/* WRITE REVIEW */}
            <div className="mb-8 bg-[#111] p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-lg mb-4">Write a Review</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setReviewRating(i)} className="text-2xl transition-transform hover:scale-110">
                    {i <= reviewRating ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-600" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full bg-black border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                  />
                </div>
                {preview && (
                  <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                    <Image src={preview} alt="preview" fill className="object-cover" />
                    <button onClick={() => { setPreview(null); setReviewImage(null); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><AiOutlineCamera /></button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-400 hover:text-blue-300 transition">
                  <AiOutlineCamera size={20} />
                  <span>Add Photo</span>
                  <input type="file" hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setReviewImage(file); setPreview(URL.createObjectURL(file)); }
                  }} />
                </label>
                <button
                  onClick={submitReview}
                  disabled={loading}
                  className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  {loading ? <ClipLoader size={18} color="black" /> : "Post Review"}
                </button>
              </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r, i) => (
                  <div key={i} className="bg-[#111] p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                        {typeof r.user === "object" && r.user.image ? (
                          <Image src={r.user.image} alt="User" width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500"><AiOutlineUser size={24} /></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{typeof r.user === "object" ? r.user.name : "Verified Buyer"}</h4>
                        <div className="flex text-yellow-500 text-xs mb-2">
                          {[1, 2, 3, 4, 5].map(star => star <= r.rating ? <FaStar key={star} /> : <FaRegStar key={star} />)}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    </div>

                    {r.image && (
                      <div className="w-full md:w-32 h-32 rounded-xl border border-white/10 bg-black overflow-hidden flex-shrink-0 relative">
                        <Image src={r.image} alt="Review" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-[#111] rounded-2xl border border-white/10">
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================== RELATED PRODUCTS ================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-8 text-white">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 8).map(rp => (
                <UserProductCard key={rp._id?.toString()} product={rp} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
