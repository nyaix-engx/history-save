// import React, { useEffect, useState } from "react"

// const ContentScript = () => {
//   const [isRecording, setIsRecording] = useState(true)
//   const [clickCount, setClickCount] = useState(0)
//   const [scrollPercentage, setScrollPercentage] = useState(0)
//   const [startTime, setStartTime] = useState(Date.now())
//   const [copyData, setCopyData] = useState<string[]>([])

//   useEffect(() => {
//     // Get the initial recording status from Chrome storage
//     chrome.storage.local.get(["isRecording"], (result) => {
//       if (result.isRecording !== undefined) {
//         setIsRecording(result.isRecording)
//       }
//     })

//     // Listen for messages from the background script
//     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//       if (request.message) {
//         // console.log("Message received from popup:", request.message)
//         if (request.message === "pause") {
//           setIsRecording(false)
//         } else if (request.message === "play") {
//           setIsRecording(true)
//           setStartTime(Date.now()) // Reset start time when resuming recording
//         }
//         chrome.storage.local.set({ isRecording: isRecording })
//       } else if (request.action === "recordTabData") {
//         recordTabData("") // Record tab data when instructed by the background script
//       }
//       return true
//     })

//     const handleBeforeUnload = (event) => {
//       event.preventDefault()
//       console.log("I'm being called")
//       if (isRecording) {
//         const endTime = Date.now()
//         const timeSpent = endTime - startTime

//         recordTabData("", {
//           timeSpent,
//           clickCount,
//           scrollPercentage,
//           copyData
//         })
//       }
//     }

//     const handleMouseClick = () => {
//       if (isRecording) {
//         setClickCount((prevCount) => prevCount + 1)
//       }
//     }

//     const handleScroll = () => {
//       if (isRecording) {
//         const scrolled =
//           (window.scrollY /
//             (document.documentElement.scrollHeight - window.innerHeight)) *
//           100
//         setScrollPercentage(scrolled)
//       }
//     }

//     const handleCopy = (event: ClipboardEvent) => {
//       if (isRecording && event.clipboardData) {
//         const copiedText = event.clipboardData.getData("text")
//         // console.log("Copied text:", copiedText) // Logging copied text
//         if (copiedText) {
//           setCopyData((prevData) => [...prevData, copiedText])
//         }
//       }
//     }

//     window.addEventListener("beforeunload", handleBeforeUnload)
//     document.addEventListener("click", handleMouseClick)
//     document.addEventListener("scroll", handleScroll)
//     document.addEventListener("copy", handleCopy)

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload)
//       document.removeEventListener("click", handleMouseClick)
//       document.removeEventListener("scroll", handleScroll)
//       document.removeEventListener("copy", handleCopy)
//     }
//   }, [isRecording, startTime, clickCount, scrollPercentage, copyData])

//   const recordTabData = (keystrokes: string, additionalData: object = {}) => {
//     // console.log("Main Problem", isRecording)
//     chrome.storage.local.get(["isRecording"], (result) => {
//       // console.log("ISRecording", isRecording, result.isRecording)
//       if (!result.isRecording) return

//       chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
//         // console.log("get response", response)
//         const tabData = {
//           url: response.tab.url.split("?")[0],
//           title: response.tab.title,
//           lastAccessed: response.tab.lastAccessed,
//           keystrokes,
//           ...additionalData
//         }
//         // console.log("here", tabData)
//         // Retrieve existing keystrokes from Chrome storage
//         chrome.storage.local.get({ keystrokes: [] }, (result) => {
//           // console.log("Previous keys", result)
//           const keystrokesData = result.keystrokes
//           const existingEntryIndex = keystrokesData.findIndex(
//             (entry) => entry.url === tabData.url
//           )
//           // console.log("Existing entry index", existingEntryIndex)
//           if (existingEntryIndex !== -1) {
//             // Update the existing entry
//             keystrokesData[existingEntryIndex] = {
//               ...keystrokesData[existingEntryIndex],
//               ...tabData
//             }
//           } else {
//             // console.log("New entry", tabData)
//             // Add the new tabData as a new entry
//             keystrokesData.push(tabData)
//           }
//           // console.log("Keystrokes", keystrokesData)
//           // Save the updated keystrokes back to Chrome storage
//           chrome.storage.local.set({ keystrokes: keystrokesData })
//         })
//       })
//     })
//   }

