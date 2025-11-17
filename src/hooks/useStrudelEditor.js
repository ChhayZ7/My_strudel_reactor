import { useEffect, useRef, useState, useCallback, use } from "react";
import '../assets/App.css';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { drawPianoroll } from '@strudel/draw';
import console_monkey_patch, { subscribe, unsubscribe } from "../console-monkey-patch";

/**
 * Custom React hook that sets up and controls a Strudle editor instance
 * It encapsulates the setup logic, manages lifecycle cleanup,
 * and exposes helper methods to control the editor.
 */
export function useStrudelEditor(options = {}){
    const {
        canvasRef = null,
        drawTime = [-2, 2],
    } = options;

    // References for the editor mount point and Strudel instance
    const mountRef = useRef(null);
    const editorRef = useRef(null);
    const d3DataRef = useRef([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        console_monkey_patch()
        const handleD3Data = (event) => {
            // console.log(event.detail)
            console.log("D3Data Handled!")
            d3DataRef.current = event.detail;
        };
        subscribe('d3Data', handleD3Data)
        return () => unsubscribe('d3Data', handleD3Data)
    }, [])
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (cancelled) return;

            // If a canvas is provided, prep 2x scale and a 2D context
            let drawCtx = null;
            if (canvasRef?.current){
                const c = canvasRef.current;
                c.width = c.width;
                c.height = c.height;
                drawCtx = c.getContext("2d");
            }
            // Build the editor
            const editor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: mountRef.current,
                drawTime,
                prebake: async () => {
                    initAudioOnFirstClick();
                    // Load Strudel modules into the eval scope
                    const loadModules = evalScope(
                      import('@strudel/core'),
                      import('@strudel/draw'),
                      import('@strudel/mini'),
                      import('@strudel/tonal'),
                      import('@strudel/webaudio')
                    );

                    await Promise.all([
                      loadModules,
                      registerSynthSounds(),
                      registerSoundfonts(),
                    ]);
                    console.log("✅ All Strudel modules loaded");
                  },
            });

            await editor.prebake?.();
            editorRef.current = editor;

            if (!cancelled) {
                console.log("Strudel editor ready");
                setReady(true);
            }
        })();

        // Cleanup when unmounting
        return () => {
            cancelled = true;
            try {
                editorRef.current?.stop();
            } catch (e){
                console.error("Cleanup error:", e);
            }
        }
    }, [canvasRef, drawTime]);

    // Wrapper functions to interace with the editor safely
    const setCode = useCallback((code) => editorRef.current?.setCode(code), []);
    const evaluate = useCallback(() => editorRef.current?.evaluate(), []);
    const stop = useCallback(() => editorRef.current?.stop(), []);
    const isStarted = useCallback(() => !!editorRef.current?.repl?.state?.started, []);
    const reset = useCallback(() => {
        if (!editorRef.current) return;
        editorRef.current.stop();
        editorRef.current.setCode("");
    }, []);
    const hasCode = useCallback(() => {
        return !!editorRef.current?.view?.state?.doc?.toString()?.trim();
    }, [])

    // Expose refs and control functions to the parent component
    return { mountRef, ready, setCode, evaluate, stop, hasCode , isStarted};
}