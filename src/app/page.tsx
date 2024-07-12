import Image from "next/image";
import EmbeddedWallet from "./components/EmbeddedWallet";

export default function Home() {
  const projectKey = process.env.NEXT_PUBLIC_PROJECT_KEY;

  if (!projectKey) {
    return <div>Error: Project key is not defined</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full p-4 sm:w-[500px]">
        <EmbeddedWallet 
          rpcEndpoint="" 
          apiKey="" 
          projectKey={projectKey}
        />
      </div>
    </div>
  );
}
