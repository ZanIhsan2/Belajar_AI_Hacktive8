const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let conversation = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Append user message to chat box
  appendMessage("user", userMessage);

  // Add to conversation history
  conversation.push({ role: "user", text: userMessage });

  // Clear input
  input.value = "";

  // Show thinking message
  const thinkingMsg = appendMessage("bot", "Thinking...");

  try {
    // Send POST request to backend
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result) {
      // Replace thinking message with AI response
      thinkingMsg.textContent = data.result;
      // Add to conversation history
      conversation.push({ role: "model", text: data.result });
    } else {
      // No result received
      thinkingMsg.textContent = "Sorry, no response received.";
    }
  } catch (error) {
    console.error("Error:", error);
    // Replace thinking message with error message
    thinkingMsg.textContent = "Failed to get response from server.";
  }

  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  return msg; // Return the element for potential replacement
}
