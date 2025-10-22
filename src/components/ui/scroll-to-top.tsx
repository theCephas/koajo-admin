import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToTopProps {
  smooth?: boolean;
  delay?: number;
}

export default function ScrollToTop({
  smooth = false,
  delay = 0,
}: ScrollToTopProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? "smooth" : "auto",
      });
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [pathname, smooth, delay]);

  return null;
}
