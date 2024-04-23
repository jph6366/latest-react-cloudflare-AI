import logo from './logo.svg';
import './App.css';import React, { useState, Suspense } from 'react';
import axios from 'axios';
import {parse} from 'marked';

const CloudflareAI = () => {
  const [uuid, setUuid] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [responseMessages, setResponseMessages] = useState([]);
  const apiUrl = "https://mindful-llama.kipper.workers.dev/";

  const setApiUrl = () => {
    const customUrl = prompt("Enter custom API URL: ");
    if (customUrl) {
      apiUrl = customUrl;
    }
  }

  const setIDSession = () => {
    const customUUID = prompt("Enter custom session ID: ");
    if (customUUID) {
      setUuid(customUUID);
    }
  }

  const generateUUID = () => {
    let newUUID = '';
    const chars = 'abcdef0123456789';
    for (let i = 0; i < 32; i++) {
      const charIndex = Math.floor(Math.random() * chars.length);
      newUUID += chars[charIndex];
      if (i === 7 || i === 11 || i === 15 || i === 19) {
        newUUID += '-';
      }
    }
    return newUUID;
  }

  const chat = async () => {
    const encodedInput = encodeURIComponent(inputValue);

    const userMessageDiv = <div className="user-message">{decodeURIComponent(encodedInput)}</div>;
    setResponseMessages([...responseMessages, userMessageDiv]);

    try {
      const response = await axios.get(`${apiUrl}/${uuid}?q=${encodedInput}`);
      const aiMessages = response.data[0].response.filter(message => message.role === 'system' && message.content.response);
      if (aiMessages.length > 0) {
        const lastAiMessage = aiMessages[aiMessages.length - 1];
        const aiMessageDiv = <div className="ai-message" dangerouslySetInnerHTML={{ __html: parse(lastAiMessage.content.response) }}></div>;
        setResponseMessages([...responseMessages, aiMessageDiv]);
      }

      setInputValue('');
    } catch (error) {
      console.log("Error receiving response:", error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleFormSubmit = (event) => {
    event.preventDefault();
    chat();
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chat();
    }
  }

  if (!uuid) {
    setUuid(generateUUID());
  }

  return (
    <>
      <h1>Cloudflare AI</h1>
      <div className="dropdown">
        <button className="dropbtn">Settings</button>
        <div className="dropdown-content">
          <a href="#" onClick={setApiUrl}>Custom API URL</a>
          <a href="#" onClick={setIDSession}>Custom ID Session</a>
        </div>
      </div>
      <div id="response">
        {responseMessages.map((message, index) => (
          <React.Fragment key={index}>
            {message}
          </React.Fragment>
        ))}
      </div>
      <form id="chatForm" onSubmit={handleFormSubmit}>
        <textarea id="input" type="text" placeholder="Send a message" value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown}></textarea>
        <button type="submit">➤</button>
      </form>
      <a className="fa fa-github github-icon" href="https://github.com/localuser-isback/Cloudflare-AI" style={{ fontSize: '36px' }}></a>
    </>
  );
}

const CloudflareAIWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CloudflareAI />
  </Suspense>
);

export default CloudflareAIWithSuspense;
