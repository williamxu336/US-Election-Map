// p3.js: p3 student code
// Copyright (C)  2025 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2025 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2025 DataVis class.
*/
/*
NOTE: Document here (after the "begin  student  code" line)
v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (other people & resources)
^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)
anyone or anything extra you used for this work (understanding what to do, and how to do it).
Besides the instructor, TA, and project partner (if you had one), who else did you you work with?
What other code, web pages, documents (outside the class readings), or generative AI services
helped you finish the work? Documentation you provide above helps the instructor know about other
useful resources, and helps the graders understand sources of code similarities between students.
*/
'use strict';
// for P3 only, with its "RN", "RE", etc, this rule may get annoying
/* eslint-disable new-cap */
import {
  d3,
  parm,
  gbos,
  // what else do you want to import from common.js?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (p3 imports from common)
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (3L in ref)
} from './common.js';

/* create the annotated balance bars for popular and electoral college votes */
export const balanceInit = function (did, sid) {
  const div = document.getElementById(did);
  /* appending elements to the div likely changes clientWidth and clientHeight, hence the need to
  save these values representing the original grid */
  const ww = div.clientWidth;
  let hh = div.clientHeight;
  const svg = d3.select('#' + did).append('svg');
  // make svg fully occupy the (original) containing div
  svg.attr('id', sid).attr('width', ww).attr('height', hh);
  const wee = 2;
  const balance = svg.append('g').attr('transform', `translate(0,${2 * wee})`);
  hh -= 2 * wee;
  /* ascii-art diagram of coordinates and id's in balance bar
                     L                                                        R
  +                  ----------------------------|-----------------------------
        popular vote | #D-pv-bar,#D-pv-txt       |        #R-pv-bar,#R-pv-txt |
  H                  ----------------------------|-----------------------------
                       #D-name                   |                    #R-name
                     ----------------------------|-----------------------------
   electoral college | #D-ec-bar,#D-ec-txt       |        #R-ec-bar,#R-ec-txt |
                     ----------------------------|-----------------------------
  */
  // some convenience variables for defining geometry
  const L = ww / 7;
  const R = (6.5 * ww) / 7;
  const H = hh / 3;
  // forEach'ing over an array of adhoc parameter objects to avoid copy-pasta
  [
    // create the left-side labels for the two bars
    { y: 0.5 * H, t: 'Popular Vote' },
    { y: 2.5 * H, t: 'Electoral College' },
  ].forEach((i) => {
    balance
      .append('text')
      .attr('transform', `translate(${L - wee},${i.y})`)
      .style('text-anchor', 'end')
      .html(i.t);
  });
  const parts = [
    /* the bars and text values for the four counts: {D,R}x{popular vote, electoral college}, and,
    the two candidate names */
    { id: 'D-pv', p: -1, y: 0 },
    { id: 'D-name', p: -1, y: 1.1 * H },
    { id: 'D-ec', p: -1, y: 2 * H },
    { id: 'R-pv', p: 1, y: 0 },
    { id: 'R-name', p: 1, y: 1.1 * H },
    { id: 'R-ec', p: 1, y: 2 * H },
  ];
  parts.forEach((i) => {
    if (!i.id.includes('name')) {
      balance
        .append('rect')
        .attr(
          /* NOTE how these bars are transformed: your code only needs to set the "width" attribute
          (even though the D bars grow rightward, and the R bars grown leftward),
          and, your code doesn't need to know the width in pixels.
          Just set width to 0.5 to make the bar go to the middle */
          'transform',
          i.p < 0 ? `translate(${L},0) scale(${R - L},1)` : `translate(${R},0) scale(${L - R},1)`
        )
        .attr('x', 0)
        .attr('y', i.y)
        .attr('height', H)
        .attr('fill', i.p < 0 ? parm.colorDem : parm.colorRep)
        // NOTE: select the bars with '#D-pv-bar', '#D-ec-bar', '#R-pv-bar', '#R-ec-bar'
        .attr('id', `${i.id}-bar`)
        .attr('width', 0.239); // totally random initial fractional value
    }
  });
  parts.forEach((i) => {
    const txt = balance
      .append('text')
      .attr('transform', `translate(${i.p < 0 ? L + wee : R - wee},${i.y + 0.5 * H})`)
      .style('text-anchor', i.p < 0 ? 'start' : 'end')
      // NOTE: select the text fields with '#D-pv-txt', '#D-ec-txt', '#R-pv-txt', '#R-ec-txt'
      .attr('id', `${i.id}${i.id.includes('name') ? '' : '-txt'}`);
    txt.html('#' + txt.node().id); // initialize text to show its own CSS selector
  });
  balance
    .append('line')
    .attr('x1', (L + R) / 2)
    .attr('x2', (L + R) / 2)
    .attr('y1', 0)
    .attr('y2', hh)
    .attr('stroke-width', 1)
    .attr('stroke', '#fff');
};

