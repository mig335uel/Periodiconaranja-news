import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
    sassOptions: {
        // Esto le dice a Sass: "Si no encuentras algo, búscalo en la raíz del proyecto"
        includePaths: [path.join(__dirname)],
    },
};

export default nextConfig;
