import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  base: "/wilhelm-costumes/",
  plugins: [solid()],
});
