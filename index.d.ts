// Type definitions for bugno
// Project: Bugno

export = Bugno;

declare class Bugno {
    constructor(options?: Bugno.Configuration);
    static init(options: Bugno.Configuration): Bugno;

    public global(options: Bugno.Configuration): Bugno;
    public configure(options: Bugno.Configuration): Bugno;
    public lastError(): Bugno.MaybeError;

    public log(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public debug(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public info(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public warn(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public warning(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public error(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public critical(...args: Bugno.LogArgument[]): Bugno.LogResult;
    public wait(callback: () => void): void;

    public captureEvent(metadata: object, level: Bugno.Level): Bugno.TelemetryEvent;

    public lambdaHandler<T = object>(handler: Bugno.LambdaHandler<T>): Bugno.LambdaHandler<T>;

    public errorHandler(): Bugno.ExpressErrorHandler;

    // Exposed only for testing, should be changed via the configure method
    // DO NOT MODIFY DIRECTLY
    public options: Bugno.Configuration;
}

declare namespace Bugno {
    export type LambdaHandler<E = object> = (event: E, context: object, callback: Callback) => void;
    export type MaybeError = Error | undefined | null;
    export type Level = "debug" | "info" | "warning" | "error" | "critical";
    export interface Configuration {
        accessToken?: string;
        version?: string;
        environment?: string;
        codeVersion?: string;
        code_version?: string;
        scrubFields?: string[];
        overwriteScrubFields?: boolean;
        scrubHeaders?: string[];
        logLevel?: Level;
        reportLevel?: Level;
        uncaughtErrorLevel?: Level;
        endpoint?: string;
        verbose?: boolean;
        enabled?: boolean;
        captureUncaught?: boolean;
        captureUnhandledRejections?: boolean;
        payload?: object;
        maxItems?: number;
        itemsPerMinute?: number;
        ignoredMessages?: string[];
        hostWhiteList?: string[];
        hostBlackList?: string[];
        filterTelemetry?: (e: TelemetryEvent) => boolean;
        autoInstrument?: AutoInstrumentOptions;
        maxTelemetryEvents?: number;
        telemetryScrubber?: TelemetryScrubber;
        includeItemsInTelemetry?: boolean;
        scrubTelemetryInputs?: boolean;
        sendConfig?: boolean;
        captureEmail?: boolean;
        captureUsername?: boolean;
        captureIp?: boolean | "anonymize";
        captureLambdaTimeouts?: boolean;
        transform?: (data: object) => void;
        checkIgnore?: (isUncaught: boolean, args: LogArgument[], item: object) => boolean;
        onSendCallback?: (isUncaught: boolean, args: LogArgument[], item: object) => void;
    }
    export type Callback = (err: MaybeError, response: object) => void;
    export type LogArgument = string | Error | object | Callback | Date | any[];
    export interface LogResult {
        uuid: string;
    }
    export interface TelemetryEvent {
        level: Level;
        type: string;
        timestamp_ms: number;
        body: object;
        source: string;
        uuid?: string;
    }
    export type AutoInstrumentOptions = boolean | AutoInstrumentSettings;
    export interface AutoInstrumentSettings {
        network?: boolean;
        networkResponseHeaders?: boolean | string[];
        networkResponseBody?: boolean;
        networkRequestBody?: boolean;
        log?: boolean;
        dom?: boolean;
        navigation?: boolean;
        connectivity?: boolean;
    }
    export type TelemetryScrubber = (description: TelemetryScrubberInput) => boolean;
    export type TelemetryScrubberInput = DomDescription | null;
    export interface DomDescription {
        tagName: string;
        id: string | undefined;
        classes: string[] | undefined;
        attributes: DomAttribute[];
    }
    export type DomAttributeKey = "type" | "name" | "title" | "alt";
    export interface DomAttribute {
        key: DomAttributeKey;
        value: string;
    }
    export type ExpressErrorHandler = (err: any, request: any, response: any, next: ExpressNextFunction) => any;
    export interface ExpressNextFunction {
      (err?: any): void;
    }
}
