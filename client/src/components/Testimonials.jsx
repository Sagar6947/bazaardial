import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const testimonials = [
  {
    id: 1,
    name: "Amit Sharma",
    location: "Vijay Nagar, Indore",
    review:
      "This platform is fantastic! It helped me list my business and grow my customer base in no time.",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Verma",
    location: "Palasia, Indore",
    review:
      "Amazing service. The process was simple, and now I'm reaching a much larger audience.",
    rating: 4,
  },
  {
    id: 3,
    name: "Ravi Patel",
    location: "Rajendra Nagar, Indore",
    review:
      "Highly recommend! The platform is easy to use, and the customer support is excellent.",
    rating: 5,
  },
  {
    id: 4,
    name: "Anjali Nair",
    location: "Sudama Nagar, Indore",
    review:
      "Great experience listing my business. I saw a significant boost in inquiries right after joining.",
    rating: 4,
  },
  {
    id: 5,
    name: "Suresh Reddy",
    location: "Scheme No. 78, Indore",
    review:
      "I love how easy it is to list my business and manage my listings. Highly recommend!",
    rating: 5,
  },
  {
    id: 6,
    name: "Neha Singh",
    location: "Bengali Square, Indore",
    review:
      "This platform helped my business grow in ways I never imagined. Excellent service.",
    rating: 5,
  },
  {
    id: 7,
    name: "Karan Joshi",
    location: "Bhawarkuan, Indore",
    review:
      "The platform made a huge difference for my business. Customer support is also amazing!",
    rating: 4,
  },
];

export default function Testimonials() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;
  const totalSlides = Math.ceil(testimonials.length / visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - visibleCount < 0
        ? (totalSlides - 1) * visibleCount
        : prevIndex - visibleCount
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + visibleCount >= testimonials.length
        ? 0
        : prevIndex + visibleCount
    );
  };

  return (
    <div className="w-full bg-orange-50 py-20">
      <h2 className="text-4xl font-extrabold text-center text-orange-500 mb-14">
        {t("testimonials.title")}
      </h2>
      <div className="w-[90%] mx-auto lg:w-[80%]">
        <div className="relative">
          <div className="flex flex-wrap lg:flex-nowrap items-stretch justify-between gap-6 overflow-hidden transition-all duration-300 ease-in-out">
            {testimonials
              .concat(testimonials)
              .slice(currentIndex, currentIndex + visibleCount)
              .map((testimonial, idx) => (
                <div
                  key={`${testimonial.id}-${idx}`}
                  className="bg-white border border-orange-100 p-8 rounded-xl shadow-md hover:shadow-lg hover:border-orange-300 transition-all duration-300 lg:w-1/3 w-full h-full flex flex-col justify-between"
                >
                  <p className="text-gray-700 text-base italic mb-4 text-center">
                    “{testimonial.review}”
                  </p>
                  <div className="text-center mb-3 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < testimonial.rating
                            ? "text-orange-500"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-center text-lg font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <p className="text-center text-sm text-gray-500">
                    {testimonial.location}
                  </p>
                </div>
              ))}
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4 z-10">
            <button
              className="text-white bg-orange-500 p-2 rounded-full shadow-md hover:bg-orange-600 transition"
              onClick={handlePrev}
              aria-label={t("testimonials.prev")}
            >
              ❮
            </button>
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4 z-10">
            <button
              className="text-white bg-orange-500 p-2 rounded-full shadow-md hover:bg-orange-600 transition"
              onClick={handleNext}
              aria-label={t("testimonials.next")}
            >
              ❯
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === Math.floor(currentIndex / visibleCount)
                  ? "bg-orange-500"
                  : "bg-gray-300"
              } transition duration-300`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}
