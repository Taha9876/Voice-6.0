// Enhanced Voice Control for Shopify with GSAP Animations
// Complete implementation in a single file
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
        width: 80px; /* Increased by 20% from 70px */
        height: 80px; /* Increased by 20% from 70px */
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
        width: 48px; /* Increased by 20% from 40px */
        height: 48px; /* Increased by 20% from 40px */
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
        bottom: 90px;
        right: 0;
        background-color: rgba(15,15,20,0.95);
        border-radius: 15px;
        padding: 0;
        color: white;
        width: 320px;
        max-height: 450px;
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
      
      .voice-commands-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .voice-commands-tabs::-webkit-scrollbar {
        display: none;
      }
      
      .voice-tab {
        padding: 10px 15px;
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;
      }
      
      .voice-tab:hover {
        color: white;
      }
      
      .voice-tab.active {
        color: #00ccff;
        border-bottom-color: #00ccff;
      }
      
      .voice-tab-content {
        display: none;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .voice-tab-content.active {
        display: block;
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
      
      .voice-confidence {
        position: absolute;
        bottom: -5px;
        right: -5px;
        background: rgba(0,0,0,0.6);
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .voice-confidence.visible {
        opacity: 1;
      }

      .voice-settings-button {
        position: absolute;
        top: 10px;
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
      
      .voice-settings-button:hover {
        background-color: rgba(255,255,255,0.4);
      }

      .voice-settings {
        position: absolute;
        bottom: 90px;
        right: 0;
        background-color: rgba(15,15,20,0.95);
        border-radius: 15px;
        padding: 20px;
        color: white;
        width: 280px;
        transform: scale(0.95);
        opacity: 0;
        transform-origin: bottom right;
        transition: transform 0.3s, opacity 0.3s;
        pointer-events: none;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .voice-settings.visible {
        transform: scale(1);
        opacity: 1;
        pointer-events: all;
      }

      .voice-settings h4 {
        margin: 0 0 15px 0;
        font-size: 18px;
        background: linear-gradient(45deg, #00ccff, #7f00ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 600;
      }

      .voice-settings-option {
        margin-bottom: 15px;
      }

      .voice-settings-option label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
      }

      .voice-settings-option select {
        width: 100%;
        padding: 8px;
        background-color: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 5px;
        color: white;
        font-size: 14px;
      }

      .voice-settings-option input[type="checkbox"] {
        margin-right: 8px;
      }

      .voice-settings-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      
      .voice-settings-close:hover {
        color: white;
      }

      .voice-feedback {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background-color: rgba(0,0,0,0.7);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 18px;
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        z-index: 999999;
        text-align: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }
      
      .voice-feedback.visible {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    `
    document.head.appendChild(styleEl)
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
      <div class="voice-commands-tabs">
        <button class="voice-tab active" data-tab="navigation">Navigation</button>
        <button class="voice-tab" data-tab="shopping">Shopping</button>
        <button class="voice-tab" data-tab="interaction">Interaction</button>
        <button class="voice-tab" data-tab="utility">Utility</button>
      </div>
      <div class="voice-commands-content">
        <div class="voice-tab-content active" data-tab="navigation">
          <ul>
            <li><span>"Go to home"</span> - Navigate to homepage</li>
            <li><span>"Go to cart"</span> - View your cart</li>
            <li><span>"Go to checkout"</span> - Proceed to checkout</li>
            <li><span>"Go to [page]"</span> - Navigate to specific page</li>
            <li><span>"Go back"</span> - Go to previous page</li>
            <li><span>"Scroll down/up"</span> - Scroll the page</li>
            <li><span>"Scroll to top/bottom"</span> - Jump to top/bottom</li>
            <li><span>"Show menu"</span> - Open navigation menu</li>
            <li><span>"Show collections"</span> - View collections</li>
          </ul>
        </div>
        <div class="voice-tab-content" data-tab="shopping">
          <ul>
            <li><span>"Add to cart"</span> - Add current product to cart</li>
            <li><span>"Buy now"</span> - Proceed to checkout with item</li>
            <li><span>"Click first product"</span> - Select first product</li>
            <li><span>"Select size [size]"</span> - Choose product size</li>
            <li><span>"Select color [color]"</span> - Choose product color</li>
            <li><span>"Increase quantity"</span> - Add one more item</li>
            <li><span>"Decrease quantity"</span> - Remove one item</li>
            <li><span>"Filter by price"</span> - Filter products by price</li>
            <li><span>"Sort by newest"</span> - Sort products by date</li>
            <li><span>"Sort by price"</span> - Sort products by price</li>
            <li><span>"Show reviews"</span> - View product reviews</li>
            <li><span>"Speak total"</span> - Hear your cart total</li>
          </ul>
        </div>
        <div class="voice-tab-content" data-tab="interaction">
          <ul>
            <li><span>"Click [element]"</span> - Click on named element</li>
            <li><span>"Open dropdown"</span> - Open dropdown menu</li>
            <li><span>"Close popup"</span> - Close modal or popup</li>
            <li><span>"Play video"</span> - Play video if present</li>
            <li><span>"Pause video"</span> - Pause video if playing</li>
            <li><span>"Next slide"</span> - Go to next slide/image</li>
            <li><span>"Previous slide"</span> - Go to previous slide</li>
            <li><span>"Zoom in"</span> - Zoom into product image</li>
            <li><span>"Zoom out"</span> - Zoom out of product image</li>
            <li><span>"Submit form"</span> - Submit the current form</li>
          </ul>
        </div>
        <div class="voice-tab-content" data-tab="utility">
          <ul>
            <li><span>"Search for [term]"</span> - Search the store</li>
            <li><span>"Read description"</span> - Read product details</li>
            <li><span>"Read price"</span> - Hear the product price</li>
            <li><span>"Subscribe"</span> - Subscribe to newsletter</li>
            <li><span>"Contact us"</span> - Go to contact page</li>
            <li><span>"Show help"</span> - Display this help panel</li>
            <li><span>"Toggle dark mode"</span> - Switch theme if available</li>
            <li><span>"Refresh page"</span> - Reload the current page</li>
            <li><span>"What can I say"</span> - List available commands</li>
            <li><span>"Stop listening"</span> - Turn off voice control</li>
          </ul>
        </div>
      </div>
    `

    // Create help button
    const helpButton = document.createElement("button")
    helpButton.className = "voice-help-button"
    helpButton.textContent = "?"
    helpButton.setAttribute("aria-label", "Show voice commands")

    // Create settings button
    const settingsButton = document.createElement("button")
    settingsButton.className = "voice-settings-button"
    settingsButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    `
    settingsButton.setAttribute("aria-label", "Voice control settings")

    // Create settings panel
    const settingsPanel = document.createElement("div")
    settingsPanel.className = "voice-settings"
    settingsPanel.innerHTML = `
      <button class="voice-settings-close" aria-label="Close settings">×</button>
      <h4>Voice Control Settings</h4>
      
      <div class="voice-settings-option">
        <label for="voice-language">Recognition Language</label>
        <select id="voice-language">
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="it-IT">Italian</option>
          <option value="ja-JP">Japanese</option>
          <option value="ko-KR">Korean</option>
          <option value="zh-CN">Chinese (Simplified)</option>
        </select>
      </div>
      
      <div class="voice-settings-option">
        <label for="voice-feedback">Voice Feedback</label>
        <select id="voice-feedback">
          <option value="full">Full Voice Feedback</option>
          <option value="minimal">Minimal Voice Feedback</option>
          <option value="none">No Voice Feedback</option>
        </select>
      </div>
      
      <div class="voice-settings-option">
        <label>
          <input type="checkbox" id="voice-continuous" />
          Continuous Listening Mode
        </label>
      </div>
      
      <div class="voice-settings-option">
        <label>
          <input type="checkbox" id="voice-auto-discover" checked />
          Auto-discover Page Commands
        </label>
      </div>
    `

    // Create feedback element
    const feedbackElement = document.createElement("div")
    feedbackElement.className = "voice-feedback"
    document.body.appendChild(feedbackElement)

    // Create confidence indicator
    const confidenceIndicator = document.createElement("div")
    confidenceIndicator.className = "voice-confidence"

    // Assemble the components
    micButton.appendChild(micIcon)
    micButton.appendChild(rings)
    micButton.appendChild(helpButton)
    micButton.appendChild(settingsButton)
    micButton.appendChild(confidenceIndicator)
    voiceControl.appendChild(statusDisplay)
    voiceControl.appendChild(commandsPanel)
    voiceControl.appendChild(settingsPanel)
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
      settingsButton,
      settingsPanel,
      confidenceIndicator,
      feedbackElement,
    }
  }

  // Initialize the voice control functionality
  async function initVoiceControl() {
    // Add styles
    addVoiceControlStyles()

    // Create UI elements
    const ui = createVoiceControlUI()

    // Load GSAP
    const gsap = await loadGSAP()

    // Set up tab functionality
    setupTabs(ui.commandsPanel)

    // Voice control functionality
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    let recognition
    let isListening = false
    let continuousMode = false
    let autoDiscover = true
    let feedbackLevel = "full"
    let currentLanguage = "en-US"
    let discoveredCommands = {}

    // Settings
    const languageSelect = document.getElementById("voice-language")
    const feedbackSelect = document.getElementById("voice-feedback")
    const continuousCheck = document.getElementById("voice-continuous")
    const autoDiscoverCheck = document.getElementById("voice-auto-discover")

    if (languageSelect) {
      languageSelect.addEventListener("change", (e) => {
        currentLanguage = e.target.value
        if (recognition) {
          recognition.lang = currentLanguage
        }
      })
    }

    if (feedbackSelect) {
      feedbackSelect.addEventListener("change", (e) => {
        feedbackLevel = e.target.value
      })
    }

    if (continuousCheck) {
      continuousCheck.addEventListener("change", (e) => {
        continuousMode = e.target.checked
      })
    }

    if (autoDiscoverCheck) {
      autoDiscoverCheck.addEventListener("change", (e) => {
        autoDiscover = e.target.checked
      })
    }

    if (SpeechRecognition) {
      recognition = new SpeechRecognition()
      recognition.lang = currentLanguage
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
        const confidence = Math.round(event.results[0][0].confidence * 100)

        console.log(`Command recognized: "${speech}" (${confidence}% confidence)`)
        showStatus(`Command: "${speech}"`, 2000)

        // Show confidence indicator
        showConfidence(confidence, ui.confidenceIndicator)

        processCommand(speech)
      }
    } else {
      showStatus("Speech recognition not supported in this browser", 5000)
      ui.micButton.disabled = true
    }

    // Show confidence level
    function showConfidence(level, indicator) {
      indicator.textContent = `${level}%`
      indicator.classList.add("visible")

      setTimeout(() => {
        indicator.classList.remove("visible")
      }, 3000)
    }

    // Set up tab functionality
    function setupTabs(panel) {
      const tabs = panel.querySelectorAll(".voice-tab")
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          // Remove active class from all tabs and content
          panel.querySelectorAll(".voice-tab").forEach((t) => t.classList.remove("active"))
          panel.querySelectorAll(".voice-tab-content").forEach((c) => c.classList.remove("active"))

          // Add active class to clicked tab and corresponding content
          tab.classList.add("active")
          const tabName = tab.getAttribute("data-tab")
          panel.querySelector(`.voice-tab-content[data-tab="${tabName}"]`).classList.add("active")
        })
      })
    }

    // Dynamic command discovery - analyze page for clickable elements
    function discoverPageCommands() {
      const commands = {}

      // Find buttons with text
      document.querySelectorAll('button, .btn, [role="button"]').forEach((btn) => {
        if (btn.textContent.trim()) {
          const text = btn.textContent.trim().toLowerCase()
          if (text.length > 1 && text.length < 20) {
            commands[`click ${text}`] = () => {
              btn.click()
              speak(`Clicking ${text}`)
              showFeedback(`Clicking: ${text}`)
            }
          }
        }
      })

      // Find links with text
      document.querySelectorAll("a").forEach((link) => {
        if (link.textContent.trim()) {
          const text = link.textContent.trim().toLowerCase()
          if (text.length > 1 && text.length < 20 && !text.includes("http")) {
            commands[`go to ${text}`] = () => {
              link.click()
              speak(`Going to ${text}`)
              showFeedback(`Navigating to: ${text}`)
            }
          }
        }
      })

      // Find form inputs
      document
        .querySelectorAll('input[type="text"], input[type="email"], input[type="search"], textarea')
        .forEach((input) => {
          const label =
            input.getAttribute("placeholder") ||
            input.getAttribute("aria-label") ||
            document.querySelector(`label[for="${input.id}"]`)?.textContent ||
            "this field"

          commands[`type in ${label.toLowerCase()}`] = () => {
            input.focus()
            speak(`Ready to type in ${label}`)
            showFeedback(`Focus on: ${label}`)
          }
        })

      // Find checkboxes and radio buttons
      document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((input) => {
        const label = document.querySelector(`label[for="${input.id}"]`)?.textContent || "this option"

        commands[`select ${label.toLowerCase()}`] = () => {
          input.checked = true
          input.dispatchEvent(new Event("change", { bubbles: true }))
          speak(`Selected ${label}`)
          showFeedback(`Selected: ${label}`)
        }
      })

      // Find select dropdowns
      document.querySelectorAll("select").forEach((select) => {
        const label = document.querySelector(`label[for="${select.id}"]`)?.textContent || "dropdown"

        commands[`open ${label.toLowerCase()}`] = () => {
          select.focus()
          select.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
          speak(`Opening ${label} dropdown`)
          showFeedback(`Opening: ${label}`)
        }
      })

      return commands
    }

    // Enhanced base commands
    const baseCommands = {
      // Navigation commands
      "go to home": () => {
        location.href = "/"
        speak("Going to home page")
        showFeedback("Navigating to: Home Page")
      },
      "go to cart": () => {
        location.href = "/cart"
        speak("Opening your cart")
        showFeedback("Navigating to: Cart")
      },
      "go to checkout": () => {
        location.href = "/checkout"
        speak("Taking you to checkout")
        showFeedback("Navigating to: Checkout")
      },
      "go back": () => {
        window.history.back()
        speak("Going back")
        showFeedback("Navigating: Back")
      },
      "scroll down": () => {
        window.scrollBy({ top: 500, behavior: "smooth" })
        speak("Scrolling down")
        showFeedback("Scrolling Down")
      },
      "scroll up": () => {
        window.scrollBy({ top: -500, behavior: "smooth" })
        speak("Scrolling up")
        showFeedback("Scrolling Up")
      },
      "scroll to top": () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        speak("Scrolling to top")
        showFeedback("Scrolling to Top")
      },
      "scroll to bottom": () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
        speak("Scrolling to bottom")
        showFeedback("Scrolling to Bottom")
      },
      "show menu": () => {
        const menuButton = document.querySelector(
          '[aria-label="Menu"], [aria-label="menu"], .menu-button, .hamburger, .navbar-toggle, button.menu, .menu-toggle',
        )
        if (menuButton) {
          menuButton.click()
          speak("Opening menu")
          showFeedback("Opening Menu")
        } else {
          speak("Menu button not found")
          showFeedback("Menu not found", "error")
        }
      },

      // Shopping commands
      "add to cart": () => {
        const btn = findAddToCartButton()
        if (btn) {
          btn.click()
          speak("Added to cart")
          showFeedback("Added to Cart")
        } else {
          speak("Add to cart button not found")
          showFeedback("Add to Cart button not found", "error")
        }
      },
      "buy now": () => {
        const buyNowBtn = document.querySelector(
          '[name="checkout"], [data-action="checkout"], .checkout-button, .buy-now',
        )
        if (buyNowBtn) {
          buyNowBtn.click()
          speak("Proceeding to checkout")
          showFeedback("Proceeding to Checkout")
        } else {
          speak("Buy now button not found")
          showFeedback("Buy Now button not found", "error")
        }
      },
      "click first product": () => {
        const first = document.querySelector(
          ".product-grid-item a, .card__information a, .product-item a, .product a, .product-card a",
        )
        if (first) {
          first.click()
          speak("Opening product")
          showFeedback("Opening First Product")
        } else {
          speak("No products found")
          showFeedback("No products found", "error")
        }
      },
      "increase quantity": () => {
        const increaseBtn = document.querySelector(
          '[data-action="increase-quantity"], [name="plus"], .quantity-up, .js-qty__adjust--plus, .quantity__button--plus',
        )
        if (increaseBtn) {
          increaseBtn.click()
          speak("Increased quantity")
          showFeedback("Increased Quantity")
        } else {
          speak("Increase quantity button not found")
          showFeedback("Increase button not found", "error")
        }
      },
      "decrease quantity": () => {
        const decreaseBtn = document.querySelector(
          '[data-action="decrease-quantity"], [name="minus"], .quantity-down, .js-qty__adjust--minus, .quantity__button--minus',
        )
        if (decreaseBtn) {
          decreaseBtn.click()
          speak("Decreased quantity")
          showFeedback("Decreased Quantity")
        } else {
          speak("Decrease quantity button not found")
          showFeedback("Decrease button not found", "error")
        }
      },
      "filter by price": () => {
        const priceFilter = document.querySelector(
          '[data-filter-price], [data-sort-by="price-ascending"], [data-option-filter="price"]',
        )
        if (priceFilter) {
          priceFilter.click()
          speak("Filtering by price")
          showFeedback("Filtering by Price")
        } else {
          speak("Price filter not found")
          showFeedback("Price filter not found", "error")
        }
      },
      "sort by newest": () => {
        const sortNew = document.querySelector(
          '[data-sort-by="created-descending"], [data-value="created-descending"], [data-option="newest"]',
        )
        if (sortNew) {
          sortNew.click()
          speak("Sorting by newest")
          showFeedback("Sorting by Newest")
        } else {
          speak("Sort option not found")
          showFeedback("Sort option not found", "error")
        }
      },
      "sort by price": () => {
        const sortPrice = document.querySelector(
          '[data-sort-by="price-ascending"], [data-value="price-ascending"], [data-option="price-ascending"]',
        )
        if (sortPrice) {
          sortPrice.click()
          speak("Sorting by price")
          showFeedback("Sorting by Price")
        } else {
          speak("Sort option not found")
          showFeedback("Sort option not found", "error")
        }
      },
      "show reviews": () => {
        const reviewsTab = document.querySelector(
          '[data-tab="reviews"], .product-reviews-tab, .reviews-link, a[href="#reviews"]',
        )
        if (reviewsTab) {
          reviewsTab.click()
          speak("Showing reviews")
          showFeedback("Showing Reviews")
        } else {
          speak("Reviews tab not found")
          showFeedback("Reviews not found", "error")
        }
      },
      "speak total": () => {
        const total = document.querySelector(
          ".cart_subtotal span, .totals_subtotal-value, .cart-subtotal__price, .cart__total",
        )
        if (total) {
          speak("Your total is " + total.innerText)
          showFeedback(`Total: ${total.innerText}`)
        } else {
          speak("Total not found")
          showFeedback("Total not found", "error")
        }
      },

      // Interaction commands
      "open dropdown": () => {
        const dropdown = document.querySelector(
          '.dropdown:not(.open) > button, [aria-expanded="false"][aria-haspopup="true"]',
        )
        if (dropdown) {
          dropdown.click()
          speak("Opening dropdown")
          showFeedback("Opening Dropdown")
        } else {
          speak("Dropdown not found")
          showFeedback("Dropdown not found", "error")
        }
      },
      "close popup": () => {
        const closeBtn = document.querySelector(
          '.modal.open .close, .popup.open .close, [aria-label="Close"], .modal-close, .popup-close, .drawer__close',
        )
        if (closeBtn) {
          closeBtn.click()
          speak("Closing popup")
          showFeedback("Closing Popup")
        } else {
          speak("Close button not found")
          showFeedback("Close button not found", "error")
        }
      },
      "play video": () => {
        const video = document.querySelector("video")
        if (video) {
          video.play()
          speak("Playing video")
          showFeedback("Playing Video")
        } else {
          speak("Video not found")
          showFeedback("Video not found", "error")
        }
      },
      "pause video": () => {
        const video = document.querySelector("video")
        if (video) {
          video.pause()
          speak("Pausing video")
          showFeedback("Pausing Video")
        } else {
          speak("Video not found")
          showFeedback("Video not found", "error")
        }
      },
      "next slide": () => {
        const nextBtn = document.querySelector(
          '.slick-next, .carousel-next, .swiper-button-next, [data-slide="next"], .flickity-next',
        )
        if (nextBtn) {
          nextBtn.click()
          speak("Next slide")
          showFeedback("Next Slide")
        } else {
          speak("Next slide button not found")
          showFeedback("Next button not found", "error")
        }
      },
      "previous slide": () => {
        const prevBtn = document.querySelector(
          '.slick-prev, .carousel-prev, .swiper-button-prev, [data-slide="prev"], .flickity-prev',
        )
        if (prevBtn) {
          prevBtn.click()
          speak("Previous slide")
          showFeedback("Previous Slide")
        } else {
          speak("Previous slide button not found")
          showFeedback("Previous button not found", "error")
        }
      },
      "zoom in": () => {
        const zoomBtn = document.querySelector('.zoom-in, [data-zoom="in"], .product-zoom')
        if (zoomBtn) {
          zoomBtn.click()
          speak("Zooming in")
          showFeedback("Zooming In")
        } else {
          speak("Zoom button not found")
          showFeedback("Zoom button not found", "error")
        }
      },
      "zoom out": () => {
        const zoomOutBtn = document.querySelector('.zoom-out, [data-zoom="out"]')
        if (zoomOutBtn) {
          zoomOutBtn.click()
          speak("Zooming out")
          showFeedback("Zooming Out")
        } else {
          speak("Zoom out button not found")
          showFeedback("Zoom out button not found", "error")
        }
      },
      "submit form": () => {
        const submitBtn = document.querySelector('form button[type="submit"], form input[type="submit"]')
        if (submitBtn) {
          submitBtn.click()
          speak("Submitting form")
          showFeedback("Submitting Form")
        } else {
          speak("Submit button not found")
          showFeedback("Submit button not found", "error")
        }
      },

      // Utility commands
      "search for *": (param) => {
        const input = document.querySelector('input[type="search"], [name="q"], .search-input, .search__input')
        if (input) {
          input.value = param
          input.form?.submit()
          speak("Searching for " + param)
          showFeedback(`Searching for: ${param}`)
        } else {
          speak("Search box not found")
          showFeedback("Search box not found", "error")
        }
      },
      "read description": () => {
        const description = document.querySelector(
          '.product-description, .product__description, .description, [itemprop="description"]',
        )
        if (description) {
          speak(description.innerText)
          showFeedback("Reading Description")
        } else {
          speak("Description not found")
          showFeedback("Description not found", "error")
        }
      },
      "read price": () => {
        const price = document.querySelector('.product-price, .product__price, .price, [itemprop="price"]')
        if (price) {
          speak("The price is " + price.innerText)
          showFeedback(`Price: ${price.innerText}`)
        } else {
          speak("Price not found")
          showFeedback("Price not found", "error")
        }
      },
      subscribe: () => {
        const emailInput = document.querySelector(
          'input[type="email"][name="contact[email]"], .newsletter-input, .subscribe-email',
        )
        const subscribeBtn = document.querySelector('.subscribe-button, .newsletter-submit, button[name="subscribe"]')

        if (emailInput && subscribeBtn) {
          emailInput.focus()
          speak("Enter your email to subscribe")
          showFeedback("Enter Email to Subscribe")
        } else {
          speak("Subscription form not found")
          showFeedback("Subscription form not found", "error")
        }
      },
      "contact us": () => {
        const contactLink = Array.from(document.querySelectorAll("a")).find(
          (a) => a.textContent.toLowerCase().includes("contact") || a.href.toLowerCase().includes("contact"),
        )
        if (contactLink) {
          contactLink.click()
          speak("Going to contact page")
          showFeedback("Navigating to Contact Page")
        } else {
          speak("Contact link not found")
          showFeedback("Contact link not found", "error")
        }
      },
      "toggle dark mode": () => {
        const darkModeToggle = document.querySelector("[data-theme-toggle], .theme-switch, .dark-mode-toggle")
        if (darkModeToggle) {
          darkModeToggle.click()
          speak("Toggling dark mode")
          showFeedback("Toggling Dark Mode")
        } else {
          speak("Dark mode toggle not found")
          showFeedback("Dark mode toggle not found", "error")
        }
      },
      "refresh page": () => {
        speak("Refreshing page")
        showFeedback("Refreshing Page")
        setTimeout(() => {
          location.reload()
        }, 1000)
      },
      "what can i say": () => {
        toggleCommandsPanel()
        speak("Here are the available commands")
        showFeedback("Showing Available Commands")
      },
      "stop listening": () => {
        if (isListening && recognition) {
          recognition.stop()
          continuousMode = false
          speak("Voice control deactivated")
          showFeedback("Voice Control Deactivated")
        }
      },
      "show collections": () => {
        const collectionsLink = Array.from(document.querySelectorAll("a")).find(
          (a) => a.textContent.toLowerCase().includes("collection") || a.href.toLowerCase().includes("collection"),
        )
        if (collectionsLink) {
          collectionsLink.click()
          speak("Showing collections")
          showFeedback("Showing Collections")
        } else {
          speak("Collections link not found")
          showFeedback("Collections link not found", "error")
        }
      },
      help: () => {
        toggleCommandsPanel()
        speak("Showing available commands")
        showFeedback("Showing Help")
      },
      "show help": () => {
        toggleCommandsPanel()
        speak("Showing available commands")
        showFeedback("Showing Help")
      },
      "show settings": () => {
        toggleSettingsPanel()
        speak("Showing settings")
        showFeedback("Showing Settings")
      },
      settings: () => {
        toggleSettingsPanel()
        speak("Showing settings")
        showFeedback("Showing Settings")
      },
    }

    // Helper function to find add to cart button with multiple selectors
    function findAddToCartButton() {
      return document.querySelector(
        '[name="add"], .add-to-cart, [data-action="add-to-cart"], ' +
          "[data-add-to-cart], .product-form__cart-submit, " +
          ".add_to_cart, #AddToCart, .product-form__add-to-cart, " +
          '.btn--add-to-cart, button:contains("Add to Cart"), ' +
          'button:contains("Add To Cart"), button:contains("ADD TO CART")',
      )
    }

    // Process voice commands
    function processCommand(speech) {
      let matched = false

      // First check if we need to update discovered commands
      if (autoDiscover) {
        discoveredCommands = discoverPageCommands()
      }

      // Combine base commands with discovered commands
      const allCommands = { ...baseCommands, ...discoveredCommands }

      // Process the command
      for (const key in allCommands) {
        if (key.includes("*")) {
          const prefix = key.split("*")[0].trim()
          if (speech.startsWith(prefix)) {
            const param = speech.replace(prefix, "").trim()
            allCommands[key](param)
            matched = true
            break
          }
        } else if (speech.includes(key)) {
          allCommands[key]()
          matched = true
          break
        }
      }

      if (!matched) {
        speak("Sorry, I didn't understand that command")
        showStatus("Command not recognized. Try 'help' for a list of commands.", 3000)
        showFeedback("Command not recognized", "error")
      }
    }

    // Text to speech with better voice
    function speak(text) {
      if (feedbackLevel === "none") return

      if ((feedbackLevel === "minimal" && text.includes("not found")) || text.includes("Sorry")) {
        // Only speak errors in minimal mode
      }

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

    // Show visual feedback
    function showFeedback(message, type = "success") {
      ui.feedbackElement.textContent = message
      ui.feedbackElement.className = `voice-feedback ${type} visible`

      setTimeout(() => {
        ui.feedbackElement.classList.remove("visible")
      }, 2000)
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
      ui.commandsPanel.classList.toggle("visible")
      ui.settingsPanel.classList.remove("visible")

      if (ui.commandsPanel.classList.contains("visible") && gsap) {
        gsap.from(".voice-commands li", {
          opacity: 0,
          y: 10,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        })
      }
    }

    // Toggle settings panel
    function toggleSettingsPanel() {
      ui.settingsPanel.classList.toggle("visible")
      ui.commandsPanel.classList.remove("visible")

      if (ui.settingsPanel.classList.contains("visible") && gsap) {
        gsap.from(".voice-settings-option", {
          opacity: 0,
          y: 10,
          stagger: 0.1,
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
      if (continuousCheck) continuousCheck.checked = continuousMode

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

    // Settings button
    ui.settingsButton.addEventListener("click", (e) => {
      e.stopPropagation()
      toggleSettingsPanel()
    })

    // Close button for commands panel
    const closeCommandsButton = ui.commandsPanel.querySelector(".voice-commands-close")
    if (closeCommandsButton) {
      closeCommandsButton.addEventListener("click", () => {
        ui.commandsPanel.classList.remove("visible")
      })
    }

    // Close button for settings panel
    const closeSettingsButton = ui.settingsPanel.querySelector(".voice-settings-close")
    if (closeSettingsButton) {
      closeSettingsButton.addEventListener("click", () => {
        ui.settingsPanel.classList.remove("visible")
      })
    }

    // Hide panels when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !ui.commandsPanel.contains(e.target) &&
        !ui.helpButton.contains(e.target) &&
        !ui.settingsPanel.contains(e.target) &&
        !ui.settingsButton.contains(e.target)
      ) {
        ui.commandsPanel.classList.remove("visible")
        ui.settingsPanel.classList.remove("visible")
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

    // Discover commands on page load
    if (autoDiscover) {
      discoveredCommands = discoverPageCommands()
    }
  }

  // Start the voice control
  initVoiceControl()
})
