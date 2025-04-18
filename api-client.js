/**
 * Structured input body for chat completions API
 * Follows the format described in streaming-api-spec.md
 */
class ApiClientInputBody {
    constructor() {
        this.model = null;
        this.messages = [];
        this.stream = false;
        this.temperature = null;
        this.isSse = false; // Internal flag, not part of the actual request
    }

    /**
     * Creates a full completion request body
     *
     * @param {string|null} model - Model identifier or null to use default
     * @param {Array} messages - Array of message objects with role and content
     * @param {boolean} stream - Whether to stream the response
     * @param {number|null} temperature - Temperature value (0-1) or null for default
     * @return {ApiClientInputBody} The created input body
     */
    static chat(model, messages, stream, temperature) {
        const body = new ApiClientInputBody();
        body.model = model;
        body.messages = messages;
        body.stream = !!stream;
        body.temperature = temperature;
        return body;
    }

    /**
     * Creates an SSE completion request body (always streaming)
     *
     * @param {string|null} model - Model identifier or null to use default
     * @param {Array} messages - Array of message objects with role and content
     * @param {number|null} temperature - Temperature value (0-1) or null for default
     * @return {ApiClientInputBody} The created input body configured for SSE
     */
    static sse(model, messages, temperature) {
        const body = ApiClientInputBody.chat(model, messages, true, temperature);
        body.isSse = true;
        return body;
    }

    /**
     * Creates a simple completion request with a single user message
     *
     * @param {string} content - The user message content
     * @param {boolean} stream - Whether to stream the response
     * @return {ApiClientInputBody} The created input body
     */
    static chatMessage(content, stream) {
        return ApiClientInputBody.chat(
            null,
            [{role: "user", content}],
            stream,
            null
        );
    }

    /**
     * Converts the input body to a JSON-serializable object
     *
     * @return {Object} A JSON-serializable object
     */
    toJsonObject() {
        const result = {};

        if (this.model) result.model = this.model;
        if (this.messages && this.messages.length > 0) result.messages = this.messages;
        result.stream = this.stream;
        if (this.temperature !== null && this.temperature !== undefined) {
            result.temperature = this.temperature;
        }

        return result;
    }
}

/**
 * Input contract for HTTP requests
 */
class ApiClientInput {
    constructor() {
        this.url = '';
        this.method = '';
        this.body = null;
        this.headers = {};
    }

    /**
     * Creates an input object for any HTTP method
     *
     * @param {string} method - The HTTP method to use
     * @param {string} url - The URL to send the request to
     * @param {string|null} body - The body of the request
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput
     */
    static create(method, url, body, headers) {
        const input = new ApiClientInput();
        input.url = url;
        input.method = method;
        input.body = body;
        input.headers = headers || {};
        return input;
    }

    /**
     * Convenience factory method for GET requests
     *
     * @param {string} url - The URL to send the request to
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a GET request
     */
    static get(url, headers) {
        return ApiClientInput.create('GET', url, null, headers);
    }

    /**
     * Convenience factory method for POST requests
     *
     * @param {string} url - The URL to send the request to
     * @param {string} body - The body of the request
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a POST request
     */
    static post(url, body, headers) {
        return ApiClientInput.create('POST', url, body, headers);
    }

    /**
     * Convenience factory method for PUT requests
     *
     * @param {string} url - The URL to send the request to
     * @param {string} body - The body of the request
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a PUT request
     */
    static put(url, body, headers) {
        return ApiClientInput.create('PUT', url, body, headers);
    }

    /**
     * Convenience factory method for DELETE requests
     *
     * @param {string} url - The URL to send the request to
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a DELETE request
     */
    static delete(url, headers) {
        return ApiClientInput.create('DELETE', url, null, headers);
    }

    /**
     * Convenience factory method for PATCH requests
     *
     * @param {string} url - The URL to send the request to
     * @param {string} body - The body of the request
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a PATCH request
     */
    static patch(url, body, headers) {
        return ApiClientInput.create('PATCH', url, body, headers);
    }