//   useEffect(() => {
//     // Record the current tab data when the content script loads, if recording is enabled
//     if (isRecording) {
//       recordTabData("")
//     }

//     // Handle keystrokes
//     const handleInput = (event: Event) => {
//       if (!isRecording) return // Check the flag before recording

//       const inputElement = event.target as HTMLInputElement | HTMLElement
//       const inputText =
//         (inputElement as HTMLInputElement).value || inputElement.innerText || ""
//       // console.log("Input text", inputText)
//       recordTabData(inputText)
//     }

//     document.addEventListener("input", handleInput)

//     return () => {
//       document.removeEventListener("input", handleInput)
//     }
//   }, [isRecording])

//   return null
// }

// import React, { useEffect, useState } from "react"
// import ReactDOM from "react-dom"

// const ContentScript = () => {
//   const [isRecording, setIsRecording] = useState(true)
//   const [clickCount, setClickCount] = useState(0)
//   const [scrollPercentage, setScrollPercentage] = useState(0)
//   const [copyData, setCopyData] = useState<string[]>([])
//   const [keystrokes, setKeystrokes] = useState("")
//   const [startTime, setStartTime] = useState<number>(Date.now())
//   const [timeSpent, setTimeSpent] = useState(0)
//   const [activeTabId, setActiveTabId] = useState<string | null>(null)
//   const [pasteData, setPasteData] = useState<string[]>([])

//   console.log("Start Time", startTime)

//   useEffect(() => {
//     chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
//       const tabId = response.tab.id
//       if (tabId) setActiveTabId(tabId)
//     })
//   }, [])

//   useEffect(() => {
//     // Retrieve initial state from chrome.storage
//     chrome.storage.local.get(["isRecording"], (result) => {
//       if (result.isRecording !== undefined) {
//         setIsRecording(result.isRecording)
//       }
//     })
//     // Listen for messages from the background script
//     const messageListener = (request: any, sender: any, sendResponse: any) => {
//       if (request.message) {
//         if (request.message === "pause") {
//           setIsRecording(false)
//         } else if (request.message === "play") {
//           setIsRecording(true)
//         }
//         chrome.storage.local.set({ isRecording: request.message === "play" })
//       } else if (request.action === "recordTabData") {
//         recordTabData()
//       }
//       return true
//     }

//     chrome.runtime.onMessage.addListener(messageListener)

//     // Handle keystrokes
//     const handleInput = (event: Event) => {
//       if (!isRecording) return
//       const inputElement = event.target as HTMLInputElement | HTMLElement
//       const inputText =
//         (inputElement as HTMLInputElement).value || inputElement.innerText || ""
//       setKeystrokes(inputText)
//       recordTabData(inputText, {})
//     }

//     // Capture click events
//     const handleClick = () => {
//       if (isRecording) setClickCount((prevCount) => prevCount + 1)
//       recordTabData("", { clickCount })
//     }

//     // Capture scroll events
//     const handleScroll = () => {
//       if (!isRecording) return
//       const scrollTop =
//         document.documentElement.scrollTop || document.body.scrollTop
//       const scrollHeight =
//         document.documentElement.scrollHeight || document.body.scrollHeight
//       const percentage = (scrollTop / (scrollHeight - window.innerHeight)) * 100
//       setScrollPercentage(percentage)
//       recordTabData("", { scrollPercentage: percentage })
//     }

//     // Capture copy-paste events
//     const handleCopy = async (event: ClipboardEvent) => {
//       if (isRecording && event.clipboardData) {
//         const clipboardContents = await navigator.clipboard.read()

//         for (const item of clipboardContents) {
//           for (const mimeType of item.types) {
//             if (mimeType === "text/plain") {
//               const blob = await item.getType("text/plain")
//               const blobText = await blob.text()
//               if (blobText) {
//                 setCopyData((prevData) => [...prevData, blobText])
//                 recordTabData("", {
//                   copyData: [...copyData, blobText]
//                 })
//               }
//             } else {
//               throw new Error(`${mimeType} not supported.`)
//             }
//           }
//         }
//       }
//     }

//     const handlePaste = (event: ClipboardEvent) => {
//       if (!isRecording) return
//       const pastedText = event.clipboardData?.getData("text") || ""
//       setPasteData((prevData) => [...prevData, pastedText])
//       recordTabData("", { pasteData })
//     }

