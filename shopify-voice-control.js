// Enhanced Voice Control for Shopify
document.addEventListener("DOMContentLoaded", () => {
  // Create and inject CSS for animations and styling
  const styleEl = document.createElement("style")
  styleEl.innerHTML = `
    .voice-control-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .voice-control-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }
    
    .voice-control-button::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, #ff0066, #6600ff, #00ccff, #00ff99);
      background-size: 300% 300%;
      animation: gradient-animation 5s ease infinite;
      z-index: -1;
    }
    
    @keyframes gradient-animation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .voice-control-button:hover::before {
      animation: gradient-animation 2s ease infinite;
    }
    
    .voice-control-button.listening::before {
      animation: gradient-animation 1s ease infinite;
    }
    
    .voice-control-status {
      background-color: rgba(0,0,0,0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      margin-bottom: 10px;
      font-size: 14px;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s, transform 0.3s;
      max-width: 250px;
      text-align: center;
    }
    
    .voice-control-status.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .voice-control-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: rgba(255,255,255,0.4);
      transform: scale(1);
      opacity: 0;
    }
    
    .voice-control-button.listening .voice-control-pulse {
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }
    
    .voice-control-commands {
      position: absolute;
      bottom: 70px;
      right: 0;
      background-color: rgba(0,0,0,0.8);
      border-radius: 10px;
      padding: 15px;
      color: white;
      width: 250px;
      max-height: 300px;
      overflow-y: auto;
      transform: scale(0.9);
      opacity: 0;
      transform-origin: bottom right;
      transition: transform 0.3s, opacity 0.3s;
      pointer-events: none;
    }
    
    .voice-control-commands.visible {
      transform: scale(1);
      opacity: 1;
      pointer-events: all;
    }
    
    .voice-control-commands h4 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #00ccff;
    }
    
    .voice-control-commands ul {
      margin: 0;
      padding: 0 0 0 20px;
      font-size: 13px;
    }
    
    .voice-control-commands li {
      margin-bottom: 5px;
    }
    
    .voice-control-help {
      position: absolute;
      bottom: 15px;
      left: 15px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
    }
  `
  document.head.appendChild(styleEl)

  // Create widget container
  const widgetContainer = document.createElement("div")
  widgetContainer.className = "voice-control-widget"

  // Create status display
  const statusDisplay = document.createElement("div")
  statusDisplay.className = "voice-control-status"
  statusDisplay.textContent = "Click to activate voice control"
  widgetContainer.appendChild(statusDisplay)

  // Create commands panel
  const commandsPanel = document.createElement("div")
  commandsPanel.className = "voice-control-commands"
  commandsPanel.innerHTML = `
    <h4>Available Commands</h4>
    <ul>
      <li>"Go to home" - Navigate to homepage</li>
      <li>"Go to cart" - View your cart</li>
      <li>"Go to checkout" - Proceed to checkout</li>
      <li>"Add to cart" - Add current product to cart</li>
      <li>"Scroll down/up" - Navigate the page</li>
      <li>"Click first product" - Select first product</li>
      <li>"Search for [term]" - Search the store</li>
      <li>"Speak total" - Hear your cart total</li>
      <li>"Show collections" - View collections</li>
      <li>"Filter by price" - Filter products by price</li>
      <li>"Sort by newest" - Sort products</li>
      <li>"Help" - Show available commands</li>
    </ul>
  `
  widgetContainer.appendChild(commandsPanel)

  // Create microphone button
  const micButton = document.createElement("button")
  micButton.className = "voice-control-button"
  micButton.innerHTML = '🎤<div class="voice-control-pulse"></div>'
  micButton.title = "Click to activate voice control"

  // Create help button inside mic button
  const helpButton = document.createElement("div")
  helpButton.className = "voice-control-help"
  helpButton.textContent = "?"
  helpButton.title = "Show available commands"
  micButton.appendChild(helpButton)

  widgetContainer.appendChild(micButton)
  document.body.appendChild(widgetContainer)

  // Voice control functionality
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let recognition
  let isListening = false

  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      isListening = true
      micButton.classList.add("listening")
      showStatus("Listening...", 0)
    }

    recognition.onend = () => {
      isListening = false
      micButton.classList.remove("listening")
      showStatus("Voice control paused", 2000)

      // Auto restart after a short delay if we're in continuous mode
      if (continuousMode) {
        setTimeout(() => {
          if (continuousMode) recognition.start()
        }, 500)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      isListening = false
      micButton.classList.remove("listening")
      showStatus(`Error: ${event.error}`, 3000)
    }

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript.toLowerCase()
      console.log("Command recognized:", speech)
      showStatus(`Command: "${speech}"`, 2000)

      processCommand(speech)
    }
  } else {
    showStatus("Speech recognition not supported in this browser", 5000)
    micButton.disabled = true
  }

  // Enhanced commands
  const commands = {
    "go to home": () => {
      location.href = "/"
      speak("Going to home page")
    },
    "go to cart": () => {
      location.href = "/cart"
      speak("Opening your cart")
    },
    "go to checkout": () => {
      location.href = "/checkout"
      speak("Taking you to checkout")
    },
    "scroll down": () => {
      window.scrollBy({ top: 500, behavior: "smooth" })
      speak("Scrolling down")
    },
    "scroll up": () => {
      window.scrollBy({ top: -500, behavior: "smooth" })
      speak("Scrolling up")
    },
    "add to cart": () => {
      const btn =
        document.querySelector('[name="add"]') ||
        document.querySelector(".add-to-cart") ||
        document.querySelector('[data-action="add-to-cart"]')
      if (btn) {
        btn.click()
        speak("Added to cart")
        showStatus("Added to cart", 2000)
      } else {
        speak("Add to cart button not found")
        showStatus("Add to cart button not found", 2000)
      }
    },
    "click first product": () => {
      const first = document.querySelector(".product-grid-item a, .card__information a, .product-item a")
      if (first) {
        first.click()
        speak("Opening product")
      } else {
        speak("No products found")
      }
    },
    "search for *": (param) => {
      const input = document.querySelector('input[type="search"]')
      if (input) {
        input.value = param
        input.form?.submit()
        speak("Searching for " + param)
      } else {
        speak("Search box not found")
      }
    },
    "speak total": () => {
      const total = document.querySelector(".cart_subtotal span, .totals_subtotal-value, .cart-subtotal__price")
      if (total) {
        speak("Your total is " + total.innerText)
      } else {
        speak("Total not found")
      }
    },
    "show collections": () => {
      const collectionsLink = Array.from(document.querySelectorAll("a")).find(
        (a) => a.textContent.toLowerCase().includes("collection") || a.href.toLowerCase().includes("collection"),
      )
      if (collectionsLink) {
        collectionsLink.click()
        speak("Showing collections")
      } else {
        speak("Collections link not found")
      }
    },
    "filter by price": () => {
      const priceFilter = document.querySelector('[data-filter-price], [data-sort-by="price-ascending"]')
      if (priceFilter) {
        priceFilter.click()
        speak("Filtering by price")
      } else {
        speak("Price filter not found")
      }
    },
    "sort by newest": () => {
      const sortNew = document.querySelector('[data-sort-by="created-descending"], [data-value="created-descending"]')
      if (sortNew) {
        sortNew.click()
        speak("Sorting by newest")
      } else {
        speak("Sort option not found")
      }
    },
    help: () => {
      toggleCommandsPanel()
      speak("Showing available commands")
    },
  }

  // Process voice commands
  function processCommand(speech) {
    let matched = false

    for (const key in commands) {
      if (key.includes("*")) {
        const prefix = key.split("*")[0].trim()
        if (speech.startsWith(prefix)) {
          const param = speech.replace(prefix, "").trim()
          commands[key](param)
          matched = true
          break
        }
      } else if (speech.includes(key)) {
        commands[key]()
        matched = true
        break
      }
    }

    if (!matched) {
      speak("Sorry, I didn't understand that command")
      showStatus("Command not recognized. Try 'help' for a list of commands.", 3000)
    }
  }

  // Text to speech with better voice
  function speak(text) {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(text)

      // Try to get a better voice
      const voices = synth.getVoices()
      const preferredVoice = voices.find(
        (voice) => voice.name.includes("Google") || voice.name.includes("Female") || voice.name.includes("en-US"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 1.0
      utterance.pitch = 1.0
      synth.speak(utterance)
    }
  }

  // Show status message
  function showStatus(message, duration = 2000) {
    statusDisplay.textContent = message
    statusDisplay.classList.add("visible")

    if (duration > 0) {
      setTimeout(() => {
        statusDisplay.classList.remove("visible")
      }, duration)
    }
  }

  // Toggle commands panel
  function toggleCommandsPanel() {
    commandsPanel.classList.toggle("visible")
  }

  // Continuous listening mode
  let continuousMode = false

  // Event listeners
  micButton.addEventListener("click", () => {
    if (!SpeechRecognition) {
      showStatus("Speech recognition not supported in this browser", 3000)
      return
    }

    if (isListening) {
      recognition.stop()
      continuousMode = false
    } else {
      try {
        recognition.start()
        showStatus("Listening...", 0)
      } catch (error) {
        console.error("Speech recognition error:", error)
        showStatus("Error starting speech recognition", 3000)
      }
    }
  })

  // Double click for continuous mode
  micButton.addEventListener("dblclick", () => {
    if (!SpeechRecognition) return

    continuousMode = !continuousMode

    if (continuousMode) {
      showStatus("Continuous listening mode activated", 2000)
      if (!isListening) {
        try {
          recognition.start()
        } catch (error) {
          console.error("Speech recognition error:", error)
        }
      }
    } else {
      showStatus("Continuous listening mode deactivated", 2000)
      if (isListening) {
        recognition.stop()
      }
    }
  })

  // Help button
  helpButton.addEventListener("click", (e) => {
    e.stopPropagation()
    toggleCommandsPanel()
  })

  // Hide commands panel when clicking outside
  document.addEventListener("click", (e) => {
    if (!commandsPanel.contains(e.target) && e.target !== helpButton) {
      commandsPanel.classList.remove("visible")
    }
  })

  // Initial greeting
  setTimeout(() => {
    showStatus("Voice control ready! Click the mic to start.", 3000)
  }, 1000)
})
