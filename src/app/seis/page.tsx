import AboutUs from "@/components/AboutUs";
import SeisMinter from "@/components/SeisMinter";

export default function Page() {
  return (
    <main className="flex min-h-screen items-stretch justify-center space-x-48 p-24">
      <AboutUs />
      <SeisMinter />
    </main>
  );
}
