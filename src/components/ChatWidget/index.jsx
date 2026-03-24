import React, { useEffect, useState } from "react";
import ChatProvider from "./ChatProvider";
import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (currentPath.startsWith("/admin")) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatButton />
      <ChatWindow />
    </ChatProvider>
  );
};

export default ChatWidget;