// Analytics setup for production
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Log events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track orders
export const trackOrder = (orderValue: number, orderItems: number) => {
  event({
    action: "purchase",
    category: "ecommerce",
    label: "order_placed",
    value: Math.round(orderValue * 100), // Convert to pence
  })
}

// Track menu views
export const trackMenuView = (category: string) => {
  event({
    action: "view_category",
    category: "menu",
    label: category,
  })
}
