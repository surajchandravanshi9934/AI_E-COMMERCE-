"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AiOutlineSearch,
  AiOutlineUser,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineHome,
  AiOutlineAppstore,
  AiOutlineShop,
  AiOutlineLogin,
  AiOutlineLogout,
  AiOutlineHeart,
} from "react-icons/ai";
import { GoListUnordered } from "react-icons/go";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/logo.jpg";
import { signOut } from "next-auth/react";
import mongoose from "mongoose";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCartCount } from "@/redux/cartSlice";
import { fetchWishlistData } from "@/redux/wishlistSlice";


interface IUser {
  _id?: mongoose.Types.ObjectId;

  name: string;
  email: string;
  password?: string;
  image?: string;

  role: "user" | "vendor" | "admin";
  phone?: string;

  /* -------------------- VENDOR FIELDS -------------------- */
  shopName?: string;
  businessAddress?: string;
  gstNumber?: string;

  isApproved?: boolean;

  verificationStatus?: "pending" | "approved" | "rejected";
  requestedAt?: Date;
  approvedAt?: Date;
  rejectedReason?: string;

  /* -------------------- PRODUCT & ORDER REFERENCES -------------------- */
  vendorProducts?: mongoose.Types.ObjectId[]; // ✅ Products created by vendor
  orders?: mongoose.Types.ObjectId[];         // ✅ Orders placed by user

  /* -------------------- CART DATA -------------------- */
  cart?: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}
