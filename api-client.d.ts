// TypeScript declaration file for api-client.js
declare class ApiClientInput {
    url: string;
    method: string;
    body: string | null;
    headers: Record<string, string>;

    constructor();

    static create(method: string, url: string, body: string | null, headers?: Record<string, string>): ApiClientInput;
    static get(url: string, headers?: Record<string, string>): ApiClientInput;
    static post(url: string, body: string, headers?: Record<string, string>): ApiClientInput;
    static put(url: string, body: string, headers?: Record<string, string>): ApiClientInput;
    static delete(url: string, headers?: Record<string, string>): ApiClientInput;
    static patch(url: string, body: string, headers?: Record<string, string>): ApiClientInput;
    static createJson<T = any>(method: string, url: string, jsonObject: T, headers?: Record<string, string>): ApiClientInput;
    static postJson<T = any>(url: string, jsonObject: T, headers?: Record<string, string>): ApiClientInput;
    static putJson<T = any>(url: string, jsonObject: T, headers?: Record<string, string>): ApiClientInput;
    static patchJson<T = any>(url: string, jsonObject: T, headers?: Record<string, string>): ApiClientInput;
}

declare class ApiClientOutput {
    statusCode: number;
    headers: Record<string, string>;
    body: string | null;
    exception: Error | null;

    constructor();

    isSuccessful(): boolean;
    getFailureReason(): string | null;
    getHeader(name: string): string | null;
    parseJsonBody<T = any>(): T | null;
    asMap(): {
        statusCode: number;
        successful: boolean;
        body: string | null;
        error?: string;
        json?: any;
    };

    static createForError(error: Error): ApiClientOutput;
    static createForSuccess(response: Response, body: string): ApiClientOutput;
    static create(response: Response): Promise<ApiClientOutput>;
}

declare class ApiClient {
    static send(input: ApiClientInput): Promise<ApiClientOutput>;

    static stream(
        input: ApiClientInput,
        onStart: () => void,
        onChunk: (chunk: string) => void,
        onFinish: (output: ApiClientOutput) => void,
        onFailure: (errorOutput: ApiClientOutput) => void
    ): void;

    static batchSendParallel(
        inputs: ApiClientInput[],
        onStart: () => void,
        onUnit: (output: ApiClientOutput) => void,
        onFinished: (batchOutput: ApiClientOutput) => void,
        onFailure: (errorOutput: ApiClientOutput) => void
    ): Promise<ApiClientOutput[]>;
}
