import type { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";

const sql = neon(process.env.DATABASE_URL!);
const SESSION_TTL = 6 * 60 * 1000; // 6 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { host_ip } = req.body;
    if (!host_ip) {
        return res.status(400).json({ error: "Missing host_ip" });
    }

    const code = uuidv4().slice(0, 6).toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL);

    try {
        await sql`
      INSERT INTO sessions (code, ip, created_at, updated_at, expires_at)
      VALUES (${code}, ${host_ip}, ${now.toISOString()}, ${now.toISOString()}, ${expiresAt.toISOString()})
    `;

        return res.status(200).json({ status: "ok", code });
    } catch (error: any) {
        console.error("DB insert failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
