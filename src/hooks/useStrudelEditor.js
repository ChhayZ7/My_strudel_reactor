import { useEffect, useRef, useState, useCallback } from "react";
import {
    initStrudel,
    evalScope,
    getAudioContext,
    webaudioOutput,
    registerSynthSounds,
    initAudioOnFirstClick,
    transpiler,
} from "@strudel/web"
import { StrudelMirror } from "@strudel/codemirror"
import { registerSoundfonts } from '@strudel/soundfonts';
import { time } from "@strudel/core";

/**
 * Custom React hook that sets up and controls a Strudle editor instance
 * It encapsulates the setup logic, manages lifecycle cleanup,
 * and exposes helper methods to control the editor.
 */
export function useStrudelEditor(options = {}){
    const {
        canvasRef = null,
        drawTime= [-2, 2],
        onDraw = null,
        enableConsolePatch = false,
        onD3Data = null,
        consolePatchFn,
        drawPianorollFn,
    } = options;

    // References for the editor mount point and Strudel instance
    const mountRef = useRef(null);
    const editorRef = useRef(null);
    const [ready, setReady] = useState(false);
    const didIntegrations = useRef(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await initStrudel();
            if (cancelled) return;

            // If a canvas is provided, prep 2x scale and a 2D context
            let drawCtx = null;
            if (canvasRef?.current){
                const c = canvasRef.current;
                c.width = c.width * 2;
                c.height = c.height * 2;
                drawCtx = c.getContext("2d");
            }

            // Build the editor
            const editor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: mountRef.current,
                drawTime,
                onDraw:
                    drawCtx &&
                    ((haps, time) => (onDraw ? onDraw({ haps, time, ctx: drawCtx, drawTime, fold: 0 })
                    : drawPianorollFn({ haps, time, ctx: drawCtx, drawTime, fold: 0 }))),
                prebake: async () => {
                    initAudioOnFirstClick();
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio')
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });

            editorRef.current = editor;
            if (!cancelled) setReady(true);
        })();

        // Cleanup when unmounting
        return () => {
            cancelled = true;
            try {
                editorRef.current?.stop();
            } catch {}
        }
    }, [canvasRef, onDraw, drawPianorollFn, drawTime]);

    useEffect(() => {
        if (didIntegrations.current) return;
        didIntegrations.current = true;

        let removeListeners = () => {};
        if (onD3Data){
            const handler = (evt) => onD3Data(evt);
            document.addEventListener("d3Data", handler);
            removeListeners = () => document.removeEventListener("d3Data", handler);
        }

        if (enableConsolePatch && typeof consolePatchFn === "function"){
            try {
                consolePatchFn();
            } catch {}
        }

        return () => {
            removeListeners();
        };
    }, [onD3Data, enableConsolePatch, consolePatchFn]);

    // Wrapper functions to interace with the editor safely
    const setCode = useCallback((code) => editorRef.current?.setCode(code), []);
    const evaluate = useCallback(() => editorRef.current?.evaluate(), []);
    const stop = useCallback(() => editorRef.current?.stop(), []);
    const isStarted = useCallback(() => !!editorRef.current?.repl?.state?.started, []);

    // Expose refs and control functions to the parent component
    return { mountRef, ready, setCode, evaluate, stop, isStarted};
}
