---
toc: false
---

<script src="https://cdn.tailwindcss.com"></script>

```js
import { roughPlugin } from "./utility/roughPlugin.js";
import * as topojson from "npm:topojson-client";
const roughPluginPlot = roughPlugin(Plot);

const colorScheme = "rdpu";
```

```js
const world = FileAttachment("data/land-110m.json").json();



const top10ArtistNames = [
  "Lee Friedlander",
  "Dorothea Lange",
  "Unidentified photographer",
  "Garry Winogrand",
  "Frans Masereel",
  "Walker Evans",
  "Marcel Duchamp",
  "Harry Callahan",
  "A.R. Penck (Ralf Winkler)",
  "Max Beckmann",
];

const BigNumberStackedBarData = [
  {
    Artist: "",
    PurchasedOrNot: true,
    percentage: 6,
  },
  {
    Artist: "",
    PurchasedOrNot: false,
    percentage: 94,
  },
];

const heatmapData = FileAttachment("data/heatmap.csv").csv({
  typed: true,
});

const byArtistNameTop10 = FileAttachment("data/byArtistNameTop10.csv").csv({
  typed: true,
});
const top10PurchasedData = FileAttachment("data/top10PurchasedData.csv").csv({
  typed: true,
});

const top10PurchasedOrNot = FileAttachment("data/top10PurchasedOrNot.csv").csv({
  typed: true,
});

```


