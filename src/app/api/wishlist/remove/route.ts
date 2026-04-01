import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
        }

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Removed from wishlist",
            count: user.wishlist.length
        });
    } catch (error) {
        console.error("WISHLIST REMOVE ERROR:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
