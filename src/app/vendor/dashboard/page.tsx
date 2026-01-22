"use client";
import React from "react";
import VendorDashboardPage from "@/component/vendorDashboardComponent";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import getCurrentUser from "@/hooks/getCurrentUser";

export default function VendorDashboard() {
    const router = useRouter();
    getCurrentUser();
    const { userData } = useSelector((state: RootState) => state.user);

    React.useEffect(() => {
        if (userData && userData.role !== "vendor") {
            router.push("/");
        }
    }, [userData, router]);

    if (!userData) return <div className="text-white text-center mt-10">Loading...</div>;

    return <VendorDashboardPage />;
}