    /**
     * Creates an input object for a JSON request
     *
     * @param {string} method - The HTTP method to use
     * @param {string} url - The URL to send the request to
     * @param {Object} jsonObject - The object to serialize as JSON
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a JSON request
     */
    static createJson(method, url, jsonObject, headers) {
        const jsonBody = JSON.stringify(jsonObject);
        const mergedHeaders = {'Content-Type': 'application/json', ...headers};
        return ApiClientInput.create(method, url, jsonBody, mergedHeaders);
    }

    /**
     * Convenience factory method for POST requests with JSON body
     *
     * @param {string} url - The URL to send the request to
     * @param {Object} jsonObject - The object to serialize as JSON
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a POST request with JSON
     */
    static postJson(url, jsonObject, headers) {
        return ApiClientInput.createJson('POST', url, jsonObject, headers);
    }

    /**
     * Convenience factory method for PUT requests with JSON body
     *
     * @param {string} url - The URL to send the request to
     * @param {Object} jsonObject - The object to serialize as JSON
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a PUT request with JSON
     */
    static putJson(url, jsonObject, headers) {
        return ApiClientInput.createJson('PUT', url, jsonObject, headers);
    }

    /**
     * Convenience factory method for PATCH requests with JSON body
     *
     * @param {string} url - The URL to send the request to
     * @param {Object} jsonObject - The object to serialize as JSON
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput for a PATCH request with JSON
     */
    static patchJson(url, jsonObject, headers) {
        return ApiClientInput.createJson('PATCH', url, jsonObject, headers);
    }

    /**
     * Creates an input object for a POST request with an ApiClientInputBody
     *
     * @param {string} url - The URL to send the request to
     * @param {ApiClientInputBody} inputBody - The input body object
     * @param {Object} headers - Headers for the request
     * @return {ApiClientInput} A new ApiClientInput configured for chat completions
     */
    static chat(url, inputBody, headers) {
        const mergedHeaders = {
            'Content-Type': 'application/json',
            ...(headers || {})
        };

        // Convert the inputBody to a JSON string
        const body = JSON.stringify(inputBody.toJsonObject());

        // Create the ApiClientInput
        const input = ApiClientInput.create('POST', url, body, mergedHeaders);

        // Store the original inputBody for reference during processing
        input.inputBody = inputBody;

        return input;
    }
}

/**
 * Output response for HTTP requests with enhanced utility methods
 */
class ApiClientOutput {
    constructor() {
        this.statusCode = 0;
        this.headers = {};
        this.body = null;
        this.error = null;
    }

    /**
     * Determines if the request was successful based on status code
     *
     * @return {boolean} true if the request was successful (status 200-299), false otherwise
     */
    isSuccessful() {
        return this.error === null && this.statusCode >= 200 && this.statusCode < 300;
    }

    /**
     * Gets the reason for failure if the request failed
     *
     * @return {string|null} The error message if an error occurred, null otherwise
     */
    getFailureReason() {
        return this.error ? this.error.message : null;
    }

    /**
     * Retrieves a specific header value
     *
     * @param {string} name - The name of the header to retrieve
     * @return {string|null} The header value, or null if the header doesn't exist
     */
    getHeader(name) {
        return this.headers[name] || null;
    }

