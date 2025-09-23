  function syncDecay(input, amplitudeCoef, decayRate, period, phaseCoef)
{
    const freq = (2.0 * Math.PI) / period;
    const sync = Math.pow(2.0, -1.0 * decayRate * input) 
               * Math.cos(freq * input + phaseCoef) 
               * amplitudeCoef;

    return sync;
}

 function linearRampInOut(input) {
    return 1.0 - 2.0 * Math.abs(input - 0.5);
}

 function easeOutCubic(input) {
    return 1 - Math.pow(1 - input, 3);
}

 function easeOutElastic(input) {
    const c4 = (2.0 * Math.PI) / 3.0;

    if (input === 0.0) return 0.0;
    if (input === 1.0) return 1.0;

    return Math.pow(2.0, -10.0 * input) * 
           Math.sin((input * 10.0 - 0.75) * c4) + 1.0;
}

 function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

 function clamp01(number) {
  return clamp(number, 0.0, 1.0);
}

 function getKeyFrames(duration, sampleCount, sampledFunction, scale = 1)
{
    const sampleStep = duration / sampleCount;

    let times = new Array(sampleCount)
    let values = new Array(sampleCount)

    for (let i = 0; i < sampleCount-1; i++)
    {
        const sampledTime = i * sampleStep;
        const progress = clamp01(sampledTime / duration);
        
        times[i] = sampledTime;
        values[i] = sampledFunction(progress) * scale;
    }

    times[sampleCount-1] = duration;
    values[sampleCount-1] = sampledFunction(1.0) * scale;

    return {times, values}
}

 function getKeyFramesWRate(duration, sampleRate, sampledFunction, scale = 1)
{
    const sampleCount = Math.floor(duration * sampleRate);
    
    return getKeyFrames(duration, sampleCount, sampledFunction, scale);
}

function convertD(dimensionVector, values, addValue = 0)
{
    const width = dimensionVector.length;
    const output = new Float32Array(values.length * width);
    for(let i = 0; i < values.length; i++)
    {
        for(let j = 0; j < width; j++)
        {
            output[i*width + j] = values[i] * dimensionVector[j] + addValue;
        }
    }
    return output;
}