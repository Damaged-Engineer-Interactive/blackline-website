import type { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Missing code" });
    }

    try {
        const result = await sql`
            DELETE FROM sessions
            WHERE code = ${code}
            RETURNING code`;

        if (result.length === 0) {
            return res.status(404).json({status: "error", message: "Session not found or expired"});
        }

        return res.status(200).json({ status: "ok", code: code });
    } catch (error: any) {
        console.error("DB update failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
