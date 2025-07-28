// Enhanced Voice Control for Shopify with GSAP Animations
document.addEventListener("DOMContentLoaded", () => {
  // First, load GSAP library dynamically if not already loaded
  function loadGSAP() {
    return new Promise((resolve) => {
      if (window.gsap) {
        resolve(window.gsap)
        return
      }

      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
      script.onload = () => resolve(window.gsap)
      script.onerror = () => {
        console.error("Failed to load GSAP")
        resolve(null)
      }
      document.head.appendChild(script)
    })
  }

  // Create the voice control UI
  function createVoiceControlUI() {
    // Create the main container
    const voiceControl = document.createElement("div")
    voiceControl.className = "voice-control"

    // Create the mic button with gradient background
    const micButton = document.createElement("button")
    micButton.className = "voice-mic-button"
    micButton.setAttribute("aria-label", "Voice Control")

    // Create the mic icon
    const micIcon = document.createElement("div")
    micIcon.className = "voice-mic-icon"
    micIcon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15c2.21 0 4-1.79 4-4V5c0-2.21-1.79-4-4-4S8 2.79 8 5v6c0 2.21 1.79 4 4 4z"/>
        <path d="M19 11c0 4.97-4.03 9-9 9s-9-4.03-9-9" stroke="white" stroke-width="2" fill="none"/>
        <path d="M12 20v2" stroke="white" stroke-width="2"/>
        <path d="M8 22h8" stroke="white" stroke-width="2"/>
      </svg>
    `

    // Create the pulse rings
    const rings = document.createElement("div")
    rings.className = "voice-mic-rings"

    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div")
      ring.className = "voice-mic-ring"
      rings.appendChild(ring)
    }

    // Create the status display
    const statusDisplay = document.createElement("div")
    statusDisplay.className = "voice-status"
    statusDisplay.textContent = "Click to activate voice control"

    // Create the commands panel
    const commandsPanel = document.createElement("div")
    commandsPanel.className = "voice-commands"
    commandsPanel.innerHTML = `
      <div class="voice-commands-header">
        <h4>Voice Commands</h4>
        <button class="voice-commands-close" aria-label="Close commands panel">×</button>
      </div>
      <ul>
        <li><span>"Go to home"</span> - Navigate to homepage</li>
        <li><span>"Go to cart"</span> - View your cart</li>
        <li><span>"Go to checkout"</span> - Proceed to checkout</li>
        <li><span>"Add to cart"</span> - Add current product to cart</li>
        <li><span>"Scroll down/up"</span> - Navigate the page</li>
        <li><span>"Click first product"</span> - Select first product</li>
        <li><span>"Search for [term]"</span> - Search the store</li>
        <li><span>"Speak total"</span> - Hear your cart total</li>
        <li><span>"Show collections"</span> - View collections</li>
        <li><span>"Filter by price"</span> - Filter products by price</li>
        <li><span>"Sort by newest"</span> - Sort products</li>
        <li><span>"Help"</span> - Show available commands</li>
      </ul>
    `

    // Create help button
    const helpButton = document.createElement("button")
    helpButton.className = "voice-help-button"
    helpButton.textContent = "?"
    helpButton.setAttribute("aria-label", "Show voice commands")

    // Assemble the components
    micButton.appendChild(micIcon)
    micButton.appendChild(rings)
    micButton.appendChild(helpButton)
    voiceControl.appendChild(statusDisplay)
    voiceControl.appendChild(commandsPanel)
    voiceControl.appendChild(micButton)

    document.body.appendChild(voiceControl)

    return {
      voiceControl,
      micButton,
      micIcon,
      rings,
      statusDisplay,
      commandsPanel,
      helpButton,
    }
  }

  // Add the CSS styles
  function addVoiceControlStyles() {
    const styleEl = document.createElement("style")
    styleEl.innerHTML = `
      .voice-control {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .voice-mic-button {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        padding: 0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        background: linear-gradient(270deg, #ff0055, #ff5500, #ffaa00, #55ff00, #00ffaa, #0055ff, #aa00ff, #ff00aa);
        background-size: 1600% 1600%;
        transition: transform 0.3s;
      }
      
      .voice-mic-button:hover {
        transform: scale(1.05);
      }
      
      .voice-mic-icon {
        position: relative;
        z-index: 2;
        width: 40px;
        height: 40px;
        transition: transform 0.3s;
      }
      
      .voice-mic-button.listening .voice-mic-icon {
        transform: scale(1.2);
      }
      
      .voice-mic-rings {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      
      .voice-mic-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.5);
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      
      .voice-status {
        background-color: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        margin-bottom: 15px;
        font-size: 15px;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s, transform 0.3s;
        max-width: 250px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        pointer-events: none;
      }
      
      .voice-status.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .voice-commands {
        position: absolute;
        bottom: 80px;
        right: 0;
        background-color: rgba(15,15,20,0.95);
        border-radius: 15px;
        padding: 0;
        color: white;
        width: 280px;
        max-height: 400px;
        overflow-y: auto;
        transform: scale(0.95);
        opacity: 0;
        transform-origin: bottom right;
        transition: transform 0.3s, opacity 0.3s;
        pointer-events: none;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .voice-commands.visible {
        transform: scale(1);
        opacity: 1;
        pointer-events: all;
      }
      
      .voice-commands-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .voice-commands-header h4 {
        margin: 0;
        font-size: 18px;
        background: linear-gradient(45deg, #00ccff, #7f00ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 600;
      }
      
      .voice-commands-close {
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      
      .voice-commands-close:hover {
        color: white;
      }
      
      .voice-commands ul {
        margin: 0;
        padding: 15px 20px;
        font-size: 14px;
        list-style-type: none;
      }
      
      .voice-commands li {
        margin-bottom: 10px;
        line-height: 1.4;
        position: relative;
        padding-left: 15px;
      }
      
      .voice-commands li:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #00ccff;
      }
      
      .voice-commands li span {
        color: #00ccff;
        font-weight: 500;
      }
      
      .voice-help-button {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: rgba(255,255,255,0.2);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        cursor: pointer;
        z-index: 3;
        transition: background-color 0.3s;
      }
      
      .voice-help-button:hover {
        background-color: rgba(255,255,255,0.4);
      }
    `
    document.head.appendChild(styleEl)
  }

  // Initialize the voice control functionality
  async function initVoiceControl() {
    // Add styles
    addVoiceControlStyles()

    // Create UI elements
    const ui = createVoiceControlUI()

    // Load GSAP
    const gsap = await loadGSAP()

    // Voice control functionality
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    let recognition
    let isListening = false
    let continuousMode = false

    if (SpeechRecognition) {
      recognition = new SpeechRecognition()
      recognition.lang = "en-US"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        isListening = true
        ui.micButton.classList.add("listening")
        showStatus("Listening...", 0)

        if (gsap) {
          startListeningAnimation(gsap, ui)
        }
      }

      recognition.onend = () => {
        isListening = false
        ui.micButton.classList.remove("listening")
        showStatus("Voice control paused", 2000)

        if (gsap) {
          stopListeningAnimation(gsap, ui)
        }

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
        ui.micButton.classList.remove("listening")
        showStatus(`Error: ${event.error}`, 3000)

        if (gsap) {
          stopListeningAnimation(gsap, ui)
        }
      }

      recognition.onresult = (event) => {
        const speech = event.results[0][0].transcript.toLowerCase()
        console.log("Command recognized:", speech)
        showStatus(`Command: "${speech}"`, 2000)

        processCommand(speech)
      }
    } else {
      showStatus("Speech recognition not supported in this browser", 5000)
      ui.micButton.disabled = true
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
      ui.statusDisplay.textContent = message
      ui.statusDisplay.classList.add("visible")

      if (duration > 0) {
        setTimeout(() => {
          ui.statusDisplay.classList.remove("visible")
        }, duration)
      }
    }

    // Toggle commands panel
    function toggleCommandsPanel() {
      const isVisible = ui.commandsPanel.classList.toggle("visible")

      if (isVisible && gsap) {
        gsap.from(".voice-commands li", {
          opacity: 0,
          y: 10,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        })
      }
    }

    // Initialize GSAP animations
    if (gsap) {
      // Animate background gradient
      gsap.to(ui.micButton, {
        backgroundPosition: "1600% 0%",
        duration: 60,
        repeat: -1,
        ease: "linear",
      })

      // Initial animation
      gsap.from(ui.micButton, {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.3)",
        delay: 0.5,
      })
    }

    // Animation for when listening starts
    function startListeningAnimation(gsap, ui) {
      // Animate the rings
      const rings = ui.rings.querySelectorAll(".voice-mic-ring")
      rings.forEach((ring, i) => {
        gsap.set(ring, {
          opacity: 0.7,
          scale: 0.5,
          width: i === 0 ? "70%" : i === 1 ? "100%" : "130%",
          height: i === 0 ? "70%" : i === 1 ? "100%" : "130%",
        })

        gsap.to(ring, {
          opacity: 0,
          scale: 1.2,
          duration: i === 0 ? 1 : i === 1 ? 1.5 : 2,
          repeat: -1,
          delay: i * 0.3,
          ease: "power1.out",
        })
      })

      // Pulse the mic icon
      gsap.to(ui.micIcon, {
        scale: 1.2,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }

    // Animation for when listening stops
    function stopListeningAnimation(gsap, ui) {
      // Stop ring animations
      const rings = ui.rings.querySelectorAll(".voice-mic-ring")
      rings.forEach((ring) => {
        gsap.killTweensOf(ring)
        gsap.to(ring, {
          opacity: 0,
          scale: 0,
          duration: 0.3,
        })
      })

      // Reset mic icon
      gsap.killTweensOf(ui.micIcon)
      gsap.to(ui.micIcon, {
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      })
    }

    // Event listeners
    ui.micButton.addEventListener("click", () => {
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
    ui.micButton.addEventListener("dblclick", () => {
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
    ui.helpButton.addEventListener("click", (e) => {
      e.stopPropagation()
      toggleCommandsPanel()
    })

    // Close button for commands panel
    const closeButton = ui.commandsPanel.querySelector(".voice-commands-close")
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        ui.commandsPanel.classList.remove("visible")
      })
    }

    // Hide commands panel when clicking outside
    document.addEventListener("click", (e) => {
      if (!ui.commandsPanel.contains(e.target) && e.target !== ui.helpButton) {
        ui.commandsPanel.classList.remove("visible")
      }
    })

    // Initial greeting
    setTimeout(() => {
      showStatus("Voice control ready! Click the mic to start.", 3000)
    }, 1000)

    // Remove any existing mic elements that might conflict
    const existingMic = document.getElementById("micWrapper")
    if (existingMic) {
      existingMic.remove()
    }
  }

  // Start the voice control
  initVoiceControl()
})
