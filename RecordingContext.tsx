import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react"

import { useStorage } from "@plasmohq/storage/hook"

interface RecordingContextProps {
  isRecording: boolean
  setIsRecording: (isRecording: boolean) => void
}

const RecordingContext = createContext<RecordingContextProps | undefined>(
  undefined
)

export const RecordingProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [isRecording, setIsRecording] = useStorage<boolean>("useStorage", false)
  console.log("isRecording", Date.now())
  //   useEffect(() => {
  //     // Get the initial recording status from storage
  //     chrome.storage.local.get(["isRecording"], (result) => {
  //       if (result.isRecording !== undefined) {
  //         setIsRecording(result.isRecording)
  //       }
  //     })
  //   }, [])

  //   useEffect(() => {
  //     // Save the recording status to storage whenever it changes
  //     chrome.storage.local.set({ isRecording })
  //   }, [isRecording])

  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  )
}

export const useRecording = (): RecordingContextProps => {
  const context = useContext(RecordingContext)
  if (!context) {
    throw new Error("useRecording must be used within a RecordingProvider")
  }
  return context
}
