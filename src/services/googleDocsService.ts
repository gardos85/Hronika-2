import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { TranslationDictionary } from "../translations";

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Provider with required Workspace scopes
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/documents");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/drive");

// In-memory cache for OAuth access token (strictly memory-only per guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

const SAVED_DOC_ID_KEY = "hronika_google_docs_doc_id";

export interface DriveFolderItem {
  id: string;
  name: string;
  parents?: string[];
}

export interface SupportedTranslationLanguage {
  code: string;
  nameSr: string;
  nameEn: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_TRANSLATION_LANGUAGES: SupportedTranslationLanguage[] = [
  { code: "sr", nameSr: "Srpski", nameEn: "Serbian", nativeName: "Српски / Srpski", flag: "🇷🇸" },
  { code: "en", nameSr: "Engleski", nameEn: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hr", nameSr: "Hrvatski", nameEn: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷" },
  { code: "bs", nameSr: "Bosanski", nameEn: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦" },
  { code: "me", nameSr: "Crnogorski", nameEn: "Montenegrin", nativeName: "Crnogorski", flag: "🇲🇪" },
  { code: "mk", nameSr: "Makedonski", nameEn: "Macedonian", nativeName: "Македонски", flag: "🇲🇰" },
  { code: "sl", nameSr: "Slovenački", nameEn: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮" },
  { code: "de", nameSr: "Nemački", nameEn: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", nameSr: "Francuski", nameEn: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", nameSr: "Španski", nameEn: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "it", nameSr: "Italijanski", nameEn: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "ru", nameSr: "Ruski", nameEn: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "pt", nameSr: "Portugalski", nameEn: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "el", nameSr: "Grčki", nameEn: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "ro", nameSr: "Rumunski", nameEn: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  { code: "hu", nameSr: "Mađarski", nameEn: "Hungarian", nativeName: "Magyar", flag: "🇭🇺" },
  { code: "pl", nameSr: "Poljski", nameEn: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "nl", nameSr: "Holandski", nameEn: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "cs", nameSr: "Češki", nameEn: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "sk", nameSr: "Slovački", nameEn: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰" },
  { code: "bg", nameSr: "Bugarski", nameEn: "Bulgarian", nativeName: "Български", flag: "🇧🇬" },
  { code: "tr", nameSr: "Turski", nameEn: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
];

export function getSavedGoogleDocFolder(lang: string = "sr"): { id: string; name: string } {
  try {
    const id = localStorage.getItem(`hronika_google_docs_folder_id_${lang}`) || "root";
    const name = localStorage.getItem(`hronika_google_docs_folder_name_${lang}`) || (lang === "en" ? "My Drive (Root)" : "Moj disk (Koren)");
    return { id, name };
  } catch (_) {
    return { id: "root", name: lang === "en" ? "My Drive (Root)" : "Moj disk (Koren)" };
  }
}

export function saveGoogleDocFolder(folderId: string, folderName: string, lang: string = "sr"): void {
  try {
    localStorage.setItem(`hronika_google_docs_folder_id_${lang}`, folderId);
    localStorage.setItem(`hronika_google_docs_folder_name_${lang}`, folderName);
  } catch (_) {}
}

export function getSavedGoogleDocId(lang: string = "sr"): string | null {
  try {
    const key = `hronika_google_docs_doc_id_${lang}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    if (lang === "sr") {
      return localStorage.getItem(SAVED_DOC_ID_KEY);
    }
    return null;
  } catch (_) {
    return null;
  }
}

export function saveGoogleDocId(docId: string | null, lang: string = "sr"): void {
  try {
    const key = `hronika_google_docs_doc_id_${lang}`;
    if (!docId) {
      localStorage.removeItem(key);
      if (lang === "sr") {
        localStorage.removeItem(SAVED_DOC_ID_KEY);
      }
    } else {
      localStorage.setItem(key, docId);
      if (lang === "sr") {
        localStorage.setItem(SAVED_DOC_ID_KEY, docId);
      }
    }
  } catch (_) {}
}

export function initGoogleAuth(
  onSuccess: (user: User, token: string) => void,
  onSignedOut: () => void
): () => void {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      onSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      onSignedOut();
    }
  });
}

export async function signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Neuspešno dobijanje Google pristupnog tokena.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

export function getCurrentAccessToken(): string | null {
  return cachedAccessToken;
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function listDriveFolders(parentId: string = "root"): Promise<DriveFolderItem[]> {
  if (!cachedAccessToken) {
    throw new Error("Morate biti prijavljeni na Google nalog.");
  }

  const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent("files(id,name,parents)")}&orderBy=name&pageSize=100`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Neuspešno učitavanje foldera sa Google Drive-a.");
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    parents: f.parents,
  }));
}

export async function createDriveFolder(name: string, parentId: string = "root"): Promise<DriveFolderItem> {
  if (!cachedAccessToken) {
    throw new Error("Morate biti prijavljeni na Google nalog.");
  }

  const metadata = {
    name: name.trim() || "Hronika Prevodi",
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId && parentId !== "root" ? [parentId] : [],
  };

  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Neuspešno kreiranje foldera na Google Drive-u.");
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name || name,
  };
}

export async function moveFileToFolder(fileId: string, folderId: string): Promise<void> {
  if (!cachedAccessToken || !folderId || folderId === "root") return;

  // Retrieve current parents
  const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`, {
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
  });

  if (!getRes.ok) return;

  const fileData = await getRes.json();
  const previousParents = (fileData.parents || []).join(",");

  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}&fields=id,parents`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
      },
    }
  );
}

