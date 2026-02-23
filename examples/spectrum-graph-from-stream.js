import canvasSketch from "canvas-sketch";

const settings = {
  dimensions: [2048, 512],
  animate: true,
  fps: 30, // faster for smoother visualization
};

canvasSketch(async ({ width, height }) => {
  // --- Audio setup ---
  const audioContext = new AudioContext();
  const userAudioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  const audioSourceNode = audioContext.createMediaStreamSource(userAudioStream);
  const audioAnalyserNode = audioContext.createAnalyser();

  audioSourceNode.connect(audioAnalyserNode);
  audioAnalyserNode.connect(audioContext.destination);
  audioAnalyserNode.fftSize = 2048;

  const bufferLength = audioAnalyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const sliceWidth = width / bufferLength;

  // --- Render function ---
  return ({ context, frame }) => {
    context.clearRect(0, 0, width, height);

    audioAnalyserNode.getByteFrequencyData(dataArray);

    // Calculate average for color
    const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    context.strokeStyle = `rgb(${avg + 64}, 0, ${frame % 256})`;
    context.lineWidth = 2;

    context.beginPath();
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 255;
      const y = height - v * height;

      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);

      x += sliceWidth;
    }
    context.stroke();
  };
}, settings);
