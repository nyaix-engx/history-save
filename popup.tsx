import React, { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "./popup.css"

import { useEffect } from "react"

type Keystroke = {
  key: string
  url: string
  timestamp: string
}

function Some() {
  const [timeInterval, setTimeInterval] = useStorage("timeInterval", [])
  const [history, setHistory] = useStorage("userHistory", [])
  const [userDetails, setUserDetails] = useStorage("userDetails", {
    name: "",
    email: "",
    isEmailValid: false
  })
  const [isActive, setIsActive] = useStorage("activeButton", "play")
  const [isStopClicked, setIsStopClicked] = useStorage("stopClicked", false)
  const [showHistory, setShowHistory] = useStorage("showHistory", false)
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([])
  const [currentTab, setCurrentTab] = useState(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)

  console.log("history", history)
  // console.log("Current tab", currentTab)
  console.log("Initial Recording", isRecording)
  console.log("Keystrokes", keystrokes)
  useEffect(() => {
    // Load keystrokes from local storage when the popup opens

    chrome.storage.local.get({ keystrokes: [] }, (result) => {
      // console.log("IsActive", isActive)
      if (isActive === "pause") setKeystrokes(result.keystrokes)
    })
  }, [isActive])

  useEffect(() => {
    // Get the initial recording status from storage
    chrome.storage.local.get(["isRecording"], (result) => {
      if (result.isRecording !== undefined) {
        setIsRecording(result.isRecording)
      }
    })
  }, [])
  // useEffect(() => {
  //   // Retrieve keystrokes from Chrome storage
  //   chrome.storage.local.get({ keystrokes: [] }, (result) => {
  //     setKeystrokes(result.keystrokes);
  //   });
  // }, []);

  const sendMessage = (message) => {
    chrome.runtime.sendMessage({
      action: "sendMessageToContentScript",
      message
    })
  }

  const toggleRecording = () => {
    const newStatus = !isRecording

    setIsRecording(newStatus)
    // Set the new recording status in storage
    chrome.storage.local.set({ isRecording: newStatus }, () => {
      console.log("Recording status set to", newStatus)
    })
    // Optionally send a message to the content script to notify about the change
    chrome.runtime.sendMessage({
      action: "sendMessageToContentScript",
      status: newStatus ? "play" : "pause"
    })
  }

  // const sendMessage = (status) => {
  //   chrome.runtime.sendMessage({
  //     action: "sendMessageToContentScript",
  //     status
  //   })
  // }

  useEffect(() => {
    // Fetch the current tab initially
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab) {
        setCurrentTab(tab)
      }
    })

    // Listen for messages from the background script
    const handleMessage = (message) => {
      if (message.tab) {
        setCurrentTab(message.tab)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    // Cleanup the listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const mergeHistory = () =>
    history.map(
      ({ url, title, id, lastVisitTime, visitCount, typedCount }) => ({
        url,
        id,
        lastVisitTime,
        visitCount,
        typedCount,
        title,
        inputValue: keystrokes[url] || ""
      })
    )

  const handlePlay = () => {
    setIsActive("pause")
    // sendMessage("play")
    toggleRecording()
    setIsStopClicked(false)
    setShowHistory(false)
    setTimeInterval(
      timeInterval.concat([{ startTime: new Date().toUTCString() }])
    )
  }

  const handlePause = () => {
    setIsActive("play")
    // sendMessage("pause")
    toggleRecording()

    setIsStopClicked(true)
    setShowHistory(false)
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
    setIsStopClicked(false)
    setShowHistory(true)
    setHistory((prevData) => [...prevData, ...keystrokes])
  }

  const handleSubmit = () => {
    setKeystrokes([])
    const newHistory = mergeHistory()
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(newHistory))
    const dlAnchorElem = document.createElement("a")
    dlAnchorElem.setAttribute("href", dataStr)
    dlAnchorElem.setAttribute("download", `${userDetails.email}.json`)
    document.body.appendChild(dlAnchorElem) // required for firefox
    dlAnchorElem.click()
    dlAnchorElem.remove()
    setHistory([])
    chrome.storage.local.clear(function () {
      console.log("Local storage cleared successfully.")
    })
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
    setHistory((prevHistory) => prevHistory.filter((item, i) => i !== index))
  }

  return (
    <div className="container">
      {userDetails.isEmailValid ? (
        <div className="container">
          <div className="heading-text">{getHeading()}</div>
          <div className="control-buttons">
            {isActive === "play" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px"
                }}>
                <button
                  className="play-button"
                  id="playButton"
                  onClick={handlePlay}
                />
                <button
                  className="submit-button"
                  onClick={() => setUserDetails({})}>
                  Reset Details
                </button>
              </div>
            ) : (
              <button
                className="pause-button"
                id="pauseButton"
                onClick={handlePause}
              />
            )}
          </div>
          {/* {!isStopEnabled() && ( */}
          {isStopClicked && (
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

          {history && !!history.length && (
            <div className="history-list">
              <ul className="history-items">
                {history.map((item, index) => (
                  <li className="item" key={`${index}_i`}>
                    <a
                      href={item.url}
                      onClick={() =>
                        navigator.clipboard.writeText(item.inputValue)
                      }>
                      {item.title}
                    </a>
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

          {history && !!history.length && showHistory && (
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
      ) : (
        <div>
          <input
            type="text"
            value={userDetails.name}
            placeholder="Enter your user name"
            onChange={(event) =>
              setUserDetails((prev) => ({ ...prev, name: event.target.value }))
            }
            className="inputText"
          />
          {/* input for taking email */}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const emailRegex =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              if (emailRegex.test(userDetails.email)) {
                setUserDetails((prev) => ({ ...prev, isEmailValid: true }))
              } else {
                setUserDetails((prev) => ({ ...prev, isEmailValid: false }))
              }
            }}>
            <input
              className={`inputText ${
                userDetails.isEmailValid ? "" : "error-input"
              }`}
              type="email"
              placeholder="Enter your email"
              value={userDetails.email}
              onChange={(event) =>
                setUserDetails((prev) => ({
                  ...prev,
                  email: event.target.value
                }))
              }
            />
            <button className="submit-form" type="submit">
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Some
