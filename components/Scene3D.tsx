"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "@/lib/shader";
import { EGG_EVENT, prefersReducedMotion, storyProgress } from "@/lib/story";

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("No se pudo crear el shader");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log ?? "Error compilando el shader");
  }
  return sh;
}

export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      setFallback(true);
      return;
    }

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    } catch (err) {
      console.error(err);
      setFallback(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(program, n);
    const u = { r: U("r"), t: U("t"), s: U("s"), m: U("m"), ox: U("ox"), hd: U("hd") };

    const reduced = prefersReducedMotion();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let progress = 0;
    let hidden = 0;
    let eggActive = false;
    let raf = 0;
    const t0 = performance.now();

    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onEgg = (e: Event) => {
      eggActive = Boolean((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener(EGG_EVENT, onEgg);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const vh = window.innerHeight;
      // Fuera de la historia, o con una ficha de proyecto abierta, no hace falta pintar
      if (window.scrollY > vh * 6.2 || document.body.dataset.overlay || document.hidden) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);

      const target = storyProgress(window.scrollY, vh);
      progress += (target - progress) * 0.07;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      hidden += ((eggActive ? 1 : 0) - hidden) * 0.3;

      const aspect = w / h;
      const time = ((now - t0) / 1000) * (reduced ? 0.25 : 1);
      gl.uniform2f(u.r, w, h);
      gl.uniform1f(u.t, time);
      gl.uniform1f(u.s, progress);
      gl.uniform2f(u.m, mouse.x, mouse.y);
      gl.uniform1f(u.ox, aspect > 1.15 ? Math.min(1.5, (aspect - 1) * 1.4) : 0);
      gl.uniform1f(u.hd, hidden);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener(EGG_EVENT, onEgg);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="scene" aria-hidden="true" />
      {fallback && <span className="scene-fallback" aria-hidden="true" />}
    </>
  );
}
