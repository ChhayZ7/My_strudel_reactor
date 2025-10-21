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

/**
 * Custom React hook that sets up and controls a Strudle editor instance
 * It encapsulates the setup logic, manages lifecycle cleanup,
 * and exposes helper methods to control the editor.
 */
export function useStrudelEditor(){
    // References for the editor mount point and Strudel instance
    const mountRef = useRef(null);
    const editorRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await initStrudel();
            if (cancelled) return;

            // Create the StrudleMirror editor and preload required modules
            const editor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: mountRef.current,
                preback: async () => {
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
    }, [])

    // Wrapper functions to interace with the editor safely
    const setCode = useCallback((code) => editorRef.current?.setCode(code), []);
    const evaluate = useCallback(() => editorRef.current?.evaluate(), []);
    const stop = useCallback(() => editorRef.current?.stop(), []);
    const isStarted = useCallback(() => !!editorRef.current?.repl?.state?.started, []);

    // Expose refs and control functions to the parent component
    return { mountRef, ready, setCode, evaluate, stop, isStarted};
}
