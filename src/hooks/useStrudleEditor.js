import { useEffect, useRef, useStatem, useCallback } from "react";
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

export function useStrudelEditor(){
    const mountRef = useRef(null);
    const editorRef = useRed(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await initStrudel();
            if (cancelled) return;

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

        return () => {
            cancelled = true;
            try {
                editorRef.current?.stop();
            } catch {}
        }
    }, [])

    const setCode = useCallback((code) => editorRef.current?.setCode(code), []);
    const evaluate = useCallback(() => editorRef.current?.evaluate(), []);
    const stop = useCallback(() => editorRef.current?.stop(), []);
    const isStarted = useCallback(() => !!editorRef.current?.repl?.state?.started, []);

    return { mountRef, ready, setCode, evaluate, stop, isStarted};
}
