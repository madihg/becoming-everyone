// Global model cache for preloading
let preloadedModel: any = null;
let modelLoadPromise: Promise<any> | null = null;

export function getPreloadedModel() {
  return preloadedModel;
}

export function preloadBodyModel() {
  if (modelLoadPromise) return modelLoadPromise;
  if (preloadedModel) return Promise.resolve(preloadedModel);
  
  modelLoadPromise = (async () => {
    console.log('Preloading body detection model...');
    const tf = await import('@tensorflow/tfjs');
    await tf.ready();
    const cocoSsd = await import('@tensorflow-models/coco-ssd');
    preloadedModel = await cocoSsd.load();
    console.log('Body detection model preloaded!');
    return preloadedModel;
  })();
  
  return modelLoadPromise;
}

