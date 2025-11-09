import { tableFieldHeight, tableHeaderHeight } from "../data/constants";

/**
 * 计算两字段之间的关系连线路径
 *
 * 参数: r                       // 关系数据，包含起止表坐标与字段索引
 *      tableWidthOrWidths       // 表宽度：可为数字（统一宽度）或对象 { startWidth, endWidth }
 *      zoom = 1                 // 缩放比例
 * 返回: string                  // SVG path 的 d 属性
 * 异常: 若 r 无效时返回空串，并记录日志（不抛异常避免渲染中断）
 */
export function calcPath(r, tableWidthOrWidths = 200, zoom = 1) {
  if (!r) {
    console.warn("[calcPath] invalid relationship input", r);
    return "";
  }

  // 支持两端表独立宽度
  const startWidth =
    typeof tableWidthOrWidths === "number"
      ? tableWidthOrWidths
      : (tableWidthOrWidths?.startWidth ?? 200);
  const endWidth =
    typeof tableWidthOrWidths === "number"
      ? tableWidthOrWidths
      : (tableWidthOrWidths?.endWidth ?? 200);

  const widthStart = startWidth * zoom;
  const widthEnd = endWidth * zoom;
  let x1 = r.startTable.x;
  let y1 =
    r.startTable.y +
    r.startFieldIndex * tableFieldHeight +
    tableHeaderHeight +
    tableFieldHeight / 2;
  let x2 = r.endTable.x;
  let y2 =
    r.endTable.y +
    r.endFieldIndex * tableFieldHeight +
    tableHeaderHeight +
    tableFieldHeight / 2;

  let radius = 10 * zoom;
  // 采用两端宽度的最大值近似计算中点，避免复杂条件
  const midX = (x2 + x1 + Math.max(widthStart, widthEnd)) / 2;
  const endX = x2 + widthEnd < x1 ? x2 + widthEnd : x2;

  if (Math.abs(y1 - y2) <= 36 * zoom) {
    radius = Math.abs(y2 - y1) / 3;
    if (radius <= 2) {
      if (x1 + widthStart <= x2)
        return `M ${x1 + widthStart} ${y1} L ${x2} ${y2 + 0.1}`;
      else if (x2 + widthEnd < x1)
        return `M ${x1} ${y1} L ${x2 + widthEnd} ${y2 + 0.1}`;
    }
  }

  if (y1 <= y2) {
    if (x1 + widthStart <= x2) {
      return `M ${x1 + widthStart} ${y1} L ${
        midX - radius
      } ${y1} A ${radius} ${radius} 0 0 1 ${midX} ${y1 + radius} L ${midX} ${
        y2 - radius
      } A ${radius} ${radius} 0 0 0 ${midX + radius} ${y2} L ${endX} ${y2}`;
    } else if (x2 <= x1 + widthStart && x1 <= x2) {
      return `M ${x1 + widthStart} ${y1} L ${
        x2 + widthEnd
      } ${y1} A ${radius} ${radius} 0 0 1 ${x2 + widthEnd + radius} ${
        y1 + radius
      } L ${x2 + widthEnd + radius} ${y2 - radius} A ${radius} ${radius} 0 0 1 ${
        x2 + widthEnd
      } ${y2} L ${x2 + widthEnd} ${y2}`;
    } else if (x2 + widthEnd >= x1 && x2 + widthEnd <= x1 + widthStart) {
      return `M ${x1} ${y1} L ${
        x2 - radius
      } ${y1} A ${radius} ${radius} 0 0 0 ${x2 - radius - radius} ${
        y1 + radius
      } L ${x2 - radius - radius} ${y2 - radius} A ${radius} ${radius} 0 0 0 ${
        x2 - radius
      } ${y2} L ${x2} ${y2}`;
    } else {
      return `M ${x1} ${y1} L ${
        midX + radius
      } ${y1} A ${radius} ${radius} 0 0 0 ${midX} ${y1 + radius} L ${midX} ${
        y2 - radius
      } A ${radius} ${radius} 0 0 1 ${midX - radius} ${y2} L ${endX} ${y2}`;
    }
  } else {
    if (x1 + widthStart <= x2) {
      return `M ${x1 + widthStart} ${y1} L ${
        midX - radius
      } ${y1} A ${radius} ${radius} 0 0 0 ${midX} ${y1 - radius} L ${midX} ${
        y2 + radius
      } A ${radius} ${radius} 0 0 1 ${midX + radius} ${y2} L ${endX} ${y2}`;
    } else if (
      x1 + widthStart >= x2 &&
      x1 + widthStart <= x2 + widthEnd
    ) {
      return `M ${x1} ${y1} L ${
        x1 - radius - radius
      } ${y1} A ${radius} ${radius} 0 0 1 ${x1 - radius - radius - radius} ${
        y1 - radius
      } L ${x1 - radius - radius - radius} ${
        y2 + radius
      } A ${radius} ${radius} 0 0 1 ${
        x1 - radius - radius
      } ${y2} L ${endX} ${y2}`;
    } else if (x1 >= x2 && x1 <= x2 + widthEnd) {
      return `M ${x1 + widthStart} ${y1} L ${
        x1 + widthStart + radius
      } ${y1} A ${radius} ${radius} 0 0 0 ${
        x1 + widthStart + radius + radius
      } ${
        y1 - radius
      } L ${x1 + widthStart + radius + radius} ${
        y2 + radius
      } A ${radius} ${radius} 0 0 0 ${x1 + widthStart + radius} ${y2} L ${
        x2 + widthEnd
      } ${y2}`;
    } else {
      return `M ${x1} ${y1} L ${
        midX + radius
      } ${y1} A ${radius} ${radius} 0 0 1 ${midX} ${y1 - radius} L ${midX} ${
        y2 + radius
      } A ${radius} ${radius} 0 0 0 ${midX - radius} ${y2} L ${endX} ${y2}`;
    }
  }
}