//     const handleBeforeUnload = () => {
//       if (isRecording) {
//         const currentTimeSpent = Date.now() - startTime
//         setTimeSpent(currentTimeSpent)
//         setStartTime(Date.now())
//         recordTabData("", { timeSpent: currentTimeSpent })
//       }
//     }

//     const handleVisibilityChange = () => {
//       // console.log("DOcument", document.visibilityState)
//       if (document.visibilityState === "hidden") {
//         console.log("Tab hidden")
//         const currentTimeSpent = Date.now() - startTime
//         console.log("Current Time spent", currentTimeSpent)

//         setTimeSpent(currentTimeSpent)
//         recordTabData("", { timeSpent: currentTimeSpent })
//       } else {
//         console.log("Tab Visible")
//         setStartTime(Date.now())
//       }
//     }

//     document.addEventListener("input", handleInput)
//     document.addEventListener("click", handleClick)
//     document.addEventListener("scroll", handleScroll)
//     document.addEventListener("copy", handleCopy)
//     document.addEventListener("paste", handlePaste)

//     window.addEventListener("beforeunload", handleBeforeUnload)
//     document.addEventListener("visibilitychange", handleVisibilityChange)

//     // Cleanup
//     return () => {
//       // clearInterval(intervalId)
//       chrome.runtime.onMessage.removeListener(messageListener)
//       // document.removeEventListener("input", handleInput)
//       document.removeEventListener("click", handleClick)
//       document.removeEventListener("scroll", handleScroll)
//       document.removeEventListener("copy", handleCopy)
//       window.removeEventListener("beforeunload", handleBeforeUnload)
//       document.removeEventListener("paste", handlePaste)

//       document.removeEventListener("visibilitychange", handleVisibilityChange)
//     }
//   }, [
//     isRecording,
//     clickCount,
//     scrollPercentage,
//     copyData,
//     keystrokes,
//     startTime,
//     activeTabId
//   ])

//   const recordTabData = (
//     keystrokes: string = "",
//     additionalData: object = {}
//   ) => {
//     // console.log("Record data", additionalData)
//     chrome.storage.local.get(["isRecording"], (result) => {
//       if (!result.isRecording) return

//       chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
//         const tabData = {
//           url:
//             new URL(response.tab.url).origin +
//             new URL(response.tab.url).pathname,
//           title: response.tab.title,
//           lastAccessed: response.tab.lastAccessed,
//           keystrokes,
//           ...additionalData
//         }

//         chrome.storage.local.get({ keystrokes: [] }, (result) => {
//           const keystrokesData = result.keystrokes
//           const existingEntryIndex = keystrokesData.findIndex(
//             (entry) => entry.url === tabData.url
//           )
//           if (existingEntryIndex !== -1) {
//             keystrokesData[existingEntryIndex] = {
//               ...keystrokesData[existingEntryIndex],
//               ...tabData,
//               timeSpent:
//                 (keystrokesData[existingEntryIndex].timeSpent || 0) +
//                 (additionalData.timeSpent || 0)
//             }
//           } else {
//             keystrokesData.push({
//               ...tabData,
//               timeSpent: additionalData.timeSpent || 0
//             })
//           }
//           chrome.storage.local.set({ keystrokes: keystrokesData })
//         })
//       })
//     })
//   }

//   return null // No UI component needed
// }

// const ContentScript = () => {
//   const [isRecording, setIsRecording] = useState(true)
//   const [keystrokes, setKeystrokes] = useState<string[]>([])
//   const [clickCount, setClickCount] = useState(0)
//   const [scrollPercentage, setScrollPercentage] = useState(0)
//   const [copyData, setCopyData] = useState<string[]>([])
//   const [pasteData, setPasteData] = useState<string[]>([])

//   // Retrieve initial state from chrome.storage
//   useEffect(() => {
//     chrome.storage.local.get(["isRecording"], (result) => {
//       console.log("Use Effect", result.isRecording)
//       if (result.isRecording !== undefined) {
//         setIsRecording(result.isRecording)
//       }
//     })
//   }, [])

//   // Function to record the current tab data
//   const recordTabData = (
//     inputKeystrokes: string = "",
//     additionalData: object = {}
//   ) => {
//     console.log({ inputKeystrokes })
//     console.log({ additionalData })
//     chrome.storage.local.get(["isRecording"], (result) => {
//       console.log("Record tab data", result.isRecording)

