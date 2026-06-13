"use client"
import { useState } from "react"
import Image from "next/image"

const slides = [
  "/images/shpe_full.jpg",
  "/images/shpe_test.jpeg",
  "/images/shpe_full.jpg",
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length)
  const next = () => setCurrent((current + 1) % slides.length)

  return (
    <div className="relative w-full h-[600px] overflow-hidden mt-16">
      {/* Image */}
      <img
        src={slides[current]}
        alt="slide"
        className="w-full h-full object-cover"
        />

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full hover:bg-black"
      >
        ←
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-full hover:bg-black"
      >
        →
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full ${i === current ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}