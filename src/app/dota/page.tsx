import AboutUs from "@/components/AboutUs";
import Minter from "@/components/DotaMinter";


export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center space-x-48 p-24">
      <AboutUs />
      <Minter />
    </main>
  );
}
