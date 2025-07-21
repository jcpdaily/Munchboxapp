"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Check } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { getMenuCategories, getMenuItems } from "@/lib/database"
import type { MenuCategory, MenuItem } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"
import { EmptyState } from "@/components/empty-state"
import { MobileHeader } from "@/components/mobile-header"
import { useToast } from "@/components/toast"

const breakfastBuilder = {
  breads: ["Baguette", "Thick Sliced", "Soft roll", "Bap", "Wrap"],
  fillings: ["Bacon", "Sausage", "Egg", "Hash brown", "Veggie Sausage"],
  sauces: [
    "Ketchup",
    "Brown Sauce",
    "Mayo",
    "Garlic Mayo",
    "Burger Sauce",
    "Piri-Piri",
    "Chilli",
    "Mustard",
    "Chipotle",
  ],
  extras: ["Cheese", "Mushrooms"],
}

export default function MenuPage() {
  const { addToCart, cartItems, getCartTotal } = useCart()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState("breakfast")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Breakfast builder state
  const [isBreakfastBuilderOpen, setIsBreakfastBuilderOpen] = useState(false)
  const [builderStep, setBuilderStep] = useState(1)
  const [breakfastSelection, setBreakfastSelection] = useState({
    bread: "",
    fillings: [] as string[],
    sauce: "",
    extras: [] as string[],
  })

  useEffect(() => {
    async function loadMenu() {
      setLoading(true)
      setError(null)
      try {
        const [categoriesData, itemsData] = await Promise.all([getMenuCategories(), getMenuItems()])

        if (categoriesData.length === 0) {
          setError("No menu categories found")
          return
        }

        setCategories(categoriesData)
        setMenuItems(itemsData)

        // Set first category as active tab
        setActiveTab(categoriesData[0].slug)
      } catch (error) {
        console.error("Error loading menu:", error)
        setError("Failed to load menu. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [])

  const calculateBreakfastPrice = () => {
    let basePrice = 4.0 // 1 filling
    if (breakfastSelection.fillings.length === 2) basePrice = 5.0
    if (breakfastSelection.fillings.length === 3) basePrice = 5.5

    const extrasPrice = breakfastSelection.extras.length * 0.5
    return basePrice + extrasPrice
  }

  const resetBreakfastBuilder = () => {
    setBreakfastSelection({
      bread: "",
      fillings: [],
      sauce: "",
      extras: [],
    })
    setBuilderStep(1)
  }

  const handleBreakfastBuilderOpen = () => {
    resetBreakfastBuilder()
    setIsBreakfastBuilderOpen(true)
  }

  const handleBreakfastBuilderClose = () => {
    setIsBreakfastBuilderOpen(false)
    resetBreakfastBuilder()
  }

  const handleBreakfastStepNext = () => {
    if (builderStep < 4) {
      setBuilderStep(builderStep + 1)
    }
  }

  const handleBreakfastStepBack = () => {
    if (builderStep > 1) {
      setBuilderStep(builderStep - 1)
    }
  }

  const handleBreakfastAddToCart = () => {
    const itemName = `${breakfastSelection.bread} - ${breakfastSelection.fillings.join(", ")} with ${breakfastSelection.sauce}${breakfastSelection.extras.length > 0 ? ` + ${breakfastSelection.extras.join(", ")}` : ""}`

    const customBreakfast = {
      id: 1,
      name: itemName,
      price: calculateBreakfastPrice(),
      category: "breakfast",
      selectedOption: `${breakfastSelection.bread}-${breakfastSelection.fillings.join(",")}-${breakfastSelection.sauce}-${breakfastSelection.extras.join(",")}`,
    }

    addToCart(customBreakfast)
    addToast({
      type: "success",
      title: "Added to cart!",
      description: `${itemName} - £${calculateBreakfastPrice().toFixed(2)}`,
    })
    handleBreakfastBuilderClose()
  }

  const handleAddToCart = (item: MenuItem, option?: string) => {
    if (item.is_custom_builder) {
      handleBreakfastBuilderOpen()
      return
    }

    if (item.has_options && !option) {
      setSelectedItem(item)
      setIsDialogOpen(true)
      return
    }

    let itemToAdd: any = {
      id: item.id,
      name: item.name,
      price: item.base_price,
      category: activeTab,
    }

    if (option && item.options) {
      const selectedOption = item.options.find((opt) => opt.option_name === option)
      if (selectedOption) {
        itemToAdd = {
          ...itemToAdd,
          name: `${item.name} (${option})`,
          selectedOption: option,
          price: selectedOption.price,
        }
      }
    }

    addToCart(itemToAdd)
    addToast({
      type: "success",
      title: "Added to cart!",
      description: `${itemToAdd.name} - £${itemToAdd.price.toFixed(2)}`,
    })
    setIsDialogOpen(false)
    setSelectedItem(null)
  }

  const handleOptionSelect = (option: string) => {
    if (selectedItem) {
      handleAddToCart(selectedItem, option)
    }
  }

  const getItemsByCategory = (categorySlug: string) => {
    return menuItems.filter((item) => {
      const category = categories.find((cat) => cat.id === item.category_id)
      return category?.slug === categorySlug
    })
  }

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Menu" showBack backHref="/" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Loading delicious menu..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Menu" showBack backHref="/" />
        <EmptyState
          type="error"
          title="Unable to load menu"
          description={error}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Menu" showBack backHref="/" showCart showPhone />

      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Our Menu</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Fresh food made to order • Click to add items to your cart
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 mb-6 sm:mb-8 h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.slug} value={category.slug} className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const categoryItems = getItemsByCategory(category.slug)

            return (
              <TabsContent key={category.slug} value={category.slug}>
                {categoryItems.length === 0 ? (
                  <EmptyState
                    type="menu"
                    title="No items available"
                    description={`No items found in ${category.name} category.`}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                              <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                              {item.has_options && item.options && (
                                <p className="text-xs text-lime-600 mt-1 font-medium">
                                  Choose:{" "}
                                  {item.options
                                    .map((opt) => `${opt.option_name} - £${opt.price.toFixed(2)}`)
                                    .join(" or ")}
                                </p>
                              )}
                              {item.is_custom_builder && (
                                <div className="text-xs text-lime-600 mt-1 space-y-1">
                                  <p>• 1 filling: £4.00 | 2 fillings: £5.00 | 3 fillings: £5.50</p>
                                  <p>• Extras (Cheese/Mushrooms): +£0.50 each</p>
                                </div>
                              )}
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-lime-600 flex-shrink-0">
                              {item.is_custom_builder
                                ? `From £${item.base_price.toFixed(2)}`
                                : item.has_options && category.slug !== "specials"
                                  ? `From £${item.base_price.toFixed(2)}`
                                  : `£${item.base_price.toFixed(2)}`}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                            size="lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {item.is_custom_builder
                              ? "Build Breakfast"
                              : item.has_options
                                ? "Choose Option"
                                : "Add to Cart"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Breakfast Builder Dialog */}
        <Dialog open={isBreakfastBuilderOpen} onOpenChange={setIsBreakfastBuilderOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Build Your Breakfast - Step {builderStep} of 4</DialogTitle>
              <DialogDescription>
                Create your perfect breakfast by choosing your bread, fillings, sauce, and extras.
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Choose Bread */}
            {builderStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Your Bread</h3>
                <div className="grid grid-cols-2 gap-2">
                  {breakfastBuilder.breads.map((bread) => (
                    <Button
                      key={bread}
                      onClick={() => {
                        setBreakfastSelection({ ...breakfastSelection, bread })
                        handleBreakfastStepNext()
                      }}
                      variant={breakfastSelection.bread === bread ? "default" : "outline"}
                      className="h-12 text-sm"
                    >
                      {bread}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Fillings */}
            {builderStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Choose Your Fillings</h3>
                  <p className="text-sm text-gray-600">Select 1-3 fillings (1: £4.00, 2: £5.00, 3: £5.50)</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {breakfastBuilder.fillings.map((filling) => (
                    <Button
                      key={filling}
                      onClick={() => {
                        const currentFillings = [...breakfastSelection.fillings]
                        if (currentFillings.includes(filling)) {
                          setBreakfastSelection({
                            ...breakfastSelection,
                            fillings: currentFillings.filter((f) => f !== filling),
                          })
                        } else if (currentFillings.length < 3) {
                          setBreakfastSelection({
                            ...breakfastSelection,
                            fillings: [...currentFillings, filling],
                          })
                        }
                      }}
                      variant={breakfastSelection.fillings.includes(filling) ? "default" : "outline"}
                      className="h-12 relative text-sm"
                    >
                      {filling}
                      {breakfastSelection.fillings.includes(filling) && (
                        <Check className="w-4 h-4 absolute top-1 right-1" />
                      )}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button onClick={handleBreakfastStepBack} variant="outline">
                    Back
                  </Button>
                  <Button onClick={handleBreakfastStepNext} disabled={breakfastSelection.fillings.length === 0}>
                    Next ({breakfastSelection.fillings.length} filling
                    {breakfastSelection.fillings.length !== 1 ? "s" : ""})
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Choose Sauce */}
            {builderStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Your Sauce</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {breakfastBuilder.sauces.map((sauce) => (
                    <Button
                      key={sauce}
                      onClick={() => {
                        setBreakfastSelection({ ...breakfastSelection, sauce })
                        handleBreakfastStepNext()
                      }}
                      variant={breakfastSelection.sauce === sauce ? "default" : "outline"}
                      className="h-12 text-sm"
                    >
                      {sauce}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button onClick={handleBreakfastStepBack} variant="outline">
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Choose Extras & Review */}
            {builderStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Add Extras (Optional)</h3>
                <p className="text-sm text-gray-600">Each extra adds £0.50</p>
                <div className="grid grid-cols-2 gap-2">
                  {breakfastBuilder.extras.map((extra) => (
                    <Button
                      key={extra}
                      onClick={() => {
                        const currentExtras = [...breakfastSelection.extras]
                        if (currentExtras.includes(extra)) {
                          setBreakfastSelection({
                            ...breakfastSelection,
                            extras: currentExtras.filter((e) => e !== extra),
                          })
                        } else {
                          setBreakfastSelection({
                            ...breakfastSelection,
                            extras: [...currentExtras, extra],
                          })
                        }
                      }}
                      variant={breakfastSelection.extras.includes(extra) ? "default" : "outline"}
                      className="h-12 relative text-sm"
                    >
                      {extra} (+£0.50)
                      {breakfastSelection.extras.includes(extra) && (
                        <Check className="w-4 h-4 absolute top-1 right-1" />
                      )}
                    </Button>
                  ))}
                </div>

                {/* Review */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Your Breakfast:</h4>
                  <p className="text-sm">
                    <strong>Bread:</strong> {breakfastSelection.bread}
                  </p>
                  <p className="text-sm">
                    <strong>Fillings:</strong> {breakfastSelection.fillings.join(", ")}
                  </p>
                  <p className="text-sm">
                    <strong>Sauce:</strong> {breakfastSelection.sauce}
                  </p>
                  {breakfastSelection.extras.length > 0 && (
                    <p className="text-sm">
                      <strong>Extras:</strong> {breakfastSelection.extras.join(", ")}
                    </p>
                  )}
                  <p className="text-lg font-bold text-lime-600 mt-2">Total: £{calculateBreakfastPrice().toFixed(2)}</p>
                </div>

                <div className="flex justify-between">
                  <Button onClick={handleBreakfastStepBack} variant="outline">
                    Back
                  </Button>
                  <Button onClick={handleBreakfastAddToCart} className="bg-lime-400 hover:bg-lime-500 text-slate-800">
                    Add to Cart - £{calculateBreakfastPrice().toFixed(2)}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Options Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose your option</DialogTitle>
              <DialogDescription>Select the size or variation you'd like for this item.</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                  {selectedItem.description && <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>}
                </div>
                <div className="space-y-2">
                  {selectedItem.options?.map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.option_name)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white flex justify-between items-center"
                      size="lg"
                    >
                      <span>{option.option_name}</span>
                      <span className="text-lime-400 font-bold">£{option.price.toFixed(2)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Mobile Cart Summary */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 sm:p-4 rounded-lg shadow-lg z-40 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="font-bold text-sm sm:text-base">Cart: £{getCartTotal().toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-gray-300">{cartItemCount} items</p>
              </div>
              <Link href="/cart">
                <Button className="bg-lime-400 hover:bg-lime-500 text-slate-800 text-sm sm:text-base">View Cart</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