/**
 * Creates a formatted Google Docs document on the user's Google Drive.
 * Formatted like:
 * key: translation
 * matching the user's layout from NW Scheduler / NW Publisher.
 */
export async function createGoogleDocTranslation(
  enTranslations: Record<string, string>,
  srTranslations: Record<string, string>,
  targetLang: string = "sr",
  targetFolderId?: string,
  onProgress?: (step: string) => void,
  targetLangLabel?: string
): Promise<{ documentId: string; url: string }> {
  if (!cachedAccessToken) {
    throw new Error("Morate biti prijavljeni na Google nalog.");
  }

  const isEn = targetLang === "en";
  const displayLabel = targetLangLabel || (isEn ? "English" : targetLang === "sr" ? "Srpski" : targetLang.toUpperCase());

  onProgress?.(`Kreiranje Google Docs dokumenta za ${displayLabel}...`);

  // 1. Create document with title
  const title = `Hronika - Prevod (${displayLabel})`;
  const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cachedAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Neuspešno kreiranje Google Docs dokumenta.");
  }

  const createdDoc = await createRes.json();
  const documentId = createdDoc.documentId as string;

  onProgress?.("Upisivanje termina i priprema teksta za prevod u realnom vremenu...");

  // 2. Prepare formatted text
  const headerLines = [
    `# HRONIKA - PREVOD / TRANSLATION (${displayLabel.toUpperCase()})`,
    `# UPUTSTVO / INSTRUCTIONS:`,
    `# Svaki red je u formatu "ključ: Prevod teksta" / Each line follows "key: Translation".`,
    `# Menjajte samo tekst sa desne strane dvotačke (:).`,
    `# Nemojte brisati niti menjati nazive ključeva sa leve strane.`,
    `# Sve izmene u ovom dokumentu se automatski u realnom vremenu uvoze u aplikaciju!`,
    "",
  ];

  const keys = Object.keys(enTranslations);
  const dataLines: { key: string; line: string }[] = [];

  // Check if existing custom translation exists for this language
  let existingCustom: Record<string, string> | null = null;
  try {
    const raw = localStorage.getItem(`hronika_custom_translation_${targetLang}_v1`);
    if (raw) existingCustom = JSON.parse(raw);
  } catch (_) {}

  for (const k of keys) {
    let val = "";
    if (existingCustom && existingCustom[k]) {
      val = existingCustom[k];
    } else if (isEn) {
      val = enTranslations[k] || "";
    } else {
      val = srTranslations[k] || enTranslations[k] || "";
    }
    const cleanVal = String(val).replace(/\r?\n/g, " ");
    dataLines.push({
      key: k,
      line: `${k}: ${cleanVal}`,
    });
  }

  const fullText = [...headerLines, ...dataLines.map(d => d.line)].join("\n") + "\n";

  // 3. Batch insert text into document
  const requests: any[] = [
    {
      insertText: {
        location: { index: 1 },
        text: fullText,
      },
    },
  ];

  let currentOffset = 1;
  for (const h of headerLines) {
    currentOffset += h.length + 1;
  }

  for (const item of dataLines) {
    const keyLength = item.key.length;
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: currentOffset,
          endIndex: currentOffset + keyLength + 1,
        },
        textStyle: {
          bold: true,
          foregroundColor: {
            color: {
              rgbColor: {
                red: 0.1,
                green: 0.35,
                blue: 0.85,
              },
            },
          },
        },
        fields: "bold,foregroundColor",
      },
    });
    currentOffset += item.line.length + 1;
  }

  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cachedAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!updateRes.ok) {
    console.warn("Styling batch failed, trying text only fallback");
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cachedAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: fullText,
            },
          },
        ],
      }),
    });
  }

  if (targetFolderId && targetFolderId !== "root") {
    onProgress?.("Premeštanje dokumenta u izabrani folder...");
    try {
      await moveFileToFolder(documentId, targetFolderId);
    } catch (e) {
      console.warn("Could not move file to folder:", e);
    }
  }

  saveGoogleDocId(documentId, targetLang);

  const url = `https://docs.google.com/document/d/${documentId}/edit`;
  return { documentId, url };
}

