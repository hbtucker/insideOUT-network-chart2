import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const width = 1200;
const height = 800;
const colors = {
  department: "#f6f6f6",
  team: "#b1b1b1",
  individual: "#ffc433"
};

export default function Chart({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(d => d.source.level === "1" && d.target.level === "1" ? 300 : 100))
      .force("charge", d3.forceManyBody().strength(d => d.level === "1" ? -1000 : d.level === "2" ? -500 : -100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => d.level === "1" ? 100 : d.level === "2" ? 60 : 30));

    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.source.level === "1" && d.target.level === "1" ? 2 : 1)
      .attr("stroke-dasharray", d => d.source.level === "1" && d.target.level === "1" ? "5,5" : "none");

    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g");

    node.append("circle")
      .attr("r", d => d.level === "1" ? 40 : d.level === "2" ? 30 : 20)
      .attr("fill", d => colors[d.level === "1" ? "department" : d.level === "2" ? "team" : "individual"]);

    node.append("text")
      .text(d => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("font-size", d => d.level === "1" ? "12px" : d.level === "2" ? "10px" : "8px")
      .attr("fill", "black");

    simulation
      .nodes(data.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(data.links);

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    const drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

    node.call(drag);

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [data]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
}
