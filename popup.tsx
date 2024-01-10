import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "./popup.css"

function IndexPopup() {
  const [data, setData] = useState([])
  const [timeInterval, setTimeInterval] = useStorage("timeInterval", [])
  const [history, setHistory] = useStorage("userHistory", [])
  const [isActive, setIsActive] = useStorage("activeButton", "play")

  const handlePlay = () => {
    setIsActive("pause")
    setTimeInterval(
      timeInterval.concat([{ startTime: new Date().toUTCString() }])
    )
  }

  console.log("HistoryItems", history)
  console.log("TimeInterval", timeInterval)

  const handlePause = () => {
    setIsActive("play")
    if (timeInterval.length > 0) {
      const newArray = [...timeInterval]
      const updatedArray = newArray.map((data, i) => {
        if (i === newArray.length - 1) {
          return { ...data, endTime: new Date().toUTCString() }
        }
        return data
      })

      setTimeInterval(updatedArray)
    }
  }

  const handleStop = () => {
    console.log("showCount", timeInterval)
    for (let i = 0; i < timeInterval.length; i++) {
      let x = Math.floor(new Date(timeInterval[i].startTime).getTime())
      let y = Math.floor(new Date(timeInterval[i].endTime).getTime())
      chrome.history.search(
        {
          text: "",
          startTime: x,
          endTime: y
        },
        function (historyItems) {
          setHistory((data) => {
            return [...data, ...historyItems]
          })
        }
      )
      setTimeInterval([])
    }
  }

  const isStopEnabled = () => {
    if (timeInterval.length > 0) {
      for (let i = 0; i < timeInterval.length; i++) {
        if (Object.entries(timeInterval[i]).length != 2) return true
      }
      return false
    }
    return true
  }

  const handleSubmit = () => {
    setHistory([])
  }

  const getHeading = () => {
    switch (isActive) {
      case "play":
        return "Click the play button to start recording history"

      case "pause":
        return "History recording is in progress"
    }
  }

  const handleDelete = (index) => {
    setHistory((data) => {
      return data.filter((item, i) => {
        if (i !== index) return item
      })
    })
  }

  return (
    <div className="container">
      <div className="heading-text">{getHeading()}</div>
      <div className="control-buttons">
        {isActive === "play" ? (
          <button
            className="play-button"
            id="playButton"
            onClick={handlePlay}
          />
        ) : (
          <button
            className="pause-button"
            id="pauseButton"
            onClick={handlePause}
          />
        )}
      </div>
      {!isStopEnabled() && (
        <div className="save-history-wrapper">
          <div className="save-history-title">
            Click here to save the history
          </div>
          <button
            className="stop-button"
            id="stopButton"
            onClick={handleStop}
          />
        </div>
      )}

      {!!history.length && (
        <div className="history-list">
          <ul className="history-items">
            {history.map((item, index) => (
              <li className="item" key={`${index}_i`}>
                <a href={item.url}>{item.title}</a>
                <div
                  className="close-icon-wrapper"
                  onClick={() => handleDelete(index)}>
                  <img
                    className="close-icon"
                    src={require("./assets/close.png")}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!history.length && (
        <div className="submit-button-wrapper">
          <div className="submit-title">
            Click the button below to submit the history
          </div>
          <button
            className="submit-button"
            id="submitButton"
            onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
