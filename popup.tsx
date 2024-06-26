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

  // console.log("Key", keystrokes)

  useEffect(() => {
    // Load keystrokes from local storage when the popup opens
    chrome.storage.local.get({ keystrokes: [] }, (result) => {
      setKeystrokes(result.keystrokes)
    })
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
    setIsStopClicked(false)
    setShowHistory(false)
    setTimeInterval(
      timeInterval.concat([{ startTime: new Date().toUTCString() }])
    )
  }

  const getCurrentTab = async () => {
    let queryOptions = { active: true, lastFocusedWindow: true }
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions)
    return tab
  }

  // console.log({ history })
  // console.log({ timeInterval })
  // console.log({ urlInputMap })

  const handlePause = () => {
    setIsActive("play")
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
    // setIsPaused(true)
    // console.log("showCount", timeInterval)
    for (let i = 0; i < timeInterval.length; i++) {
      let x = Math.floor(new Date(timeInterval[i].startTime).getTime())
      let y = Math.floor(new Date(timeInterval[i].endTime).getTime())
      // console.log({ x })
      // console.log({ y })
      chrome.history.search(
        {
          text: "",
          startTime: x,
          endTime: y
        },
        // if (
        //     (Object.entries(historyItems).length === 0 &&
        //       typeof data === "object") ||
        //     Object.entries(data).length > 0
        //   ) {
        //     let temp = []
        //     console.log("__>", data)
        //     if (data.length > 0) {
        //       for (const [key, value] of Object.entries(data)) {
        //         temp.push(value)
        //       }
        //       console.log("temp", temp)
        //       return [...temp, ...historyItems]
        //     } else {
        //       getCurrentTab()
        //         .then((data) => {
        //           console.log("tabinfo", data)
        //           const temp = []
        //           const obj = {
        //             url: data.url,
        //             id: data.id,
        //             lastVisitTime: data.lastAccessed,
        //             visitCount: "",
        //             typedCount: "",
        //             title: data.title
        //           }
        //           temp.push(obj)
        //           return [...temp, ...historyItems]
        //         })
        //         .catch((err) => console.log(err))
        //     }
        //   } else {
        //     console.log("here")
        //     return [...historyItems]
        //   }
        function (historyItems) {
          setHistory((data) => {
            console.log({ data })
            console.log({ historyItems })
            if (
              Object.entries(historyItems).length > 0 &&
              Object.entries(data).length == 0
            ) {
              return [...historyItems]
            } else if (
              Object.entries(historyItems).length > 0 &&
              Object.entries(data).length > 0
            ) {
              let temp = []
              // console.log("here")
              for (const [key, value] of Object.entries(data)) {
                temp.push(value)
              }
              return [...temp, ...historyItems]
            } else if (Object.entries(historyItems).length === 0) {
              getCurrentTab()
                .then((data) => {
                  // console.log("tabinfo", data)
                  const temp = []
                  const obj = {
                    url: data.url,
                    id: data.id,
                    lastVisitTime: data.lastAccessed,
                    visitCount: "",
                    typedCount: "",
                    title: data.title
                  }
                  console.log("Obj", obj)
                  temp.push(obj)
                  return [...temp, ...historyItems]
                })
                .catch((err) => console.log(err))
            }
          })
        }
      )

      setTimeInterval([])
    }
  }

  const handleSubmit = () => {
    // console.log("Submit")
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
    setHistory(newHistory)
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
