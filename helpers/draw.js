function clearCanvas(w, h) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, w, h);
}

function drawWaveform(wave, w, h) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let buffer = wave.getValue(0);

  let start = 0;
  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i - 1] < 0 && buffer[i] >= 0) {
      start = i;
      break;
    }
  }

  let end = start + buffer.length / 2;

  const color = randomColor();
  for (let i = start; i < end; i++) {
    let x1 = scale(i - 1, start, end, 0, w);
    let y1 = scale(buffer[i - 1], -1, 1, 0, h);
    let x2 = scale(i, start, end, 0, w);
    let y2 = scale(buffer[i], -1, 1, 0, h);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

function scale(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

function fixDpi() {
  const dpi = window.devicePixelRatio;
  const canvas = document.getElementById("canvas");

  let style = {
    height() {
      return +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    },
    width() {
      return +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    },
  };

  canvas.setAttribute("width", style.width() * dpi);
  canvas.setAttribute("height", style.height() * dpi);
}
export { drawWaveform, clearCanvas, fixDpi };
