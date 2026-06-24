import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'

// tilt card transition



const TiltCard = ({ className, children, ...props }) => {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const smoothX = useSpring(rotateX, { stiffness: 150, damping: 20 })
  const smoothY = useSpring(rotateY, { stiffness: 150, damping: 20 })
  const transform = useMotionTemplate`perspective(1000px) rotateX(${smoothX}deg) rotateY(${smoothY}deg)`

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const maxTilt = 10

    rotateX.set(-((y - centerY) / centerY) * maxTilt)
    rotateY.set(((x - centerX) / centerX) * maxTilt)
  }

  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      style={{ transformStyle: 'preserve-3d', transform }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default TiltCard

