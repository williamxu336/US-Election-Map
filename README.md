# U.S. Presidential Election Visualization

This project is an interactive visualization tool for exploring U.S. presidential election results from 1972–2024. It combines a hexagonal U.S. map, scatterplots, balance bars, and dynamic colormapping to help users compare voting patterns across states, years, and parties.

---

## Features

### 1. Balance Bars
- Two bars at the top display the **Democratic (blue)** and **Republican (red)** totals for both **popular votes** and **Electoral College votes (EC)**.
- Values are formatted with commas for readability.
- Bars smoothly update with transitions when the year changes.

### 2. Hexagonal U.S. Map
- Each state (and D.C.) is shown as a labeled hexagon, adapted from [NPR’s hex-tile map](https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html).
- States are colored based on the selected colormap mode.
- Tooltips appear on hover, showing state name, year, popular vote counts, and EC votes.
- Hovering also highlights the corresponding state in the scatterplot.

### 3. Scatterplot
- Displays all states in a 2D space, with layout and color depending on the selected mode.
- Three supported modes:
  - **RVD (Republican vs Democratic)**  
    - X = warped Republican votes, Y = warped Democratic votes.  
    - States are red or blue, depending on which party had more votes.
  - **PUR (Purple Scale)**  
    - Same layout as RVD.  
    - States colored along a blue–purple–red spectrum based on political leaning (PL).
  - **LVA (Lean vs Amount)**  
    - X = political leaning (PL), Y = warped total votes (VA).  
    - Colors balance between blue, gray, and red, with luminance increasing for larger vote totals.
- Scatterplot positions and colors transition smoothly between years.

### 4. Timeline Slider
- Allows users to scrub through elections from 1972–2024.
- Updating the slider changes:
  - Balance bars
  - State colors on the hex map
  - Scatterplot positions

### 5. Interactive Linking
- Hovering over a state in the hex map highlights it in the scatterplot, and vice versa.
- Tooltips provide structured info (in table format) about state-level results.
- Optional extra credit: implemented trajectory paths showing how a state moves across elections over time, with thickness indicating recency.

---

## Data Sources
- **votes.csv**: Popular and EC votes for Democrats (DN, DE) and Republicans (RN, RE) by state/year.  
- **stateNames.csv**: Mapping of state abbreviations to full names.  
- **hexRC.csv**: Hex grid layout coordinates for states.  
- **candidateNames.csv**: Names of Democratic and Republican candidates per year.  

Data was compiled from Wikipedia election pages and double-checked for Maine and Nebraska’s split EC allocations.

---

## Technical Details
- Built using **D3.js** for visualization and transitions.
- Hex map rendered with SVG polygons.
- Scatterplot underlaid with a colormap drawn on an HTML5 canvas.
- Data preprocessing (`dataProc()`) computes derived quantities:  
  - **TN** = DN + RN  
  - **PL** = 2×RN / (1+TN) – 1  
  - **DA, RA** = warped values for Democratic/Republican popular votes  
  - **VA** = warped value for total votes  
- Warping functions (`W1`, `W2`) spread out vote counts to improve ordinal comparisons across states.

---

## How to Run
1. Clone this repository.
2. Open `index.html` in a browser.
3. Explore the timeline, scatterplot modes, and hover interactions.

---

## Example Use Cases
- Explore how population growth affects total votes over time.
- Compare consistent Republican- or Democratic-leaning states.
- Visualize political polarization by examining scatterplot trajectories.
- See how balance of power in EC vs. popular votes evolves.