# api-client-js

A lightweight, promise-based HTTP client for the browser with streaming support and batch processing capabilities.

## Features

- Simple, promise-based API for making HTTP requests
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- JSON request and response handling
- Streaming response processing
- Parallel batch request processing
- Chat completions API support (regular, JSON streaming, and SSE)
- Detailed response information with convenient utility methods
- Typed interfaces with TypeScript declarations
- Zero dependencies
- Works directly in the browser without bundling

## Installation

### Direct inclusion in HTML

```html
<script src="https://cdn.jsdelivr.net/gh/mingzilla/api-client-js@latest/api-client.js"></script>
```

#### TypeScript Support for Direct Inclusion

If you're using TypeScript with direct script inclusion, you can reference the type definitions in one of these ways:

1. **Download the definition file** and place it in your project, then reference it in your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "typeRoots": ["./typings", "./node_modules/@types"]
     }
   }
   ```

   And create a folder structure:
   ```
   your-project/
   ├── typings/
   │   └── api-client-js/
   │       └── index.d.ts  // Copy contents from api-client.d.ts
   ```

2. **Reference the declaration file directly** using a triple-slash directive:

   ```typescript
   /// <reference path="./typings/api-client.d.ts" />
   ```

3. **Use the CDN for the declaration file**:

   ```typescript
   // In your TypeScript file
   declare module 'api-client-js';
   // Then add a reference in your HTML
   // <script src="https://cdn.jsdelivr.net/gh/mingzilla/api-client-js@latest/api-client.js"></script>
   ```

### NPM

```bash
npm install @mingzilla/api-client-js
```

## Usage

### Basic Request

```javascript
// Make a simple GET request
ApiClient.send(ApiClientInput.get('https://api.example.com/data', {}))
  .then(response => {
    if (response.isSuccessful()) {
      const data = response.parseJsonBody();
      console.log('Response data:', data);
    } else {
      console.error('Request failed:', response.getFailureReason());
    }
  });

// POST with JSON body
const data = { name: 'Example', value: 42 };
ApiClient.send(ApiClientInput.postJson('https://api.example.com/data', data, {}))
  .then(response => {
    console.log('Status code:', response.statusCode);
    console.log('Response body:', response.body);
  });
```

### Streaming Response

```javascript
ApiClient.stream(
  ApiClientInput.get('https://api.example.com/stream', {}),
  () => console.log('Stream started'), // onStart
  (chunk) => console.log('Received chunk:', chunk), // onChunk
  (fullResponse) => console.log('Stream complete, full response:', fullResponse), // onFinish
  (error) => console.error('Stream error:', error.getFailureReason()) // onFailure
);
```

### Chat Completions API (Regular Request)

```javascript
// Create a chat input body
const chatBody = ApiClientInputBody.chat(
  'model-name', // Model identifier
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  false, // Not streaming
  0.7 // Temperature
);

// Send the chat request
ApiClient.send(ApiClientInput.chat('https://api.example.com/chat/completions', chatBody, {}))
  .then(response => {
    if (response.isSuccessful()) {
      const data = response.parseJsonBody();
      console.log('Assistant response:', data.message.content);
    } else {
      console.error('Chat request failed:', response.getFailureReason());
    }
  });
```

### Chat Completions API (JSON Streaming)

```javascript
// Create a streaming chat input body
const streamingChatBody = ApiClientInputBody.chat(
  'model-name', // Model identifier
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Write a short poem about coding.' }
  ],
  true, // Enable streaming
  0.7 // Temperature
);

let fullResponse = '';

// Send the streaming chat request
ApiClient.stream(
  ApiClientInput.chat('https://api.example.com/chat/completions', streamingChatBody, {}),
  () => console.log('Chat stream started'), // onStart
  (chunk) => {
    try {
      // Each chunk is a JSON object with a message fragment
      const jsonChunk = JSON.parse(chunk);
      if (jsonChunk.message && jsonChunk.message.content) {
        const content = jsonChunk.message.content;
        fullResponse += content;
        console.log('Received content:', content);
      }
    } catch (e) {
      console.warn('Failed to parse chunk as JSON:', chunk);
    }
  }, // onChunk
  (response) => {
    console.log('Chat stream complete, full response:', fullResponse);
  }, // onFinish
  (error) => console.error('Chat stream error:', error.getFailureReason()) // onFailure
);
```

### Chat Completions API (Server-Sent Events)

```javascript
// Create an SSE chat input body (streaming is always enabled for SSE)
const sseChatBody = ApiClientInputBody.sse(
  'model-name', // Model identifier
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain how SSE works.' }
  ],
  0.7 // Temperature
);

