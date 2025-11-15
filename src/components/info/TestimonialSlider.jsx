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

  // Render loading or error states
  if (loading) {
    return <div className="text-center p-8">{t('common.ang_ti_nh_gi')}</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (testimonials.length === 0) {
    return <div className="text-center p-8">{t('common.khng_c_nh_gi')}</div>;
  }

  return (
    <div className="relative max-w-5xl mx-auto p-4 md:p-8 rounded-md shadow-md bg-[#f5f7ff]">
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-1 md:pl-2 z-20">
        <button
          onClick={goToPrev}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label={t('common.previous_testimonial')}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-1 md:pr-2 z-20">
        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label={t('common.next_testimonial')}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    
      {/* Testimonial content */}
      <div className="overflow-hidden relative min-h-[200px] md:min-h-[250px] py-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="h-full flex flex-col justify-center items-center text-center px-8 md:px-12">
              <p className="text-black text-base md:text-lg italic leading-relaxed mb-3 md:mb-4 line-clamp-4">
                "{testimonial.text}"
              </p>
              {/* Star rating display: Show 5 stars, fill yellow up to rating value */}
              <div className="flex mb-3 md:mb-4 space-x-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < testimonial.rating ? (
                      // Filled star
                      <svg 
                        className="w-4 h-4 md:w-5 md:h-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="#FBBF24"
                      >
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      // Empty star
                      <svg 
                        className="w-4 h-4 md:w-5 md:h-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="#D1D5DB"
                      >
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-gray-900 font-semibold text-base md:text-lg">
                - {testimonial.author}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 md:mt-6 gap-4">
        <button className="px-4 md:px-6 py-2 md:py-3 bg-white text-blue-600 font-medium rounded-full border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200 text-sm md:text-base w-full md:w-auto">
          {t('common.leave_us_a_review')}
        </button>

        <div className="flex space-x-1.5 md:space-x-2 flex-wrap justify-center max-w-full overflow-hidden">
          {testimonials.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors flex-shrink-0 ${
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
          {testimonials.length > 10 && (
            <span className="text-xs text-gray-500 px-2">+{testimonials.length - 10}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
// Updated: 2025-10-12T16:06:37.997Z

// Updated: 2025-10-12T16:08:49.605Z
