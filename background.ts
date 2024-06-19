export {}

// console.log(
//   "Live now; make now always the most precious time. Now will never come again."
// )

// // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //   if (message.action === "inputChanged") {
// //     chrome.storage.local.get({ keystrokes: [] }, (result) => {
// //       const keystrokes = result.keystrokes
// //       keystrokes.push({
// //         key: message.value,
// //         url: message.url
// //       })
// //       chrome.storage.local.set({ keystrokes })
// //     })
// //   }
// // })

// // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //   if (message.action === "inputChanged") {
// //     chrome.storage.local.get({ keystrokes: {} }, (result) => {
// //       let keystrokes = result.keystrokes

// //       keystrokes[message.url] = message.value
// //       console.log("Keystrokes", keystrokes)
// //       // Save the updated keystrokes array
// //       chrome.storage.local.set({ keystrokes })
// //     })
// //   }
// // })

// // chrome.tabs.onActivated.addListener((activeInfo) => {
// //   chrome.tabs.get(activeInfo.tabId, (tab) => {
// //     chrome.runtime.sendMessage({ tab })
// //   })
// // })

// // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
// //   if (changeInfo.status === "complete") {
// //     chrome.runtime.sendMessage({ tab })
// //   }
// // })

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "getCurrentTab") {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const tab = tabs[0]
//       sendResponse({ url: tab.url, title: tab.title })
//     })
//     return true // Keep the message channel open for sendResponse
//   }
// })

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "sendMessageToContentScript") {
//     // Send message to all tabs
//     chrome.tabs.query({}, (tabs) => {
//       tabs.forEach((tab) => {
//         chrome.tabs.sendMessage(tab.id, { message: request.status })
//       })
//     })
//   }
// })

// // background.js
// chrome.action.onClicked.addListener((tab) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const currentTab = tabs[0];
//     if (currentTab) {
//       console.log('Current tab URL:', currentTab.url);
//       // Do something with the current tab's data
//     }
//   });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCurrentTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      sendResponse({ tab })
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

// Function to send a message to all tabs to record tab data
function notifyTabsToRecordData() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "recordTabData" })
      }
    })
  })
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "recordTabData" })
  }
})

// Listen for tab activations
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "recordTabData" })
    }
  })
})

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "recordTabData" })
      }
    })
  }
})