//       if (!result.isRecording) return

//       chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
//         const tabData = {
//           url: response.tab.url.split("?")[0],
//           title: response.tab.title,
//           lastAccessed: response.tab.lastAccessed,
//           keystrokes: inputKeystrokes,
//           ...additionalData
//         }

//         chrome.storage.local.get({ keystrokes: [] }, (result) => {
//           const keystrokesData = result.keystrokes
//           const existingEntryIndex = keystrokesData.findIndex(
//             (entry: any) => entry.url === tabData.url
//           )

//           if (existingEntryIndex !== -1) {
//             keystrokesData[existingEntryIndex] = {
//               ...keystrokesData[existingEntryIndex],
//               ...tabData,
//               scrollPercentage: getScrollPercentage(
//                 keystrokesData[existingEntryIndex]?.scrollPercentage,
//                 tabData
//               ),
//               keystrokes: tabData.keystrokes
//                 ? tabData.keystrokes
//                 : keystrokesData[existingEntryIndex].keystrokes
//             }
//           } else {
//             keystrokesData.push(tabData)
//           }
//           console.log({ keystrokesData })

//           chrome.storage.local.set({ keystrokes: keystrokesData })
//         })
//       })
//     })
//   }

//   const getScrollPercentage = (existingScroll, tabData) => {
//     if (existingScroll) {
//       if (
//         tabData?.scrollPercentage &&
//         tabData?.scrollPercentage > existingScroll
//       ) {
//         return tabData?.scrollPercentage
//       }
//       return existingScroll
//     } else {
//       return tabData?.scrollPercentage
//     }
//   }

//   // Listen for messages from the background script
//   useEffect(() => {
//     const messageListener = (request: any, sender: any, sendResponse: any) => {
//       if (request.message) {
//         if (request.message === "pause") {
//           setIsRecording(false)
//         } else if (request.message === "play") {
//           setIsRecording(true)
//         }
//         chrome.storage.local.set({ isRecording })
//       } else if (request.action === "recordTabData") {
//         recordTabData()
//       }
//       return true
//     }

//     chrome.runtime.onMessage.addListener(messageListener)

//     return () => {
//       chrome.runtime.onMessage.removeListener(messageListener)
//     }
//   }, [isRecording])

//   // Record the current tab data when the content script loads, if recording is enabled
//   // useEffect(() => {
//   //   if (isRecording) {
//   //     recordTabData()
//   //   }
//   // }, [isRecording])

//   // Handle keystrokes
//   useEffect(() => {
//     const handleInput = (event: Event) => {
//       console.log("handleInput", isRecording)
//       if (!isRecording) return

//       const inputElement = event.target as HTMLInputElement | HTMLElement
//       const inputText =
//         (inputElement as HTMLInputElement).value || inputElement.innerText || ""
//       setKeystrokes((prevKeystrokes) => [...prevKeystrokes, inputText])
//       recordTabData(inputText)
//     }

//     // Capture click events
//     const handleClick = () => {
//       console.log("handleclick", isRecording)

//       if (isRecording) setClickCount((prevCount) => prevCount + 1)
//       recordTabData("", { clickCount })
//     }

//     // Capture scroll events
//     const handleScroll = () => {
//       console.log("handlescroll", isRecording)

//       if (!isRecording) return

//       const scrollTop =
//         document.documentElement.scrollTop || document.body.scrollTop
//       const scrollHeight =
//         document.documentElement.scrollHeight || document.body.scrollHeight
//       const clientHeight =
//         document.documentElement.clientHeight || window.innerHeight

//       let percentage = 0
//       if (scrollHeight <= clientHeight) {
//         percentage = 100 // No scroll
//       } else {
//         percentage = (scrollTop / (scrollHeight - clientHeight)) * 100
//       }

//       setScrollPercentage(percentage)
//       recordTabData("", { scrollPercentage: percentage })
//     }

//     // Capture copy-paste events
//     const handleCopy = async (event: ClipboardEvent) => {
//       console.log("handlecopy", isRecording)

//       if (isRecording && event.clipboardData) {
//         const clipboardContents = await navigator.clipboard.read()

