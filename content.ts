export {}

let isRecording = true // Initialize the flag to control recording

// Retrieve initial state from chrome.storage
chrome.storage.local.get(["isRecording"], (result) => {
  if (result.isRecording !== undefined) {
    isRecording = result.isRecording
  }
})

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message) {
    console.log("Message received from popup:", request.message)
    if (request.message === "pause") {
      isRecording = false // Stop recording keystrokes
    } else if (request.message === "play") {
      isRecording = true // Start recording keystrokes
    }
    chrome.storage.local.set({ isRecording })
  } else if (request.action === "recordTabData") {
    recordTabData() // Record tab data when instructed by the background script
  }
  return true
})

// Function to get the base URL without query parameters
function getBaseUrl(url: string): string {
  const urlObj = new URL(url)
  return urlObj.origin + urlObj.pathname
}

// Function to record the current tab data
function recordTabData(keystrokes: string = "") {
  console.log("Main Problem", isRecording)
  chrome.storage.local.get(["isRecording"], (result) => {
    console.log("ISRecording", isRecording, result.isRecording)
    if (!result.isRecording) return

    chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
      console.log("get response", response)
      const baseUrl = getBaseUrl(response.tab.url)
      const tabData = {
        url: baseUrl,
        title: response.tab.title,
        lastAccessed: response.tab.lastAccessed,
        keystrokes
      }
      console.log("here", tabData)
      // Retrieve existing keystrokes from Chrome storage
      chrome.storage.local.get({ keystrokes: [] }, (result) => {
        console.log("Previous keys", result)
        const keystrokesData = result.keystrokes
        const existingEntryIndex = keystrokesData.findIndex(
          (entry) => entry.url === tabData.url
        )
        console.log("Existing entry index", existingEntryIndex)
        if (existingEntryIndex !== -1) {
          // Update the existing entry
          keystrokesData[existingEntryIndex] = {
            ...keystrokesData[existingEntryIndex],
            ...tabData
          }
        } else {
          console.log("New entry", tabData)
          // Add the new tabData as a new entry
          keystrokesData.push(tabData)
        }
        console.log("Keystrokes", keystrokesData)
        // Save the updated keystrokes back to Chrome storage
        chrome.storage.local.set({ keystrokes: keystrokesData })
      })
    })
  })
}

// Record the current tab data when the content script loads, if recording is enabled
if (isRecording) {
  recordTabData()
}

// Handle keystrokes
document.addEventListener("input", (event) => {
  if (!isRecording) return // Check the flag before recording

  const inputElement = event.target as HTMLInputElement | HTMLElement
  const inputText =
    (inputElement as HTMLInputElement).value || inputElement.innerText || ""
  console.log("Input text", inputText)
  recordTabData(inputText)
})
