import React from "react"

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm text-gray-400 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="px-3 py-2 bg-vercel-darkAccent border border-vercel-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-vercel-lightBlue focus:ring-1 focus:ring-vercel-lightBlue transition-colors"
      />
    </div>
  )
}

export default Input
