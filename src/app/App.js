import '../assets/cors-redirect';
import '../assets/App.css';
import '../assets/Component.css';
import { useEffect, useRef, useMemo, useState, useCallback, use } from "react";
import { useStrudelEditor } from "../hooks/useStrudelEditor"
import { stranger_tune } from './tunes';
import PreprocessInput from '../components/preprocessInput';
import Transport from '../components/transport';
import EditorPane from '../components/editorPane';
import PartControls from '../components/partControls'
import console_monkey_patch, { getD3Data } from '../console-monkey-patch';
import { detectParts, preprocess } from '../utils/strudelPreprocessing';
import TempoControl from '../components/tempoControl';
import ProjectManager from '../components/projectManager';
import { 
  createProject,
  saveProjectToFile,
  loadProjectFromFile
 } from '../utils/strudelProjectManaging';
import VolumeControl from '../components/volumeControl';

const handleD3Data = (event) => {
  console.log(event.detail);
};

export default function App(){
  const canvasRef = useRef(null);
  const [rawText, setRawText] = useState("");
  const [partStates, setPartStates] = useState({});
  // Example: partStates = { 'arp': 'on', 'bass': 'hush' }
  const [bpm, setBpm] = useState(140); // Default BPM
  const [projectName, setProjectName] = useState("Untitled Project");
  const [volume, setVolume] = useState(1.0) // 100% volume by defualt
  const isUpdatingRef = useRef(false); // Still be tested not use if it is useful

  // Detect parts from raw text
  const detectedParts = useMemo(() => detectParts(rawText), [rawText]);

  // Use and expose Strudel editor controls
  const { mountRef, ready, setCode, evaluate, stop, hasCode, isStarted } = useStrudelEditor({
    canvasRef,
    drawTime: [-2, 2],
  });

    // Preprocess code based on part states and volume
  const processed = useMemo(() => {
    return preprocess(rawText, partStates, volume);
  }, [rawText, partStates, volume]);

  // Handle preprocessing when preprocess button is clicked
  const handlePreprocess = useCallback(() => {
    if (!ready) return;
    if(!processed.trim()) return;
    setCode(processed);
    // setCodeLoaded(true);
    console.log("Preprocessed and set code.");
  }, [ready, processed, setCode]);

  // Handle preprocess and play when button is clicked
  const handleProcPlay = useCallback(() => {
    if (!ready) return;
    if(!processed.trim()) return;
    console.log(processed);
    setCode(processed);
    setTimeout(() => evaluate(), 0);
    console.log("Process and Play");
  }, [ready, processed, setCode, evaluate]);

  // Handle play button click
  const handlePlay = useCallback(() => {
    if (!ready) {
      alert("Strudel is not ready yet!\n\nPlease wait for the strudel editor to initialise");
      return;
    };

    // Handle no code case
    if(!hasCode()){
      alert("No code loaded!\n\nPlease preprocess or load a tune first.");
      return ;
    }

    evaluate();
  }, [ready, evaluate]);

  // Handle instrument part state changes
  const handlePartStateChange = useCallback((partName, newState) => {
    if(isUpdatingRef.current) return;
    setPartStates(prev => {
      const newStates = {
        ...prev,
        [partName]: newState
    };

    // If playing, restart with new part configuration
    if (isStarted()){
      isUpdatingRef.current = true;
      stop();

      setTimeout(() => {
        const newProcessed = preprocess(rawText, newStates);
        setCode(newProcessed);
        setTimeout(() => {
          evaluate();
          isUpdatingRef.current = false;
        }, 50);
      }, 50);
    }
    return newStates;
  });
  }, [isStarted, stop, setCode, evaluate, rawText]);

  // Handle BPM changes for tempo control
  const handleBpmChange = useCallback((newBpm) => {
    if(isUpdatingRef.current) return;
    setBpm(newBpm);

    setRawText(prevRawText => {
      const updatedCode = prevRawText.replace(/setcps\(([^)]+)\)/,
         `setcps(${newBpm}/60/4)`);


    if(isStarted()){
      isUpdatingRef.current = true;
      stop();
      const processedWithNewTempo = preprocess(updatedCode, partStates);
      setTimeout(() => {
        setCode(processedWithNewTempo);
        setTimeout(() => {
          evaluate();
          isUpdatingRef.current = false;
        }, 50);
      }, 50);
    }
    return updatedCode;
  })
  }, [partStates, setCode, isStarted, stop, evaluate]);

  // Handles saving current project to JSON file
  const handleSaveProject = useCallback(() => {
    try{
      const project = createProject(
        rawText,
        partStates,
        bpm,
        projectName
      );

      const filename = saveProjectToFile(project);

      alert(`Project saved succesfully!\n\nFile: ${filename}`)
      console.log("💾 Project saved:", filename);
    } catch (error) {
      console.error("Failed to save project:", error);
      alert(`Failed to save project:\n${error.message}`);
    }
  }, [rawText, partStates, bpm, projectName]);

  // Handles loading project from JSON file
  const handleLoadProject = useCallback(async (event) => {
    const file = event.target.files[0];
    if(!file) return;

    try{
      const project = await loadProjectFromFile(file);

      // Stop playback if currently playing
      if (isStarted()){
        stop();
      }

      // Apply project data to app state
      setRawText(project.code.raw);
      setPartStates(project.partStates);
      setBpm(project.settings.bpm);
      setProjectName(project.metadata.name);

      console.log(`Project loaded: ${project.metadata.name}`);
      console.log(`Parts: ${Object.keys(project.partStates).length}`);
      console.log(`BPM: ${project.settings.bpm}`);

      // Show success notification
      alert(
        `✅ Project loaded successfully!\n\n` +
        `Name: ${project.metadata.name}\n` +
        `Parts: ${Object.keys(project.partStates).length}\n` +
        `BPM: ${project.settings.bpm}\n\n` +
        `Click "Proc & Play" to start playback.`
      );
    } catch (error) {
      console.error("Failed to load project:", error);
      alert(`❌ Failed to load project:\n\n${error.message}`);
    }

    // Reset file input
    event.target.value = '';
  }, [isStarted, stop]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);

    // If playing, restart with new volume
    if(isStarted()){
      isUpdatingRef.current = true;
      stop();

      const newProcessed = preprocess(rawText, partStates, newVolume);
      setTimeout(() => {
        setCode(newProcessed);
        setTimeout(() => {
          evaluate();
          isUpdatingRef.current = false;
        }, 50);
      }, 50);
    }
  }, [isStarted, stop, rawText, partStates, setCode, evaluate]);

  // Extract BPM from raw text when it changes
  useEffect(() => {
    const match = rawText.match(/setcps\(([^)]+)\)/);
    if(match){
      const cpsValue = eval(match[1]);
      console.log("Extracted CPS:", cpsValue);
      if(!isNaN(cpsValue)){
        const extractedBpm = cpsValue * 60 *4; // Convert CPS back to BPM
        if (Math.abs(extractedBpm - bpm) > 0.1){ // Avoid unnecessary updates when BPM changes is too small
          console.log("Updating BPM to:", extractedBpm);
          setBpm(extractedBpm);
      }
    }
  }
}, [rawText]);

  // Initialize raw text with default tune if empty
  useEffect(() => {
    if (!ready) return;

    if (rawText === "") setRawText(prev => (prev === "" ? stranger_tune : prev));
  }, [ready, rawText]);

  // Update part states when detected parts change
  useEffect(() => {
    const newStates = {};
    detectedParts.forEach(part => {
        // Only check if key exists, don't read value
        if (!(part.name in partStates)) {
            newStates[part.name] = 'on';
        }
    });
    // Example: before: prev = { bass: "on", drums: "hush" }
    // newStates = { arp: "on" }

    // Only update if there are new parts
    if (Object.keys(newStates).length > 0) {
        setPartStates(prev => ({ ...prev, ...newStates }));
    }

    // Example: after: PartStates = { bass: "on", drums: "hush", arp: "on" }
    }, [detectedParts]);

  // Render UI layout
  return (
    <div>
    <h2 className='app-title'>🎵 Strudle Demo By Kimchhay Leng</h2>

    {!ready && (
      <div className="alert alert-info">
        Loading Strudel Editor... Please wait.
      </div>
    )}
    <main className="container-fluid">
      {/* Main Layout: Code Editor (Left) | Controls (Right) */}
      <div className="row g-2">
        <div class="col-md-8">
          <div className="panel editor-pane">
            <PreprocessInput value={rawText} onChange={setRawText}/>
          </div>

          <div className='panel editor-pane'>
            <EditorPane mountRef={mountRef} />
          </div>
        </div>

        <div className='col-md-4 scroll-section'>
            <div className="accordion" id="accordionExample">
              <div className="panel mb-2">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    ⏯️ Transport Controls
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show">
                  <div className="accordion-body">
                    <Transport
                      onPreprocess={handlePreprocess}
                      onProcPlay={handleProcPlay}
                      onPlay={handlePlay}
                      onStop={stop}
                      disabled={!ready}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="panel mb-2">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseVolume" aria-expanded="true" aria-controls="collapseVolume">
                    🔊 Master Volume ({(volume * 100).toFixed(0)}%)
                  </button>
                </h2>
                <div id="collapseVolume" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    <VolumeControl
                      volume={volume}
                      onVolumeChange={handleVolumeChange}
                      disabled={!ready}
                    />
                  </div>
                </div>
              </div>
            </div>
                <div className='panel mb-2'>
                <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                    ⏱️ Tempo Control (BPM: {bpm.toFixed(0)})
                  </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    <TempoControl
                      bpm={bpm}
                      onBpmChange={handleBpmChange}
                      disabled={!ready}
                    />
                  </div>
                </div>
              </div>
            </div>
              <div className='panel mb-2'>
                <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="true" aria-controls="collapseThree">
                    🎛️ Instrument Controls
                  </button>
                </h2>
                <div id="collapseThree" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    <PartControls
                    parts={detectedParts}
                    partStates={partStates}
                    onChange={handlePartStateChange}
                    disabled={!ready}
                    />
                  </div>
                </div>
              </div>
            </div>

                          <div className='panel mb-2'>
                <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="true" aria-controls="collapseFour">
                    💾 Save/Load Project
                  </button>
                </h2>
                <div id="collapseFour" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    <ProjectManager
                      projectName={projectName}
                      onProjectNameChange={setProjectName}
                      onSave={handleSaveProject}
                      onLoad={handleLoadProject}
                      disabled={!ready}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>




        </div>
      </div>
    {/* Third Row: Visualization Canvas (TBA) */}
    <div className="row mt-3">
      <div className="col-12">
        <div className="canvas-container">
        {/* <canvas ref={canvasRef}></canvas> */}
        🎵 Strudel Visualization Canvas  🎵 (TBA)
        </div>
      </div>
    </div>
    </main>
  </div>
  )
}