let sseResponse = '';
let eventSource = null;

// For SSE, we'll use the browser's EventSource API
function startSSEStream() {
  // First, prepare the request by converting the input body to JSON
  const requestBody = sseChatBody.toJsonObject();
  
  // Create URL with parameters for GET request
  const params = new URLSearchParams();
  params.append('request', JSON.stringify(requestBody));
  
  // Create and configure EventSource
  eventSource = new EventSource(`https://api.example.com/chat/sse?${params.toString()}`);
  
  // Handle incoming messages
  eventSource.onmessage = (event) => {
    if (event.data === '[END]') {
      console.log('SSE stream ended');
      eventSource.close();
      console.log('Complete SSE response:', sseResponse);
    } else {
      try {
        const jsonData = JSON.parse(event.data);
        if (jsonData.message && jsonData.message.content) {
          const content = jsonData.message.content;
          sseResponse += content;
          console.log('SSE chunk:', content);
        }
      } catch (e) {
        console.warn('Failed to parse SSE data:', event.data);
      }
    }
  };
  
  // Handle errors
  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    eventSource.close();
  };
}

// Start the SSE stream
startSSEStream();

// To stop the stream manually
function stopSSEStream() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
```

### Parallel Batch Requests

```javascript
const requests = [
  ApiClientInput.get('https://api.example.com/data/1', {}),
  ApiClientInput.get('https://api.example.com/data/2', {}),
  ApiClientInput.get('https://api.example.com/data/3', {})
];

ApiClient.batchSendParallel(
  requests,
  () => console.log('Batch started'), // onStart
  (response) => console.log('Completed request:', response.statusCode), // onUnit
  (batchResult) => console.log('All requests complete:', batchResult.parseJsonBody()), // onFinished
  (error) => console.error('Batch error:', error.getFailureReason()) // onFailure
);
```

## API Reference

### ApiClientInputBody

Factory class for creating chat completion request bodies.

#### Static Methods

- `chat(model, messages, stream, temperature)`: Create a chat completion request body
- `sse(model, messages, temperature)`: Create an SSE chat completion request body
- `chatMessage(content, stream)`: Create a simple chat completion with a single user message

### ApiClientInput

Factory class for creating HTTP request inputs.

#### Static Methods

- `create(method, url, body, headers)`: Create a request with specified parameters
- `get(url, headers)`: Create a GET request
- `post(url, body, headers)`: Create a POST request
- `put(url, body, headers)`: Create a PUT request
- `delete(url, headers)`: Create a DELETE request
- `patch(url, body, headers)`: Create a PATCH request
- `createJson(method, url, jsonObject, headers)`: Create a request with a JSON body
- `postJson(url, jsonObject, headers)`: Create a POST request with a JSON body
- `putJson(url, jsonObject, headers)`: Create a PUT request with a JSON body
- `patchJson(url, jsonObject, headers)`: Create a PATCH request with a JSON body
- `chat(url, inputBody, headers)`: Create a chat completions request

### ApiClientOutput

Class representing HTTP response outputs with utility methods.

#### Properties

- `statusCode`: HTTP status code
- `headers`: Response headers
- `body`: Response body as string
- `error`: Error object if request failed

#### Methods

- `isSuccessful()`: Returns true if request was successful (status 200-299)
- `getFailureReason()`: Returns error message if request failed
- `getHeader(name)`: Get a specific header value
- `parseJsonBody()`: Parse response body as JSON (returns null if invalid)
- `asMap()`: Return response data as a convenient map

### ApiClient

Static utility class for making HTTP requests.

#### Methods

- `send(input)`: Make an HTTP request
- `stream(input, onStart, onChunk, onFinish, onFailure)`: Make a streaming HTTP request
- `batchSendParallel(inputs, onStart, onUnit, onFinished, onFailure)`: Execute multiple requests in parallel
- `isDone(record)`: Determines if a stream is completed based on reader record from fetch API

## License

MIT

## Author

Ming Huang (mingzilla)
