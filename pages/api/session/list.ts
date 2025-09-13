import type { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const now = new Date();

    try {
        const rows = await sql`
            SELECT code, ip, created_at, updated_at, expires_at
            FROM sessions
            ORDER BY created_at`;

        const active: string[] = [];
        const expired: string[] = [];

        active.push(`[ CODE ] <${"".padStart(45, " ")}> | ${"Created At".padStart(27, " ")} | ${"Updated At".padStart(27, " ")} | ${"Expires At".padStart(27, " ")} |`)
        expired.push(`[ CODE ] <${"".padStart(45, " ")}> | ${"Created At".padStart(27, " ")} | ${"Updated At".padStart(27, " ")} | ${"Expires At".padStart(27, " ")} |`)

        rows.forEach((r: any) => {
            const line = `[${r.code}] <${r.ip.padStart(45, ` `)}> | ${r.created_at.toISOString().padStart(27, ` `)} | ${r.updated_at.toISOString().padStart(27, ` `)} | ${r.expires_at.toISOString().padStart(27, ` `)} |`;
            if (new Date(r.expires_at) > now) active.push(line);
            else expired.push(line);
        });

        let output = "=== ACTIVE  SESSIONS ===\n";
        output += active.length - 1 ? active.join("\n") : "(none)";
        output += "\n=== EXPIRED SESSIONS ===\n";
        output += expired.length - 1 ? expired.join("\n") : "(none)";

        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(output);

    } catch (error: any) {
        console.error("DB get failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
