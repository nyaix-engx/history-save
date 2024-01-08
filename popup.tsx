import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

// import { Storage } from "@plasmohq/storage"

function IndexPopup() {
  const [data, setData] = useState([])
  const [timeInterval, setTimeInterval] = useStorage("history", [])

  const handlePlay = () => {
    setTimeInterval(timeInterval.concat([{ startTime: new Date() }]))
  }

  const handlePause = () => {
    if (timeInterval.length > 0) {
      const newArray = [...timeInterval]
      const updatedArray = newArray.map((data, i) => {
        if (i === newArray.length - 1) {
          return { ...data, endTime: new Date() }
        }
        return data
      })

      setTimeInterval(updatedArray)
    }
  }

  const handleStop = () => {
    console.log("showCount", timeInterval)
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
        }
      )
    }
  }

  return (
    <div>
      <div id="controls">
        <button id="playButton" onClick={handlePlay}>
          Play
        </button>
        <button id="pauseButton" onClick={handlePause}>
          Pause
        </button>
        <button id="stopButton" onClick={handleStop}>
          Stop
        </button>
      </div>
      {!!data.length && (
        <div id="historyList">
          <ul id="historyItems">
            {data.map((item, index) => (
              <li key={`${index}_i`}>{item.url}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
