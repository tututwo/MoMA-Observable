import * as Plot from "npm:@observablehq/plot";
import roughJS from "npm:roughjs";

export function roughPlugin(Plot) {
    const myPlot = Object.create(Plot);
  function wrapPlotFunction(funcName) {
    const originalFunc = Plot[funcName];
    myPlot[funcName] = (...args) => {
      let data, options;
      if (args.length === 1 && !isIterable(args[0])) {
        [options] = args;
        data = null;
      } else {
        [data, options = {}] = args;
      }
      const { rough, ...restOptions } = options;
      const mark = originalFunc(data, restOptions);

      if (mark && typeof mark === "object") {
        if (rough) {
          const { id, ...roughOptions } = rough;
          mark.rough = roughOptions;
          mark.ariaLabel =
            id ||
            `rough-${funcName}-${Math.random().toString(36).substr(2, 9)}`;
          // if (!!mark.plot) {
          //   Object.keys(mark).forEach((key) => {
          //     if (!isNaN(Number(key))) {
          //       mark[key].rough = roughOptions;
          //       mark[key].ariaLabel =
          //         id ||
          //         `rough-${funcName}-${Math.random().toString(36).substr(2, 9)}`;
          //     }
          //   });
          // } else {
          //   mark.rough = roughOptions;
          //   mark.ariaLabel =
          //     id ||
          //     `rough-${funcName}-${Math.random().toString(36).substr(2, 9)}`;
          // }
        }
      }
      return mark;
    };
  }
  plotFunctions.forEach(wrapPlotFunction);

  const originalPlot = Plot.plot;

  myPlot.plot = (options) => {
    const svg = originalPlot(options);

    function applyRoughToMark(mark) {
      if (mark && mark.rough) {
        const groupElements = svg.querySelectorAll(
          `g[aria-label="${mark.ariaLabel}"]`
        );
        if (groupElements.length > 0) {
          applyRoughStyling(groupElements, mark.rough);
        }
      }
    }

    function processMarks(marks) {
      marks.forEach((mark) => {
        if (Array.isArray(mark)) {
          // This is a custom mark (composite mark)
          processMarks(mark);
        } else if (typeof mark === "object" && mark !== null) {
          // This is a normal mark
          applyRoughToMark(mark);
        }
      });
    }
    // recursive processMarks function
    processMarks(options.marks);

    return svg;
  };
  return myPlot;
}
function applyRoughStyling(gContainer, roughOptions) {
  const roughSvg = roughJS.svg(gContainer);

  gContainer.forEach((svg) => {
    svg
      .querySelectorAll(
        "rect:not(clipPath *), circle:not(clipPath *), path:not(clipPath *), line:not(clipPath *)"
      )
      .forEach((element) => {
        let roughElement;

        // Extract fill and stroke from the original element
        const fill =
          svg.getAttribute("fill") ||
          element.getAttribute("fill") ||
          "transparent";
        const stroke =
          svg.getAttribute("stroke") ||
          element.getAttribute("stroke") ||
          "black";
        const clipPath = element.getAttribute("clip-path") || "";

        // Merge fill and stroke with roughOptions
        const mergedOptions = {
          ...roughOptions,
          fill: roughOptions.fill || fill,
          stroke: roughOptions.stroke || stroke,
        };

        switch (element.tagName.toLowerCase()) {
          case "rect":
            const x = parseFloat(element.getAttribute("x") || 0);
            const y = parseFloat(element.getAttribute("y") || 0);
            const width = parseFloat(element.getAttribute("width"));
            const height = parseFloat(element.getAttribute("height"));
            roughElement = roughSvg.rectangle(
              x,
              y,
              width,
              height,
              mergedOptions
            );
            break;
          case "circle":
            const cx = parseFloat(element.getAttribute("cx"));
            const cy = parseFloat(element.getAttribute("cy"));
            const r = parseFloat(element.getAttribute("r"));
            roughElement = roughSvg.circle(cx, cy, r * 2, mergedOptions);
            break;
          case "path":
            roughElement = roughSvg.path(element.getAttribute("d"), {
              ...mergedOptions,
            });
            break;
          case "line":
            const x1 = parseFloat(element.getAttribute("x1"));
            const y1 = parseFloat(element.getAttribute("y1"));
            const x2 = parseFloat(element.getAttribute("x2"));
            const y2 = parseFloat(element.getAttribute("y2"));
            roughElement = roughSvg.line(x1, y1, x2, y2, mergedOptions);
            break;
        }

        if (roughElement) {
          // Create a group to hold the rough element
          // const group = document.createElementNS(
          //   "http://www.w3.org/2000/svg",
          //   "g"
          // );
          // element.parentNode.replaceChild(group, element);
          // Apply clip-path to the group if it exists
          if (clipPath) {
            // group.setAttribute("clip-path", clipPath);
          }
          roughElement.setAttribute(
            "transform",
            element.getAttribute("transform") ?? ""
          );
          roughElement.setAttribute("class", "rough-elements-group");
          // Replace the original element with the group

          element.parentNode.insertBefore(roughElement, element);
          // element.style.display = "none";
          element.parentNode.removeChild(element);
        }
      });
  });
}
const plotFunctions = [
  "area",
  "areaX",
  "areaY",
  // "arealineY",
  "arrow",
  // "auto",
  // "autoSpec",
  // "axisFx",
  // "axisFy",
  // "axisX",
  // "axisY",
  "barX",
  "barY",
  // "bin",
  // "binX",
  // "binY",
  "bollinger",
  "bollingerX",
  "bollingerY",
  "boxX",
  "boxY",
  "cell",
  "cellX",
  "cellY",
  // "centroid",
  "circle",
  // "cluster",
  "column",
  "contour",
  "crosshair",
  "crosshairX",
  "crosshairY",
  "delaunayLink",
  "delaunayMesh",
  "density",
  "differenceY",
  // "dodgeX",
  // "dodgeY",
  "dot",
  "dotX",
  "dotY",
  // "filter",
  // "find",
  // "formatIsoDate",
  // "formatMonth",
  // "formatNumber",
  // "formatWeekday",
  "frame",
  "geo",
  // "geoCentroid",
  "graticule",
  "gridFx",
  "gridFy",
  "gridX",
  "gridY",
  // "group",
  // "groupX",
  // "groupY",
  // "groupZ",
  "hexagon",
  // "hexbin",
  "hexgrid",
  "hull",
  // "identity",
  // "image",
  // "indexOf",
  // "initializer",
  // "interpolateNearest",
  // "interpolateNone",
  // "interpolatorBarycentric",
  // "interpolatorRandomWalk",
  "legend",
  "line",
  "lineX",
  "lineY",
  "linearRegressionX",
  "linearRegressionY",
  "link",
  // "map",
  // "mapX",
  // "mapY",
  // "marks",
  // "normalize",
  // "normalizeX",
  // "normalizeY",
  // "numberInterval",
  // "plot",
  // "pointer",
  // "pointerX",
  // "pointerY",
  "raster",
  "rect",
  "rectX",
  "rectY",
  // "reverse",
  "ruleX",
  "ruleY",
  // "scale",
  // "select",
  // "selectFirst",
  // "selectLast",
  // "selectMaxX",
  // "selectMaxY",
  // "selectMinX",
  // "selectMinY",
  // "shiftX",
  // "shuffle",
  // "sort",
  "sphere",
  "spike",
  // "stackX",
  // "stackX1",
  // "stackX2",
  // "stackY",
  // "stackY1",
  // "stackY2",
  "text",
  "textX",
  "textY",
  // "tickX",
  // "tickY",
  // "timeInterval",
  // "tip",
  // "transform",
  // "tree",
  // "treeLink",
  // "treeNode",
  // "utcInterval",
  // "valueof",
  // "vector",
  // "vectorX",
  // "vectorY",
  // "version",
  // "voronoi",
  // "voronoiMesh",
  // "window",
  // "windowX",
  // "windowY"
];
// wrote to handle the axis situation
function isIterable(value) {
  return value && typeof value[Symbol.iterator] === "function";
}
// export const roughPluginPlot = roughPlugin(Plot);
