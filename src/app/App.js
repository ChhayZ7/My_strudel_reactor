import '../assets/cors-redirect';
import '../assets/App.css';
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useStrudelEditor } from "../hooks/useStrudelEditor"
import { stranger_tune } from './tunes';
import PreprocessInput from '../components/preprocessInput';
import Tranport from '../components/transport';
import EditorPane from '../components/editorPane';
import HushToggle from '../components/hushToggle';
import console_monkey_patch, { getD3Data } from '../console-monkey-patch';

// let globalEditor = null;
const handleD3Data = (event) => {
  console.log(event.detail);
};


// Helper functions
function detectParts(tune){
  const partRegex = /<part:(\w+)>([\s\S]*?)<\/part:\1>/g;
  const parts = [];
  let match;

  while ((match = partRegex.exec(tune)) !== null) {
    parts.push({
      name: match[1],
      fullMatch: match[0],
      content: match[2]
     });
  }

  return parts;
}
function preprocess(text, partState){
  // const replacement = hush ? "_" : "";
  // return text.replaceAll("<p1_Radio>", replacement);
}

export default function App(){
  const canvasRef = useRef(null);

  const { mountRef, ready, setCode, evaluate, stop, reset, isStarted } = useStrudelEditor({
    canvasRef,
    drawTime: [-2, 2],
  });

  const [rawText, setRawText] = useState("");
  const [hush, setHush] = useState(false);

  const processed = useMemo(() => preprocess(rawText, hush), [rawText, hush]);

  const handlePreprocess = useCallback(() => {
    if (!ready) return;
    if(!processed.trim()) return;
    setCode(processed);
    console.log("Preprocessed and set code.");
  }, [ready, processed, setCode]);

  const handleProcPlay = useCallback(() => {
    if (!ready) return;
    if(!processed.trim()) return;
    setCode(processed);
    setTimeout(() => evaluate(), 0);
  }, [ready, processed, setCode, evaluate]);

  const handleHushToggle = useCallback((newHushState) => {
    const wasPlaying = isStarted();
    setHush(newHushState);

    if (wasPlaying){
      stop();
      setTimeout(() => {
        const newProcessed = preprocess(rawText, newHushState); // use for testing purpose only (to be changed later)
        setCode(newProcessed);
        setTimeout(() => evaluate(), 50);
      }, 50);
    }
  }, [isStarted, stop, setCode, evaluate, rawText]);

  useEffect(() => {
    if (!ready) return;

    if (rawText === "") setRawText(prev => (prev === "" ? stranger_tune : prev));
  }, [ready, rawText]);

  useEffect(() => {
    if (!ready) return;
    setCode(processed);
  }, [processed, ready, setCode]);

  // Render UI layout
  return (
    <div>
    <h2>Strudle Demo</h2>
    <main className="container-fluid">
      {/* Top section text input and transport buttons */}
      <div className="row">
        <PreprocessInput value={rawText} onChange={setRawText}/>
        <Tranport
          onPreprocess={handlePreprocess}
          onProcPlay={handleProcPlay}
          onPlay={evaluate}
          onStop={stop}
          disabled={!ready}/>
      </div>
    </main>


    <div className="row mt-3">
      <EditorPane mountRef={mountRef}/>
      <HushToggle hush={hush} onChange={handleHushToggle}/>
    </div>
    <canvas ref={canvasRef} id="strudelCanvas"></canvas>
  </div>
  )
}