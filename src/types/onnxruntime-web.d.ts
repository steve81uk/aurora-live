declare module 'onnxruntime-web' {
  export class Tensor {
    data: Float32Array | Int32Array | Uint8Array;
    dims?: number[];
    constructor(dtype: string, data: Float32Array | Int32Array | Uint8Array, dims?: number[]);
  }
  export interface SessionOptions {
    executionProviders?: string[];
  }
  export class InferenceSession {
    run(inputs: Record<string, Tensor>): Promise<Record<string, Tensor>>;
    static create(modelUrl: string, options?: SessionOptions): Promise<InferenceSession>;
  }
}