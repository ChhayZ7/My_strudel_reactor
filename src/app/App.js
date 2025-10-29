import '../assets/cors-redirect';
import '../assets/App.css';
// import { initStrudel, note, hush, evalScope, getAudioContext, webaudioOutput, registerSynthSounds, initAudioOnFirstClick, transpiler } from "@strudel/web";
import { useEffect, useRef, useMemo, useState } from "react";
// import { StrudelMirror } from '@strudel/codemirror';
// import { registerSoundfonts } from '@strudel/soundfonts';
import { useStrudelEditor } from "../hooks/useStrudelEditor"
import { stranger_tune } from './tunes';
import PreprocessInput from '../components/preprocessInput';
import Tranport from '../components/transport';
import EditorPane from '../components/editorPane';

// let globalEditor = null;

// Helper function
function preprocess(text, hush){
  const replacement = hush ? "_" : "";
  return text.replaceAll("<p1_Radio>", replacement);
}

export default function App(){
  const { mountRef, ready, setCode, evaluate, stop, isStarted } = useStrudelEditor();

  const [rawText, setRawText] = useState("");
  const [hush, setHush] = useState(false);

  const processed = useMemo(() => preprocess(rawText, hush), [rawText, hush]);

  useEffect(() => {
    if(ready){
      setRawText(stranger_tune);
      // Wait until the editor is mounted before setting code
      queueMicrotask(() => setCode(preprocess(stranger_tune, false)))
    }
  }, [ready, setCode]);

  useEffect(() => {
    if(!ready) return;
    setCode(processed);
    if(isStarted()) evaluate();
  }, [hush, processed, ready, setCode, evaluate, isStarted])

  const handlePreprocess = () => {
    if (!ready) return;
    setCode(processed);
  }

  const handleProcPlay = () => {
    if (!ready) return;
    setCode(processed);
    evaluate();
  }
  // Render UI layout
  return (
    <div>
    <h2>Strudle Demo</h2>
    <main class="container-fluid">
      {/* Top section text input and transport buttons */}
      <div class="row">
        <PreprocessInput value={rawText} onChange={setRawText}/>
        <Tranport
          onPreprocess={handlePreprocess}
          onProcPlay={handleProcPlay}
          onPlay={evaluate}
          onStop={stop}
          disabled={!ready}/>
      </div>
    </main>

    {/* Bottom section: editor + hush toggle */}
    <div className="row mt-3">
      <EditorPane mountRef={mountRef}/>
    </div>
  </div>
  )
}