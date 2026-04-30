import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMeta, getPageMeta } from "../utils/pageMeta";

export default function usePageMeta() {
  const location = useLocation();

  useEffect(() => {
    const meta = getPageMeta(location.pathname);
    applyPageMeta(meta);
  }, [location.pathname]);
}
