"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchFullWishlistData } from "@/redux/wishlistSlice";
import UserProductCard from "@/component/userProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHeart, AiOutlineShopping } from "react-icons/ai";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { fullProducts, fullFetchStatus } = useSelector((state: RootState) => state.wishlist);

    useEffect(() => {
        dispatch(fetchFullWishlistData());
    }, [dispatch]);

    const isLoading = fullFetchStatus === "loading";

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center gap-4">
                            My Wishlist <AiOutlineHeart className="text-red-500" />
                        </h1>
                        <p className="text-gray-400">Items you've saved for later</p>
                    </div>
                    <button
                        onClick={() => router.push('/category')}
                        className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 transition-all font-medium"
                    >
                        <AiOutlineShopping size={20} />
                        Continue Shopping
                    </button>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <ClipLoader color="#3b82f6" size={50} />
                        <p className="text-gray-500 animate-pulse uppercase tracking-widest text-xs">Loading your treasures...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {fullProducts.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                            >
                                {fullProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <UserProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-40 text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                    <AiOutlineHeart size={40} className="text-gray-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
                                <p className="text-gray-500 max-w-sm mb-8">
                                    Browse our collection and save your favorite products to see them here later!
                                </p>
                                <button
                                    onClick={() => router.push('/category')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Start Exploring
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
