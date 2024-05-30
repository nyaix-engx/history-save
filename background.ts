// export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "inputChanged") {
//     chrome.storage.local.get({ keystrokes: [] }, (result) => {
//       const keystrokes = result.keystrokes
//       keystrokes.push({
//         key: message.value,
//         url: message.url
//       })
//       chrome.storage.local.set({ keystrokes })
//     })
//   }
// })

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "inputChanged") {
//     chrome.storage.local.get({ keystrokes: {} }, (result) => {
//       let keystrokes = result.keystrokes

//       keystrokes[message.url] = message.value
//       console.log("Keystrokes", keystrokes)
//       // Save the updated keystrokes array
//       chrome.storage.local.set({ keystrokes })
//     })
//   }
// })

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     chrome.runtime.sendMessage({ tab })
//   })
// })

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete") {
//     chrome.runtime.sendMessage({ tab })
//   }
// })

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCurrentTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      sendResponse({ url: tab.url, title: tab.title })
    })
    return true // Keep the message channel open for sendResponse
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendMessageToContentScript") {
    // Send message to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { message: request.status })
      })
    })
  }
})
