const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

const resizeCanvas = (gl) => {
    gl.canvas.width = (9 / 12) * window.innerWidth;
    gl.canvas.height = (9 / 12) * window.innerWidth;
};

window.onload = function main() {
    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    resizeCanvas(gl);
    window.addEventListener("resize", () => resizeCanvas(gl), false);

    gl.clearColor(0.6, 0.75, 0.9, 1);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
}