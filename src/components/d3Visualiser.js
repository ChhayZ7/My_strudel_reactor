import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function D3Visualiser(){
    const svgRef = useRef(null);
    const [hapData, setHapData] = useState([]);

    // listen for d3Data events
    useEffect(() => {
        const handleD3Data = (event) => {
            const data = event.detail;
            setHapData(data);
        };

        document.addEventListener("d3Data", handleD3Data);

        return () => {
            document.removeEventListener("d3Data", handleD3Data);
        }
    }, []);

    // Update D3 visualisation when data changes
    useEffect(() => {
        if (!hapData.length || !svgRef.current) return;

        // Parse the hap data 
        const parsedData = hapData.map((hapString, index) => {
            // console.log("Haps string:", hapString )
            const regex = /cutoff:(\d+)/;
            const match = hapString.match(regex);
            if (match) {
                console.log(match[1]);
            }
            return {
                id: index,
                value: Math.random() * 100, // Placeholder for parsing actual value later
                time: index,
            };
        });

        // D3 visualisation setup
        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 30, left: 40};

        // Clear previous content
        svg.selectAll("*").remove();

        // Set up scales
        // const xScale = d3.scaleLinear()
        // .domain([0, parsedData.length])
        // .range([margin.left, width - margin.right]);

        // const yScale = d3.scaleLinear()
        // .domain([0, d3.max(parsedData, d => d.value)])
        // .range([height - margin.bottom, margin.top]);

        // Create circles for each hap event
        svg.selectAll("circle")
        .data(hapData)
        .join("circle")
        .attr("cx", (d, i) => (i / hapData.length) * width)
        .attr("cy", height / 2)
        .attr("r", 5)
        .attr("fill", "#00f3ff")
        .attr("opacity", (d, i) => i / hapData.length) // Fade in effect
        .transition()
        .duration(500)
        .attr("r", 8)
        .attr("opacity", 1);
    }, [hapData]);

    return (
        <div style={{ width: '100%', overflow: 'hidden'}}>
            <svg
                ref={svgRef}
                width="100%"
                height="250"
                style={{
                    background: 'var(--input-bg)',
                    borderRadius: '8px',
                    border: '2px solid var(--neon-cyan)'
                }}
            />
            <div style={{ color: 'var(--neon-cyan)', marginTop: '10px', textAlign: 'center' }}>
                📊 {hapData.length} events captured
            </div>
        </div>
    )
}

export default D3Visualiser;