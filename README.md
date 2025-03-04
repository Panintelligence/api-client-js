# api-client-js

A lightweight, promise-based HTTP client for the browser with streaming support and batch processing capabilities.

## Features

- Simple, promise-based API for making HTTP requests
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- JSON request and response handling
- Streaming response processing
- Parallel batch request processing
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
      const data = response.safeParseJsonBody();
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
  (batchResult) => console.log('All requests complete:', batchResult.safeParseJsonBody()), // onFinished
  (error) => console.error('Batch error:', error.getFailureReason()) // onFailure
);
```

## API Reference

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

### ApiClientOutput

Class representing HTTP response outputs with utility methods.

#### Properties

- `statusCode`: HTTP status code
- `headers`: Response headers
- `body`: Response body as string
- `exception`: Error object if request failed

#### Methods

- `isSuccessful()`: Returns true if request was successful (status 200-299)
- `getFailureReason()`: Returns error message if request failed
- `getHeader(name)`: Get a specific header value
- `parseJsonBody()`: Parse response body as JSON (throws if invalid)
- `safeParseJsonBody()`: Parse response body as JSON (returns null if invalid)
- `asMap()`: Return response data as a convenient map

### ApiClient

Static utility class for making HTTP requests.

#### Methods

- `send(input)`: Make an HTTP request
- `stream(input, onStart, onChunk, onFinish, onFailure)`: Make a streaming HTTP request
- `batchSendParallel(inputs, onStart, onUnit, onFinished, onFailure)`: Execute multiple requests in parallel

## License

MIT

## Author

Ming Huang (mingzilla)
