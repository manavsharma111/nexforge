import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"

// Register the CustomEase plugin
gsap.registerPlugin(CustomEase)

// Lenis-style cubic-bezier — slow start, very smooth deceleration
CustomEase.create("lenis", "M0,0,C0.075,0.82,0.165,1,1,1")

/**
 * Lenis-style ink wipe hover:
 *   Enter → fills from LEFT → RIGHT
 *   Leave → exits going RIGHTWARD
 */
export default function Hover({ children, className = "", fillColor = "#ff007f" }) {
  const wrapRef = useRef(null)
  const fillRef = useRef(null)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Listen for resize (useful when toggling devtools)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const wrap = wrapRef.current
    const fill = fillRef.current
    if (!wrap || !fill) return

    // Always hide the fill initially — BEFORE the touch check
    gsap.set(fill, {
      scaleX: 0,
      transformOrigin: "left center",
      force3D: true,
    })

    // Skip on touch devices — hover doesn't exist on mobile
    const isTouch = window.matchMedia("(hover: none)").matches
    if (isTouch) return

    const onEnter = () => {
      gsap.killTweensOf(fill)
      gsap.to(fill, {
        scaleX: 1,
        duration: 0.65,
        ease: "lenis",                    // custom Lenis-style ease
        transformOrigin: "left center",
        force3D: true,
        overwrite: true,
      })
    }

    const onLeave = () => {
      gsap.killTweensOf(fill)
      gsap.to(fill, {
        scaleX: 0,
        duration: 0.65,
        ease: "lenis",
        transformOrigin: "right center",   // shrinks towards right
        force3D: true,
        overwrite: true,
      })
    }

    wrap.addEventListener("mouseenter", onEnter)
    wrap.addEventListener("mouseleave", onLeave)

    return () => {
      wrap.removeEventListener("mouseenter", onEnter)
      wrap.removeEventListener("mouseleave", onLeave)
    }
  }, [isMobile, fillColor])
  if (isMobile) {
    return <div className={`inline-block ${className}`}>{children}</div>
  }

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden inline-block ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* GPU-accelerated fill layer */}
      <div
        ref={fillRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundColor: fillColor,
          willChange: "transform",
        }}
      />
      {/* Content always on top */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}