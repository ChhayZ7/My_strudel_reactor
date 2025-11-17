import React, { useState, useCallback } from "react";

// Volume Control Component

// Controls volume using Strudel's built-in .gain() method.
// Volume is applied to all patterns globally.

function VolumeControl({ volume, onVolumeChange, disabled = false }){
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(volume);

    // COnvert 0-2 range to 0-200% for display
    const volumePercent = Math.round(volume * 100);

    // Gets appropriate volume icon based on current volume
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return '🔇';
        if (volume < 0.3) return '🔈';
        if (volume < 0.7) return '🔉'
        return '🔊'
    };

    // Handles volume slider change
    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);

        // If volume is moved from 0, unmute
        if (isMuted && newVolume > 0){
            setIsMuted(false);
        }

        onVolumeChange(newVolume);
    }, [isMuted, onVolumeChange]);

    //  Toggle mute state
    const handleMuteToggle = useCallback(() => {
        if (isMuted){
            // Unmute: restore previous volume
            onVolumeChange(previousVolume > 0 ? previousVolume : 1.0);
            setIsMuted(false);
        } else {
            // Mute: save current volume and set to 0
            setPreviousVolume(volume);
            onVolumeChange(0);
            setIsMuted(true);
        }
    }, [isMuted, volume, previousVolume, onVolumeChange]);

    return (
        <div className="volume-control">
            <label>Master Volume</label>

            {/* Volume Display and Mute Button */}
            <div className="volume-header">
                <button
                    className={`btn btn-volume-mute ${isMuted ? 'muted' : ''}`}
                    onClick={handleMuteToggle}
                    disabled={disabled}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {getVolumeIcon()}
                </button>

                <span className="volume-value">
                    {isMuted ? 'MUTED' : `${volumePercent}%`}
                </span>
            </div>

            {/* Volume Slider (0-200%) */}
            <div className="volume-slider-container">
                <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="2"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    disabled={disabled}
                    aria-label="Master volume"
                />

                {/* Visual fill indicator */}
                <div
                    className="volume-slider-fill"
                    style={{ width: `${(volume / 2) * 100}%` }}
                />
            </div>

            {/* Volume Level Labels */}
            <div className="volume-labels">
                <small>0%</small>
                <small>100%</small>
                <small>200%</small>
            </div>

            {/* Info */}
            <small className="volume-hint">
                💡 Applied via Strudel's <code>.gain()</code> method
            </small>
        </div>
    );
}

export default VolumeControl;