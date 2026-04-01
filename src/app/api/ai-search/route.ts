import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDb from "@/lib/db";
import Product from "@/models/product.model";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query || query.trim() === "") {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDb();

        // Get all approved and active products
        const allProducts = await Product.find({
            isActive: true,
            verificationStatus: "approved",
        })
            .populate("vendor")
            .limit(100)
            .lean();

        // Create a summary of products for AI analysis
        const productSummary = allProducts.map((p: any) => ({
            pid: p._id.toString(),
            title: p.title,
            category: p.category,
            price: p.price,
            description: (p.description || "").substring(0, 150) + "...", // Truncate for efficiency
        }));

        // Use Gemini to analyze the query
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a smart e-commerce product search assistant. A user is searching for: "${query}"

Here are the available products (JSON format):
${JSON.stringify(productSummary, null, 2)}

Based on the user's query, analyze their intent and return a JSON response with:
1. "intent": A brief description of what the user is looking for
2. "pids": An array of pids (from the list above) that best match the query, ordered by relevance (max 12 products)
3. "explanation": A brief explanation of why these products were selected

Consider:
- Keywords in the query (brand names, product types, features)
- Price hints (cheap, affordable, expensive, under X amount)
- Category hints (electronics, fashion, home, etc.)
- Quality indicators (best, good, premium, budget)

Return ONLY valid JSON, no additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse AI response
        let aiResponse: { intent: string, pids: string[], explanation: string } | null = null;
        try {
            // Extract JSON from response (more robustly)
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');

            if (startIndex !== -1 && endIndex !== -1) {
                const jsonStr = text.substring(startIndex, endIndex + 1);
                aiResponse = JSON.parse(jsonStr);
            } else {
                console.error("No JSON block found in AI response:", text);
            }
        } catch (e) {
            console.error("Failed to parse AI response JSON:", e);
            console.error("Raw AI text:", text);
        }

        if (!aiResponse || !aiResponse.pids) {
            // Fallback: simple keyword search
            const keywords = query.toLowerCase().split(" ");
            const matchedProducts = allProducts.filter((p: any) =>
                keywords.some(
                    (kw: string) =>
                        p.title.toLowerCase().includes(kw) ||
                        p.category.toLowerCase().includes(kw) ||
                        (p.description && p.description.toLowerCase().includes(kw))
                )
            );

            return NextResponse.json({
                intent: `Searching for products matching: ${query}`,
                products: matchedProducts.slice(0, 12),
                explanation: "Showing products based on keyword matching.",
            });
        }

        // Get the full product details for matched IDs
        const matchedProducts = aiResponse.pids
            .map((pid: string) => allProducts.find((p: any) => p._id.toString() === pid))
            .filter(Boolean)
            .slice(0, 12);

        return NextResponse.json({
            intent: aiResponse.intent,
            products: matchedProducts,
            explanation: aiResponse.explanation,
        });
    } catch (error: any) {
        console.error("AI Search error:", error);
        return NextResponse.json(
            { error: "Failed to process AI search", details: error.message },
            { status: 500 }
        );
    }
}