    /**
     * Attempts to parse the response body as JSON, returning null if parsing fails
     *
     * @return {Object|null} The parsed JSON object or null if parsing fails
     */
    parseJsonBody() {
        try {
            // First try standard JSON parsing
            return JSON.parse(this.body);
        } catch (e) {
            try {
                // Handle case where body is wrapped in quotes and/or uses single quotes
                let processedBody = this.body;

                // If the string starts and ends with quotes, remove them
                if (
                    (processedBody.startsWith('"') && processedBody.endsWith('"')) ||
                    (processedBody.startsWith("'") && processedBody.endsWith("'"))
                ) {
                    processedBody = processedBody.slice(1, -1);
                }

                // Replace single quotes with double quotes, but only those used for object properties
                // This regex handles various forms of single-quoted properties
                processedBody = processedBody.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');

                // Also handle single-quoted values
                processedBody = processedBody.replace(/:\s*'([^']*?)'/g, ': "$1"');

                return JSON.parse(processedBody);
            } catch (innerError) {
                // If all parsing attempts fail, return null
                return null;
            }
        }
    }

    /**
     * Returns the response as a map for easier data access
     *
     * @return {Object} A map containing the status code, success flag, body, and error if any
     */
    asMap() {
        const result = {
            statusCode: this.statusCode,
            successful: this.isSuccessful(),
            body: this.body
        };

        if (this.error) {
            result.error = this.getFailureReason();
        }

        const contentType = this.getHeader('Content-Type');
        if (contentType && contentType.toLowerCase().includes('json')) {
            const jsonBody = this.parseJsonBody();
            if (jsonBody !== null) {
                result.json = jsonBody;
            }
        }

        return result;
    }

    /**
     * Creates an output object for an error
     *
     * @param {Error} error - The error that occurred
     * @return {ApiClientOutput} A new ApiClientOutput with the error set
     */
    static createForError(error) {
        const output = new ApiClientOutput();
        output.error = error;
        output.statusCode = 0; // Indicate a client-side error
        return output;
    }

    /**
     * Creates an output object for a successful response
     *
     * @param {Response} response - The fetch Response object
     * @param {string} body - The response body content
     * @return {ApiClientOutput} A new ApiClientOutput with success data
     */
    static createForSuccess(response, body) {
        const output = new ApiClientOutput();
        output.statusCode = response.status;
        output.body = body;
        output.headers = ApiClientOutput.createHeaders(response);
        return output;
    }

    /**
     * Creates an output object from a fetch Response
     *
     * @param {Response} response - The fetch Response object
     * @return {Promise<ApiClientOutput>} A Promise that resolves to a new ApiClientOutput
     */
    static async create(response) {
        try {
            const body = await response.text();
            return ApiClientOutput.createForSuccess(response, body);
        } catch (e) {
            const output = new ApiClientOutput();
            output.statusCode = response.status;
            output.headers = ApiClientOutput.createHeaders(response);
            output.error = e;
            output.body = `Error reading response body: ${e.message}`;
            return output;
        }
    }

    /**
     * Creates an output object for a response error
     *
     * @param {Response} response - The fetch Response object containing an error
     * @return {ApiClientOutput} A new ApiClientOutput with error information
     */
    static createResponseError(response) {
        const output = new ApiClientOutput();
        output.statusCode = response.status;
        output.headers = ApiClientOutput.createHeaders(response);
        try {
            output.error = {
                message: `Server returned ${response.status}`,
                type: 'http_error',
                code: response.status.toString()
            };
        } catch (headerError) {
            output.error = response['error'] || response;
        }

        return output;
    }

    static createHeaders(response) {
        const headers = {};
        try {
            response.headers.forEach((value, name) => {
                headers[name] = value;
            });
        } catch (ignore) {
        }
        return headers;
    }
}

/**
 * A utility class for making HTTP requests
 */
class ApiClient {
    /**
     * Performs an HTTP request
     *
     * @param {ApiClientInput} input - The input parameters for the request
     * @return {Promise<ApiClientOutput>} A Promise that resolves to the output response
     */
    static send(input) {
        return (async () => {
            try {
                const options = {
                    method: input.method,
                    headers: input.headers,
                    mode: 'cors'
                };

                // Add body for non-GET requests
                if (input.method !== 'GET' && input.body) {
                    options.body = input.body;
                }

                const response = await fetch(input.url, options);
                return await ApiClientOutput.create(response);
            } catch (e) {
                return ApiClientOutput.createForError(e);
            }
        })();
    }

