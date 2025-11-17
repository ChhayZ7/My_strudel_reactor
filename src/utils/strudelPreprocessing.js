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
    if (volume === 1.0){
      return content;
    }

    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//')){
        return line;
      }

      // Check if line has .gain() or .postgain()
      const hasGain = line.includes('.gain(');
      const hasPostgain = line.includes('.postgain(');

      if (hasGain || hasPostgain){
        // Multiply existing gain/postgain values by master volume
        let processedLine = line

        // Handle .gain() by multiply the value
        if (hasGain){
          processedLine = processedLine.replace(
            /\.gain\(([^)]+)\)/g,
            `.gain(($1) * ${volume.toFixed(3)})`
          );
        }

        // Handle .postgain() by multiply the value
        if (hasPostgain){
          processedLine = processedLine.replace(
            /\.postgain\(([^)]+)\)/g,
            `.postgain(($1) * ${volume.toFixed(3)})`
          );
        }
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