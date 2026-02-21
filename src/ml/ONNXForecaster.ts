import type { FeatureVector } from './types';
import * as ort from 'onnxruntime-web';

let session: ort.InferenceSession | null = null;
let loadingPromise: Promise<void> | null = null;

export async function loadONNXModel(path: string = '/ml-models/kp_forecaster.onnx') {
  if (session) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    session = await ort.InferenceSession.create(path, { executionProviders: ['wasm'] });
  })();
  return loadingPromise;
}

/**
 * Run the model multiple times with slight noise to simulate Monte Carlo dropout.
 * Input: flattened [1,24,6] features tensor.
 */
export async function predictONNX(
  input: Float32Array,
  runs: number = 50
): Promise<{ mean: number[]; std: number[] }> {
  await loadONNXModel();
  if (!session) throw new Error('ONNX session not loaded');

  const results: number[][] = [];
  for (let i = 0; i < runs; i++) {
    // add tiny gaussian noise to input to emulate dropout randomness
    const noisy = new Float32Array(input.length);
    for (let j = 0; j < input.length; j++) {
      noisy[j] = input[j] + (Math.random() - 0.5) * 0.02; // small perturbation
    }
    const tensor = new ort.Tensor('float32', noisy, [1, 24, 6]);
    const outputMap = await session.run({ input: tensor });
    const outTensor = outputMap[Object.keys(outputMap)[0]] as ort.Tensor;
    results.push(Array.from(outTensor.data as Float32Array));
  }

  const mean: number[] = [];
  const std: number[] = [];
  const len = results[0].length;
  for (let k = 0; k < len; k++) {
    const vals = results.map(r => r[k]);
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length;
    mean.push(m);
    std.push(Math.sqrt(variance));
  }
  return { mean, std };
}

/**
 * React hook to run ONNX forecaster on feature vector and return prediction with uncertainty
 */
import { useEffect, useState } from 'react';

export function useONNXForecast(features: FeatureVector | null) {
  const [result, setResult] = useState<{kp: number[]; uncertainty: number[]} | null>(null);

  useEffect(() => {
    if (!features) {
      setResult(null);
      return;
    }
    (async () => {
      // prepare input array [1,24,6] same as LSTM
      const arr = new Float32Array(24 * 6);
      for (let t = 0; t < 24; t++) {
        arr[t * 6 + 0] = (features.solarWindSpeed[t] - 450) / 120;
        arr[t * 6 + 1] = (features.solarWindDensity[t] - 7) / 5;
        arr[t * 6 + 2] = (features.magneticFieldBt[t] - 6) / 3;
        arr[t * 6 + 3] = (features.magneticFieldBz[t] - 0) / 5;
        arr[t * 6 + 4] = (features.kpIndex[t] - 2.5) / 1.8;
        arr[t * 6 + 5] = (features.newellCouplingHistory[t] - 5000) / 8000;
      }
      const { mean, std } = await predictONNX(arr, 40);
      // mean contains 9 outputs: [Kp6h,Bz6h,...Kp24h,...]
      setResult({ kp: [mean[0], mean[3], mean[6]], uncertainty: [std[0], std[3], std[6]] });
    })();
  }, [features]);

  return result;
}
