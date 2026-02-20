import { useState, useEffect } from 'react';
import { neuralForecaster } from '../ml/LSTMForecaster';
import type { NeuralForecast, FeatureVector } from '../ml/types';

export const useSkollForecast = (liveData: FeatureVector | null) => {
  const [forecast, setForecast] = useState<NeuralForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runInference = async () => {
      if (!liveData) return;
      try {
        const result = await neuralForecaster.predict(liveData);
        setForecast(result);
        setIsLoading(false);
      } catch (err) {
        console.error("🌌 Sköll-Track: Inference Jammed", err);
      }
    };

    runInference();
  }, [liveData]);

  return { forecast, isLoading };
};