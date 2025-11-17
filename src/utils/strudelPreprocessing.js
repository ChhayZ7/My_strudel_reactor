// Helper functions for Strudel code preprocessing with part management

// Extract all parts from the tune's code
export function detectParts(code) {
    const partRegex = /<part:(\w+)>([\s\S]*?)<\/part:\1>/g;
    const parts = [];
    let match;
    
    while ((match = partRegex.exec(code)) !== null) {
      parts.push({
        name: match[1],
        fullMatch: match[0],
        content: match[2]
      });
    }
    
    return parts;
    // example return: [ { name: 'arp', fullMatch: '<part:arp>...</part:arp>'
    // content: '...' (content within the arp tags) }, ... ]
  }

// Preprocess code based on part states
export function preprocess(code, partStates, volume = 1.0) {
    let processed = code;
    
    // Validate volume input
    if (!isFinite(volume) || isNaN(volume)){
      console.error("Invalid volume value: ", volume);
      volume = 1.0; // Fallback to default
    }

    // Clamp volume to reasonable range (0 to 2)
    volume = Math.max(0, Math.min(2, volume));

    // Check if any part is soloed
    const soloedParts = Object.entries(partStates)
      .filter(([_, state]) => state === 'solo')
      .map(([name, _]) => name);
    
    const hasSolo = soloedParts.length > 0;
    
    // Process each part based on its state
    Object.entries(partStates).forEach(([partName, state]) => {
      const partRegex = new RegExp(
        `<part:${partName}>([\\s\\S]*?)<\\/part:${partName}>`,
        'g'
      );
      
      processed = processed.replace(partRegex, (_, content) => {
        // If something is soloed
        if (hasSolo) {
          if (state === 'solo') {
            return applyVolumeToContent(content, volume);
          } else {
            // Comment out the entire section
            return content.split('\n').map(line => `// ${line}`).join('\n');
          }
        }
        
        // No solo active, respect individual states
        if (state === 'hush') {
          return content.split('\n').map(line => `// ${line}`).join('\n');
        } else {
          return applyVolumeToContent(content, volume);
        }
      });
    });

    // Add volume indicator at the top if volume is not default
    if (volume !== 1.0){
      const volumeHeader = `// 🔊 Master Volume: ${(volume * 100).toFixed(0)}%\n\n`;
      processed = volumeHeader + processed;
    }
    
    return processed;
  }

  function applyVolumeToContent(content, volume){
    // If volume is default (1.0), don't modify
    if (Math.abs(volume - 1.0) < 0.001){
      return content;
    }

    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//')){
        return line;
      }

      let processedLine = line;
      let modified = false
      // Handle .gain() by multiply the value
      if (line.includes('.gain(')){
        // Check if already modified (contains the volume multiplier)
        if (!line.includes(`* ${volume.toFixed(3)}`)){
          processedLine = processedLine.replace(
            /\.gain\(([^)]+)\)/g,
            (match, gainValue) => {
              // Don't modify if it's already been modified
              if (gainValue.includes('*')){
                return match;
              }
              return `.gain((${gainValue}) * ${volume.toFixed(3)})`;
            }
          );
          modified = true;
        }
      }

      // Handle .postgain() by multiply the value
      if (line.includes('.postgain(')){
        // Check if already modified (contains the volume multiplier)
        if (!line.includes(`* ${volume.toFixed(3)}`)){
          processedLine = processedLine.replace(
            /\.postgain\(([^)]+)\)/g,
            (match, gainValue) => {
              // Don't modify if it's already been modified
              if (gainValue.includes('*')){
                return match;
              }
              return `.postgain((${gainValue}) * ${volume.toFixed(3)})`;
            }
          );
          modified = true;
        }
      }

      // If we modified the line, return it
      if (modified){
        return processedLine;
      }

      // Check if this is a pattern line (contains : and method chaining)
      // Add .gain() to lines that don't have any gain control
      if (trimmed.includes(':') && trimmed.includes('.')) {
          return line + `.gain(${volume.toFixed(3)})`;
      }

      return line;
    });

    return processedLines.join('\n');
  }