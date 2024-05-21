import { useStorage } from "@plasmohq/storage/hook"

import "./styles.css"

import React, { useEffect, useState } from "react"

function Some() {
  const [timeInterval, setTimeInterval] = useStorage("timeInterval", [])
  const [history, setHistory] = useStorage("userHistory", [])
  const [isActive, setIsActive] = useStorage("activeButton", "play")
  const [inputValue, setInputValue] = useState("")
  const [urlInputMap, setUrlInputMap] = useStorage("urlInputMap", {})
  const [isStopClicked, setIsStopClicked] = useStorage("stopClicked", false)
  const [showHistory, setShowHistory] = useStorage("showHistory", false)

  useEffect(() => {
    const handleInput = (event) => {
      console.log({ event })
      if (!showHistory) {
        const inputElement = event.target
        const inputText = inputElement.innerText || inputElement.value || ""
        setInputValue(inputText)
        // Update the input value for the current URL
        const currentUrl = window.location.href
        setUrlInputMap((prevMap) => ({
          ...prevMap,
          [currentUrl]: inputText
        }))
      }
    }
    document.addEventListener("input", handleInput)
    return () => {
      document.removeEventListener("input", handleInput)
    }
  }, [showHistory])

  const handlePlay = () => {
    setIsActive("pause")
    setIsStopClicked(false)
    setShowHistory(false)
    setTimeInterval(
      timeInterval.concat([{ startTime: new Date().toUTCString() }])
    )
  }

  console.log({ history })
  console.log({ urlInputMap })

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

  const mergeHistory = () =>
    history.map(
      ({ url, title, id, lastVisitTime, visitCount, typedCount }) => ({
        url,
        id,
        lastVisitTime,
        visitCount,
        typedCount,
        title,
        inputValue: urlInputMap[url] || ""
      })
    )

  const handleSubmit = () => {
    console.log("called")

    const newHistory = mergeHistory()
    console.log({ newHistory })
    setHistory(newHistory)
    setHistory([])
    setUrlInputMap({})
  }

  const getHeading = () => {
    switch (isActive) {
      case "play":
        return "Click the play button to start recording history"

      case "pause":
        return "History recording is in progress"
    }
  }

  const handleDelete = (url) => {
    setHistory((prevHistory) => {
      const updatedHistory = { ...prevHistory }
      delete updatedHistory[url] // Remove the history item
      return updatedHistory
    })

    setUrlInputMap((prevMap) => {
      const updatedMap = { ...prevMap }
      delete updatedMap[url] // Remove the corresponding entry from urlInputMap
      return updatedMap
    })
  }

  const pulseAnimation = `
  @keyframes pulse {
    0% {
      box-shadow: 0px 0px 5px 0px rgba(173, 0, 0, 0.3);
    }
    65% {
      box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0.3);
    }
    90% {
      box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0);
    }
  }
`

  return (
    (isActive as "pause") == "pause" && (
      <>
        <style>{pulseAnimation}</style>
        <div
          style={{
            animationName: "pulse",
            animationDuration: "1.5s",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            width: "15px",
            height: "15px",
            fontSize: 0,
            backgroundColor: "red",
            border: 0,
            borderRadius: "15px",
            position: "fixed",
            bottom: "20px",
            right: "20px"
          }}></div>
      </>
    )
  )
}

export default Some
