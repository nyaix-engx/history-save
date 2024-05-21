export {}

console.log("========> Hello from content.ts")
// Attach the input event listener
document.addEventListener("input", function (event) {
  // Your event handling code here
  // For example, send a message to the background script with the input value
  const inputElement = event.target
  const inputText = inputElement.innerText || inputElement.value || ""
  console.log("==> inside content", inputText)

  chrome.runtime.sendMessage({
    action: "inputChanged",
    value: inputText,
    url: window.location.href
  })
})
