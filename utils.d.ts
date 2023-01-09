export declare function notEmpty<TValue>(value: TValue | null | undefined): value is TValue;
export declare function randomString(length?: number): string;
export declare function randomId(length?: number): string;
export declare function debounce(fn: (...args: any) => any, delay?: number): (...args: any) => void;
