import React, { useState, useEffect } from "react";
import { getAllReviews } from "../../apis/reviewProductApi";
import { useTranslation } from 'react-i18next';

const TestimonialSlider = ({
  autoPlay = true,
  interval = 5000,
}) => {
  const { t } = useTranslation();

  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reviews from Database API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getAllReviews();

        if (data.EC === 1 && data.DT && data.DT.length > 0) {
          // Map backend ProductReviewDTO to testimonials format
          // Filter out reviews that violate policies (if violate = true)
          const mappedTestimonials = data.DT
            .filter((review) => !review.violate) // Chỉ hiển thị reviews không vi phạm
            .map((review) => ({
              id: review.id,
              text: review.comment,
              author: review.userFullName || "Khách hàng", // Sử dụng userFullName từ DTO
              rating: review.rating || 5, // Include rating (expected 0-5)
            }));
          setTestimonials(mappedTestimonials);
          
          if (mappedTestimonials.length === 0) {
            setError("Chưa có đánh giá nào");
          }
        } else {
          setError(data.EM || "Không thể tải đánh giá");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Lỗi tải đánh giá từ database");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    let timer;
    if (isPlaying && testimonials.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);
    }
    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, interval, testimonials.length]);

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    if (autoPlay) setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    if (autoPlay) setIsPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    if (autoPlay) setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400 text-sm">
        {error || t('common.khng_c_nh_gi')}
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Card */}
      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm px-10 md:px-16 py-10 overflow-hidden">
        {/* Decorative gradient quote mark */}
        <div className="absolute top-6 left-8 text-7xl font-serif leading-none bg-gradient-to-br from-violet-200 to-purple-100 bg-clip-text text-transparent select-none pointer-events-none">
          &ldquo;
        </div>

        {/* Nav: Prev */}
        <button
          onClick={goToPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200"
          aria-label={t('common.previous_testimonial')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Nav: Next */}
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200"
          aria-label={t('common.next_testimonial')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slides */}
        <div className="overflow-hidden relative min-h-[180px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="h-full flex flex-col justify-center items-center text-center pt-4">
                {/* Stars */}
                <div className="flex mb-4 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill={i < testimonial.rating ? "#f59e0b" : "#e5e7eb"} className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-5 line-clamp-4 italic max-w-lg">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {testimonial.author?.[0]?.toUpperCase() || "K"}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-5 gap-3 px-2">
        <button className="px-5 py-2 text-sm font-semibold text-violet-700 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors">
          {t('common.leave_us_a_review')}
        </button>

        <div className="flex items-center gap-1.5">
          {testimonials.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 h-2 bg-gradient-to-r from-violet-600 to-purple-500"
                  : "w-2 h-2 bg-gray-200 hover:bg-violet-300"
              }`}
            />
          ))}
          {testimonials.length > 10 && (
            <span className="text-xs text-gray-400 ml-1">+{testimonials.length - 10}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
