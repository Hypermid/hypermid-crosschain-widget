import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "HypermidWidget",
      formats: ["umd", "es"],
      fileName: (format) => (format === "umd" ? "widget.js" : "widget.esm.js"),
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
    minify: "terser",
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
