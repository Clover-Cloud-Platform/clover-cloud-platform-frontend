//Source: https://github.com/okalachev/arucogen
import dict from "../assets/dict.json";
function generateMarkerSvg(width, height, bits, fixPdfArtifacts = true) {
  const svg = document.createElement("svg");
  svg.setAttribute("width", "8");
  svg.setAttribute("height", "8");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("shape-rendering", "crispEdges");

  // Background rect
  const rect = document.createElement("rect");
  rect.setAttribute("x", 0);
  rect.setAttribute("y", 0);
  rect.setAttribute("width", width + 4);
  rect.setAttribute("height", height + 4);
  rect.setAttribute("fill", "white");
  svg.appendChild(rect);
  const rect2 = document.createElement("rect");
  rect2.setAttribute("x", 1);
  rect2.setAttribute("y", 1);
  rect2.setAttribute("width", width + 2);
  rect2.setAttribute("height", height + 2);
  rect2.setAttribute("fill", "black");
  svg.appendChild(rect2);

  // "Pixels"
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const white = bits[i * height + j];
      if (!white) continue;

      const pixel = document.createElement("rect");
      pixel.setAttribute("width", 1);
      pixel.setAttribute("height", 1);
      pixel.setAttribute("x", j + 2);
      pixel.setAttribute("y", i + 2);
      pixel.setAttribute("fill", "white");
      svg.appendChild(pixel);

      if (!fixPdfArtifacts) continue;

      if (j < width - 1 && bits[i * height + j + 1]) {
        pixel.setAttribute("width", 1.5);
      }

      if (i < height - 1 && bits[(i + 1) * height + j]) {
        const pixel2 = document.createElement("rect");
        pixel2.setAttribute("width", 1);
        pixel2.setAttribute("height", 1.5);
        pixel2.setAttribute("x", j + 2);
        pixel2.setAttribute("y", i + 2);
        pixel2.setAttribute("fill", "white");
        svg.appendChild(pixel2);
      }
    }
  }
  return svg;
}

function generateArucoMarker(width, height, dictName, id) {
  console.log("Generate ArUco marker " + dictName + " " + id);

  const bytes = dict[dictName][id];
  const bits = [];
  const bitsCount = width * height;

  // Parse marker's bytes
  for (let byte of bytes) {
    const start = bitsCount - bits.length;
    for (let i = Math.min(7, start - 1); i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  return generateMarkerSvg(width, height, bits);
}

export default function generateAruco(id) {
  return generateArucoMarker(4, 4, "4x4_1000", id);
}
