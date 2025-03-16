// TypeScript declaration file for api-client.js

/**
 * Structured input body for chat completions API
 * Follows the format described in streaming-api-spec.md
 */
declare class ApiClientInputBody {
    model: string | null;
    messages: Array<{ role: string; content: string }>;
    stream: boolean;
    temperature: number | null;
    isSse: boolean; // Internal flag, not part of the actual request

    constructor();

    /**
     * Creates a full completion request body
     *
     * @param model - Model identifier or null to use default
     * @param messages - Array of message objects with role and content
     * @param stream - Whether to stream the response
     * @param temperature - Temperature value (0-1) or null for default
     * @return The created input body
     */
    static chat(
        model: string | null,
        messages: Array<{ role: string; content: string }>,
        stream: boolean,
        temperature: number | null
    ): ApiClientInputBody;

    /**
     * Creates an SSE completion request body (always streaming)
     *
     * @param model - Model identifier or null to use default
     * @param messages - Array of message objects with role and content
     * @param temperature - Temperature value (0-1) or null for default
     * @return The created input body configured for SSE
     */
    static sse(
        model: string | null,
        messages: Array<{ role: string; content: string }>,
        temperature: number | null
    ): ApiClientInputBody;

    /**
     * Creates a simple completion request with a single user message
     *
     * @param content - The user message content
     * @param stream - Whether to stream the response
     * @return The created input body
     */
    static chatMessage(content: string, stream: boolean): ApiClientInputBody;

    /**
     * Converts the input body to a JSON-serializable object
     *
     * @return A JSON-serializable object
     */
    toJsonObject(): Record<string, any>;
}

/**
 * Input contract for HTTP requests
 */
declare class ApiClientInput {
    url: string;
    method: string;
    body: string | null;
    headers: Record<string, string>;
    inputBody?: ApiClientInputBody;

    constructor();