    /**
     * Performs a streaming HTTP request
     *
     * @param {ApiClientInput} input - The input parameters for the request
     * @param {Function} onStart - Callback that runs before first chunk is received
     * @param {Function} onChunk - Callback that runs for each chunk of data
     * @param {Function} onFinish - Callback that runs when all data is received, returns ApiClientOutput
     * @param {Function} onFailure - Callback that runs if an error occurs, returns ApiClientOutput with error
     */
    static stream(input, onStart, onChunk, onFinish, onFailure) {
        (async () => {
            let failed = false;
            let reader = null;

            try {
                const options = {
                    method: input.method,
                    headers: input.headers,
                    mode: 'cors'
                };

                if (input.method !== 'GET' && input.body) {
                    options.body = input.body;
                }

                const response = await fetch(input.url, options);

                if (!response.ok || !response.body) {
                    failed = true;
                    const errorOutput = ApiClientOutput.createResponseError(response);
                    onFailure(errorOutput);
                    return;
                }

                onStart();

                reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullText = '';

                while (!failed) {
                    const record = await reader.read();
                    const isDone = ApiClient.isDone(record);

                    if (isDone) {
                        const output = ApiClientOutput.createForSuccess(response, fullText);
                        onFinish(output);
                        break;
                    }

                    const value = record.value;
                    if (!value) continue;

                    const chunk = decoder.decode(value, {stream: true});
                    fullText += chunk;
                    onChunk(chunk);
                }
            } catch (error) {
                if (!failed) {
                    failed = true;
                    const errorOutput = ApiClientOutput.createForError(error);
                    onFailure(errorOutput);
                }
            } finally {
                // Release the reader
                if (reader) {
                    try {
                        reader.releaseLock(); // Letting the stream be garbage collected 
                    } catch (e) {
                        // Ignore release errors
                    }
                }
            }
        })();
    }

    /**
     * Execute multiple requests in parallel
     *
     * @param {Array<ApiClientInput>} inputs - List of request inputs
     * @param {Function} onStart - Called before the batch begins processing
     * @param {Function} onUnit - Called for each completed request with ApiClientOutput (success or error)
     * @param {Function} onFinished - Called when all requests are complete with a summary ApiClientOutput
     * @param {Function} onFailure - Called if there's a failure in the batch process, returns ApiClientOutput with error
     * @return {Promise<Array<ApiClientOutput>>} A Promise that resolves to an array of outputs
     */
    static batchSendParallel(inputs, onStart, onUnit, onFinished, onFailure) {
        return (async () => {
            try {
                if (!inputs || inputs.length === 0) {
                    const emptyOutput = new ApiClientOutput();
                    emptyOutput.statusCode = 200;
                    emptyOutput.body = JSON.stringify([]);

                    onFinished(emptyOutput);
                    return [];
                }

                onStart();

                const promises = inputs.map(input =>
                    ApiClient.send(input).then(output => {
                        onUnit(output);
                        return output;
                    })
                );

                const results = await Promise.all(promises);

                // Create a batch summary output
                const batchOutput = new ApiClientOutput();
                batchOutput.statusCode = 200; // Assume success

                // Compile results into a structured batch response
                const responseData = {
                    total: results.length,
                    successful: results.filter(r => r.isSuccessful()).length,
                    failed: results.filter(r => !r.isSuccessful()).length,
                    results: results.map(r => r.asMap())
                };

                batchOutput.body = JSON.stringify(responseData);

                // Check if any requests failed
                if (responseData.failed > 0) {
                    batchOutput.statusCode = 207; // Multi-Status
                }

                onFinished(batchOutput);
                return results;
            } catch (error) {
                const errorOutput = ApiClientOutput.createForError(error);
                onFailure(errorOutput);
                throw error; // Re-throw for Promise rejection
            }
        })();
    }

    /**
     * Determines if a stream is completed based on the reader record
     *
     * @param {Object} record - The record from reader.read()
     * @return {boolean} true if the stream is done, false otherwise
     */
    static isDone(record) {
        if (record.done) return true; // Check if reader is done at network level
        if (!record.value) return false; // No value to process

        try {
            const chunk = new TextDecoder("utf-8").decode(record.value, {stream: true});
            if (chunk.includes('data: [DONE]')) return true; // Check for SSE end marker

            // Check for JSON stream completion marker
            if (chunk.includes('"done":true') || chunk.includes('"done": true')) {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.done === true) return true;
                    } catch (e) {
                        // Not valid JSON, continue
                    }
                }
            }
        } catch (e) {
            // Error processing chunk, assume not done
        }

        return false;
    }
}
