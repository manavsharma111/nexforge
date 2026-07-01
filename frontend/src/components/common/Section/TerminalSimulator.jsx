import React, { useState, useEffect, useCallback } from "react"

const LINES = [
  { text: "$ nexforge deploy --prod", type: "command" },
  { text: "> Analyzing project...", type: "info" },
  { text: "> Installing dependencies...", type: "info" },
  { text: "> Building React application...", type: "info" },
  { text: "> Optimizing bundles...", type: "info" },
  { text: "> Deploying to edge network...", type: "info" },
  { text: "✓ Deployed successfully in 1.2s!", type: "success" },
  { text: "> URL: https://myapp.nexforge.com", type: "url" },
]

const CHAR_DELAY = 35
const LINE_PAUSE = 400
const RESTART_PAUSE = 3000

export default function TerminalSimulator() {
  const [displayedLines, setDisplayedLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const resetTerminal = useCallback(() => {
    setDisplayedLines([])
    setCurrentLineIndex(0)
    setCurrentCharIndex(0)
    setIsTyping(true)
  }, [])

  useEffect(() => {
    if (currentLineIndex >= LINES.length) {
      // All lines done, wait then restart
      const timer = setTimeout(resetTerminal, RESTART_PAUSE)
      return () => clearTimeout(timer)
    }

    const currentLine = LINES[currentLineIndex]

    if (currentCharIndex < currentLine.text.length) {
      // Still typing current line
      const timer = setTimeout(
        () => {
          setDisplayedLines((prev) => {
            const newLines = [...prev]
            if (newLines.length <= currentLineIndex) {
              newLines.push({ text: "", type: currentLine.type })
            }
            newLines[currentLineIndex] = {
              ...newLines[currentLineIndex],
              text: currentLine.text.slice(0, currentCharIndex + 1),
            }
            return newLines
          })
          setCurrentCharIndex((prev) => prev + 1)
        },
        currentLine.type === "command" ? CHAR_DELAY : CHAR_DELAY * 0.6,
      )
      return () => clearTimeout(timer)
    } else {
      // Line finished, move to next
      const timer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1)
        setCurrentCharIndex(0)
      }, LINE_PAUSE)
      return () => clearTimeout(timer)
    }
  }, [currentLineIndex, currentCharIndex, resetTerminal])

  const getLineColor = (type) => {
    switch (type) {
      case "command":
        return "text-white font-semibold"
      case "success":
        return "text-emerald-400 font-semibold"
      case "url":
        return "text-purple-400"
      default:
        return "text-[#A1A1AA]"
    }
  }

  return (
    <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/5">
      {/* Terminal Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222] bg-[#111]">
        <div className="w-3 h-3 rounded-full bg-[#EF4444]/80"></div>
        <div className="w-3 h-3 rounded-full bg-[#EAB308]/80"></div>
        <div className="w-3 h-3 rounded-full bg-[#22C55E]/80"></div>
        <span className="ml-3 text-xs text-[#555] font-mono">
          nexforge — zsh
        </span>
      </div>

      {/* Terminal Body */}
      <div className="p-5 font-mono text-sm leading-7 min-h-[280px]">
        {displayedLines.map((line, i) => (
          <div key={i} className={getLineColor(line.type)}>
            {line.text}
          </div>
        ))}
        {/* Blinking cursor */}
        {currentLineIndex < LINES.length && (
          <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-0.5 align-middle"></span>
        )}
      </div>
    </div>
  )
}
