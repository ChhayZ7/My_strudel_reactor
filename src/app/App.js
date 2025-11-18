import '../assets/cors-redirect';
import '../assets/App.css';
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useStrudelEditor } from "../hooks/useStrudelEditor"
import { stranger_tune } from './tunes';
import PreprocessInput from '../components/preprocessInput';
import Transport from '../components/transport';
import EditorPane from '../components/editorPane';
import PartControls from '../components/partControls'
import { detectParts, preprocess } from '../utils/strudelPreprocessing';
import TempoControl from '../components/tempoControl';
import ProjectManager from '../components/projectManager';
import { 
  createProject,
  saveProjectToFile,
  loadProjectFromFile
 } from '../utils/strudelProjectManaging';
import VolumeControl from '../components/volumeControl';
import D3Visualiser from '../components/d3Visualiser';
import { ToastContainer } from '../components/toast';


export default function App(){
  const canvasRef = useRef(null);
  const [rawText, setRawText] = useState("");
  const [alreadyProcessed, setAlreadyProcessed] = useState(false);
  const [partStates, setPartStates] = useState({});
  // Example: partStates = { 'arp': 'on', 'bass': 'hush' }
  const [bpm, setBpm] = useState(140); // Default BPM
  const [projectName, setProjectName] = useState("Untitled Project");
  const [volume, setVolume] = useState(1.0) // 100% volume by defualt
  const [toasts, setToasts] = useState([]); // Toast notification state
  const toastIdRef = useRef(0);
  const isUpdatingRef = useRef(false); // Still be tested not use if it is useful

  // Detect parts from raw text
  const detectedParts = useMemo(() => detectParts(rawText), [rawText]);

  // Use and expose Strudel editor controls
  const { mountRef, ready, setCode, evaluate, stop, isStarted } = useStrudelEditor({
    canvasRef,
    drawTime: [-2, 2],
  });

    // Preprocess code based on part states and volume
  const processed = useMemo(() => {
    return preprocess(rawText, partStates, volume);
  }, [rawText, partStates, volume]);

  // Toast helper functions
  const showToast = useCallback((message, type = 'info', duration = 5000, autoClose = true) => {
    const id = toastIdRef.current++;
    const newToast = { id, message, type, duration, autoClose};

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  // Handle toast dismissal
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, [])

  // Showing different type of toast based on the app response
  const showSuccess = useCallback((message, duration = 4000) => {
    return showToast(message, 'success', duration);
  }, [showToast])

  const showError = useCallback((message, duration = 4000) => {
    return showToast(message, 'danger', duration);
  }, [showToast])

  const showWarning = useCallback((message, duration = 4000) => {
    return showToast(message, 'warning', duration);
  }, [showToast])

  const showInfo = useCallback((message, duration = 4000) => {
    return showToast(message, 'info', duration);
  }, [showToast])

  // Handle preprocessing when preprocess button is clicked
  const handlePreprocess = () => {
    if (!ready) {
      showWarning("Strudel is not ready yet!\n\nPlease wait for editor to initialise")
      return
    };
    if(!processed.trim()) {
      showWarning("No code to preprocess!\n\nPlease enter some code first.")
      return
    };
    setCode(processed);
    setAlreadyProcessed(true)
    // showSuccess("Code preprocessed successfully!");
  };

  // Handle preprocess and play when button is clicked
  const handleProcPlay = useCallback(() => {
    if (!ready) {
      showWarning("Strudel is not ready yet!\n\nPlease wait for editor to initialise")
      return
    };
    if(!processed.trim()) {
      showWarning("No code to preprocess!\n\nPlease enter some code first.")
      return
    };
    // showSuccess("Tune is playing! 🎵");
    setCode(processed);
    setTimeout(() => evaluate(), 0);
  }, [ready, processed, setCode, evaluate]);

  // Handle play button click
  const handlePlay = () => {
    if (!ready) {
      showWarning("Strudel is not ready yet!\n\nPlease wait for editor to initialise")
      return
    };

    // Handle no code case
    if(!alreadyProcessed){
      showWarning("No code loaded!\n\nPlease preprocess or load a tune first.");
      return;
    }

    setCode(processed);
    evaluate();
    // showSuccess("Playing! 🎵");
  };

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
      // showInfo(`Tempo changed to ${newBpm.toFixed(0)} BPM`, 2000);
    } else {
      // showSuccess(`BPM set to ${newBpm.toFixed(0)}`, 2000);
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

      showSuccess(`Project saved succesfully!\n\nFile: ${filename}`)
    } catch (error) {
      console.error("Failed to save project:", error);
      showError(`Failed to save project:\n${error.message}`);
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

      // Show success notification
      showSuccess(
        `✅ Project loaded successfully!\n\n` +
        `Name: ${project.metadata.name}\n` +
        `Parts: ${Object.keys(project.partStates).length}\n` +
        `BPM: ${project.settings.bpm}\n\n` +
        `Click "Proc & Play" to start playback.`,
        6000
      );
    } catch (error) {
      showError(`❌ Failed to load project:\n\n${error.message}`);
    }

    // Reset file input
    event.target.value = '';
  }, [isStarted, stop, showSuccess, showError]);

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

      // const volumePercent = Math.round(newVolume * 100);
      // showInfo(`Volume: ${volumePercent}%`, 2000);
    }
  }, [isStarted, stop, rawText, partStates, setCode, evaluate]);

  // Extract BPM from raw text when it changes
  useEffect(() => {
    const match = rawText.match(/setcps\(([^)]+)\)/);
    if(match){
      const cpsValue = eval(match[1]);
      if(!isNaN(cpsValue)){
        const extractedBpm = cpsValue * 60 *4; // Convert CPS back to BPM
        if (Math.abs(extractedBpm - bpm) > 0.1){ // Avoid unnecessary updates when BPM changes is too small
          setBpm(extractedBpm);
      }
    }
  }
}, [rawText, bpm]);

  // Initialize raw text with default tune if empty
  useEffect(() => {
    if (!ready) return;

    if (rawText === "") setRawText(prev => (prev === "" ? stranger_tune : prev));
  }, [ready]);

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
    }, [detectedParts, partStates]);

  // Render UI layout
  return (
    <div>
    <h2 className='app-title'>🎵 Musix By Kimchhay Leng</h2>

    {/* Toast Container for notifications */}
    <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    {!ready && (
      <div className="alert alert-info">
        Loading Strudel Editor... Please wait.
      </div>
    )}
    <main className="container-fluid">
      {/* Main Layout: Code Editor (Left) | Controls (Right) */}
      <div className="row g-2">
        <div className="col-md-8">
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
                      showToast={showWarning}
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
            {/* Button & Modal for cutoff frequency graph */}
            <div className="panel mb-2">
              {/* Button */}
              <nav className="d-grid">
                <button
                  type="button"  
                  data-bs-toggle="modal" 
                  data-bs-target="#cutoffFrequencyGraph"
                  className='btn btn-outline-primary'
                >
                  📊 Cutoff Frequency Graph
                </button>
              </nav>

          </div>
        </div>
      </div>
      {/* Modal */}
      <div className="modal fade" id="cutoffFrequencyGraph" tabIndex="-1" aria-labelledby="cutoffFrequencyGraphLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fs-5" id="exampleModalLabel">📊 Cutoff Frequency Graph</h6>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body panel">
              <D3Visualiser/>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  )
}