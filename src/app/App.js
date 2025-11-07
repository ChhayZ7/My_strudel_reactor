import '../assets/cors-redirect';
import '../assets/App.css';
import '../assets/Component.css';
import { useEffect, useRef, useMemo, useState, useCallback, use } from "react";
import { useStrudelEditor } from "../hooks/useStrudelEditor"
import { stranger_tune } from './tunes';
import PreprocessInput from '../components/preprocessInput';
import Tranport from '../components/transport';
import EditorPane from '../components/editorPane';
import PartControls from '../components/partControls'
import console_monkey_patch, { getD3Data } from '../console-monkey-patch';
import { detectParts, preprocess } from '../utils/strudelPreprocessing';
import TempoControl from '../components/tempoControl';

const handleD3Data = (event) => {
  console.log(event.detail);
};

export default function App(){
  const canvasRef = useRef(null);

  const { mountRef, ready, setCode, evaluate, stop, hasCode, isStarted } = useStrudelEditor({
    canvasRef,
    drawTime: [-2, 2],
  });

  const [rawText, setRawText] = useState("");
  const [partStates, setPartStates] = useState({});
  // Example: partStates = { 'arp': 'on', 'bass': 'hush' }
  const [bpm, setBpm] = useState(140); // Default BPM
  const isUpdatingRef = useRef(false); // Still be tested not use if it is useful

  // Detect parts from raw text
  const detectedParts = useMemo(() => detectParts(rawText), [rawText]);

    // Preprocess code based on part states
  const processed = useMemo(() => {
    return preprocess(rawText, partStates);
  }, [rawText, partStates]);

  const handlePreprocess = useCallback(() => {
    if (!ready) return;
    if(!processed.trim()) return;
    setCode(processed);
    // setCodeLoaded(true);
    console.log("Preprocessed and set code.");
  }, [ready, processed, setCode]);

  const handleProcPlay = useCallback(() => {
    if (!ready) return;
    if(!processed.trim()) return;
    console.log(processed);
    setCode(processed);
    setTimeout(() => evaluate(), 0);
    console.log("Process and Play");
  }, [ready, processed, setCode, evaluate]);

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
    <h2>🎵 Strudle Demo By Kimchhay Leng</h2>
    <main className="container-fluid">
      {/* Top section text input and transport buttons */}
      <div className="row">
        <div class="col-8">
          <div className="panel">
            <PreprocessInput value={rawText} onChange={setRawText}/>
          </div>
        </div>

        <div className='col-4'>
          <div className="panel">
          <Tranport
          onPreprocess={handlePreprocess}
          onProcPlay={handleProcPlay}
          onPlay={handlePlay}
          onStop={stop}
          disabled={!ready}/>
          <TempoControl 
            bpm={bpm}
            onBpmChange={handleBpmChange}
            disabled={!ready}
          />
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className='col-8'>
          <div className='panel editor-pane'>
            <EditorPane mountRef={mountRef} />
          </div>
        </div>

        <div className='col-4'>
          <div className='panel'>
            <PartControls
            parts={detectedParts}
            partStates={partStates}
            onChange={handlePartStateChange}
            disabled={!ready}
          />
          </div>
        </div>

    </div>
    </main>
    <div className="row mt-3">
      <div className="col-12">
        <div className="canvas-container">
        {/* <canvas ref={canvasRef}></canvas> */}
        🎵 Strudel Visualization Canvas  🎵 (TBA)
        </div>
      </div>
    </div>

  </div>
  )
}