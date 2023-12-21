import AboutUs from "@/components/AboutUs";
import InjsMinter from "@/components/InjsMinter";


export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center space-x-48 p-24">
      <AboutUs />
      <InjsMinter />
    </main>
  );
}
