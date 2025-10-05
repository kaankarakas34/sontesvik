import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface AnimatedChartProps {
  data: ChartData[];
  type: 'bar' | 'line' | 'doughnut';
  title?: string;
  height?: number;
  animated?: boolean;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  type,
  title,
  height = 300,
  animated = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationProgress = 0;
    const animationDuration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      animationProgress = Math.min(elapsed / animationDuration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, height);

      if (type === 'bar') {
        drawBarChart(ctx, data, canvas.offsetWidth, height, animationProgress);
      } else if (type === 'line') {
        drawLineChart(ctx, data, canvas.offsetWidth, height, animationProgress);
      } else if (type === 'doughnut') {
        drawDoughnutChart(ctx, data, canvas.offsetWidth, height, animationProgress);
      }

      if (animationProgress < 1 && animated) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, type, height, animated]);

  const drawBarChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    width: number,
    height: number,
    progress: number
  ) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    const maxValue = Math.max(...data.map(d => d.value));

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight * progress;
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - padding - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, item.color);
      gradient.addColorStop(1, item.color + '80');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add glow effect
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.shadowBlur = 0;

      // Draw labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);
      
      // Draw values
      if (progress > 0.8) {
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 10);
      }
    });
  };

  const drawLineChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    width: number,
    height: number,
    progress: number
  ) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(d => d.value));
    const pointsToShow = Math.floor(data.length * progress);

    if (pointsToShow < 2) return;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    data.slice(0, pointsToShow).forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - (item.value / maxValue) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Add glow effect
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw points
    data.slice(0, pointsToShow).forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - (item.value / maxValue) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Animated pulse effect for the last point
      if (index === pointsToShow - 1 && progress < 1) {
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#dc262640';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      ctx.fillText(item.label, x, height - padding + 20);
    });
  };

  const drawDoughnutChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    width: number,
    height: number,
    progress: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = radius * 0.6;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    let currentAngle = -Math.PI / 2;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * progress;
      
      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();

      // Create gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
      gradient.addColorStop(0, item.color + 'CC');
      gradient.addColorStop(1, item.color);

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      currentAngle += sliceAngle;
    });

    // Draw center text
    if (progress > 0.5) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Toplam', centerX, centerY - 10);
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText(total.toString(), centerX, centerY + 15);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {title && (
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-900 mb-4 text-center"
        >
          {title}
        </motion.h3>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg"
      />
      
      {/* Legend for doughnut chart */}
      {type === 'doughnut' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap justify-center gap-4"
        >
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedChart;