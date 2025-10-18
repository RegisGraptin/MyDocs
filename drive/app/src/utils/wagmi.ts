import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: process.env.NEXT_PUBLIC_SITE_NAME!,
    projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
    chains: [sepolia, mainnet],
    transports: {
        [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
        [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    },
    ssr: true,
});
