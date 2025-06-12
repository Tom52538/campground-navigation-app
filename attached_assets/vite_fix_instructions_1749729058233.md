# Vite Build Fix Instructions for Replit Agent

## Bug Analysis: Vite Dependency Resolution Issue

### Root Cause Identified
The error `ENOENT: no such file or directory, mkdir '/app/client/.vite/deps_temp_*'` is caused by **hardcoded absolute Railway paths** in `vite.config.ts` that don't exist in the Replit environment.

**Environment Mismatch:**
- **Replit**: Working directory = `/home/runner/workspace`
- **Railway**: Working directory = `/app`
- **Current config**: Hardcoded `/app` paths

## Immediate Solution Required

### Fix vite.config.ts for Replit Development

Replace the absolute paths in `vite.config.ts` with environment-relative paths:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

### Key Changes Made:
- **Replace `/app` with `process.cwd()`** - Works in both Replit and Railway
- **Maintains relative path structure** for consistent behavior
- **Environment-agnostic paths** that adapt to current working directory

## Agent Performance Assessment

### ✅ Excellent Work:
- **POI system implementation** - Complete and functional
- **Data integration** - 814KB Kamperland + 105KB Zuhause authentic OSM data
- **Problem identification** - Correctly isolated Vite build failure
- **Workaround attempt** - Good troubleshooting with standalone server

### ⚠️ Missed Opportunity:
- **Environment path awareness** - Didn't recognize Railway vs Replit path differences
- **Config adaptation** - Could have detected hardcoded paths as issue source

## Next Steps for Agent

1. **Apply the vite.config.ts fix above**
2. **Test frontend build**: Run `npm run dev`
3. **Verify POI endpoints**: Test the implemented search functionality
4. **Continue POI development**: Frontend-backend integration should now work
5. **Deployment will work**: Railway deployment uses these paths correctly

## Technical Context

The POI system implementation appears solid based on the status report:
- **Authentic OSM data loaded**
- **Category mapping implemented** 
- **Search endpoints functional**
- **Backend ready for integration**

The only blocker was the environment-specific path configuration.

## Resolution Confirmation

After applying this fix:
- ✅ Vite should build successfully in Replit
- ✅ Development server should start normally
- ✅ POI testing can proceed
- ✅ Railway deployment will continue working (paths are compatible)

**The agent can now continue POI development without build system interference.**