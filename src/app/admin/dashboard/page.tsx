"use client";
import React from "react";
import AdminDashboard from "@/component/adminDashbordComponent";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import getCurrentUser from "@/hooks/getCurrentUser";

export default function AdministratorDashboard() {
    const router = useRouter();
    getCurrentUser();
    const { userData } = useSelector((state: RootState) => state.user);

    React.useEffect(() => {
        if (userData && userData.role !== "admin") {
            router.push("/");
        }
    }, [userData, router]);

    if (!userData) return <div className="text-white text-center mt-10">Loading...</div>;

    return <AdminDashboard />;
}
