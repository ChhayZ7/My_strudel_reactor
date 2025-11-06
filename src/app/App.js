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

// let globalEditor = null;
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
  const [bpm, setBpm] = useState(140); // Default BPM
  // const [codeLoaded, setCodeLoaded] = useState(false);

  // Detect parts from raw text
  const detectedParts = useMemo(() => detectParts(rawText), [rawText]);

    // Preprocess code based on part states
  const processed = useMemo(() => {
    return preprocess(rawText, partStates);
  }, [rawText, partStates]);

  // Initialize part states when parts change
  useEffect(() => {
    const newStates = {};
    detectedParts.forEach(part => {
      newStates[part.name] = partStates[part.name] || 'on';
    });
    setPartStates(newStates);
  }, [detectedParts]);

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
    // setCodeLoaded(true);
    setTimeout(() => evaluate(), 0);
    console.log("Process and Play");
  }, [ready, processed, setCode, evaluate]);

  const handlePlay = useCallback(() => {
    if (!ready) {
      alert("Strudel is not ready yet!\n\nPlease wait for the strudel editor to initialise");
      return;
    };

    if(!hasCode()){
      alert("No code loaded!\n\nPlease preprocess or load a tune first.");
      return ;
    }

    evaluate();
  }, [ready, evaluate]);

  const handlePartStateChange = useCallback((partName, newState) => {
    const wasPlaying = isStarted();

    setPartStates(prev => ({
      ...prev,
      [partName]: newState
    }));

    // If playing, restart with new part configuration
    if (wasPlaying){
      stop();
      setTimeout(() => {
        const newProcessed = preprocess(rawText, {
          ...partStates,
          [partName]: newState
        });
        setCode(newProcessed);
        setTimeout(() => evaluate(), 50);
      }, 50);
    }
  }, [isStarted, stop, setCode, evaluate, rawText, partStates]); 

  const handleBpmChange = useCallback((newBpm) => {
    const wasPlaying = isStarted();
    setBpm(newBpm);

    const cps = (newBpm / 60 /4).toFixed(6); // Convert BPM to cycles per second

    const updatedCode = rawText.replace(
      /setcps\([^)]+\)/g,
      `setcps(${newBpm}/60/4)`  
    );

    setRawText(updatedCode);

    if(wasPlaying){
      stop();
      setTimeout(() => {
      const processedWithNewTempo = preprocess(updatedCode, partStates);
      setCode(processedWithNewTempo);
      setTimeout(() => evaluate(), 50);}, 50);
    } else {
      const processedWithNewTempo = preprocess(updatedCode, partStates);
      setCode(processedWithNewTempo);
    }
  }, [rawText, partStates, setCode, isStarted, stop, evaluate]);

  // Extract BPM from raw text when it changes
  useEffect(() => {
    const match = rawText.match(/setcps\(([^)]+)\)/);
    if(match){
      const cpsValue = eval(match[1]);
      console.log("Extracted CPS:", cpsValue);
      if(!isNaN(cpsValue)){
        const extractedBpm = cpsValue * 60 *4; // Convert CPS back to BPM
        if (Math.abs(extractedBpm - bpm) > 0.1){
          console.log("Updating BPM to:", extractedBpm);
          setBpm(extractedBpm);
      }
    }
  }
}, [rawText, bpm]);

  // Initialize raw text with default tune if empty
  useEffect(() => {
    if (!ready) return;

    if (rawText === "") setRawText(prev => (prev === "" ? stranger_tune : prev));
  }, [ready, rawText]);

  // // Update editor when processed code changes
  // useEffect(() => {
  //   if (!ready) return;
  //   setCode(processed);
  // }, [processed, ready, setCode]);

  // Render UI layout
  return (
    <div>
    <h2>Strudle Demo</h2>
    <main className="container-fluid">
      {/* Top section text input and transport buttons */}
      <div className="row">
        <PreprocessInput value={rawText} onChange={setRawText}/>
        <div className='col-4'>
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
      <div className="row mt-3">
        <EditorPane mountRef={mountRef}/>
        <PartControls
          parts={detectedParts}
          partStates={partStates}
          onChange={handlePartStateChange}
          disabled={!ready}
        />
    </div>
    </main>
    <canvas ref={canvasRef} id="strudelCanvas"></canvas>
  </div>
  )
}