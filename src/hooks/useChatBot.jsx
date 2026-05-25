import { useState, useRef, useEffect } from "react";

export const useChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputRefMultiple = useRef(null);

  const [sessionId] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  const sendMessage = async (overrideMessage) => {
    const nextMessage = (overrideMessage ?? input).trim();
    if (!nextMessage) return;

    setMessages((prev) => [...prev, { sender: "user", text: nextMessage, type: "text" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: nextMessage, sessionId }),
      });
      const data = await response.json();

      let botMessage;
      if (!data.success) {
        botMessage = (
          <div className="text-red-600">
            {data.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"}
          </div>
        );
      } else if (data.data && data.data.length > 0) {
        botMessage = (
          <div className="space-y-4">
            <div
              className="prose prose-sm max-w-none rounded-2xl px-4 py-3 bg-gradient-to-r from-indigo-50 via-white to-pink-50 border border-gray-200 shadow-md"
              dangerouslySetInnerHTML={{ __html: data.answer }}
            />
            {data.data && data.data.length > 0 && (
              <div className="space-y-4 mt-2">
                {data.data.map((product, idx) => (
                  <div key={idx} className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <h3 className="font-semibold text-gray-800 text-base text-center">{product.name}</h3>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-28 h-28 object-cover rounded-xl my-3 border border-gray-200" onError={(e) => { e.target.src = "https://via.placeholder.com/80"; }} />
                    )}
                    <p className="text-sm text-gray-600 text-center line-clamp-3">{product.description}</p>
                    <p className="text-sm font-medium text-emerald-600 mt-3">Giá: {product.price.toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            )}
            {data.totalPrice && (
              <p className="mt-4 font-bold text-lg text-red-600 bg-red-50 px-4 py-2 rounded-xl inline-block shadow-sm">
                Tổng chi phí: {data.totalPrice.toLocaleString()}đ
              </p>
            )}
          </div>
        );
      } else {
        botMessage = <p>{data.answer}</p>;
      }

      setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: <div className="text-red-600">Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại!</div>, sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('sessionId', sessionId);
    formData.append('message', 'Phân tích sản phẩm từ ảnh này');

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "user", text: "Đã gửi ảnh sản phẩm", type: "image", image: URL.createObjectURL(file) }]);

      let botMessage;
      if (data.success) {
        if (data.data && data.data.length > 0) {
          botMessage = (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none rounded-2xl px-4 py-3 bg-gradient-to-r from-indigo-50 via-white to-pink-50 border border-gray-200 shadow-md" dangerouslySetInnerHTML={{ __html: data.answer }} />
              <div className="space-y-4 mt-2">
                {data.data.map((product, idx) => (
                  <div key={idx} className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-base text-center">{product.name}</h3>
                    {product.image && <img src={product.image} alt={product.name} className="w-28 h-28 object-cover rounded-xl my-3 border border-gray-200" />}
                    <p className="text-sm text-gray-600 text-center">{product.description}</p>
                    <p className="text-sm font-medium text-emerald-600 mt-3">Giá: {product.price.toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          botMessage = <p>{data.answer}</p>;
        }
      } else {
        botMessage = <div className="text-red-600">{data.message}</div>;
      }

      setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: <div className="text-red-600">Lỗi xử lý ảnh. Vui lòng thử lại!</div>, sender: "bot" }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompareImages = async (images) => {
    if (!images || images.length !== 2) {
      alert("Vui lòng chọn đúng 2 ảnh để so sánh!");
      return;
    }
    const validImages = images.filter(img => img instanceof File && img.type.startsWith('image/'));
    if (validImages.length !== 2) {
      alert("Vui lòng chọn file ảnh hợp lệ!");
      return;
    }
    setIsUploading(true);
    
    const formData = new FormData();
    validImages.forEach(image => formData.append('images', image));

    try {
      const response = await fetch("http://localhost:5000/api/chat/compare-images", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "user", text: "So sánh 2 sản phẩm", type: "compare", images: validImages.map(img => URL.createObjectURL(img)) }]);

      let botMessage;
      if (data.success) {
        botMessage = (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none rounded-2xl px-4 py-3 bg-gradient-to-r from-green-50 via-white to-blue-50 border border-gray-200 shadow-md" dangerouslySetInnerHTML={{ __html: data.comparison }} />
            {data.products && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {data.products.map((product, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                    <h3 className="font-semibold text-center text-sm">{product.productName}</h3>
                    <p className="text-xs text-center text-emerald-600 mt-2">{product.price?.toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      } else {
        botMessage = <div className="text-red-600">{data.message}</div>;
      }
      setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: <div className="text-red-600">Lỗi so sánh ảnh. Vui lòng thử lại!</div>, sender: "bot" }]);
    } finally {
      setIsUploading(false);
      setSelectedImages([]);
      setShowImagePreview(false);
      setCompareMode(false);
    }
  };

  const handleFileSelect = (e, multiple = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (multiple) {
      if (files.length > 2) {
        alert("Chỉ được chọn tối đa 2 ảnh để so sánh!");
        return;
      }
      if (files.length > 0) {
        setSelectedImages(files);
        setShowImagePreview(true);
        setCompareMode(true);
      }
    } else {
      if (files[0]) handleImageUpload(files[0]);
    }
    e.target.value = '';
  };

  return {
    messages, input, setInput, loading, isTyping, selectedImages, setSelectedImages, 
    isUploading, showImagePreview, setShowImagePreview, setCompareMode, fileInputRef, 
    fileInputRefMultiple, sendMessage, handleCompareImages, handleFileSelect
  };
};
