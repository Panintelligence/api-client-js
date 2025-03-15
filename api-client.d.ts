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
     */
    static chat(
        model: string | null,
        messages: Array<{ role: string; content: string }>,
        stream: boolean,
        temperature: number | null
    ): ApiClientInputBody;

    /**
     * Creates an SSE completion request body (always streaming)
     */
    static sse(
        model: string | null,
        messages: Array<{ role: string; content: string }>,
        temperature: number | null
    ): ApiClientInputBody;

    /**
     * Creates a simple completion request with a single user message
     */
    static chatMessage(content: string, stream: boolean): ApiClientInputBody;

    /**
     * Converts the input body to a JSON-serializable object
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
    inputBody: ApiClientInputBody | null;

    constructor();

    /**
     * Creates an input object for any HTTP method
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
     */
    static putJson<T = any>(url: string, jsonObject: T, headers: Record<string, string>): ApiClientInput;

    /**
     * Convenience factory method for PATCH requests with JSON body
     */
    static patchJson<T = any>(url: string, jsonObject: T, headers: Record<string, string>): ApiClientInput;

    /**
     * Creates an input object for a POST request with an ApiClientInputBody
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
    exception: Error | null;

    constructor();

    /**
     * Determines if the request was successful based on status code
     */
    isSuccessful(): boolean;

    /**
     * Gets the reason for failure if the request failed
     */
    getFailureReason(): string | null;

    /**
     * Retrieves a specific header value
     */
    getHeader(name: string): string | null;

    /**
     * Attempts to parse the response body as JSON, returning null if parsing fails
     */
    parseJsonBody<T = any>(): T | null;

    /**
     * Returns the response as a map for easier data access
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
     */
    static createForError(error: Error): ApiClientOutput;

    /**
     * Creates an output object for a successful response
     */
    static createForSuccess(response: Response, body: string): ApiClientOutput;

    /**
     * Creates an output object from a fetch Response
     */
    static create(response: Response): Promise<ApiClientOutput>;
}

/**
 * A utility class for making HTTP requests
 */
declare class ApiClient {
    /**
     * Performs an HTTP request
     */
    static send(input: ApiClientInput): Promise<ApiClientOutput>;

    /**
     * Performs a streaming HTTP request
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
     */
    static batchSendParallel(
        inputs: ApiClientInput[],
        onStart: () => void,
        onUnit: (output: ApiClientOutput) => void,
        onFinished: (batchOutput: ApiClientOutput) => void,
        onFailure: (errorOutput: ApiClientOutput) => void
    ): Promise<ApiClientOutput[]>;
}