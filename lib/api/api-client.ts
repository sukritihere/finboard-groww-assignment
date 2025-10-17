export interface APIPreset {
  name: string
  url: string
  requiresKey: boolean
  description: string
}

export const API_PRESETS: APIPreset[] = [
  {
    name: "Alpha Vantage - Stock Data",
    url: "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=YOUR_KEY",
    requiresKey: true,
    description: "Real-time stock quotes",
  },
  {
    name: "Finnhub - Stock Info",
    url: "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY",
    requiresKey: true,
    description: "Stock market data",
  },
  {
    name: "JSONPlaceholder - Posts",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    requiresKey: false,
    description: "Free test data (no key needed)",
  },
  {
    name: "JSONPlaceholder - Users",
    url: "https://jsonplaceholder.typicode.com/users",
    requiresKey: false,
    description: "Free user data (no key needed)",
  },
  {
    name: "Coinbase - Exchange Rates",
    url: "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
    requiresKey: false,
    description: "Cryptocurrency exchange rates",
  },
]

export async function testAPIConnection(url: string): Promise<{
  success: boolean
  data?: any
  error?: string
  fields?: string[]
}> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const fields = extractFields(data)

    return {
      success: true,
      data,
      fields,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function extractFields(obj: any, prefix = ""): string[] {
  const fields: string[] = []

  function traverse(current: any, path: string) {
    if (current === null || current === undefined) return

    if (Array.isArray(current)) {
      if (current.length > 0) {
        traverse(current[0], path)
      }
    } else if (typeof current === "object") {
      Object.keys(current).forEach((key) => {
        const newPath = path ? `${path}.${key}` : key
        const value = current[key]

        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          fields.push(newPath)
        } else if (typeof value === "object" && value !== null) {
          traverse(value, newPath)
        }
      })
    }
  }

  traverse(obj, prefix)
  return fields
}

export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return null

  const keys = path.split(".")
  let current = obj

  for (const key of keys) {
    if (!current) return null
    current = current[key]
  }

  return current ?? null
}
