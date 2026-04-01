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

        // Add to wishlist if not already there
        const isInWishlist = user.wishlist.some((id: any) => id.toString() === productId);
        if (!isInWishlist) {
            user.wishlist.push(productId);
            await user.save();
        }

        return NextResponse.json({
            success: true,
            message: "Added to wishlist",
            count: user.wishlist.length
        });
    } catch (error) {
        console.error("WISHLIST ADD ERROR:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
