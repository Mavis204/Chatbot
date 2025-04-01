document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector("#send-btn");

  let userMessage = null;
  const inputInitHeight = chatInput.scrollHeight;

  const API_KEY = "PUT YOUR API KEY HERE";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

  // Chat history to improve response context
  const chatHistory = [
    {
      role: "user",
      parts: [
        { text: "PUT YOUR SYSTEM INSTRUCTIONS HERE", 
        }
      ]
    },
    {
      role: "user",
      parts: [
        { text: "how to enroll at icps" }
      ]
    },
  // PUT THE REST OF YOUR CHAT HISTORY HERE
  ];
  

  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048  
  };
  

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    return chatLi;
  };

  const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory, generationConfig })
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
      let botMessage = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');  // Links
      messageElement.innerHTML = botMessage;
      chatHistory.push({ role: "model", parts: [{ text: botMessage }] });

      
      if (chatHistory.length > 5) chatHistory.shift();
    } catch (error) {
      messageElement.classList.add("error");
      messageElement.textContent = error.message;
    } finally {
      chatbox.scrollTo(0, chatbox.scrollHeight);
    }
  };

  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(incomingChatLi);
    }, 600);
  };

  chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      handleChat();
    }
  });

  sendChatBtn.addEventListener("click", handleChat);
  closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
