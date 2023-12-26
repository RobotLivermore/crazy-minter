import AboutUs from '@/components/AboutUs'
import SeisMinter from '@/components/SeisMinter'

export default function Page() {
  return (
    <main className="grid grid-cols-2 min-h-screen">
      <div
        className="flex flex-col items-center p-6"
        style={{
          borderRight: 'solid 1px black',
        }}
      >
        <AboutUs />
      </div>
      <div className="flex flex-col items-center p-6">
        <SeisMinter />
      </div>
    </main>
  )
}