    /**
     * Creates an input object for any HTTP method
     *
     * @param method - The HTTP method to use
     * @param url - The URL to send the request to
     * @param body - The body of the request
     * @param headers - Headers for the request
     * @return A new ApiClientInput
     */
    static create(method: string, url: string, body: string | null, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for GET requests
     */
    static get(url: string, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for POST requests
     */
    static post(url: string, body: string, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for PUT requests
     */
    static put(url: string, body: string, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for DELETE requests
     */
    static delete(url: string, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for PATCH requests
     */
    static patch(url: string, body: string, headers: Record<string, string>): ApiClientInput;

    /**
     * Creates an input object for a JSON request
     */
    static createJson<T = any>(method: string, url: string, jsonObject: T, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for POST requests with JSON body
     */
    static postJson<T = any>(url: string, jsonObject: T, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for PUT requests with JSON body
     *
     * @param url - The URL to send the request to
     * @param jsonObject - The object to serialize as JSON
     * @param headers - Headers for the request
     * @return A new ApiClientInput for a PUT request with JSON
     */
    static putJson<T = any>(url: string, jsonObject: T, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for PATCH requests with JSON body
     *
     * @param url - The URL to send the request to
     * @param jsonObject - The object to serialize as JSON
     * @param headers - Headers for the request
     * @return A new ApiClientInput for a PATCH request with JSON
     */
    static patchJson<T = any>(url: string, jsonObject: T, headers: Record<string, string>): ApiClientInput;

    /**
     * Creates an input object for a POST request with an ApiClientInputBody
     *
     * @param url - The URL to send the request to
     * @param inputBody - The input body object
     * @param headers - Headers for the request
     * @return A new ApiClientInput configured for chat completions
     */
    static chat(url: string, inputBody: ApiClientInputBody, headers: Record<string, string>): ApiClientInput;
}

/**
 * Output response for HTTP requests with enhanced utility methods
 */
declare class ApiClientOutput {
    statusCode: number;
    headers: Record<string, string>;
    body: string | null;
    error: Error | null;

    constructor();

    /**
     * Determines if the request was successful based on status code
     *
     * @return true if the request was successful (status 200-299), false otherwise
     */
    isSuccessful(): boolean;

    /**
     * Gets the reason for failure if the request failed
     *
     * @return The error message if an error occurred, null otherwise
     */
    getFailureReason(): string | null;

    /**
     * Retrieves a specific header value
     *
     * @param name - The name of the header to retrieve
     * @return The header value, or null if the header doesn't exist
     */
    getHeader(name: string): string | null;

    /**
     * Attempts to parse the response body as JSON, returning null if parsing fails
     *
     * @return The parsed JSON object or null if parsing fails
     */
    parseJsonBody<T = any>(): T | null;

    /**
     * Returns the response as a map for easier data access
     *
     * @return A map containing the status code, success flag, body, and error if any
     */
    asMap(): {
        statusCode: number;
        successful: boolean;
        body: string | null;
        error?: string;
        json?: any;
    };

    /**
     * Creates an output object for an error
     *
     * @param error - The error that occurred
     * @return A new ApiClientOutput with the error set
     */
    static createForError(error: Error): ApiClientOutput;

    /**
     * Creates an output object for a successful response
     *
     * @param response - The fetch Response object
     * @param body - The response body content
     * @return A new ApiClientOutput with success data
     */
    static createForSuccess(response: Response, body: string): ApiClientOutput;

    /**
     * Creates an output object from a fetch Response
     *
     * @param response - The fetch Response object
     * @return A Promise that resolves to a new ApiClientOutput
     */
    static create(response: Response): Promise<ApiClientOutput>;

    /**
     * Creates an output object for a response error
     *
     * @param response - The fetch Response object containing an error
     * @return A new ApiClientOutput with error information
     */
    static createResponseError(response: Response): ApiClientOutput;

    /**
     * Creates a headers object from a Response object
     *
     * @param response - The Response object to extract headers from
     * @return An object containing the headers
     */
    static createHeaders(response: Response): Record<string, string>;
}

/**
 * A utility class for making HTTP requests
 */
declare class ApiClient {
    /**
     * Performs an HTTP request
     *
     * @param input - The input parameters for the request
     * @return A Promise that resolves to the output response
     */
    static send(input: ApiClientInput): Promise<ApiClientOutput>;

    /**
     * Performs a streaming HTTP request
     *
     * @param input - The input parameters for the request
     * @param onStart - Callback that runs before first chunk is received
     * @param onChunk - Callback that runs for each chunk of data
     * @param onFinish - Callback that runs when all data is received, returns ApiClientOutput
     * @param onFailure - Callback that runs if an error occurs, returns ApiClientOutput with error
     */
    static stream(
        input: ApiClientInput,
        onStart: () => void,
        onChunk: (chunk: string) => void,
        onFinish: (output: ApiClientOutput) => void,
        onFailure: (errorOutput: ApiClientOutput) => void
    ): void;

    /**
     * Execute multiple requests in parallel
     *
     * @param inputs - List of request inputs
     * @param onStart - Called before the batch begins processing
     * @param onUnit - Called for each completed request with ApiClientOutput (success or error)
     * @param onFinished - Called when all requests are complete with a summary ApiClientOutput
     * @param onFailure - Called if there's a failure in the batch process, returns ApiClientOutput with error
     * @return A Promise that resolves to an array of outputs
     */
    static batchSendParallel(
        inputs: ApiClientInput[],
        onStart: () => void,
        onUnit: (output: ApiClientOutput) => void,
        onFinished: (batchOutput: ApiClientOutput) => void,
        onFailure: (errorOutput: ApiClientOutput) => void
    ): Promise<ApiClientOutput[]>;

    /**
     * Determines if a stream is completed based on the reader record
     *
     * @param record - The record from reader.read()
     * @return true if the stream is done, false otherwise
     */
    static isDone(record: { done: boolean; value?: Uint8Array }): boolean;
}