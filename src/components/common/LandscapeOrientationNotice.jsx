import React, { useState, useEffect } from "react";
import { Maximize2, Smartphone } from "lucide-react";
import "./landscape-notice.css";

/**
 * Universal Mobile Landscape Prompt
 * Detects when a mobile or tablet touch device is oriented in portrait,
 * and politely presents an animated visual prompt guiding them to turn horizontal.
 * Automatically clears when turned into landscape.
 */
export default function LandscapeOrientationNotice() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device has touch capability or mobile width/height
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;

      // Portrait: height is greater than width
      const isPortraitAspect = window.innerHeight > window.innerWidth;

      // Limit to phone/tablet scale screens (<= 1024px)
      const isMobileSize =
        window.innerWidth <= 1024 || window.innerHeight <= 1024;

      setIsPortrait(Boolean(isTouch && isPortraitAspect && isMobileSize));
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const handleFullscreenLandscape = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }

      // If Screen Orientation API is available, lock to landscape
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape").catch(() => {});
      }
    } catch (err) {
      console.log("Fullscreen / Orientation lock error:", err);
    }
  };

  if (!isPortrait || dismissed) {
    return null;
  }

  return (
    <div className="sv-rotate-overlay" role="dialog" aria-modal="true">
      <div className="sv-rotate-card">
        {/* Animated Rotating Phone Device */}
        <div className="sv-rotate-phone-wrapper">
          <div className="sv-rotate-phone-glow" />
          <div className="sv-rotate-phone-device">
            <div className="sv-rotate-phone-notch" />
            <div className="sv-rotate-phone-screen">
              <div className="sv-rotate-phone-screen-inner" />
            </div>
            <div className="sv-rotate-phone-bar" />
          </div>
        </div>

        {/* Badge */}
        <div className="sv-rotate-badge">
          <Smartphone size={12} />
          <span>Landscape Recommended</span>
        </div>

        {/* Heading & Subtitle */}
        <h2 className="sv-rotate-title">Rotate Your Phone</h2>
        <p className="sv-rotate-desc">
          SkillVerse is designed to be played in landscape mode. Please turn your
          phone horizontally for the best gaming experience!
        </p>

        {/* Action Controls */}
        <div className="sv-rotate-actions">
          <button
            type="button"
            className="sv-rotate-btn-fs"
            onClick={handleFullscreenLandscape}
          >
            <Maximize2 size={16} />
            <span>Enter Fullscreen (Landscape)</span>
          </button>

          <button
            type="button"
            className="sv-rotate-btn-skip"
            onClick={() => setDismissed(true)}
          >
            Continue in portrait anyway
          </button>
        </div>
      </div>
    </div>
  );
}
