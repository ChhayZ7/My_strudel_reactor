import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// D3 Visualiser Component

// Listen for hap Data in the console
// Build d3 line graph using hap data
function D3Visualiser() {
  const svgRef = useRef(null);
  const [hapData, setHapData] = useState([]);

  // Listen for hap data from Strudel
  useEffect(() => {
    const handleD3Data = (event) => {
      setHapData(event.detail);
    };

    document.addEventListener("d3Data", handleD3Data);
    
    return () => {
      document.removeEventListener("d3Data", handleD3Data);
    };
  }, []);

  // Parse hap strings to extract useful data
  const parseHap = (hapString, index) => {
    try {
      // Extract cutoff frequency
      const frequencyMatch = hapString.match( /cutoff:(\d+)/);
      const frequency = frequencyMatch ? parseFloat(frequencyMatch[1]) : 1;
      return {
        index,
        frequency: frequency,
      };
    } catch (e) {
      // Fallback if parsing fails
      return {
        index,
        frequency: 1,
      };
    }
  };

  // Draw visualization with D3
  useEffect(() => {
    // Don't draw if no SVG
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Define margins properly
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const fullWidth = svg.node().getBoundingClientRect().width;
    const fullHeight = svg.node().getBoundingClientRect().height;
    
    // Ensure minimum height
    const height = Math.max(fullHeight - margin.top - margin.bottom, 500);
    const width = fullWidth;
    
    console.log("Chart Dimensions:", { width, height });

    // Create yScale with fixed domain
    let yScale = d3.scaleLinear()
      .domain([0, 2000])
      .range([height, 0]);

    const chartGroup = svg.append('g')
      .classed('chartGroup', true)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // draw the y-axis (even when no data)
    let yAxis = d3.axisLeft(yScale)
      .ticks(8) 
      .tickFormat(d => `${d} Hz`);
    
    const yAxisGroup = chartGroup.append('g')
      .classed('axis y', true)
      .call(yAxis);

    // Style the axis
    yAxisGroup.selectAll('path')   
      .attr('stroke', '#00f3ff');

    yAxisGroup.selectAll('text')  
      .attr('fill', '#00f3ff');

    // Only draw data if it exists
    if (hapData.length > 0) {
      // Parse all hap data
      const parsedData = hapData.map((hap, i) => parseHap(hap, i));

      const barWidth = width / hapData.length;

      // Draw area chart
      chartGroup
        .append('path')
        .datum(parsedData.map((d) => d.frequency))
        .attr('fill', '#00f3ff')
        .attr('fill-opacity', 0.2)
        .attr('stroke', '#00f3ff')
        .attr('stroke-width', 1.5)
        .attr('d', d3.area()
          .x((d, i) => i * barWidth)
          .y0(height)
          .y1(d => yScale(d))
        );
    }
  }, [hapData]); // Re-draw when hapData changes

  return (
    <div className="row" style={{ minHeight: '600px' }}>
        <svg
        ref={svgRef}
        width="100%" 
        height="600"
        style={{ minHeight: '600px' }}
        ></svg>
    </div>
  );
}

export default D3Visualiser;