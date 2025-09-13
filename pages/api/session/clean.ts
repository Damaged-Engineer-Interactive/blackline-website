import type { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let now = new Date();

    try {
        await sql `
            DELETE FROM sessions
            WHERE expires_at < ${now.toISOString()}`;

        return res.status(200).json({ status: "ok"});
    } catch (error: any) {
        console.error("DB update failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
