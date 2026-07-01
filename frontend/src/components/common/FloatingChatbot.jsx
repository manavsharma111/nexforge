import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, User, Bot, Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { askAIAsync } from "../../redux/slices/aiSlice"

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "ai",
      text: "Hi there I am NexAI, your AI assistant. How can I help you today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [chatHistory, isOpen])

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!message.trim()) return

    const userMsg = message.trim()
    const currentHistory = [...chatHistory]

    // add user message to chat history
    setChatHistory([...currentHistory, { sender: "user", text: userMsg }])
    setMessage("")
    setIsLoading(true)

    try {
      const result = await dispatch(askAIAsync({ prompt: userMsg })).unwrap()
      if (result?.response) {
        setChatHistory((prev) => [
          ...prev,
          { sender: "ai", text: result.response },
        ])
      }
    } catch (error) {
      console.error("AI Chat Error", error)
      const errorMsg =
        "Sorry, I am having trouble connecting right now. Please try again later."

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: errorMsg,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // show chatbot only if authenticated
  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 w-[calc(100vw-32px)] md:w-[400px] h-[60vh] md:h-[500px] bg-[#111111]/90 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* header section */}
            <div className="bg-[#18181b] border-b border-[rgba(255,255,255,0.08)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6366F1]/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-[#6366F1]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    NexAI
                  </h3>
                  <p className="text-white/80 text-xs">NexForge Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* chat section */}
            <div
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {chatHistory.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                        msg.sender === "user"
                          ? "bg-[#27272a]"
                          : "bg-[#6366F1]/20"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <User className="w-4 h-4 text-gray-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#6366F1]" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-[#27272a] text-white rounded-tr-none border border-[rgba(255,255,255,0.08)]"
                          : "bg-transparent text-gray-200 rounded-tl-none border border-[#6366F1]/30"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-[#6366F1]/20">
                      <Bot className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <div className="p-3 rounded-2xl bg-transparent rounded-tl-none border border-[#6366F1]/30 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#6366F1] animate-spin" />
                      <span className="text-sm text-gray-400 italic">
                        NexAI is thinking...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* input section */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#18181b]"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-[#27272a] border border-[rgba(255,255,255,0.08)] rounded-full py-3 pl-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-white ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#6366F1] rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center hover:bg-[#4F46E5] transition-colors relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default FloatingChatbot