/**
 * Fetches the document from Google Docs API and parses all "key: translation" lines.
 */
export async function fetchTranslationsFromGoogleDoc(
  documentId: string
): Promise<{ count: number; data: Partial<TranslationDictionary>; title: string; revisionId: string }> {
  if (!cachedAccessToken) {
    throw new Error("Morate biti prijavljeni na Google nalog.");
  }

  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      "Authorization": `Bearer ${cachedAccessToken}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Neuspešno čitanje Google Docs dokumenta.");
  }

  const doc = await res.json();
  const title = doc.title || "Google Docs";
  const revisionId = doc.revisionId || "";

  // Extract all text content
  let text = "";
  if (doc.body && Array.isArray(doc.body.content)) {
    for (const elem of doc.body.content) {
      if (elem.paragraph && Array.isArray(elem.paragraph.elements)) {
        for (const pElem of elem.paragraph.elements) {
          if (pElem.textRun && pElem.textRun.content) {
            text += pElem.textRun.content;
          }
        }
      }
    }
  }

  const result: Partial<TranslationDictionary> = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
      continue;
    }

    const match = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && value) {
        (result as any)[key] = value;
      }
    }
  }

  const count = Object.keys(result).length;
  if (count === 0) {
    throw new Error("Nije pronađen nijedan validan prevod u formatu 'ključ: Prevod' u ovom Google Docs dokumentu.");
  }

  return { count, data: result, title, revisionId };
}

/**
 * Starts a real-time live sync session for a Google Doc translation.
 * Periodically checks for revisions and imports updates on the fly.
 * Also checks when the browser tab gains focus (instant refresh upon editing in Docs).
 */
export function startGoogleDocLiveSync(
  documentId: string,
  lang: string,
  onUpdate: (data: Partial<TranslationDictionary>, count: number, timestamp: Date, docTitle: string) => void,
  onError?: (err: any) => void
): () => void {
  let isChecking = false;
  let lastRevisionId: string | null = null;

  const performCheck = async () => {
    if (isChecking) return;
    if (!cachedAccessToken) return;

    try {
      isChecking = true;
      const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}?fields=revisionId,title,body`, {
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`,
        },
      });

      if (!res.ok) {
        return;
      }

      const doc = await res.json();
      const currentRev = doc.revisionId;
      if (lastRevisionId && currentRev && currentRev === lastRevisionId) {
        return; // No changes in document revision
      }

      let text = "";
      if (doc.body && Array.isArray(doc.body.content)) {
        for (const elem of doc.body.content) {
          if (elem.paragraph && Array.isArray(elem.paragraph.elements)) {
            for (const pElem of elem.paragraph.elements) {
              if (pElem.textRun && pElem.textRun.content) {
                text += pElem.textRun.content;
              }
            }
          }
        }
      }

      const result: Partial<TranslationDictionary> = {};
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;
        const match = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && value) {
            (result as any)[key] = value;
          }
        }
      }

      const count = Object.keys(result).length;
      if (count > 0) {
        lastRevisionId = currentRev || "rev_" + Date.now();
        onUpdate(result, count, new Date(), doc.title || "Google Docs");
      }
    } catch (err) {
      onError?.(err);
    } finally {
      isChecking = false;
    }
  };

  // Immediate check
  performCheck();

  // Polling every 7 seconds
  const interval = setInterval(performCheck, 7000);

  // Check immediately on tab focus
  const onFocus = () => {
    performCheck();
  };
  window.addEventListener("focus", onFocus);

  return () => {
    clearInterval(interval);
    window.removeEventListener("focus", onFocus);
  };
}