/* `canvasInit` initializes the HTML canvas that we use to draw a picture of the bivariate
colormap underneath the scatterplot. NOTE THAT AS A SIDE-EFFECT this sets gbos.scatContext
and `gbos.scatImage`, which you must use again later when changing the pixel values inside
the canvas */
export const canvasInit = function (id) {
  const canvas = document.querySelector('#' + id);
  canvas.width = parm.scatSize;
  canvas.height = parm.scatSize;
  const marg = parm.scatMarg;
  canvas.style.padding = `${marg}px`;
  gbos.scatContext = canvas.getContext('2d');
  gbos.scatImage = gbos.scatContext.createImageData(parm.scatSize, parm.scatSize);
  /* set pixels of `gbos.scatImage` to checkerboard pattern with ramps; the only purpose of this
  is to show an example of traversing the `scatImage` pixel array, in a way that (with thought
  and scrutiny) identifies how `i` and `j` are varying over the image as it is seen on the screen.
  NOTE that nested C-style for() loops like this are an idiomatic way of working with pixel
  data arrays, as opposed to functional idioms like .map() or .forEach that we use for other
  kinds of arrays. You can do the same in your code, but other than for this particular need,
  you should *not* add other "eslint-disable" comments that would subvert ESlint grading. */
  // eslint-disable-next-line no-restricted-syntax
  for (let k = 0, j = 0; j < parm.scatSize; j++) {
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < parm.scatSize; i++) {
      gbos.scatImage.data[k++] =
        100 + // RED channel is a constant plus ...
        (120 * i) / parm.scatSize + // ... ramp up along i,
        30 * (Math.floor(i / 40) % 2); // with wide bands
      gbos.scatImage.data[k++] =
        100 + // GREEN channel is a constant plus ...
        (120 * j) / parm.scatSize + // ... ramp up along with j,
        30 * (Math.floor(j / 10) % 2); // with narrow bands
      gbos.scatImage.data[k++] = 30; // BLUE channel is constant
      gbos.scatImage.data[k++] = 255; // 255 = full OPACITY (don't change)
    }
  }
  /* display scatImage inside canvas.
  NOTE that you will need to call this again (exactly this way, with these variable names)
  anytime you change the scatImage.data canvas pixels */
  gbos.scatContext.putImageData(gbos.scatImage, 0, 0);
};

/* Place the scatterplot axis labels, and finalize the stacking of both the labels and the
scatterplot marks over the canvas. That this assumes many specific element ids in the DOM is likely
evidence of bad design */
export const scatLabelPos = function () {
  // place the scatterplot axis labels.
  const wee = parm.scatTweak; // extra tweak to text position
  const marg = parm.scatMarg;
  const sz = parm.scatSize;
  /* since these two had style "position: absolute", we have to specify where they will be, and
  this is done relative to the previously placed element, the canvas */
  /* (other functions here in p3.js try to avoid assuming particular element ids, using instead ids
  passed to the function, but that unfortunately became impractical for this function) */
  ['#scat-axes', '#scat-marks-container'].map((pid) =>
    d3
      .select(pid)
      .style('left', 0)
      .style('top', 0)
      .attr('width', 2 * marg + sz)
      .attr('height', 2 * marg + sz)
  );
  d3.select('#y-axis').attr('transform', `translate(${marg - wee},${marg + sz / 2}) rotate(-90)`);
  d3.select('#x-axis').attr('transform', `translate(${marg + sz / 2},${marg + sz + wee + 13})`);
  d3.select('#scat-marks')
    .attr('transform', `translate(${marg},${marg})`)
    .attr('width', sz)
    .attr('height', sz);
};

/* scatMarksInit() creates the per-state circles to be drawn over the scatterplot */
export const scatMarksInit = function (id, data) {
  /* maps interval [0,data.length-1] to [0,parm.scatSize-1]; this is NOT an especially informative thing
  to do; it just gives all the tickmarks some well-defined initial location */
  const tscl = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, parm.scatSize]);
  /* create the circles */
  d3.select('#' + id)
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('class', 'stateScat')
    // note that every scatterplot mark gets its own id, eg. 'stateScat_IL'
    .attr('id', (d) => `stateScat_${d.StateAbbr}`)
    .attr('r', parm.circRad)
    .attr('cx', (d, ii) => tscl(ii))
    .attr('cy', (d, ii) => parm.scatSize - tscl(ii));
};

