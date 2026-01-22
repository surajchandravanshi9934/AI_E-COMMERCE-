"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setAllOrderData } from "@/redux/orderSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FiBox, FiTruck, FiCheck, FiX, FiRefreshCw, FiEye, FiClock, FiMapPin } from "react-icons/fi";
import { FaBoxes } from "react-icons/fa";

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userData } = useSelector((state: RootState) => state.user);
  const { allOrderData } = useSelector((state: RootState) => state.order);

  const [loading, setLoading] = useState(true);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackOrderModal, setTrackOrderModal] = useState<any | null>(null);

  // -----------------------------
  // Fetch Orders
  // -----------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const result = await axios.get("/api/order/allOrder");
        const orders = Array.isArray(result.data) ? result.data : result.data.orders || [];
        dispatch(setAllOrderData(orders));
      } catch (err) {
        console.error("Order Fetch Error:", err);
        dispatch(setAllOrderData([]));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [dispatch]);

  useEffect(() => {
    setLocalOrders(allOrderData || []);
  }, [allOrderData]);

  // -----------------------------
  // Filter Orders
  // -----------------------------
  const userOrders = useMemo(() => {
    if (!userData) return [];
    return localOrders.filter((o) => {
      const buyerId = o?.buyer?._id ?? o.buyer;
      return String(buyerId) === String(userData._id);
    });
  }, [localOrders, userData]);

  const formatDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "shipped": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "returned": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Helper logic for returns/cancels (kept from original)
  const isReturnEligible = (deliveryDate: string, replacementDays: number) => {
    if (!deliveryDate || !replacementDays) return false;
    const deliveredAt = new Date(deliveryDate).getTime();
    const expiry = deliveredAt + replacementDays * 24 * 60 * 60 * 1000;
    return Date.now() <= expiry;
  };

  const getRemainingReturnDays = (deliveryDate: string, replacementDays: number) => {
    if (!deliveryDate || !replacementDays) return 0;
    const expiry = new Date(deliveryDate).getTime() + replacementDays * 24 * 60 * 60 * 1000;
    const diff = expiry - Date.now();
    return diff <= 0 ? 0 : Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  const handleReturnOrder = async (orderId: string) => {
    try {
      const res = await axios.post("/api/order/return", { orderId });
      const returnedOrder = res.data.order;
      const updatedOrders = localOrders.map((o: any) =>
        o._id === orderId ? { ...o, orderStatus: "returned", returnedAmount: returnedOrder.returnedAmount } : o
      );
      alert(`Order Returned. Refund ₹${returnedOrder.returnedAmount}`);
      setSelectedOrder(null);
      setLocalOrders(updatedOrders);
      dispatch(setAllOrderData(updatedOrders));
    } catch (error: any) {
      alert(error?.response?.data?.message || "Return failed");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await axios.post("/api/order/cancel", { orderId });
      const updatedOrders = localOrders.map((o: any) =>
        o._id === orderId ? { ...o, orderStatus: "cancelled" } : o
      );
      alert("Order Cancelled");
      setSelectedOrder(null);
      setLocalOrders(updatedOrders);
      dispatch(setAllOrderData(updatedOrders));
    } catch (error: any) {
      alert(error?.response?.data?.message || "Cancel failed");
    }
  };

  const isCancelDisabled = (order: any) => order.isPaid === true && order.paymentMethod === "stripe";


  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              My Orders
            </h1>
            <p className="text-gray-400 mt-1">Track and manage your recent purchases</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm font-semibold border border-white/10">
            {userOrders.length} Orders
          </div>
        </header>

        {userOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
              <FaBoxes size={32} />
            </div>
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="text-gray-500">Looks like you haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 rounded-t-xl border border-white/10 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-2">Order ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Items</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            <div className="space-y-4">
              {userOrders.map((order: any) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order._id}
                  className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition duration-300"
                >
                  {/* Desktop Row */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center px-6 py-4">
                    <div className="col-span-2 font-mono text-sm text-blue-400">#{String(order._id).slice(-8)}</div>
                    <div className="col-span-2 text-sm text-gray-300">{formatDate(order.createdAt)}</div>
                    <div className="col-span-3 text-sm text-gray-300 truncate">
                      {order.products.length} Items: {order.products.map((p: any) => p.product?.title).join(", ")}
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(order.orderStatus)} uppercase`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="col-span-1 text-right font-bold text-green-400">₹ {order.totalAmount}</div>
                    <div className="col-span-2 flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-white/5 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && order.orderStatus !== "returned" && (
                        <button
                          onClick={() => setTrackOrderModal(order)}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition"
                          title="Track Order"
                        >
                          <FiTruck size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="lg:hidden p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">Order ID</div>
                        <div className="font-mono text-blue-400 text-lg">#{String(order._id).slice(-8)}</div>
                      </div>
                      <div className={`px-3 py-1 rounded text-xs font-semibold border ${getStatusColor(order.orderStatus)} uppercase`}>
                        {order.orderStatus}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {order.products.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm text-gray-300">
                          <span>{p.quantity} x {p.product?.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-3">
                      <div className="text-sm text-gray-400">{formatDate(order.createdAt)}</div>
                      <div className="font-bold text-green-400 text-lg">₹ {order.totalAmount}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
                      >
                        <FiEye /> Details
                      </button>
                      {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && order.orderStatus !== "returned" && (
                        <button
                          onClick={() => setTrackOrderModal(order)}
                          className="flex items-center justify-center gap-2 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition"
                        >
                          <FiTruck /> Track
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================== DETAILS MODAL ================== */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#09090b] border border-white/10 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition"><FiX size={20} /></button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">

                {/* Status & ID */}
                <div className="flex flex-wrap gap-4 justify-between items-center bg-white/5 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Order ID</p>
                    <p className="font-mono text-lg font-semibold text-blue-400">#{String(selectedOrder._id).slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase text-right">Payment</p>
                    <p className={`font-semibold text-right ${selectedOrder.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} ({selectedOrder.isPaid ? 'Paid' : 'Pending'})
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-300">Items</h3>
                  {selectedOrder.products.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div>
                        <p className="font-medium">{p.product?.title}</p>
                        <p className="text-xs text-gray-400">Qty: {p.quantity} × ₹{p.price}</p>
                      </div>
                      <p className="font-semibold">₹ {p.quantity * p.price}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Subtotal</span><span>₹ {selectedOrder.productsTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Delivery</span><span>₹ {selectedOrder.deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2">
                    <span>Total</span><span className="text-green-400">₹ {selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Return/Cancel Logic */}
                {selectedOrder.orderStatus === "delivered" ? (
                  (() => {
                    const deliveryDate = selectedOrder.deliveryDate;
                    return (
                      <div className="space-y-2 mt-4">
                        {selectedOrder.products.map((p: any, i: number) => {
                          const eligible = isReturnEligible(deliveryDate, p.product?.replacementDays || 0);
                          const remaining = getRemainingReturnDays(deliveryDate, p.product?.replacementDays || 0);

                          return (
                            <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                              <div className="text-sm">
                                <span className="text-gray-300">{p.product?.title}</span>
                                {eligible ? (
                                  <span className="block text-xs text-yellow-400 mt-1">Return available: {remaining} days left</span>
                                ) : (
                                  <span className="block text-xs text-red-400 mt-1">Return period expired</span>
                                )}
                              </div>
                              {eligible && (
                                <button onClick={() => handleReturnOrder(selectedOrder._id)} className="px-3 py-1 bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded text-sm hover:bg-yellow-600/30 transition">
                                  Return Item
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()
                ) : (
                  selectedOrder.orderStatus !== "cancelled" && selectedOrder.orderStatus !== "returned" && (
                    <button
                      disabled={isCancelDisabled(selectedOrder)}
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className={`w-full py-3 rounded-xl font-bold transition mt-4 ${isCancelDisabled(selectedOrder) ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                      {isCancelDisabled(selectedOrder) ? "Cancellation Unavailable (Stripe)" : "Cancel Order"}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================== TRACK MODAL ================== */}
      <AnimatePresence>
        {trackOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#09090b] border border-white/10 text-white w-full max-w-md rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><FiMapPin className="text-blue-400" /> Track Order</h2>
                <button onClick={() => setTrackOrderModal(null)} className="p-2 hover:bg-white/10 rounded-full"><FiX /></button>
              </div>

              {/* Address */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5 text-sm space-y-1">
                <p className="font-semibold text-white">{trackOrderModal.address.name}</p>
                <p className="text-gray-400">{trackOrderModal.address.address}</p>
                <p className="text-gray-400">{trackOrderModal.address.city}, {trackOrderModal.address.pincode}</p>
                <p className="text-gray-400">Phone: {trackOrderModal.address.phone}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-6 relative pl-4 border-l-2 border-white/10 ml-2">
                {["pending", "confirmed", "shipped", "delivered"].map((status, i) => {
                  const currentStatus = trackOrderModal.orderStatus;
                  const statusIndex = ["pending", "confirmed", "shipped", "delivered"].indexOf(currentStatus);
                  const isActive = i <= statusIndex;
                  const isCurrent = i === statusIndex;

                  return (
                    <div key={status} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#09090b] ${isActive ? "bg-blue-500" : "bg-gray-700"}`}></div>
                      <p className={`capitalize font-medium ${isActive ? "text-white" : "text-gray-500"} ${isCurrent ? "text-blue-400" : ""}`}>
                        {status}
                      </p>
                      {isCurrent && <p className="text-xs text-blue-400 animate-pulse">Current Status</p>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
