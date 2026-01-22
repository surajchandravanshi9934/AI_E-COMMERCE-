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
  AiOutlinePhone,
  AiOutlineShop,
  AiOutlineLogin,
  AiOutlineLogout,
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
  const router = useRouter();
  /* -------------------- REDUX HOOKS -------------------- */
  const dispatch = useDispatch<AppDispatch>();
  const cartCount = useSelector((state: RootState) => state.cart.count);

  useEffect(() => {
    if (user?.role === "user") {
      dispatch(fetchCartCount());
    }
  }, [user, dispatch]);


  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }}>
            <Image src={logo} alt="Logo" width={40} height={40} className="rounded-full" />
          </motion.div>
          <span className="text-xl font-semibold hidden sm:inline">MegaMart</span>
        </div>

        {/* Desktop Links */}
        {user?.role == "user" && <div className="hidden md:flex gap-8">
          <NavItem label="Home" path="/" router={router} />
          <NavItem label="Categories" path="/category" router={router} />
          <NavItem label="Shop" path="/shop" router={router} />
          <NavItem label="Orders" path="/orders" router={router} />
        </div>}

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center gap-6">
          {user?.role === "user" && <IconBtn Icon={AiOutlineSearch} onClick={() => router.push("/category")} />}

          {/* ⭐ ADDED SUPPORT ICON HERE */}
          <IconBtn Icon={AiOutlinePhone} onClick={() => router.push("/support")} />

          <div className="relative">
            {user ? (
              <>
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="user"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700 cursor-pointer"
                    onClick={() => setOpenMenu(!openMenu)}
                  />
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

          {user?.role === "user" && <CartBtn router={router} count={cartCount} />}
        </div>

        {/* Mobile Icons */}
        <div className="md:hidden flex items-center gap-4">

          {(user?.role === "admin" || user?.role === "vendor") ? (
            <>
              {/* ⭐ MOBILE SUPPORT ICON */}
              <IconBtn Icon={AiOutlinePhone} onClick={() => router.push("/support")} />

              <div className="relative">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="user"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-gray-700 cursor-pointer"
                    onClick={() => setOpenMenu(!openMenu)}
                  />

                ) : (
                  <IconBtn Icon={AiOutlineUser} onClick={() => setOpenMenu(!openMenu)} />
                )}
                <AnimatePresence>
                  {openMenu && <ProfileDropdown router={router} close={() => setOpenMenu(false)} />}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              {/* Normal user */}
              <IconBtn Icon={AiOutlineSearch} onClick={() => router.push("/category")} />

              {/* ⭐ SUPPORT FOR NORMAL USER */}
              <IconBtn Icon={AiOutlinePhone} onClick={() => router.push("/support")} />

              <CartBtn router={router} count={cartCount} />
              <AiOutlineMenu size={28} className="cursor-pointer" onClick={() => setSidebarOpen(true)} />
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && <Sidebar close={() => setSidebarOpen(false)} router={router} user={user} />}
      </AnimatePresence>
    </nav>
  );
}

/* ------- Components -------- */

const NavItem = ({ label, path, router }: any) => (
  <button onClick={() => router.push(path)} className="hover:text-gray-300">
    {label}
  </button>
);

const IconBtn = ({ Icon, onClick }: any) => (
  <motion.button whileHover={{ scale: 1.1 }} onClick={onClick}>
    <Icon size={24} />
  </motion.button>
);

const CartBtn = ({ router, count }: any) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    onClick={() => router.push("/cart")}
    className="relative"
  >
    <AiOutlineShoppingCart size={24} />

    {count > 0 && (
      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-1">
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
    transition={{ duration: 0.2 }}
    className="absolute right-0 top-12 w-56 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 bg-[#0a0a0add] overflow-hidden z-50 p-2"
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
    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
  >
    <Icon size={18} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ close, router, user }: any) => (
  <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "spring", stiffness: 200, damping: 24 }}
    className="fixed top-0 right-0 h-screen w-[65%] bg-white/90 dark:bg-black/90 backdrop-blur-lg p-6 text-black dark:text-white shadow-2xl"
  >
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Menu</h2>
      <AiOutlineClose size={28} className="cursor-pointer" onClick={close} />
    </div>

    <div className="flex flex-col gap-4 text-lg">

      <SidebarLink Icon={AiOutlineHome} label="Home" path="/" router={router} close={close} />
      <SidebarLink Icon={AiOutlineAppstore} label="Categories" path="/category" router={router} close={close} />
      <SidebarLink Icon={AiOutlineShop} label="Shop" path="/shop" router={router} close={close} />
      <SidebarLink Icon={GoListUnordered} label="Order" path="/orders" router={router} close={close} />



      <SidebarLink Icon={AiOutlineUser} label="Profile" path="/profile" router={router} close={close} />
      {!user ? (
        <SidebarLink Icon={AiOutlineLogin} label="Login" path="/login" router={router} close={close} />
      ) : (
        <SidebarSignOut Icon={AiOutlineLogout} label="Sign Out" close={close} />
      )}
    </div>
  </motion.div>
);

const SidebarLink = ({ Icon, label, path, router, close }: any) => (
  <button
    onClick={() => {
      router.push(path);
      close();
    }}
    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#6a69693c] hover:bg-gray-200 dark:hover:bg-white/10 text-left transition-colors"
  >
    <Icon size={20} /> {label}
  </button>
);

const SidebarSignOut = ({ Icon, label, close }: any) => (
  <button
    onClick={() => {
      signOut({ callbackUrl: "/login" });
      close();
    }}
    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#6a69693c] hover:bg-red-500 hover:text-white dark:hover:bg-white/10 text-left transition-colors"
  >
    <Icon size={20} /> {label}
  </button>
);
