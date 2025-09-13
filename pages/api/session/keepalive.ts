import type { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const SESSION_TTL = 6 * 60 * 1000; // 6 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Missing code" });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL);

    try {
        const result = await sql`
            UPDATE sessions
            SET updated_at = ${now.toISOString()}, expires_at = ${expiresAt.toISOString()}
            WHERE code = ${code} AND expires_at > ${(now.toISOString())}
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
