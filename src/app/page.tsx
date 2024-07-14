import Image from "next/image";
import EmbeddedWallet from "./components/EmbeddedWallet";

export default function Home() {
  const projectKey = process.env.NEXT_PUBLIC_PROJECT_KEY;
  const mainnetRpcEndpoint = process.env.NEXT_PUBLIC_MAINNET_URL;
  const devnetRpcEndpoint = process.env.NEXT_PUBLIC_DEVNET_URL;

  if (!projectKey || !mainnetRpcEndpoint || !devnetRpcEndpoint) {
    return <div>Error: An error occur</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full p-4 sm:w-[500px]">
        <EmbeddedWallet 
        mode="embedded"
          mainnetRpcEndpoint={mainnetRpcEndpoint}
          devnetRpcEndpoint={devnetRpcEndpoint}
          projectKey={projectKey}
        />
      </div>
    </div>
  );
}