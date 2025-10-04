import { Viewer, PointPrimitiveCollection } from "cesium";
import get_pixel_aqi_color from "../utils/get_aqi"
import { Color } from "cesium";

function get_aqi_color(aqi) {
    if (aqi <= 50) return Color.GREEN;
    else if (aqi <= 100) return Color.YELLOW;
    else if (aqi <= 150) return Color.ORANGE;
    else if (aqi <= 200) return Color.RED;
    else if (aqi <= 300) return Color.PURPLE;
    else               { return Color.MAROON; }
}

function get_aqi_color_css(aqi) {
  if (aqi <= 50) return "rgba(0,255,0,0.6)";
  if (aqi <= 100) return "rgba(255,255,0,0.6)";
  if (aqi <= 150) return "rgba(255,165,0,0.6)";
  if (aqi <= 200) return "rgba(255,0,0,0.6)";
  if (aqi <= 300) return "rgba(128,0,128,0.6)";
  return "rgba(128,0,0,0.6)";
}
/** 
    * @param {Viewer} viewer - cesium viewport
    * @param {Object} bounds four points of world-bounds for the map to render on  and generate grid
    * @returns {Promise<HTMLCanvasElement>}*/
export default async function render_aqi_points(viewer, bounds) {
    // Hard coded for now.
    bounds = { west: -130, south: 20, east: -60, north: 50 };

    const result_grid = await generate_heatmap_grid(3, 3, bounds)
    console.info("GRID:", result_grid);

    return render_aqi_heatmap_to_canvas(result_grid, bounds);
}


function render_aqi_heatmap_to_canvas(grid, bounds) {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  const rows = grid.length;
  const cols = grid[0].length;
  const cellWidth = canvas.width / (cols - 1);
  const cellHeight = canvas.height / (rows - 1);

  // Simple bilinear interpolation
  for (let y = 0; y < canvas.height; y++) {
    const gy = y / cellHeight;
    const y0 = Math.floor(gy);
    const y1 = Math.min(y0 + 1, rows - 1);
    const fy = gy - y0;

    for (let x = 0; x < canvas.width; x++) {
      const gx = x / cellWidth;
      const x0 = Math.floor(gx);
      const x1 = Math.min(x0 + 1, cols - 1);
      const fx = gx - x0;

      // bilinear interpolation
      const a00 = grid[y0][x0];
      const a01 = grid[y0][x1];
      const a10 = grid[y1][x0];
      const a11 = grid[y1][x1];

      const a0 = a00 * (1 - fx) + a01 * fx;
      const a1 = a10 * (1 - fx) + a11 * fx;
      const aqi = a0 * (1 - fy) + a1 * fy;

      console.log(get_aqi_color_css(aqi))
      ctx.fillStyle = get_aqi_color_css(aqi);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas;
}

async function generate_heatmap_grid(rows, cols, bounds) {
    const grid = [];
    const offset_x = Math.abs(bounds.west - bounds.east) / cols;
    const offset_y = Math.abs(bounds.south - bounds.north) / rows;

    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        let lat = bounds.south + y * offset_y;
        
        for (let x = 0; x < cols; x++) {
            let lon = bounds.west + x * offset_x;
            console.log(lat, lon)

            console.log(get_pixel_aqi_color(5, {lat, lon}));
            const pixel_color = await get_pixel_aqi_color(5, {lat, lon})
            grid[y][x] = pixel_color;
        }
    }

    return grid;
}