//         for (const item of clipboardContents) {
//           for (const mimeType of item.types) {
//             if (mimeType === "text/plain") {
//               const blob = await item.getType("text/plain")
//               const blobText = await blob.text()
//               console.log("Copy", blobText)
//               if (blobText) {
//                 setCopyData((prevData) => [...prevData, blobText])
//                 recordTabData("", {
//                   copyData: [...copyData, blobText]
//                 })
//               }
//             } else {
//               throw new Error(`${mimeType} not supported.`)
//             }
//           }
//         }
//       }
//     }

//     const handlePaste = async (event: ClipboardEvent) => {
//       console.log("handlepaste", isRecording)

//       if (!isRecording) return
//       try {
//         const clipboardContents = await navigator.clipboard.read()
//         for (const item of clipboardContents) {
//           for (const mimeType of item.types) {
//             if (mimeType === "text/plain") {
//               const blob = await item.getType("text/plain")
//               const blobText = await blob.text()
//               console.log({ blobText })
//               setPasteData((prevData) => [...prevData, blobText])
//               recordTabData("", {
//                 pasteData: [...pasteData, blobText]
//               })
//             } else {
//               throw new Error(`${mimeType} not supported.`)
//             }
//           }
//         }
//       } catch (error) {
//         console.log(error.message)
//       }
//     }

//     document.addEventListener("input", handleInput)
//     document.addEventListener("click", handleClick)
//     document.addEventListener("scroll", handleScroll)
//     document.addEventListener("copy", handleCopy)
//     document.addEventListener("paste", handlePaste)
//     return () => {
//       document.removeEventListener("input", handleInput)
//       document.removeEventListener("click", handleClick)
//       document.removeEventListener("scroll", handleScroll)
//       document.removeEventListener("copy", handleCopy)
//       document.removeEventListener("paste", handlePaste)
//     }
//   }, [isRecording, clickCount, scrollPercentage, copyData])

//   return null
// }

// const mountNode = document.createElement("div")
// document.body.appendChild(mountNode)
// ReactDOM.render(<ContentScript />, mountNode)

import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

import { RecordingProvider, useRecording } from "./RecordingContext"

