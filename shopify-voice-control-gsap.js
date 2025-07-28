// Enhanced Voice Control for Shopify with GSAP Animations
document.addEventListener("DOMContentLoaded", () => {
  // First, load GSAP library dynamically
  function loadGSAP() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load GSAP"))
      document.head.appendChild(script)
    })
  }

  // Load GSAP and then initialize the voice control
  loadGSAP()
    .then(initVoiceControl)
    .catch((err) => {
      console.error(err)
      // Fallback to initialize without GSAP if loading fails
      initVoiceControl(false)
    })

  function initVoiceControl(gsapLoaded = true) {
    // Create and inject CSS for base styling
    const styleEl = document.createElement("style")
    styleEl.innerHTML = `
      .voice-control-widget {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      }
      
      .voice-control-button {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
        background-color: #111;
        transition: transform 0.3s;
      }
      
      .voice-control-button:hover {
        transform: scale(1.05);
      }
      
      .voice-control-button-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
      }
      
      .voice-control-icon {
        position: relative;
        z-index: 2;
        color: white;
        transition: transform 0.3s;
      }
      
      .voice-control-status {
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
      }
      
      .voice-control-status.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .voice-control-commands {
        position: absolute;
        bottom: 80px;
        right: 0;
        background-color: rgba(15,15,20,0.9);
        border-radius: 15px;
        padding: 20px;
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
      
      .voice-control-commands.visible {
        transform: scale(1);
        opacity: 1;
        pointer-events: all;
      }
      
      .voice-control-commands h4 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        background: linear-gradient(45deg, #00ccff, #7f00ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 600;
      }
      
      .voice-control-commands ul {
        margin: 0;
        padding: 0 0 0 20px;
        font-size: 14px;
      }
      
      .voice-control-commands li {
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .voice-control-commands li span {
        color: #00ccff;
        font-weight: 500;
      }
      
      .voice-control-help {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        z-index: 3;
        transition: background-color 0.3s;
      }
      
      .voice-control-help:hover {
        background-color: rgba(255,255,255,0.4);
      }
      
      .voice-control-rings {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      
      .voice-control-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.3);
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
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
      <h4>Voice Commands</h4>
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
    widgetContainer.appendChild(commandsPanel)

    // Create microphone button
    const micButton = document.createElement("button")
    micButton.className = "voice-control-button"

    // Create button background for GSAP animations
    const buttonBg = document.createElement("div")
    buttonBg.className = "voice-control-button-bg"
    micButton.appendChild(buttonBg)

    // Create rings container for pulse animations
    const ringsContainer = document.createElement("div")
    ringsContainer.className = "voice-control-rings"

    // Create multiple rings for animation
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div")
      ring.className = "voice-control-ring"
      ringsContainer.appendChild(ring)
    }
    micButton.appendChild(ringsContainer)

    // Create mic icon
    const micIcon = document.createElement("div")
    micIcon.className = "voice-control-icon"
    micIcon.innerHTML = "🎤"
    micButton.appendChild(micIcon)

    // Create help button inside mic button
    const helpButton = document.createElement("div")
    helpButton.className = "voice-control-help"
    helpButton.textContent = "?"
    helpButton.title = "Show available commands"
    micButton.appendChild(helpButton)

    widgetContainer.appendChild(micButton)
    document.body.appendChild(widgetContainer)

    // Initialize GSAP animations if loaded
    const gsap = window.gsap // Declare the gsap variable here
    if (gsapLoaded && gsap) {
      initGSAPAnimations(buttonBg, micIcon, ringsContainer)
    }

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

        if (gsapLoaded && gsap) {
          startListeningAnimation()
        }
      }

      recognition.onend = () => {
        isListening = false
        micButton.classList.remove("listening")
        showStatus("Voice control paused", 2000)

        if (gsapLoaded && gsap) {
          stopListeningAnimation()
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
        micButton.classList.remove("listening")
        showStatus(`Error: ${event.error}`, 3000)

        if (gsapLoaded && gsap) {
          stopListeningAnimation()
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

      if (gsapLoaded && gsap && commandsPanel.classList.contains("visible")) {
        gsap.from(".voice-control-commands ul li", {
          opacity: 0,
          y: 10,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        })
      }
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

    // GSAP Animation Functions
    function initGSAPAnimations(buttonBg, micIcon, ringsContainer) {
      // Create initial background gradient
      gsap.set(buttonBg, {
        background: "linear-gradient(45deg, #ff0066, #6600ff, #00ccff, #00ff99)",
        backgroundSize: "300% 300%",
      })

      // Animate background gradient
      gsap.to(buttonBg, {
        backgroundPosition: "100% 100%",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Button hover effect
      micButton.addEventListener("mouseenter", () => {
        gsap.to(micIcon, {
          scale: 1.2,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        })

        gsap.to(buttonBg, {
          backgroundSize: "200% 200%",
          duration: 0.5,
        })
      })

      micButton.addEventListener("mouseleave", () => {
        gsap.to(micIcon, {
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        })

        gsap.to(buttonBg, {
          backgroundSize: "300% 300%",
          duration: 0.5,
        })
      })

      // Initial animation
      gsap.from(micButton, {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.3)",
        delay: 0.5,
      })

      // Setup rings for pulse animation
      const rings = ringsContainer.querySelectorAll(".voice-control-ring")
      gsap.set(rings, {
        width: "10%",
        height: "10%",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
      })
    }

    // Animation for when listening starts
    function startListeningAnimation() {
      if (!gsap) return

      // Animate the button background
      gsap.to(".voice-control-button-bg", {
        backgroundSize: "150% 150%",
        duration: 0.5,
      })

      // Speed up the background animation
      gsap.killTweensOf(".voice-control-button-bg", { backgroundPosition: true })
      gsap.to(".voice-control-button-bg", {
        backgroundPosition: "100% 100%",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Animate the rings
      const rings = document.querySelectorAll(".voice-control-ring")
      rings.forEach((ring, i) => {
        gsap.set(ring, { opacity: 0.7, scale: 0.5 })

        gsap.to(ring, {
          opacity: 0,
          scale: i === 0 ? 1.2 : i === 1 ? 1.5 : 1.8,
          duration: i === 0 ? 1 : i === 1 ? 1.5 : 2,
          repeat: -1,
          delay: i * 0.3,
          ease: "power1.out",
        })
      })

      // Pulse the mic icon
      gsap.to(".voice-control-icon", {
        scale: 1.1,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }

    // Animation for when listening stops
    function stopListeningAnimation() {
      if (!gsap) return

      // Reset button background
      gsap.killTweensOf(".voice-control-button-bg", { backgroundPosition: true })
      gsap.to(".voice-control-button-bg", {
        backgroundSize: "300% 300%",
        duration: 0.5,
      })
      gsap.to(".voice-control-button-bg", {
        backgroundPosition: "100% 100%",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Stop ring animations
      const rings = document.querySelectorAll(".voice-control-ring")
      rings.forEach((ring) => {
        gsap.killTweensOf(ring)
        gsap.to(ring, {
          opacity: 0,
          scale: 0,
          duration: 0.3,
        })
      })

      // Reset mic icon
      gsap.killTweensOf(".voice-control-icon")
      gsap.to(".voice-control-icon", {
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      })
    }

    // Initial greeting
    setTimeout(() => {
      showStatus("Voice control ready! Click the mic to start.", 3000)
    }, 1000)
  }
})