export default function Navbar({ user }: { user?: IUser | null }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  /* -------------------- REDUX HOOKS -------------------- */
  const dispatch = useDispatch<AppDispatch>();
  const cartCount = useSelector((state: RootState) => state.cart.count);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.count);

  useEffect(() => {
    if (user?.role === "user") {
      dispatch(fetchCartCount());
      dispatch(fetchWishlistData());
    }
  }, [user, dispatch]);

  // Debounced search logic for suggestions
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(searchTerm)}`);
        if (res.data.success) {
          setSuggestions(res.data.products);
          setShowSuggestions(res.data.products.length > 0);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => router.push("/")}
        >
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }}>
            <Image src={logo} alt="Logo" width={40} height={40} className="rounded-full" />
          </motion.div>
          <span className="text-xl font-semibold hidden lg:inline">MegaMart</span>
        </div>

        {/* Desktop Links (Large Screens Only) */}
        {user?.role === "user" && (
          <div className="hidden lg:flex gap-6 xl:gap-8">
            <NavItem label="Home" path="/" router={router} />
            <NavItem label="Categories" path="/category" router={router} />
            <NavItem label="Shop" path="/shop" router={router} />
            <NavItem label="Orders" path="/orders" router={router} />
          </div>
        )}

        {/* Desktop Icons (Large Screens Only) */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {user?.role === "user" && (
            <div className="relative group w-48 xl:w-80 transition-all">
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    router.push(`/category?search=${encodeURIComponent(searchTerm)}`);
                    setShowSuggestions(false);
                  }
                }}
                className="w-full bg-[#111] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
              />

              <AnimatePresence>
                {showSuggestions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 left-0 w-full bg-[#0a0a0add] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {suggestions.map((p) => (
                          <button
                            key={p._id}
                            onClick={() => {
                              router.push(`/view-product/${p._id}`);
                              setShowSuggestions(false);
                              setSearchTerm("");
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all group text-left"
                          >
                            <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden shrink-0">
                              <Image src={p.image1} alt={p.title} width={40} height={40} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0 text-sm">
                              <p className="text-gray-300 truncate">{p.title}</p>
                              <p className="text-blue-400 font-bold">₹{p.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {user?.role === "user" && (
            <div className="relative">
              <IconBtn Icon={AiOutlineHeart} onClick={() => router.push("/wishlist")} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center pointer-events-none">
                  {wishlistCount}
                </span>
              )}
            </div>
          )}

          {user?.role === "user" && <CartBtn router={router} count={cartCount} />}

          <div className="relative">
            {user ? (
              <>
                {user.image ? (
                  <Image src={user.image} alt="user" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-gray-700 cursor-pointer" onClick={() => setOpenMenu(!openMenu)} />
                ) : (
                  <IconBtn Icon={AiOutlineUser} onClick={() => setOpenMenu(!openMenu)} />
                )}
                <AnimatePresence>
                  {openMenu && <ProfileDropdown router={router} close={() => setOpenMenu(false)} />}
                </AnimatePresence>
              </>
            ) : (
              <IconBtn Icon={AiOutlineLogin} onClick={() => router.push("/login")} />
            )}
          </div>


        </div>

        {/* Mobile & Tablet Icons - Below 1024px */}
        <div className="lg:hidden flex items-center gap-3 sm:gap-4">
          {(user?.role === "admin" || user?.role === "vendor") ? (
            <>
              <div className="relative">
                {user.image ? (
                  <Image src={user.image} alt="user" width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gray-700" onClick={() => setOpenMenu(!openMenu)} />
                ) : (
                  <IconBtn Icon={AiOutlineUser} onClick={() => setOpenMenu(!openMenu)} />
                )}
                <AnimatePresence>
                  {openMenu && <ProfileDropdown router={router} close={() => setOpenMenu(false)} />}
                </AnimatePresence>
              </div>
              <AiOutlineMenu size={28} className="cursor-pointer" onClick={() => setSidebarOpen(true)} />
            </>
          ) : (
            <>
              {/* User Mobile View */}
              <div className="relative w-24 sm:w-48 transition-all">
                <AiOutlineSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-[#111] border border-white/10 rounded-full py-1.5 pl-8 pr-3 text-xs focus:outline-none"
                />

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div className="absolute top-10 left-[-50px] w-[250px] sm:w-[300px] bg-black border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-2 max-h-[300px] overflow-y-auto">
                        {suggestions.map((p) => (
                          <button key={p._id} onClick={() => { router.push(`/view-product/${p._id}`); setShowSuggestions(false); setSearchTerm(""); }} className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl text-left">
                            <div className="w-8 h-8 shrink-0 bg-white/5 rounded-lg overflow-hidden">
                              <Image src={p.image1} alt={p.title} width={32} height={32} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-300 truncate">{p.title}</p>
                              <p className="text-[10px] text-blue-400">₹{p.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <IconBtn Icon={AiOutlineHeart} onClick={() => router.push("/wishlist")} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full px-1 min-w-[12px] h-3 flex items-center justify-center pointer-events-none">
                    {wishlistCount}
                  </span>
                )}
              </div>

              <CartBtn router={router} count={cartCount} />

              {/* Profile / Login button for user & guest on mobile */}
              <div className="relative">
                {user ? (
                  <>
                    {user.image ? (
                      <Image src={user.image} alt="user" width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gray-700 cursor-pointer" onClick={() => setOpenMenu(!openMenu)} />
                    ) : (
                      <IconBtn Icon={AiOutlineUser} onClick={() => setOpenMenu(!openMenu)} />
                    )}
                    <AnimatePresence>
                      {openMenu && <ProfileDropdown router={router} close={() => setOpenMenu(false)} />}
                    </AnimatePresence>
                  </>
                ) : (
                  <IconBtn Icon={AiOutlineLogin} onClick={() => router.push("/login")} />
                )}
              </div>

              <AiOutlineMenu size={28} className="cursor-pointer" onClick={() => setSidebarOpen(true)} />
            </>
          )}
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && <Sidebar close={() => setSidebarOpen(false)} router={router} user={user} />}
      </AnimatePresence>
    </nav>
  );
}

/* ------- Sub-Components (Cleaned Up) -------- */

const NavItem = ({ label, path, router }: any) => (
  <button onClick={() => router.push(path)} className="hover:text-gray-300 transition-colors">
    {label}
  </button>
);

const IconBtn = ({ Icon, onClick }: any) => (
  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClick} className="p-2 rounded-full hover:bg-white/5 transition-colors">
    <Icon size={24} />
  </motion.button>
);

const CartBtn = ({ router, count }: any) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => router.push("/cart")}
    className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
  >
    <AiOutlineShoppingCart size={24} />
    {count > 0 && (
      <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
        {count}
      </span>
    )}
  </motion.button>
);


const ProfileDropdown = ({ router, close }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    className="absolute right-0 top-14 w-56 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 bg-[#0a0a0add] overflow-hidden z-50 p-2"
  >
    <div className="flex flex-col gap-1">
      <DropdownBtn Icon={AiOutlineUser} label="Profile" onClick={() => router.push("/profile")} close={close} />
      <DropdownBtn Icon={AiOutlineAppstore} label="My Orders" onClick={() => router.push("/orders")} close={close} />
      <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
      <DropdownBtn Icon={AiOutlineLogout} label="Sign Out" onClick={() => signOut({ callbackUrl: "/login" })} close={close} />
    </div>
  </motion.div>
);

const DropdownBtn = ({ Icon, label, onClick, close }: any) => (
  <button
    onClick={() => {
      onClick();
      close();
    }}
    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
  >
    <Icon size={18} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ close, router, user }: any) => (
  <>
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={close} />
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="fixed top-0 right-0 h-screen w-[75%] max-w-sm bg-black border-l border-white/10 p-6 text-white z-[70] shadow-2xl"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold">Menu</h2>
        <button onClick={close} className="p-2 hover:bg-white/5 rounded-full"><AiOutlineClose size={24} /></button>
      </div>

      <div className="flex flex-col gap-3">
        <SidebarLink Icon={AiOutlineHome} label="Home" path="/" router={router} close={close} />
        <SidebarLink Icon={AiOutlineAppstore} label="Categories" path="/category" router={router} close={close} />
        <SidebarLink Icon={AiOutlineShop} label="Shop" path="/shop" router={router} close={close} />
        <SidebarLink Icon={GoListUnordered} label="My Orders" path="/orders" router={router} close={close} />
        {user?.role === "user" && <SidebarLink Icon={AiOutlineHeart} label="Wishlist" path="/wishlist" router={router} close={close} />}
        <div className="h-[1px] bg-white/10 my-4"></div>
        <SidebarLink Icon={AiOutlineUser} label="Profile" path="/profile" router={router} close={close} />
        {!user ? (
          <SidebarLink Icon={AiOutlineLogin} label="Login" path="/login" router={router} close={close} />
        ) : (
          <button onClick={() => { signOut({ callbackUrl: "/login" }); close(); }} className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all text-left">
            <AiOutlineLogout size={22} /> <span className="font-medium">Sign Out</span>
          </button>
        )}
      </div>
    </motion.div>
  </>
);

const SidebarLink = ({ Icon, label, path, router, close }: any) => (
  <button
    onClick={() => {
      router.push(path);
      close();
    }}
    className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
  >
    <Icon size={22} className="text-gray-400 group-hover:text-white" />
    <span className="font-medium">{label}</span>
  </button>
);
