# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# 🎵 Live-coding Music App

A React-based user interface for [Strudel](https://strudel.cc), a live coding environment for algorithmic music. This application provides an intuitive control panel for creating, editing, managing and performing with Strudel patterns.

## ✨ Features
- **Visual Code Editor** with syntax highlighting
- **Part-based Music Coding Syntax** for managing individual instruments
- **Real-time Transport Controls** for playback management
- **Dynamic Tempo Control** with BPM adjustment
- **Master Volume Control** with mute functionality (0-200% range)
- **Instrument Control** with ON/HUSH/SOLO modes
- **Project Save/Load** functionality (JSON format)
- **d3 Graph Visualisation** for cutoff frequency analysis

-- 

## App Sections

### 1. Code Input & Editor

**Location:** Main left panel

- **Text to preprocess:** Large textarea for entering code
- **Code Editor:** for editing code
- Supports syntax highlighting via CodeMirror
- Code must be preprocessed before playback

**Part Definition Syntax:**
```javascript
<part:partname>
partname:
note("c3 e3 g3")
.sound("piano")
.gain(1)
</part:partname>
```

**Rules:**
- Opening and closing tags must match exactly
- Part names should be alphanumeric (letters and numbers only)
- Each part becomes a controllable instrument section

---

### 2. Transport Controls ⏯️

**Location:** Right panel (accordion section)

| Button | Function | Notes |
|--------|----------|-------|
| **⚙️ Preprocess** | Processes code with current part states and volume | Required before first play |
| **▶️⚙️ Proc & Play** | Preprocesses code and starts playback immediately | One-click play |
| **▶️ Play** | Starts playback | Requires code to be preprocessed first |
| **⏹️ Stop** | Stops playback | Immediately halts all sound |

**Workflow:**
1. First time: Click "Proc & Play" to process and start
2. After code edits: Click "Preprocess" then "Play"
3. Quick restart: Use "Proc & Play" to update and restart

---

### 3. Master Volume Control 🔊

**Location:** Right panel (accordion section)

**Components:**
- **Mute Button**: Toggle mute/unmute (preserves volume setting)
- **Volume Display**: Shows current volume as percentage
- **Slider**: Adjustable range from 0% to 200%
  - 0-100%: Normal volume range
  - 100-200%: Boosted volume range
- **Volume Icon**: Changes based on level (🔇/🔈/🔉/🔊)

**How it works:**
- Multiplies all `.gain()` values in your code during preprocessing
- Applied globally to all parts
- Changes take effect on next playback start

**⚠️ Warning:** Values above 150% may cause distortion or clipping. Use headphones with caution at high volumes.

---

### 4. Tempo Control ⏱️

**Location:** Right panel (accordion section)

**Controls:**
- **BPM Input Field**: Direct entry (valid range: 20-300)
- **- Button**: Decrease BPM by 1
- **+ Button**: Increase BPM by 1
- **Set Button**: Apply the entered BPM value
- **Preset Buttons**: Quick access to 60, 90, 120, 140, 160 BPM

**How it works:**
- Modifies the `setcps()` function in your code
- Formula: `setcps(BPM/60/4)`
- Changes apply on next playback (automatically restarts if playing)
- BPM is auto-detected from code if `setcps()` is present

**Note:** If your code doesn't contain `setcps()`, the default is 140 BPM.

---

### 5. Instrument Controls 🎛️

**Location:** Right panel (accordion section)

Each detected `<part:name>` section gets its own control panel with three state buttons:

| State | Button Color | Behavior |
|-------|-------------|----------|
| **ON** | Green | Part plays normally |
| **HUSH** | Gray | Part is muted (commented out) |
| **SOLO** | Yellow | Only soloed parts play |

**SOLO Mode Behavior:**
- When any part is set to SOLO, all non-soloed parts are automatically muted
- Multiple parts can be soloed simultaneously
- To return to normal: switch all SOLO parts back to ON
- HUSH state is ignored when SOLO is active elsewhere

**Live Control:**
- Changes apply immediately if playback is running
- Automatically restarts playback with new configuration
- Short 50ms delay prevents audio glitches during updates

---

### 6. Project Manager 💾

**Location:** Right panel (accordion section)

**Save Project:**
1. Enter a project name
2. Click "💾 Save Project"
3. Downloads as `.json` file to your computer

**Load Project:**
1. Click "📂 Load Project"
2. Select a `.json` project file
3. All settings and code are restored

**Saved Data Includes:**
- Raw Strudel code
- Part states (ON/HUSH/SOLO)
- BPM setting
- Project metadata (name, timestamps)

**File Naming:**
- Automatically sanitized (special characters removed)
- Spaces replaced with underscores
- Converted to lowercase
- Example: "My Cool Beat" -> `my_cool_beat.json`

---

### 7. Cutoff Frequency Graph 📊

**Location:** Button in right panel (opens modal)

**Purpose:**
- Visualizes cutoff frequency data from playing patterns
- Uses d3 module for real-time area chart rendering
- Y-axis: Frequency in Hz (0-2000 Hz range)
- X-axis: sequence position

---

## 📋 Usage Guide

### Getting Started

1. **Wait for initialization**: Ensure "Loading Strudel Editor... Please wait" disappears
2. **Default tune**: A demo tune loads automatically on startup
3. **First play**: Click "▶️⚙️ Proc & Play" to start
4. **Experiment**: Try toggling instrument states, adjusting volume/tempo
5. **Edit**: Modify code in the textarea
6. **Update**: Click "⚙️ Preprocess" to apply changes, then "▶️ Play"

### Best Practices

1. **Always preprocess after editing** code before playing
2. **Use part tags** to enable instrument controls
3. **Save your work** regularly using Project Manager
4. **Start with lower volumes** when experimenting (50-75%)
5. **Use SOLO mode** to isolate and debug individual parts
6. **Test BPM changes** with small increments

### Typical Workflow

```
1. Write/edit code with <part:name> sections
2. Click "Proc & Play" (or "Preprocess" then "Play")
3. Adjust instruments (ON/HUSH/SOLO)
4. Fine-tune volume and tempo
5. Make code changes as needed
6. Preprocess again to update
7. Save project when satisfied
```

---

## ⚠️ Known Quirks & Limitations

### Quirks

1. **Initialization Required**
   - Must wait for Strudel editor to fully load
   - "Loading Strudel Editor..." alert will appear initially
   - All controls disabled until ready

2. **First Play Requirement**
   - Must click "Preprocess" or "Proc & Play" before "Play" button works
   - Alert will remind you if forgotten

3. **Live Updates Restart Playback**
   - Changing part states while playing → automatic restart
   - Changing volume while playing → automatic restart
   - Changing tempo while playing → automatic restart
   - Brief 50ms delay during transitions

4. **Volume Range**
   - Slider goes to 200% for boosting quiet samples
   - Values >150% may cause audio distortion
   - Recommended range: 50-125% for most use cases

5. **BPM Detection**
   - Auto-extracts BPM from `setcps()` in code
   - If no `setcps()` found, defaults to 140 BPM
   - Manual BPM changes modify code's `setcps()` line

6. **Part Detection**
   - Only detects parts with proper `<part:name>` tags
   - Part names must be consistent in opening/closing tags
   - Parts appear in Instrument Controls after detection

7. **SOLO Mode Override**
   - When ANY part is SOLO, it mutes ALL non-soloed parts
   - HUSH state ignored when SOLO is active elsewhere
   - Can be confusing if you forget parts are soloed

8. **Graph Visualization**
   - Only shows data for patterns using `.cutoff()` parameter
   - Empty graph if no cutoff data available
   - Limited to last 100 events

### Limitations

- **No undo/redo** in code editor
- **No code syntax validation** before preprocessing
- **No real-time error messages** (check browser console)
- **No collaborative editing** features
- **No audio export** (record via system audio if needed)
