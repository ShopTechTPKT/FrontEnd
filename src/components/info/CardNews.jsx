import React from "react";
import { useTranslation } from 'react-i18next';

const CardNews = ({
  title = null,
  excerpt = null,
  date = "01.09.2020",
  imageUrl = "/path-to-default-image.jpg",
}) => {
  const { t } = useTranslation();

  // Nếu không truyền title/excerpt thì dùng mặc định đa ngôn ngữ
  const displayTitle = title || t('news.defaultTitle');
  const displayExcerpt = excerpt || t('news.defaultExcerpt');

  const [imageError, setImageError] = React.useState(false);
  const [currentImageUrl, setCurrentImageUrl] = React.useState(imageUrl);

  React.useEffect(() => {
    setCurrentImageUrl(imageUrl);
    setImageError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Fallback to placeholder image
      setCurrentImageUrl(`https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=${encodeURIComponent(displayTitle)}`);
    }
  };

  return (
    <div className="group flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={currentImageUrl}
          alt={displayTitle}
          className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="mb-2 cursor-pointer text-lg font-semibold leading-snug text-gray-800 transition-colors hover:text-violet-700 dark:text-gray-100 dark:hover:text-violet-400">
          {displayTitle}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {displayExcerpt}
        </p>

        <div className="mt-auto flex items-center text-xs text-gray-500">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {date}
        </div>
      </div>
    </div>
  );
};

export default CardNews;

