export {}

let isRecording = true // Initialize the flag to control recording

// Retrieve initial state from chrome.storage
chrome.storage.local.get(["isRecording"], (result) => {
  // console.log("Present IsRecoding value", result.isRecording)

  if (result.isRecording !== undefined) {
    isRecording = result.isRecording
    // console.log("Recording check", isRecording)
  }
})

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received from popup:", request.message)

  if (request.message) {
    if (request.message === "pause") {
      isRecording = false // Stop recording keystrokes
      chrome.storage.local.set({ isRecording })
    } else if (request.message === "play") {
      isRecording = true // Start recording keystrokes
      chrome.storage.local.set({ isRecording })
    }
  }
  // console.log("Setting IsRecording", isRecording)

  return true
})

// Handle keystrokes
document.addEventListener("input", (event) => {
  // console.log("IsRecording", isRecording)
  if (!isRecording) return // Check the flag before recording

  const inputElement = event.target as HTMLInputElement | HTMLElement
  const inputText =
    (inputElement as HTMLInputElement).value || inputElement.innerText || ""

  // Get the current tab URL
  chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
    const tabData = {
      url: response.url,
      title: response.title,
      keystrokes: inputText
    }

    // Retrieve existing keystrokes from Chrome storage
    chrome.storage.local.get({ keystrokes: [] }, (result) => {
      const keystrokes = result.keystrokes
      const existingEntryIndex = keystrokes.findIndex(
        (entry) => entry.url === tabData.url
      )

      if (existingEntryIndex !== -1) {
        // Append the new keystroke to the existing entry
        keystrokes[existingEntryIndex] = tabData
      } else {
        // Add the new tabData as a new entry
        keystrokes.push(tabData)
      }
      console.log("Keystokes", keystrokes)
      // Save the updated keystrokes back to Chrome storage
      chrome.storage.local.set({ keystrokes })
    })
  })
})
