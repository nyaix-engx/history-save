let timeInterval = []
let count = 0
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startSavingHistory") {
    sendResponse({ message: "History saving started" })
    timeInterval.push({ startTime: new Date() })
  } else if (message.type === "pauseSavingHistory") {
    if (timeInterval.length > 0) {
      timeInterval[timeInterval.length - 1].endTime = new Date()
    }
    sendResponse({ message: "History saving paused" })
  } else if (message.type === "stopSavingHistory") {
    console.log("Received message to stop saving history", timeInterval)
    for (let i = 0; i < timeInterval.length; i++) {
      let x = Math.floor(timeInterval[i].startTime.getTime())
      let y = Math.floor(timeInterval[i].endTime.getTime())
      chrome.history.search(
        {
          text: "",
          startTime: x,
          endTime: y
        },
        function (historyItems) {
          console.log("background", historyItems)
          sendResponse({
            message: "History saving stopped",
            data: historyItems,
            count: count + 1
          })
        }
      )
    }
    return true
  }
})
