/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import session from "express-session";
import cookieParser from "cookie-parser";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    session({
      secret: "viral-agent-secret",
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: true, 
        sameSite: 'none', 
        httpOnly: true 
      },
    })
  );

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.APP_URL}/auth/youtube/callback`
  );

  // YOUTUBE OAUTH ROUTES
  app.get("/api/auth/youtube/url", (req, res) => {
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
      return res.status(500).json({ error: "YouTube API credentials not configured." });
    }
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/youtube.upload"],
      prompt: "consent"
    });
    res.json({ url });
  });

  app.get("/auth/youtube/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      // In a real app, store these tokens securely (e.g. in a DB linked to the session)
      // For this demo, we'll just pass a success message back
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'YOUTUBE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
              window.close();
            </script>
            <p>YouTube Connected! This window will close.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("YouTube OAuth callback error", error);
      res.status(500).send("Authentication failed.");
    }
  });

  // MOCK VIDEO GENERATION API
  app.post("/api/video/generate", async (req, res) => {
    const { script, product } = req.body;
    // Here as an example, we'll simulate a 10s "rendering" process
    // In reality, this would call HeyGen, Runway, or Pictory API
    console.log(`Generating video for ${product.name}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    // For the demo, we return a mock video URL (usually an S3 or CDN link)
    res.json({ 
      success: true, 
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnailUrl: `https://picsum.photos/seed/${product.id}/1280/720`
    });
  });

  // YOUTUBE UPLOAD PROXY
  app.post("/api/youtube/upload", async (req, res) => {
    const { tokens, videoUrl, title, description, tags } = req.body;
    if (!tokens) return res.status(401).json({ error: "Unauthorized" });

    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials(tokens);
      const youtube = google.youtube({ version: "v3", auth });

      // In real life, you'd need to download the videoUrl to a buffer first
      // But since we are mocking the video gen, we'll simulate the upload metadata part
      
      /* 
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: { title, description, tags, categoryId: '22' },
          status: { privacyStatus: 'unlisted' }
        },
        media: {
          body: // read stream from videoUrl
        }
      });
      */

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      res.json({ 
        success: true, 
        videoId: "dQw4w9WgXcQ", 
        url: "https://youtu.be/dQw4w9WgXcQ" 
      });
    } catch (error) {
      console.error("YouTube Upload error", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
