import express from "express";
import fs from "fs";
import path from "path";
import { INITIAL_ITEMS, DEFAULT_GROUPS } from "../src/data";

const app = express();
app.use(express.json({ limit: "50mb" }));

const getProjectsDir = () => {
  const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const dir = isVercel
    ? path.join("/tmp", "data", "projects")
    : path.join(process.cwd(), "data", "projects");
    
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// GET /api/projects
app.get("/api/projects", (req, res) => {
  try {
    const projectsDir = getProjectsDir();
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
            name: data.name || (id === "default" ? "Prazan projekat" : `Projekat ${id}`)
          };
        } catch (_) {
          return {
            id,
            name: id === "default" ? "Prazan projekat" : `Projekat ${id}`
          };
        }
      });

    const hasDefault = list.some(p => p.id === "default");
    if (!hasDefault) {
      list.unshift({ id: "default", name: "Prazan projekat" });
    }

    res.json(list);
  } catch (err: any) {
    res.json([{ id: "default", name: "Prazan projekat" }]);
  }
});

// GET /api/timeline?id=...
app.get("/api/timeline", (req, res) => {
  const rawId = req.query.id as string;
  const id = rawId && rawId.trim() ? rawId.trim() : "default";
  const projectsDir = getProjectsDir();
  const filePath = path.join(projectsDir, `${id}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (!data.name) {
        data.name = id === "default" ? "Prazan projekat" : `Projekat ${id}`;
      }
      return res.json(data);
    } catch (err: any) {}
  }

  const defaultData = { name: "Prazan projekat", items: [], groups: DEFAULT_GROUPS };
  return res.json(defaultData);
});

// POST /api/timeline
app.post("/api/timeline", (req, res) => {
  const rawId = req.body.id || req.query.id;
  const id = typeof rawId === "string" && rawId.trim() ? rawId.trim() : "default";
  const { items, groups, name } = req.body;
  const projectsDir = getProjectsDir();
  const filePath = path.join(projectsDir, `${id}.json`);

  const dataToSave = {
    name: name || (id === "default" ? "Prazan projekat" : `Projekat ${id}`),
    items: Array.isArray(items) ? items : [],
    groups: Array.isArray(groups) ? groups : DEFAULT_GROUPS
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");
    res.json({ success: true, id, data: dataToSave });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timeline/create
app.post("/api/timeline/create", (req, res) => {
  const { id, name, items, groups } = req.body;
  const newId = id || `proj_${Date.now().toString(36)}`;
  const projectName = name || "Prazan projekat";
  const projectsDir = getProjectsDir();
  const filePath = path.join(projectsDir, `${newId}.json`);

  const newProjectData = {
    name: projectName,
    items: Array.isArray(items) ? items : [],
    groups: Array.isArray(groups) ? groups : DEFAULT_GROUPS
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(newProjectData, null, 2), "utf8");
    res.json({ id: newId, name: projectName, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timeline/rename
app.post("/api/timeline/rename", (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: "Missing id or name" });

  const projectsDir = getProjectsDir();
  const filePath = path.join(projectsDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      data.name = name.trim();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      return res.json({ success: true, name: data.name });
    } catch (err: any) {}
  }
  res.json({ success: true, name: name.trim() });
});

// DELETE /api/timeline
app.delete("/api/timeline", (req, res) => {
  const rawId = req.query.id as string;
  if (!rawId) return res.status(400).json({ error: "Missing id" });

  const projectsDir = getProjectsDir();
  const filePath = path.join(projectsDir, `${rawId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }
  res.json({ success: true });
});

// POST /api/translate
app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: "Missing text or targetLang" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.json({ translated: text });

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Translate to ${targetLang === "en" ? "English" : "Serbian"}. Respond ONLY with translation:\n${text}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    res.json({ translated: response.text?.trim() || text });
  } catch (e) {
    res.json({ translated: text });
  }
});

export default app;
