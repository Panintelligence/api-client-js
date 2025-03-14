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
}

/**
 * Output response for HTTP requests with enhanced utility methods
 */
class ApiClientOutput {
    constructor() {
        this.statusCode = 0;
        this.headers = {};
        this.body = null;
        this.exception = null;
    }

    /**
     * Determines if the request was successful based on status code
     *
     * @return {boolean} true if the request was successful (status 200-299), false otherwise
     */
    isSuccessful() {
        return this.exception === null && this.statusCode >= 200 && this.statusCode < 300;
    }

    /**
     * Gets the reason for failure if the request failed
     *
     * @return {string|null} The error message if an exception occurred, null otherwise
     */
    getFailureReason() {
        return this.exception ? this.exception.message : null;
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

        if (this.exception) {
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
     * @param {Error} error - The exception that occurred
     * @return {ApiClientOutput} A new ApiClientOutput with the exception set
     */
    static createForError(error) {
        const output = new ApiClientOutput();
        output.exception = error;
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

        // Convert headers from Response to a simple object
        const headers = {};
        response.headers.forEach((value, name) => {
            headers[name] = value;
        });
        output.headers = headers;

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
            output.exception = e;
            output.body = `Error reading response body: ${e.message}`;

            // Still try to get headers
            try {
                const headers = {};
                response.headers.forEach((value, name) => {
                    headers[name] = value;
                });
                output.headers = headers;
            } catch (headerError) {
                // If we can't get headers, just continue
            }

            return output;
        }
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
                    const errorOutput = ApiClientOutput.createForError(
                        new Error(`Failed to fetch stream. Status: ${response.status}`)
                    );
                    onFailure(errorOutput);
                    return;
                }

                onStart();

                reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullText = '';

                while (!failed) { // Check failed flag at the start of each iteration
                    const {value, done} = await reader.read();

                    if (done) {
                        const output = ApiClientOutput.createForSuccess(response, fullText);
                        onFinish(output);
                        break;
                    }

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
                // Release the reader if we have one and an error occurred
                if (reader && failed) {
                    try {
                        reader.releaseLock();
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
}