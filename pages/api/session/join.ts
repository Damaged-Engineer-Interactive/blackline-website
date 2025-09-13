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

    const now = new Date();

    try {
        const result = await sql`
            SELECT ip FROM sessions WHERE code = ${code} AND expires_at > ${now.toISOString()}`;

        if (result.length === 0) {
            return res.status(404).json({status: "error", message: "Session not found or expired"});
        }

        return res.status(200).json({ status: "ok", host_ip: result[0].ip });
    } catch (error: any) {
        console.error("DB get failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
