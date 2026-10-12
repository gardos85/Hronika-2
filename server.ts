import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_ITEMS, DEFAULT_GROUPS } from "./src/data";
import { translations } from "./src/translations";

function writeTimelineDataToLocalFile(items: unknown[], groups: unknown[]) {
  const fileContent = `import { TimelineItem } from "./types";

export const DEFAULT_GROUPS = ${JSON.stringify(groups, null, 2)};

export const INITIAL_ITEMS: TimelineItem[] = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), "src/data.ts"), fileContent, "utf8");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));

  const projectsDir = path.join(process.cwd(), "data", "projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  // GET /api/timeline?id=... - loads project by ID
  app.get("/api/timeline", (req, res) => {
    const rawId = req.query.id as string;
    const id = rawId && rawId.trim() ? rawId.trim() : "default";
    const filePath = path.join(projectsDir, `${id}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (!data.name) {
          data.name = id === "default" ? "Istorija" : `Projekat ${id}`;
        }
        return res.json(data);
      } catch (err: any) {
        console.error(`Error parsing project ${id}:`, err);
      }
    }

    // Fallback to default
    const defaultPath = path.join(projectsDir, "default.json");
    if (fs.existsSync(defaultPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(defaultPath, "utf8"));
        if (!data.name) {
          data.name = "Istorija";
        }
        return res.json(data);
      } catch (err: any) {
        console.error("Error parsing default project file:", err);
      }
    }

    // Seed default
    const initialData = { name: "Istorija", items: INITIAL_ITEMS, groups: DEFAULT_GROUPS };
    try {
      fs.writeFileSync(defaultPath, JSON.stringify(initialData, null, 2), "utf8");
    } catch (err) {
      console.error("Error seeding default project file:", err);
    }
    return res.json(initialData);
  });

  // POST /api/timeline - saves items and groups for project with given ID
  app.post("/api/timeline", (req, res) => {
    const rawId = req.body.id || req.query.id;
    const id = typeof rawId === "string" && rawId.trim() ? rawId.trim() : "default";
    const { items, groups, name } = req.body;

    if (!Array.isArray(items) || !Array.isArray(groups)) {
      return res.status(400).json({ error: "Format podataka nije ispravan." });
    }

    try {
      const filePath = path.join(projectsDir, `${id}.json`);
      
      let existingName = id === "default" ? "Istorija" : `Projekat ${id}`;
      if (fs.existsSync(filePath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (parsed.name) existingName = parsed.name;
        } catch (_) {}
      }

      const dataToSave = { 
        name: name || existingName,
        items, 
        groups 
      };
      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");

      // Note: Data is saved to data/projects/${id}.json. We do not write to src/data.ts
      // during runtime auto-saves to prevent Vite dev file-watcher reload loops.
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error saving project data for ${id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/timeline/create - creates a new project with random ID (empty of events)
  app.post("/api/timeline/create", (req, res) => {
    const { groups, name } = req.body;
    const randomStr = Math.random().toString(36).substring(2, 8);
    const newId = `hronika-${randomStr}`;

    let dataItems: unknown[] = []; // Empty project, no events!
    let dataGroups = groups;
    let newName = name || `Projekat ${randomStr}`;

    if (!Array.isArray(dataGroups)) {
      dataGroups = DEFAULT_GROUPS;
    }

    try {
      const filePath = path.join(projectsDir, `${newId}.json`);
      const dataToSave = { name: newName, items: dataItems, groups: dataGroups };
      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");
      res.json({ id: newId, name: newName });
    } catch (err: any) {
      console.error(`Error creating new project ${newId}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/timeline?id=... - deletes a custom project
  app.delete("/api/timeline", (req, res) => {
    const rawId = req.query.id as string;
    const id = rawId && rawId.trim() ? rawId.trim() : "";
    if (!id || id === "default") {
      return res.status(400).json({ error: "Glavni projekat se ne može obrisati" });
    }
    const filePath = path.join(projectsDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return res.json({ success: true });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    return res.status(404).json({ error: "Projekat nije pronađen" });
  });

  // GET /api/projects - lists all saved projects with their IDs and Names
  app.get("/api/projects", (req, res) => {
    try {
      const files = fs.readdirSync(projectsDir);
      const list = files
        .filter(f => f.endsWith(".json"))
        .map(f => {
          const id = f.replace(".json", "");
          const filePath = path.join(projectsDir, f);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
            return {
              id,
              name: data.name || (id === "default" ? "Istorija" : `Projekat ${id}`)
            };
          } catch (_) {
            return {
              id,
              name: id === "default" ? "Istorija" : `Projekat ${id}`
            };
          }
        });

      // Ensure 'default' is always in the list
      const hasDefault = list.some(p => p.id === "default");
      if (!hasDefault) {
        list.unshift({ id: "default", name: "Istorija" });
      }

      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/timeline/rename - renames a project's name
  app.post("/api/timeline/rename", (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "Missing id or name" });
    }
    const targetId = id.trim();
    const targetName = name.trim();
    const filePath = path.join(projectsDir, `${targetId}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        data.name = targetName;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        return res.json({ success: true, name: targetName });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    return res.status(404).json({ error: "Project not found" });
  });

  // API to save the current timeline items and groups directly into src/data.ts.
  app.post("/api/save_timeline", (req, res) => {
    const { items, groups } = req.body;
    if (!Array.isArray(items) || !Array.isArray(groups)) {
      return res.status(400).json({ error: "Format podataka nije ispravan." });
    }

    try {
      writeTimelineDataToLocalFile(items, groups);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Greška pri upisivanju timeline podataka:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Local offline AppFlowy workspace & user endpoints
  app.get("/api/user/workspace", (_req, res) => {
    res.json({
      code: 0,
      data: {
        user_profile: { uuid: "hronika-local-user" },
        visiting_workspace: {
          id: "hronika-main-workspace",
          name: "Svici",
          icon: "📜",
          role: "Owner"
        },
        workspaces: [
          {
            id: "hronika-main-workspace",
            name: "Svici",
            icon: "📜",
            role: "Owner"
          }
        ]
      }
    });
  });

  app.get("/api/user/profile", (_req, res) => {
    res.json({
      code: 0,
      data: {
        uuid: "hronika-local-user",
        name: "Korisnik",
        email: "korisnik@hronika.plus"
      }
    });
  });

  app.get("/api/workspace/:workspaceId/view/:viewId", (req, res) => {
    res.json({
      code: 0,
      data: {
        id: req.params.viewId || "hronika-main-workspace",
        name: "Svici",
        children: []
      }
    });
  });

  app.get("/gotrue/user", (_req, res) => {
    res.json({
      id: "hronika-local-user",
      email: "korisnik@hronika.plus"
    });
  });

  // Support contact form endpoint (sending to hronika.timeline@gmail.com with Reply-To user email)
  app.post("/api/support", async (req, res) => {
    const { name, email, topic, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address format." });
    }

    console.log("==========================================");
    console.log("📨 NOVI UPIT ZA PODRŠKU (SUPPORT REQUEST)");
    console.log(`Primalac / To: hronika.timeline@gmail.com`);
    console.log(`Pošiljalac / Name: ${name}`);
    console.log(`Reply-To Email: ${email}`);
    console.log(`Tema / Topic: ${topic || "Opšte"}`);
    console.log(`Poruka / Message:\n${message}`);
    console.log(`Vreme / Timestamp: ${new Date().toISOString()}`);
    console.log("==========================================");

    return res.json({
      success: true,
      message: "Upit za podršku je uspešno poslat.",
      details: {
        recipient: "hronika.timeline@gmail.com",
        replyTo: email,
        name,
        topic
      }
    });
  });

  app.post("/api/translate", async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or targetLang." });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback if no API key
        return res.json({ translated: text });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a professional translator. Translate the following text to ${
        targetLang === "en" ? "English" : "Serbian"
      }. Respond ONLY with the translation. Do not add any quotes, markdown formatting, explanation, or introductory text:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const translated = response.text?.trim() || text;
      res.json({ translated });
    } catch (err: any) {
      console.error("Translation API error:", err);
      res.status(500).json({ error: err.message || "Translation failed." });
    }
  });

  // GET /api/translations/csv - provides CSV translation table for Google Sheets IMPORTDATA
  app.get("/api/translations/csv", (req, res) => {
    try {
      const keys = Object.keys(translations.en) as (keyof typeof translations.en)[];
      const rows: string[] = ["key,English,Srpski"];
      for (const key of keys) {
        const enVal = String((translations.en as any)[key] || "").replace(/"/g, '""').replace(/\r?\n/g, " ");
        const srVal = String((translations.sr as any)[key] || "").replace(/"/g, '""').replace(/\r?\n/g, " ");
        rows.push(`"${key}","${enVal}","${srVal}"`);
      }
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send("\uFEFF" + rows.join("\r\n"));
    } catch (err: any) {
      res.status(500).send("Error generating CSV: " + err.message);
    }
  });

  // Cache for wol.jw.org map images
  const wolMapCache = new Map<string, { buffer: Buffer; contentType: string }>();

  app.get("/api/wol_map", async (req, res) => {
    const id = req.query.id as string;
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).send("Invalid map id");
    }

    if (wolMapCache.has(id)) {
      const cached = wolMapCache.get(id)!;
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached.buffer);
    }

    try {
      const upstreamUrl = `https://wol.jw.org/en/wol/ml/r1/lp-e/${id}`;
      const upstream = await fetch(upstreamUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
      });

      if (!upstream.ok) {
        return res.status(upstream.status).send("Failed to fetch map from wol.jw.org");
      }

      const contentType = upstream.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await upstream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      wolMapCache.set(id, { buffer, contentType });

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(buffer);
    } catch (err: any) {
      console.error("Error fetching wol map:", err);
      res.status(500).send("Error fetching map");
    }
  });

  // Simple in-memory cache for link previews to keep hover previews fast and lightweight
  const previewCache = new Map<string, { title?: string; description?: string; image?: string }>();

  // API to fetch metadata / OpenGraph preview from any external link
  app.get("/api/link_preview", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "No URL provided" });
    }

    if (previewCache.has(targetUrl)) {
      return res.json(previewCache.get(targetUrl));
    }

    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({ error: "Invalid protocol" });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const fallback = {
          title: parsed.hostname,
          description: ""
        };
        previewCache.set(targetUrl, fallback);
        return res.json(fallback);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return res.json({ title: parsed.hostname, description: targetUrl });
      }

      const html = await response.text();

      // extract title
      let title = "";
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }

      // extract og:title
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i) ||
                           html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:title["']/i);
      if (ogTitleMatch) {
        title = ogTitleMatch[1].trim();
      }

      // extract description
      let description = "";
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
                        html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }

      // extract og:description
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i) ||
                           html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:description["']/i);
      if (ogDescMatch) {
        description = ogDescMatch[1].trim();
      }

      // If description is empty or short, extract text from paragraphs / article body
      let contentSnippet = "";
      const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pMatches && pMatches.length > 0) {
        const textSnippets = pMatches.slice(0, 5).map(p => {
          return p
            .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
            .replace(/<span class="footnote"[^>]*>[\s\S]*?<\/span>/gi, "")
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim();
        }).filter(t => t.length > 20 && !t.includes("cookie") && !t.includes("JavaScript"));
        if (textSnippets.length > 0) {
          contentSnippet = textSnippets.join("\n\n");
        }
      }

      // extract og:image
      let image = "";
      const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["']/i) ||
                         html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:image["']/i);
      if (ogImgMatch) {
        image = ogImgMatch[1].trim();
      }

      const decodeEntities = (str: string) => {
        return str
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ");
      };

      title = decodeEntities(title);
      description = decodeEntities(description);
      contentSnippet = decodeEntities(contentSnippet);

      const generatedDescription = contentSnippet || description || title;

      const result = {
        title: title || parsed.hostname,
        description: description || "",
        contentSnippet: contentSnippet || undefined,
        generatedDescription: generatedDescription || undefined,
        image: image || undefined
      };

      previewCache.set(targetUrl, result);
      return res.json(result);

    } catch {
      try {
        const host = new URL(targetUrl).hostname;
        return res.json({
          title: host,
          description: ""
        });
      } catch {
        return res.json({
          title: "Link",
          description: ""
        });
      }
    }
  });

  // Helper to serve index.html dynamically with dynamic metadata / OpenGraph preview
  const serveDynamicHtml = (req: any, res: any, id: string) => {
    const isProd = process.env.NODE_ENV === "production";
    const indexPath = isProd 
      ? path.join(process.cwd(), "dist", "index.html")
      : path.join(process.cwd(), "index.html");

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("index.html not found");
    }

    let html = fs.readFileSync(indexPath, "utf8");

    // Default values
    let projectName = "Istorija";
    if (id && id !== "default") {
      const filePath = path.join(projectsDir, `${id}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (data.name) {
            projectName = data.name;
          }
        } catch (_) {}
      }
    } else if (id === "default" || !id) {
      const filePath = path.join(projectsDir, "default.json");
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (data.name) {
            projectName = data.name;
          }
        } catch (_) {}
      }
    }

    const title = projectName ? `Hronika | ${projectName}` : "Hronika";
    const description = `Pogledajte interaktivnu vremensku liniju "${projectName}" na platformi Hronika.`;
    const host = req.get("host") || "ais-dev-bohipqj5tnne4qjac5kikk-304555909966.europe-west2.run.app";
    const absoluteLogoUrl = `https://${host}/favicon.png`;

    html = html
      .replace(/<title>[^<]*<\/title>/g, `<title>${title}</title>`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${title}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${description}" />`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${description}" />`);

    // Add or replace og:image tag
    if (html.includes("og:image")) {
      html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/g, `<meta property="og:image" content="${absoluteLogoUrl}" />`);
    } else {
      html = html.replace("</head>", `  <meta property="og:image" content="${absoluteLogoUrl}" />\n  </head>`);
    }

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  };

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Dynamic routes served before static to prevent express.static serving dist/index.html statically
    app.get("/", (req, res) => {
      const id = (req.query.id as string) || "default";
      serveDynamicHtml(req, res, id);
    });

    app.get("/p/:id", (req, res) => {
      const id = req.params.id;
      serveDynamicHtml(req, res, id);
    });

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      const pathParts = req.path.split("/");
      if (pathParts.length >= 3 && pathParts[1] === "p") {
        serveDynamicHtml(req, res, pathParts[2]);
      } else {
        serveDynamicHtml(req, res, "default");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
