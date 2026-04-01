import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Product from "@/models/product.model";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(session.user.id).populate({
            path: 'wishlist',
            model: Product,
            select: 'title _id image1 price category stock'
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            products: user.wishlist || []
        });
    } catch (error) {
        console.error("WISHLIST FETCH ERROR:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