export const formsInit = function (tlid, yid, years, mdid) {
  // finish setting up timeline for choosing the year
  const tl = d3.select('#' + tlid);
  tl.attr('min', d3.min(years))
    .attr('max', d3.max(years))
    .attr('step', 4) // presidential elections are every 4 years
    // responding to both input and click facilitates being activated from code
    .on('input click', function () {
      /* This is one of the situations in which you CANNOT use an arrow function; you need a real
      "function" so that "this" is usefully set (here, "this" is this input element) */
      d3.select('#' + yid).html(this.value);
      yearSet(+this.value); // need the "+"" so that year is numeric
    });
  // create radio buttons for choosing colormap/scatterplot mode
  const radioModes = Object.keys(gbos.modeDesc).map((id) => ({
    id,
    str: gbos.modeDesc[id],
  }));
  // one span per choice
  const spans = d3
    .select('#' + mdid)
    .selectAll('span')
    .data(radioModes)
    .join('span');
  // inside each span, put a radio button
  spans
    .append('input')
    // add some spacing left of 2nd and 3rd radio button; the 'px' units are in fact needed
    .style('margin-left', (_, i) => `${20 * !!i}px`)
    .attr('type', 'radio')
    .attr('name', 'mode') // any string that all the radiobuttons share
    .attr('id', (d) => d.id) // so label can refer to this, and is thus clickable
    .attr('value', (d) => d.id) // so that form as a whole has a value
    /* respond to being selected by calling the modeSet function (in this file). Here too
    we really need "function" or else "this" will not have the expected meaning */
    .on('input', function () {
      modeSet(this.value);
    });
  // also in each span put the choice description
  spans
    .append('label')
    .attr('for', (d) => d.id)
    .html((d) => d.str);
};

/* TODO: finish `dataProc`, which assumes the `gbos` global state object, and modifies it as
needed prior to interactions starting.
You will want to do things with the results of reading all the CSV data,
currently sitting in `gbos.csvData`. */
export const dataProc = () => {
  // some likely useful things are computed for you
  // gbos.years: sorted array of all numerical years
  gbos.years = gbos.csvData.votes.columns // all column headers from voting data CSV
    .filter((c) => c.includes('_')) // select the years (works for given votes.csv)
    .map((c) => c.split('_')[1]) // extract year part (dropping 'DN', 'DE', 'RN', 'RE')
    // select only unique elements (note the use of all 3 args of filter function)
    .filter((d, i, A) => i === A.indexOf(d))
    .map((y) => +y) // and make into numbers
    .sort(); // make sure sorted if not already
  // gbos.stateName: maps from two-letter abbreviation to full "state" name.
  gbos.stateName = {};
  gbos.csvData.stateNames.forEach((s) => (gbos.stateName[s.StateAbbr] = s.StateName));
  // gbos.cname: maps from election year to little object with D and R candidate names
  gbos.cname = {};
  gbos.csvData.candidateNames.forEach((nn) => {
    gbos.cname[+nn.year] = {
      D: nn.D,
      R: nn.R,
    };
  });
  // what other arrays or objects do you want to set up?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (p3 dataProc)
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (54L in ref)
};

/* TODO: finish `visInit`, which sets up any other state or resources that your vis code
will use to support fast user interaction (very likely involving the `gbos` global variable) */
export const visInit = function () {
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (p3 visInit)
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (69L in ref)
};

const updateAxes = function (mode) {
  if ('PUR' === mode) mode = 'RVD'; // RVD and PUR same; handle RVD
  const axLabels = {
    RVD: ['Republican Votes', 'Democratic Votes'],
    LVA: ['Political Leaning', 'Amount of Votes'],
  }[mode];
  d3.select('#x-axis').html(axLabels[0]);
  d3.select('#y-axis').html(axLabels[1]);
};

/* TODO: add any other functions you need, including those called by `modeSet` and `yearSet`.
By the magic of hoisting, any functions you add here will also be visible to
`dataProc` and `visInit` above. */
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (p3 new functions)
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (115L in ref)

// UI wants to set the new colormapping mode to "mode"
const modeSet = function (mode) {
  console.log(`modeSet(${mode}): hello`);
  if (gbos.currentMode === mode) return; // nothing to do
  // else do work to display mode "mode"
  updateAxes(mode);
  /* Your code should update:
  - the position of the marks in the scatterplot, and
  - the colormap image underneath the scatterplot,
  - how the states in the US map are filled.
  NOTICE how few lines of code are in the reference code here!  Grading does not
  look at how closely you match lines of code, but consider how to organize your
  code to avoid copy-pasta and keep it legible for others. */
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (p3 modeSet)
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (3L in ref)
  gbos.currentMode = mode;
};

// UI wants to set the near year to "year"
const yearSet = function (year) {
  console.log(`yearSet(${year}): hello`);
  if (gbos.currentYear === year) return; // nothing to do
  /* else do work to display year "year". Your code should update:
  - the position of the marks in the scatterplot,
  - how the states in the US map are filled, and
  - and the balance bars
  See note above about "NOTICE how few lines of code are in the reference code here!" */
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code (p3 yearSet)
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (4L in ref)
  gbos.currentYear = year;
};
