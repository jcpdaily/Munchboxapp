import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Phone, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 text-slate-800 px-3 py-1 rounded font-bold text-lg sm:text-xl">
              THE MUNCH BOX
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Phone className="w-4 h-4" />
            <span className="text-sm sm:text-base">07825368920</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-64 sm:h-96 bg-slate-800">
        <Image
          src="/images/truck-hero.jpg"
          alt="The Munch Box Food Truck"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-slate-800/60 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">
              THE <span className="text-lime-400">MUNCH BOX</span>
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8">Fresh Food • Great Taste • Quick Service</p>
            <Link href="/menu">
              <Button
                size="lg"
                className="bg-lime-400 hover:bg-lime-500 text-slate-800 font-bold text-lg px-6 sm:px-8 py-3"
              >
                ORDER NOW
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-slate-800">
            Why Choose The Munch Box?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Clock className="w-10 sm:w-12 h-10 sm:h-12 text-lime-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Quick Collection</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Order ahead and collect when ready. No waiting in queues!
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Star className="w-10 sm:w-12 h-10 sm:h-12 text-lime-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Fresh Quality</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Made fresh to order with quality ingredients every time.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <Star className="w-10 sm:w-12 h-10 sm:h-12 text-lime-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Local Favorite</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your neighborhood food truck serving the community daily.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <MapPin className="w-10 sm:w-12 h-10 sm:h-12 text-lime-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Find Us</h3>
                <p className="text-gray-600 text-sm sm:text-base">Old Brighton Road, Crawley, RH11 0PR, England</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-slate-800">
            Our Menu Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="bg-slate-800 text-white">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-lime-400">BUILD BREAKFAST</h3>
                <p className="text-sm">Choose your bread, fillings & sauce</p>
                <p className="text-xs mt-2 text-gray-300">From £4.00</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 text-white">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-lime-400">BURGERS</h3>
                <p className="text-sm">Plain, cheese, bacon & cheese burgers</p>
                <p className="text-xs mt-2 text-gray-300">From £4.00</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 text-white">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-lime-400">HOT DRINKS</h3>
                <p className="text-sm">Tea, coffee, latte, cappuccino</p>
                <p className="text-xs mt-2 text-gray-300">From £1.50</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 text-white">
              <CardContent className="p-4 sm:p-6 text-center">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-lime-400">SPECIALS</h3>
                <p className="text-sm">Curry dishes, breakfast boxes & more</p>
                <p className="text-xs mt-2 text-gray-300">From £6.00</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center">
            <Link href="/menu">
              <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-white">
                VIEW FULL MENU
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-lime-400 text-slate-800 px-4 py-2 rounded font-bold text-lg sm:text-xl inline-block mb-4">
            THE MUNCH BOX
          </div>
          <p className="mb-2 text-sm sm:text-base">Phone Orders: 07825368920</p>
          <p className="mb-2 text-sm sm:text-base">Old Brighton Road, Crawley, RH11 0PR, England</p>
          <p className="text-gray-400 text-sm">Fresh Food • Great Taste • Quick Service</p>
        </div>
      </footer>
    </div>
  )
}
