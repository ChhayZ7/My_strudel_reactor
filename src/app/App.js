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

// export function SetupButtons() {

//   document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
//   document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
//   document.getElementById('process').addEventListener('click', () => {
//     Proc()
//   }
//   )
//   document.getElementById('process_play').addEventListener('click', () => {
//     if (globalEditor != null) {
//       Proc()
//       globalEditor.evaluate()
//     }
//   }
//   )
// }



// export function ProcAndPlay() {
//   if (globalEditor != null && globalEditor.repl.state.started == true) {
//     console.log(globalEditor)
//     Proc()
//     globalEditor.evaluate();
//   }
// }

// export function Proc() {

//   let proc_text = document.getElementById('proc').value
//   let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
//   ProcessText(proc_text);
//   globalEditor.setCode(proc_text_replaced)
// }

// export function ProcessText(match, ...args) {

//   let replace = ""
//   if (document.getElementById('flexRadioDefault2').checked) {
//     replace = "_"
//   }

//   return replace
// }

// export default function StrudelDemo() {

//   const hasRun = useRef(false);

//   useEffect(() => {

//     if (!hasRun.current) {
//       hasRun.current = true;
//       (async () => {
//         await initStrudel();

//         globalEditor = new StrudelMirror({
//           defaultOutput: webaudioOutput,
//           getTime: () => getAudioContext().currentTime,
//           transpiler,
//           root: document.getElementById('editor'),
//           prebake: async () => {
//             initAudioOnFirstClick(); // needed to make the browser happy (don't await this here..)
//             const loadModules = evalScope(
//               import('@strudel/core'),
//               import('@strudel/draw'),
//               import('@strudel/mini'),
//               import('@strudel/tonal'),
//               import('@strudel/webaudio'),
//             );
//             await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
//           },
//         });
//         Proc()
//       })();
//       document.getElementById('proc').value = stranger_tune
//       SetupButtons()
//     }

//   }, []);


//   return (
//     <div>
//       <h2>Strudel Demo</h2>
//       <main>

//         <div className="container-fluid">
//           <div className="row">
//             <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
//               <label htmlFor="exampleFormControlTextarea1" className="form-label">Text to preprocess:</label>
//               <textarea className="form-control" rows="15" id="proc" ></textarea>
//             </div>
//             <div className="col-md-4">

//               <nav>
//                 <button id="process" className="btn btn-outline-primary">Preprocess</button>
//                 <button id="process_play" className="btn btn-outline-primary">Proc & Play</button>
//                 <br />
//                 <button id="play" className="btn btn-outline-primary">Play</button>
//                 <button id="stop" className="btn btn-outline-primary">Stop</button>
//               </nav>
//             </div>
//           </div>
//           <div className="row">
//             <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
//               <div id="editor" />
//             </div>
//             <div className="col-md-4">
//               <div className="form-check">
//                 <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onChange={ProcAndPlay} defaultChecked />
//                 <label className="form-check-label" htmlFor="flexRadioDefault1">
//                   p1: ON
//                 </label>
//               </div>
//               <div className="form-check">
//                 <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" onChange={ProcAndPlay} />
//                 <label className="form-check-label" htmlFor="flexRadioDefault2">
//                   p1: HUSH
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>

//       </main >
//     </div >
//   );


// }