```js
const landMesh = topojson.mesh(world, world.objects.land);
```

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: top10ArtistNames,
    scheme: colorScheme,
  },
});
```

```js
function top10Bar({ width, height }) {
  return roughPluginPlot.plot({
    width,
    height,
    marginLeft: 10,
    marginRight: 30,
    marginBottom: 0,
    marginTop: -10,
    x: {
      axis: "top",
      label: null,
      tickSize: 0,
      tickFormat: () => "",
    },
    y: {
      label: null,
      tickSize: 0,
      tickFormat: () => "",
    },
    color: { scheme: colorScheme },
    marks: [
      roughPluginPlot.barX(byArtistNameTop10, {
        x: "count",
        y: "Artist",
        fill: "Artist",
        sort: { y: "x", reverse: true },
        insetTop: 22, //- inset the top edge
        insetRight: 0, //- inset the right edge
        insetBottom: 22, // - inset the bottom edge
        insetLeft: 0, // - inset the left edge
        rough: {
          id: "top10",
          roughness: 0.5,
          bowing: 0,
          fillStyle: "hachure",
          hachureGap: 1,
          strokeWidth: 1.5,
        },
      }),
      roughPluginPlot.text(byArtistNameTop10, {
        x: 0, // Position the text at the center of the first bar
        y: "Artist",
        text: (d, i) => i + 1 + " " + d["Artist"], // Format the percentage
        textAnchor: "start",
        dy: -28,
        fontSize: 14,
        fontWeight: 600,
      }),
      roughPluginPlot.text(byArtistNameTop10, {
        x: "count", // Position the text at the center of the first bar
        y: "Artist",
        text: (d) => `${d.count.toFixed(0)}`, // Format the percentage
        textAnchor: "start",
        dx: 5,
        fontSize: 14,
        fontWeight: "bold",
      }),
    ],
  });
}
```

```js
function artistStackedBar(ArtistName, { width, height }) {
  let data;
  if (ArtistName.length > 0) {
    data = top10PurchasedOrNot
      .filter((d) => d.Artist === ArtistName)
      .sort((a, b) => b.PurchasedOrNot - a.PurchasedOrNot);
  } else {
    data = BigNumberStackedBarData;
  }
  return roughPluginPlot.plot({
    width,
    height,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    marginTop: 0,
    x: {
      label: null,
      tickSize: 0,
      tickFormat: () => "",
    },
    y: {
      label: null,
      tickSize: 0,
      tickFormat: () => "",
    },
    color: {
      domain: [true, false],
      range: ["purple", "white"],
    },
    marks: [
      roughPluginPlot.barX(
        data,
        roughPluginPlot.groupY(
          {
            x: "sum",
          },
          {
            x: "percentage",
            y: "Artist",
            fill: "PurchasedOrNot",
            tip: true,
            inset: 0, // no gaps
            rough: {
              id: ArtistName + "artistStackedBar",
              roughness: 0.5,
              bowing: 0,
              fillStyle: "hachure",
              hachureGap: 1,
              strokeWidth: 1.5,
            },
          }
        )
      ),
      roughPluginPlot.text(
        data.filter((d) => d.PurchasedOrNot),
        {
          x: (d) => d.percentage, // Position the text at the center of the first bar
          y: "Artist",
          text: (d) => `${d.percentage.toFixed(1)}%`, // Format the percentage
          textAnchor: "right",
          dx: 30,
          fontWeight: "bold",
        }
      ),
    ],
  });
}
```

```js
function artistDot(ArtistName, { width, height }) {
  const tickRange = d3.extent(
    top10PurchasedData.filter((d) => d.Artist == ArtistName),
    (d) => d.AcquiredYear
  );

  return roughPluginPlot.plot({
    color: { legend: false },
    width,
    height,
    marginLeft: 0,
    marginTop: 20,
    marginBottom: 30,
    x: {
      label: null,
      ticks: [tickRange[0], tickRange[1]],
      tickSize: 0,
      // tickFormat: (d) => d.toLocaleString("en-US", { useGrouping: false }),
    }, // This removes the x-axis title
    y: {
      label: null, // This removes the y-axis title
      tickSize: 0, // This removes the y-axis ticks
      tickFormat: () => "", // This removes the tick labels
    },
    r: { domain: [0, 1000], range: [0, 40] },
    marks: [
      roughPluginPlot.dot(
        top10PurchasedData.filter((d) => d.Artist == ArtistName),
        roughPluginPlot.group(
          { r: "sum" },
          {
            x: "AcquiredYear",
            y: "Artist",
            stroke: "black",
            fill: (d) => color.apply(ArtistName),
            r: "count",
            tip: true,
            rough: {
              id: ArtistName + "artistDot",
              fillWeight: 1,
              strokeWidth: 1,
              strokeOpacity: 1,
              hachureGap: 1,
              roughness: 0.21,
              bowing: 0,
              fillStyle: "cross-hatch",
            },
          }
        )
      ),
    ],
  });
}
```

```js
function heatmap({ width, height }) {
  return roughPluginPlot.plot({
    x: {
      // label: null, // This removes the y-axis title
      // tickSize: 0, // This removes the y-axis ticks
      // tickFormat: () => "", // This removes the tick labels
    },
    y: {
      label: null, // This removes the y-axis title
      tickSize: 0, // This removes the y-axis ticks
      // tickFormat: () => "", // This removes the tick labels
    },
    width: width,
    height: height,
    marginLeft: 80,
    marginBottom: 0,
    marginTop: 0,
    color: {
      scheme: colorScheme,
      legend: false,
      label: "count",
      domain: [0, 100],
    },
    marks: [
      roughPluginPlot.cell(heatmapData, {
        x: "decade",
        y: "Classification",
        stroke: "count",
        fill: "count",
        tip: true,
        // stroke: "white",
        inset: 1,
        rough: {
          id: "heatmap",
          roughness: 0.81,
          bowing: 10,
          strokeWidth: 1,
          hachureGap: 1,
          fillStyle: "solid",
        },
      }),
      // y bar
      // roughPluginPlot.text(
      //   Array.from(new Set(heatmapData.map((d) => d["Classification"]))).map(
      //     (d) => {
      //       return { Classification: d };
      //     }
      //   ),
      //   {
      //     x: 0, // Position the text at the center of the first bar
      //     y: "Classification",
      //     text: (d) => `${d["Classification"]}`, // Format the percentage
      //     textAnchor: "end",
      //     dx: 5,
      //     fontSize: 14,
      //     fontWeight: "thin",
      //   }
      // ),
      // cell annotation
      Plot.text(heatmapData, {
        x: "decade",
        y: "Classification",
        text: (d) => d.count,
        fontSize: 0,
        // fill: (d) => (Math.abs(d.correlation) > 0.6 ? "white" : "black"),
      }),
    ],
  });
}
```

<header class="ml-[10px] w-full relative"><div class="w-screen tracking-widest leading-10">MoMA Purchased Collection Analysis</div> <image class="w-[200px] absolute right-[20px] top-[-200%]" src="https://play-lh.googleusercontent.com/v5YffsiTFfMa0gGcOnJpfnIyC8_dqyw6O-qPlfc3_KGJiCn0SGT-z4tVbuBhPRfofHpa"></image></header>
<div class="container max-w-[3000px] h-screen mx-0 p-4">
  <!-- Big Number -->
<div class=" flex gap-4">
  <!-- Big Number 1 -->
  <div class="card my-0 bg-white shadow rounded-lg flex-1">
    <h2>Among 156738 Art Pieces</h2>
    <span class="text-gray-400">Oct. 15, 2024</span>
    <div class="text-left w-full flex items-end">
      <span
        class="text-[#682a85] text-[2rem] font-semibold flex items-center mr-2 inline"
        >9489</span
      >
      <span class="inline"> are purchased </span>
    </div>
    <div class="mt-2 text-left w-full flex items-end">
      <span class="inline">That is</span>
      <span class="text-[#682a85] text-[2rem] font-semibold mx-2 inline"> 6% </span>
      <span class="inline">of the entire collection</span>
    </div>
    <div class="mt-2 h-[20px] w-full">
        ${resize((width, height) => artistStackedBar("", { width, height }))}
      </div>
  </div>
  <!-- Big Number 2 -->
  <div class="card my-0 bg-white shadow rounded-lg flex-1 ">
        <h2>MoMA has collected work from</h2>
        <div class="flex w-full h-full">
        <div class="flex flex-col justify-between pb-4">
    <div class="text-left">
      <span class="text-[#682a85] text-[2rem] font-semibold inline">15608</span>
      <span class="text-sm text-gray-700">
        artists across 
      </span>
      <u class="font-bold">128</u> countries
    </div>
    <div class="flex items-end text-sm">
      <span class="text-[#682a85] text-[2rem] font-semibold mr-2 inline">2037 </span>
      <span class="text-gray-500">artist's work are purchased</span>
    </div>
    </div>
    <map class="flex-grow h-full pb-2"> ${resize((width, height) => Plot.marks([Plot.graticule(), Plot.geo(landMesh, {fill: "#d0b6e0"})]).plot({width:width,height: height, inset: 1, projection: {type: "orthographic", rotate: [100, -30]}}))}</map>
    </div>
  </div>
  <!-- Big Number 3 -->
  <div class="card my-0  bg-white shadow rounded-lg flex-1 flex z-[1000]">
    <div class="text-left w-[60%]">
      <h2 class="pr-2">The collection purchased by MoMA covers</h2>
            <span class="text-[#682a85] text-[2rem] font-semibold mr-2 inline">19</span>
      <span class="inline">different categories</span>
    </div>
     <div class="flex-grow h-full">${resize((width, height) => {
      const columns = [1, 2, 3, 4, 5];
const rows = [1, 2, 3, 4];
const containerHeight = height; // Example fixed height
const padding = 0; // Padding for labels and axes
const cellSize = Math.floor((containerHeight - padding) / rows.length);
const plotWidth = cellSize * columns.length;
const data = columns.flatMap(x => 
  rows.map(y => (x === 5 && y === 4) ? null : {x, y, z: Math.random()})
).filter(d => d !== null);
return roughPluginPlot.plot({
  width: plotWidth,
  height: containerHeight,
  margin:0,
  x: {
    type: "band",
    domain: columns
  },
  y: {
    type: "band",
    domain: rows,
  },
  color: {
    scheme: colorScheme,
  },
    label:null,
  marks: [
    roughPluginPlot.cell(data, { x: "x", y: "y", fill: "z",rough: {
          id: "bignumber-3",
          roughness: 0.81,
          bowing: 10,
          strokeWidth: 1,
          hachureGap: 1,
          fillStyle: "hachure",
        }, }),
  ],
});
     })}</div>
  </div>
</div>

  <!-- Rough Heatmap -->
  <div class="card bg-white p-4 shadow ">
    <h1 class="ml-[5px] text-xl">Purchased Number of Collection of Different Classification by Year</h1>
      <div class=" rounded-lg w-full h-[400px] flex-grow">
    ${resize((width, height) => heatmap({ width, height }))}
  </div>
  </div>

  <!-- Bottom Container -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 h-[100vh]">
    <!-- top 10+ Bar chart -->
     <div class="lg:col-span-1 flex flex-col row-span-5 card bg-white shadow rounded-lg ">
       <!--Bar Chart -->
           <h1 class="ml-[10px] text-lg"]>Top 10 Most Purchased Artists</h1>
       <div class="h-[200px] flex-1" id="top10-Bar-Chart">
         ${resize((width, height) => top10Bar({ width, height }))}
       </div>
    </div>
    <!-- Small Multiple -->
    <div class="card bg-white px-4 rounded-lg lg:col-span-2 row-span-5 flex flex-col">
       <h1 class="text-lg">Purchased Artist's Collection by Year</h1>
    <div
      class="flex-grow grid grid-cols-2 grid-rows-5 gap-x-[32px] gap-y-[30px]"
      id="small-multiple"
    >
      ${top10ArtistNames.map(
        (artist) => html`
          <div class=" my-0 h-full flex flex-col">
            <h2
              class="border-l-4 border-gray-500 pl-2 font-thin tracking-widest text-gray-500"
            >
              ${artist}
            </h2>
            <div class=" text-gray-700 flex justify-between">
              <div>Pieces in total</div>
              <div><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path><path fill="#a62842" d="M2 11.385H31V13.231H2z"></path><path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#a62842" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg></div>
            </div>
            <div class="flex flex-col mt-0 flex-grow">
              <div class="mt-2 h-[20px]">
                ${resize((width, height) =>
                  artistStackedBar(artist, { width, height })
                )}
              </div>
              <div class="flex-grow">
                ${resize((width, height) =>
                  artistDot(artist, { width, height })
                )}
              </div>
            </div>
          </div>
        `
      )}
    </div>
    </div>
  </div>
</div>

---

<style>
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

* {
  font-family: "Roboto"
}
 header div {
    font-family: "Roboto";
  font-size:2.5rem;
  margin-left:20px;
  font-weight:900
  }
#top10-Bar-Chart .plot-d6a7b5 text {
  /* //'Patrick Hand', cursive */
   font-family: "Gaegu", sans-serif;
  font-size:1.1rem;
  /* font-style: normal; */
  }

  #small-multiple .plot-d6a7b5 text {
  /* //'Patrick Hand', cursive */
   font-family: "Gaegu", sans-serif;
  font-size:1.2rem;
  /* font-style: normal; */
  }
</style>