const ContentScript: React.FC = () => {
  const { isRecording, setIsRecording } = useRecording()
  const [keystrokes, setKeystrokes] = useState<string[]>([])
  const [clickCount, setClickCount] = useState(0)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [copyData, setCopyData] = useState<string[]>([])
  const [pasteData, setPasteData] = useState<string[]>([])
  const [startTime, setStartTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)
  console.log("Had hai bhe")
  const recordTabData = (
    inputKeystrokes: string = "",
    additionalData: object = {}
  ) => {
    console.log("Record Tab Data", isRecording)
    if (!isRecording) return

    chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
      console.log("Resposne", response)
      const tabData = {
        url: response.tab.url,
        title: response.tab.title,
        active: response.tab.active,
        audible: response.tab.audible,
        autoDiscardable: response.tab.autoDiscardable,
        discarded: response.tab.discarded,
        groupId: response.tab.groupId,
        height: response.tab.height,
        highlighted: response.tab.highlighted,
        incognito: response.tab.incognito,
        index: response.tab.index,
        openerTabId: response.tab.openerTabId,
        pinned: response.tab.pinned,
        selected: response.tab.selected,
        status: response.tab.status,
        width: response.tab.width,
        windowId: response.tab.windowId,
        id: response.tab.id,
        lastAccessed: response.tab.lastAccessed,
        keystrokes: inputKeystrokes,
        ...additionalData
      }

      chrome.storage.local.get({ keystrokes: [] }, (result) => {
        const keystrokesData = result.keystrokes
        const existingEntryIndex = keystrokesData.findIndex(
          (entry: any) => entry.url === tabData.url
        )

        if (existingEntryIndex !== -1) {
          keystrokesData[existingEntryIndex] = {
            ...keystrokesData[existingEntryIndex],
            ...tabData,
            scrollPercentage: getScrollPercentage(
              keystrokesData[existingEntryIndex]?.scrollPercentage,
              tabData
            ),
            keystrokes: tabData.keystrokes
              ? tabData.keystrokes
              : keystrokesData[existingEntryIndex].keystrokes
          }
        } else {
          keystrokesData.push(tabData)
        }

        chrome.storage.local.set({ keystrokes: keystrokesData })
      })
    })
  }

  const getScrollPercentage = (existingScroll, tabData) => {
    if (existingScroll) {
      if (
        tabData?.scrollPercentage &&
        tabData?.scrollPercentage > existingScroll
      ) {
        return tabData?.scrollPercentage
      }
      return existingScroll
    } else {
      return tabData?.scrollPercentage
    }
  }

  useEffect(() => {
    const messageListener = (request: any, sender: any, sendResponse: any) => {
      // if (request.message) {
      //   if (request.message === "pause") {
      //     setIsRecording(false)
      //   } else if (request.message === "play") {
      //     setIsRecording(true)
      //   }
      // } else
      if (request.action === "recordTabData") {
        recordTabData()
      }
      return true
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [isRecording])

  useEffect(() => {
    const handleInput = (event: Event) => {
      console.log("HandleInput", isRecording)

      if (!isRecording) return

      const inputElement = event.target as HTMLInputElement | HTMLElement
      const inputText =
        (inputElement as HTMLInputElement).value || inputElement.innerText || ""
      setKeystrokes((prevKeystrokes) => [...prevKeystrokes, inputText])
      recordTabData(inputText)
    }

    const handleClick = () => {
      console.log("handle click", isRecording)

      if (isRecording) setClickCount((prevCount) => prevCount + 1)
      recordTabData("", { clickCount })
    }

    const handleScroll = () => {
      console.log("Handle Scroll", isRecording)

      if (!isRecording) return

      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight

      let percentage = 0
      if (scrollHeight <= clientHeight) {
        percentage = 100
      } else {
        percentage = (scrollTop / (scrollHeight - clientHeight)) * 100
      }

      setScrollPercentage(percentage)
      recordTabData("", { scrollPercentage: percentage })
    }

    const handleVisibilityChange = () => {
      console.log("handleVisibilityChange", isRecording)

      if (document.visibilityState === "hidden") {
        console.log("Tab hidden")
        const currentTimeSpent = Date.now() - startTime
        console.log("Current Time spent", currentTimeSpent)

        setTimeSpent(currentTimeSpent)
        recordTabData("", { timeSpent: currentTimeSpent })
      } else {
        console.log("Tab Visible")
        setStartTime(Date.now())
      }
    }

    const handleBeforeUnload = () => {
      console.log("handleBeforeunload", isRecording)
      if (isRecording) {
        const currentTimeSpent = Date.now() - startTime
        setTimeSpent(currentTimeSpent)
        setStartTime(Date.now())
        recordTabData("", { timeSpent: currentTimeSpent })
      }
    }

    const handleCopy = async (event: ClipboardEvent) => {
      console.log("handlecopy", isRecording)

      if (isRecording && event.clipboardData) {
        const clipboardContents = await navigator.clipboard.read()

        for (const item of clipboardContents) {
          for (const mimeType of item.types) {
            if (mimeType === "text/plain") {
              const blob = await item.getType("text/plain")
              const blobText = await blob.text()
              if (blobText) {
                setCopyData((prevData) => [...prevData, blobText])
                recordTabData("", { copyData: [...copyData, blobText] })
              }
            } else {
              throw new Error(`${mimeType} not supported.`)
            }
          }
        }
      }
    }

    const handlePaste = async (event: ClipboardEvent) => {
      console.log("handlePaste", isRecording)

      if (!isRecording) return
      try {
        const clipboardContents = await navigator.clipboard.read()
        for (const item of clipboardContents) {
          for (const mimeType of item.types) {
            if (mimeType === "text/plain") {
              const blob = await item.getType("text/plain")
              const blobText = await blob.text()
              setPasteData((prevData) => [...prevData, blobText])
              recordTabData("", { pasteData: [...pasteData, blobText] })
            } else {
              throw new Error(`${mimeType} not supported.`)
            }
          }
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    document.addEventListener("input", handleInput)
    document.addEventListener("click", handleClick)
    document.addEventListener("scroll", handleScroll)
    document.addEventListener("copy", handleCopy)
    document.addEventListener("paste", handlePaste)
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("input", handleInput)
      document.removeEventListener("click", handleClick)
      document.removeEventListener("scroll", handleScroll)
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("paste", handlePaste)
    }
  }, [isRecording, clickCount, scrollPercentage, copyData])

  return null
}

const mountNode = document.createElement("div")
document.body.appendChild(mountNode)
ReactDOM.render(
  <RecordingProvider>
    <ContentScript />
  </RecordingProvider>,
  mountNode
)
