import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import store from "./redux/store"
import "./index.css"
import "react-toastify/dist/ReactToastify.css"
import App from "./App.jsx"
import { ToastContainer } from "react-toastify"

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover />
    </BrowserRouter>
  </Provider>,
)
