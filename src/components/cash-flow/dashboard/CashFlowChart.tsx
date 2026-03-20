"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import type { ChartPeriod } from "@/types/cash-flow";
import { formatCompactCurrency } from "@/lib/cash-flow/format-utils";

interface CashFlowChartProps {
  periods: ChartPeriod[];
  openingBalance: number;
  threshold: number;
}

interface HitArea {
  x: number;
  width: number;
  data: ChartPeriod & { balance: number; projected: boolean };
}

function fmtFull(n: number): string {
  return n.toLocaleString("en-US");
}

function roundRectFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: [number, number, number, number]
) {
  const [tl, tr, br, bl] = radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function niceStep(max: number, steps: number): number {
  if (max <= 0 || steps <= 0) return 1;
  const raw = max / steps;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

export function CashFlowChart({
  periods,
  openingBalance,
  threshold,
}: CashFlowChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hitAreasRef = useRef<HitArea[]>([]);
  const yAxisRef = useRef<HTMLDivElement>(null);
  const xAxisRef = useRef<HTMLDivElement>(null);

  const [canvasWidth, setCanvasWidth] = useState(0);
  const rafRef = useRef(0);
  const H_CSS = 320;

  // Pre-compute balances and scale values (reused in render + tooltip)
  const chartData = useMemo(() => {
    if (periods.length === 0) return null;
    const balances: number[] = [];
    let b = openingBalance;
    periods.forEach((d) => {
      b += d.revenue - d.expense;
      balances.push(b);
    });
    const allVals = [openingBalance, ...balances, threshold];
    const minVal = Math.min(...allVals) * 0.9;
    const maxVal = Math.max(...allVals) * 1.1;
    const range = maxVal - minVal || 1;
    return { balances, minVal, maxVal, range };
  }, [periods, openingBalance, threshold]);

  // Observe container width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setCanvasWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Main render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasWidth === 0 || !chartData) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvasWidth;
    const H = H_CSS;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Layout constants
    const PAD_TOP = 36;
    const PAD_BOTTOM = 6;
    const PAD_H = 10;

    const { balances, minVal, maxVal, range } = chartData;
    const plotH = H - PAD_TOP - PAD_BOTTOM;
    const yScale = (val: number) => PAD_TOP + plotH - ((val - minVal) / range) * plotH;

    // Bar geometry
    const n = periods.length;
    const groupW = (W - PAD_H * 2) / n;
    const barW = Math.min(48, groupW * 0.6);

    const hitAreas: HitArea[] = [];

    ctx.clearRect(0, 0, W, H);

    // Gridlines
    const yStep = niceStep(range, 4);
    const gridStart = Math.ceil(minVal / yStep) * yStep;
    ctx.save();
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    for (let v = gridStart; v <= maxVal; v += yStep) {
      const y = yScale(v);
      if (y >= PAD_TOP && y <= H - PAD_BOTTOM) {
        ctx.beginPath();
        ctx.moveTo(PAD_H, y);
        ctx.lineTo(W - PAD_H, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Threshold line
    const threshY = yScale(threshold);
    if (threshY > PAD_TOP && threshY < H - PAD_BOTTOM) {
      ctx.save();
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD_H, threshY);
      ctx.lineTo(W - PAD_H, threshY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Threshold badge
      const badgeTxt = "$" + threshold.toLocaleString();
      ctx.font = "700 12px 'DM Mono', monospace";
      const tw = ctx.measureText(badgeTxt).width;
      const bx = W - PAD_H - tw - 16;
      const by = threshY - 14;
      const bh = 20;
      const bw = tw + 14;
      const br = 4;
      ctx.fillStyle = "#fff7ed";
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 1.5;
      roundRect(ctx, bx, by, bw, bh, br);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ea580c";
      ctx.fillText(badgeTxt, bx + 7, by + 14);
      ctx.restore();
    }

    // Draw balance bars
    periods.forEach((d, i) => {
      const projected = !d.current && i > 0;
      const cx = PAD_H + i * groupW + groupW / 2;
      const bx = cx - barW / 2;

      const runBal = balances[i];
      const barTop = yScale(runBal);
      const barBot = yScale(0 > minVal ? 0 : minVal);
      const barH = Math.abs(barBot - barTop);

      const belowThreshold = runBal < threshold;
      const alpha = projected ? 0.35 : 1.0;

      // Current week highlight background
      if (d.current) {
        ctx.save();
        ctx.fillStyle = "#8BC34A";
        ctx.globalAlpha = 0.08;
        roundRectFill(
          ctx,
          bx - 8,
          PAD_TOP - 4,
          barW + 16,
          H - PAD_TOP - PAD_BOTTOM + 8,
          [6, 6, 6, 6]
        );
        ctx.restore();

        // Current week border
        ctx.save();
        ctx.strokeStyle = "#8BC34A";
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1.5;
        roundRect(ctx, bx - 8, PAD_TOP - 4, barW + 16, H - PAD_TOP - PAD_BOTTOM + 8, 6);
        ctx.stroke();
        ctx.restore();
      }

      // Bar color
      const barColor = belowThreshold ? "#ef4444" : "#3b82f6";

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = barColor;
      if (runBal >= 0) {
        roundRectFill(ctx, bx, barTop, barW, barH, [5, 5, 0, 0]);
      } else {
        roundRectFill(ctx, bx, Math.min(barTop, barBot), barW, barH, [0, 0, 5, 5]);
      }
      ctx.restore();

      // Balance value on top of bar
      if (!projected || i === n - 1) {
        ctx.save();
        ctx.fillStyle = belowThreshold ? "#ef4444" : "#3b82f6";
        ctx.globalAlpha = alpha;
        ctx.font = "700 10px 'DM Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(formatCompactCurrency(runBal), cx, barTop - 6);
        ctx.restore();
      }

      hitAreas.push({
        x: bx - 6,
        width: barW + 12,
        data: { ...d, balance: runBal, projected },
      });
    });

    // "NOW" marker for current week
    const currentIdx = periods.findIndex((p) => p.current);
    if (currentIdx >= 0) {
      const cx = PAD_H + currentIdx * groupW + groupW / 2;
      ctx.save();
      ctx.fillStyle = "#8BC34A";
      ctx.font = "700 11px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("THIS WEEK", cx, PAD_TOP - 16);
      ctx.restore();
    }

    hitAreasRef.current = hitAreas;

    // Build Y axis
    buildYAxis(minVal, maxVal, plotH, PAD_TOP, H);

    // Build X axis
    buildXAxis(periods, groupW, PAD_H);
  }, [periods, chartData, threshold, canvasWidth]);

  const buildYAxis = useCallback(
    (minVal: number, maxVal: number, _plotH: number, padTop: number, H: number) => {
      const ya = yAxisRef.current;
      if (!ya) return;
      ya.replaceChildren();
      ya.style.height = H - 28 + "px";

      const range = maxVal - minVal || 1;
      const yStep = niceStep(range, 4);
      const gridStart = Math.ceil(minVal / yStep) * yStep;
      const plotH = H - padTop - 6;

      const addTick = (y: number, label: string) => {
        const el = document.createElement("div");
        el.className =
          "absolute right-2 font-mono text-[12px] -translate-y-1/2 text-right whitespace-nowrap text-[#6b7280]";
        el.style.top = y + "px";
        el.textContent = label;
        ya.appendChild(el);
      };

      for (let v = gridStart; v <= maxVal; v += yStep) {
        const y = padTop + plotH - ((v - minVal) / range) * plotH;
        if (y >= padTop && y <= H - 28) {
          addTick(y, formatCompactCurrency(v));
        }
      }
    },
    []
  );

  const buildXAxis = useCallback(
    (data: ChartPeriod[], groupW: number, padH: number) => {
      const xa = xAxisRef.current;
      if (!xa) return;
      xa.replaceChildren();

      // Compute week-start dates: find current week's Monday, offset from there
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      const currentIdx = data.findIndex((d) => d.current);
      const baseOffset = currentIdx >= 0 ? currentIdx : 0;

      data.forEach((d, i) => {
        const el = document.createElement("div");
        const isCurrent = !!d.current;
        const isProjected = !d.current && i > 0;

        // Calculate this period's Monday
        const weekDate = new Date(monday);
        weekDate.setDate(monday.getDate() + (i - baseOffset) * 7);
        const dateLabel = weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        el.className =
          "flex-1 text-center text-[11px] font-semibold tracking-[0.02em] " +
          (isCurrent
            ? "text-[#5a8c1f] font-bold"
            : isProjected
              ? "text-[#93a3b8]"
              : "text-[#6b7280]");
        el.textContent = dateLabel;
        xa.appendChild(el);
      });
    },
    []
  );

  // Re-render on data/size changes
  useEffect(() => {
    render();
  }, [render]);

  // Tooltip handling — throttled via rAF to avoid jank on fast mouse movement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const tooltip = tooltipRef.current;
        if (!canvas || !tooltip) return;

        const rect = canvas.getBoundingClientRect();
        const mx = clientX - rect.left;

        let hit: HitArea | null = null;
        for (const area of hitAreasRef.current) {
          if (mx >= area.x && mx <= area.x + area.width) {
            hit = area;
            break;
          }
        }

        if (hit) {
          const d = hit.data;
          const net = d.revenue - d.expense;
          tooltip.innerHTML = `
            <div class="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.07em] mb-1.5">${d.label}${d.projected ? " · Projected" : " · Actual"}</div>
            <div class="flex justify-between gap-4 mb-0.5">
              <span class="text-[#9ca3af] font-medium">Bank Balance</span>
              <span class="font-mono font-semibold" style="color:${d.balance < threshold ? "#f87171" : "#93c5fd"}">${fmtFull(d.balance)}</span>
            </div>
            <div class="border-t border-[#374151] my-1"></div>
            <div class="flex justify-between gap-4 mb-0.5">
              <span class="text-[#9ca3af] font-medium">Cash In</span>
              <span class="font-mono font-semibold text-[#86efac]">${fmtFull(d.revenue)}</span>
            </div>
            <div class="flex justify-between gap-4 mb-0.5">
              <span class="text-[#9ca3af] font-medium">Cash Out</span>
              <span class="font-mono font-semibold text-[#fca5a5]">−${fmtFull(d.expense)}</span>
            </div>
            <div class="border-t border-[#374151] my-1"></div>
            <div class="flex justify-between gap-4">
              <span class="text-[#9ca3af] font-medium">Net</span>
              <span class="font-mono font-semibold" style="color:${net >= 0 ? "#4ade80" : "#f87171"}">${net >= 0 ? "+" : ""}${fmtFull(net)}</span>
            </div>
          `;
          tooltip.style.display = "block";
          tooltip.style.left = clientX + 14 + "px";
          tooltip.style.top = clientY - 10 + "px";
          canvas.style.cursor = "crosshair";
        } else {
          tooltip.style.display = "none";
          canvas.style.cursor = "default";
        }
      });
    },
    [threshold]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const tooltip = tooltipRef.current;
    if (tooltip) tooltip.style.display = "none";
  }, []);

  // Cleanup pending rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <div className="relative" style={{ paddingLeft: 64 }}>
        <div
          ref={yAxisRef}
          className="pointer-events-none absolute left-0 top-0 w-[60px]"
          style={{ bottom: 28 }}
        />
        <div ref={wrapRef} className="relative w-full">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="block w-full"
            role="img"
            aria-label={`Cash flow bar chart showing ${periods.length} periods. Opening balance: $${openingBalance.toLocaleString()}. Minimum balance threshold: $${threshold.toLocaleString()}.`}
            tabIndex={0}
          />
        </div>
        <div ref={xAxisRef} className="flex pt-1.5" />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-[1000] hidden min-w-[150px] rounded-lg bg-[#1f2937] p-[10px_14px] text-xs text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
      />
    </>
  );
}
