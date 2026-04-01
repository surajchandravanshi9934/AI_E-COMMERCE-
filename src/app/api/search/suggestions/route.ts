import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Product from "@/models/product.model";

export async function GET(req: NextRequest) {
    try {
        await connectDb();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ success: true, products: [] });
        }

        const products = await Product.find({
            isActive: true,
            verificationStatus: "approved",
            $or: [
                { title: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        })
            .select("title _id image1 price category")
            .limit(8)
            .lean();

        return NextResponse.json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error("SUGGESTIONS API ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
