import { io } from 'socket.io-client';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const clearButton = document.getElementById('clearButton');

  let currentStroke = null;
  let isDrawing = false;

  const socket = io('http://localhost:5173');

  socket.on('init', strokes => redrawCanvas(strokes));
  socket.on('draw', stroke => drawStroke(stroke));
  socket.on('clear', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  clearButton.addEventListener('click', () => socket.emit('clear'));

  function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e) {
    isDrawing = true;
    currentStroke = {
      color: colorPicker.value,
      lineWidth: parseInt(brushSize.value),
      points: [getCanvasCoordinates(e)]
    };
  }

  function draw(e) {
    if (!isDrawing) return;
    currentStroke.points.push(getCanvasCoordinates(e));
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    currentStroke.points.push(getCanvasCoordinates(e));
    socket.emit('draw', currentStroke);
    currentStroke = null;
  }

  function redrawCanvas(strokes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => drawStroke(stroke));
  }

  function drawStroke(stroke) {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    stroke.points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
});