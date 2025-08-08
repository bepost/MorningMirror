import "./style.css"
const STORAGE_KEY = "daily-quote"

const devMode = import.meta.env.MODE === "development"
if (devMode) {
  const resetBtn = document.getElementById("reset")!
  resetBtn.style.display = "block"
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  })
}

const getTodayKey = () => new Date().toISOString().split("T")[0]

type Quote = {
  quote: string
  author: string
}

type StoredQuote = {
  date: string
  quote: Quote
}

async function getQuote(): Promise<Quote> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: StoredQuote = JSON.parse(raw)
      if (parsed && parsed.quote && parsed.date === getTodayKey()) return parsed.quote
    }
  } catch {}

  var newQuote = await getRandomQuote()
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      date: getTodayKey(),
      quote: newQuote,
    }),
  )
  return newQuote
}

async function getRandomQuote(): Promise<Quote> {
  const res = await fetch("/quotes.json")
  const quotes = await res.json()
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  const formattedQuote = quote.quote.replace(/\s([^\s]+)$/, "\u00A0$1")
  return { ...quote, quote: formattedQuote } as Quote
}

const loadQuote = async () => {
  const element = document.getElementById("quote")
  if (!element) {
    console.error("Element with id 'quote' not found")
    return
  }

  var quote = await getQuote()
  element.innerHTML = `
    <header>&mdash;&mdash; morning mirror &mdash;&mdash;</header>
    <blockquote>"${quote.quote}"</blockquote>
    <cite>— ${quote.author}</cite>
  `

  setTimeout(() => element.classList.add("show"), 100)
}

loadQuote()
