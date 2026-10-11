import React, { useState, useEffect } from "react";
import { X, Mail, CheckCircle2, AlertCircle, Send, User, MessageSquare, Tag, Loader2, Languages } from "lucide-react";
import { SkinType } from "../types";
import { SKINS_CONFIG } from "./SettingsModal";
import { LangType, getAppTranslations } from "../translations";
import { SUPPORTED_TRANSLATION_LANGUAGES } from "../services/googleDocsService";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
  skin?: SkinType;
  lang: LangType;
  initialTopic?: string;
}

export function SupportModal({
  isOpen,
  onClose,
  theme = "dark",
  skin = "hronika",
  lang,
  initialTopic
}: SupportModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(initialTopic || "technical");
  const [translationHelpLang, setTranslationHelpLang] = useState<string>("en");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialTopic) {
        setTopic(initialTopic);
      } else {
        setTopic("technical");
      }
    }
  }, [isOpen, initialTopic]);

  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLightTheme = theme === "light";
  const skinInfo = SKINS_CONFIG[skin] || SKINS_CONFIG.hronika;
  const t = getAppTranslations(lang);

  const validate = () => {
    const errs: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) {
      errs.name = lang === "sr" ? "Ime i prezime je obavezno polje." : "Full name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = lang === "sr" ? "Email adresa je obavezno polje." : "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      errs.email = lang === "sr" ? "Unesite validnu email adresu (npr. ime@primer.com)." : "Please enter a valid email address.";
    }

    if (!message.trim()) {
      errs.message = lang === "sr" ? "Poruka je obavezno polje." : "Message description is required.";
    } else if (message.trim().length < 10) {
      errs.message = lang === "sr" ? "Poruka mora imati barem 10 karaktera." : "Message must be at least 10 characters long.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const topicLabels: Record<string, { sr: string; en: string }> = {
        technical: { sr: "Tehnički problem", en: "Technical issue" },
        suggestion: { sr: "Predlog za aplikaciju", en: "App suggestion" },
        translation_help: { sr: "Pomoć oko prevoda", en: "Translation help" },
        other: { sr: "Drugo", en: "Other" }
      };

      const selectedTopicLabel = topicLabels[topic]?.[lang] || topic;
      const langObj = SUPPORTED_TRANSLATION_LANGUAGES.find(l => l.code === translationHelpLang);
      const finalMessage = topic === "translation_help" && langObj 
        ? `[Jezik za prevod: ${langObj.nameSr} / ${langObj.nameEn} (${langObj.code})]\n\n${message.trim()}`
        : message.trim();

      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: selectedTopicLabel,
          message: finalMessage,
          recipient: "hronika.timeline@gmail.com"
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit support request");
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Support form submit error:", err);
      setSubmitError(
        lang === "sr" 
          ? "Došlo je do greške prilikom slanja upita. Molimo pokušajte ponovo ili pišite direktno na hronika.timeline@gmail.com."
          : "An error occurred while sending your request. Please try again or email us directly at hronika.timeline@gmail.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setEmail("");
    setTopic("technical");
    setMessage("");
    setErrors({});
    setIsSuccess(false);
    setSubmitError(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-text cursor-pointer"
      onClick={handleResetAndClose}
      id="modal_support_backdrop"
    >
      <div 
        className={`border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 cursor-default ${
          isLightTheme 
            ? "bg-white border-[#1E443A] text-slate-800" 
            : "bg-[#0f0f12] border-[#1E443A] text-slate-100"
        }`}
        id="modal_support_container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLightTheme ? "bg-slate-50 border-[#1E443A]/30 text-slate-800" : "bg-[#0d0d10] border-[#1E443A]/40 text-slate-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E443A]/30 flex items-center justify-center text-[#3E927B] shrink-0">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`font-bold text-base leading-tight font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                {lang === "sr" ? "Tehnička podrška" : "Technical Support"}
              </h3>
              <p className="text-[11px] text-[#ada9a3]">
                {lang === "sr" ? "Prijavite problem, dajte sugestiju ili postavite pitanje" : "Report a problem, make a suggestion, or ask a question"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLightTheme 
                ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" 
                : "hover:bg-[#161619] text-[#ada9a3] hover:text-white"
            }`}
            id="btn_support_close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#1E443A]/30 border border-[#3E927B]/40 text-[#3E927B] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                  {lang === "sr" ? "Upit je uspešno poslat!" : "Request Sent Successfully!"}
                </h4>
                <p className="text-xs text-[#ada9a3] leading-relaxed">
                  {lang === "sr" 
                    ? "Hvala vam na poruci. Primili smo vaš upit i poslaćemo vam odgovor na unetu email adresu u najkraćem mogućem roku."
                    : "Thank you for reaching out. We have received your message and will respond to your email address shortly."}
                </p>
              </div>

              <div className={`w-full p-3 rounded-xl border text-xs text-left font-mono space-y-1 ${
                isLightTheme ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-[#161619] border-[#373735] text-[#ada9a3]"
              }`}>
                <div><strong>{lang === "sr" ? "Primalac:" : "Recipient:"}</strong> hronika.timeline@gmail.com</div>
                <div><strong>Reply-To:</strong> {email}</div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#1E443A] hover:bg-[#255246] transition cursor-pointer active:scale-95 shadow-md border border-[#3E927B]/40"
              >
                {lang === "sr" ? "Zatvori" : "Close"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="form_support">
              {submitError && (
                <div className="p-3 rounded-xl bg-[#A34836]/15 border border-[#A34836]/30 text-[#A34836] dark:text-[#E08D79] text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Ime i prezime */}
              <div className="space-y-1">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#ada9a3]" />
                    <span>{lang === "sr" ? "Ime i prezime" : "Full name"}</span>
                    <span className="text-[#A34836]">*</span>
                  </span>
                  {errors.name && <span className="text-[11px] text-[#A34836] font-normal">{errors.name}</span>}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder={lang === "sr" ? "npr. Marko Marković" : "e.g. John Doe"}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${
                    errors.name
                      ? "border-[#A34836] focus:ring-1 focus:ring-[#A34836] bg-[#A34836]/5"
                      : isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#3E927B] focus:bg-white"
                        : "bg-[#161619] border-[#373735] text-[#eaeaea] focus:border-[#3E927B] focus:bg-[#0f0f12]"
                  }`}
                  id="inp_support_name"
                />
              </div>

              {/* Email adresa */}
              <div className="space-y-1">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#ada9a3]" />
                    <span>{lang === "sr" ? "Vaša imejl adresa" : "Your email address"}</span>
                    <span className="text-[#A34836]">*</span>
                  </span>
                  {errors.email && <span className="text-[11px] text-[#A34836] font-normal">{errors.email}</span>}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder={lang === "sr" ? "npr. marko.markovic@gmail.com" : "e.g. john.doe@gmail.com"}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${
                    errors.email
                      ? "border-[#A34836] focus:ring-1 focus:ring-[#A34836] bg-[#A34836]/5"
                      : isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#3E927B] focus:bg-white"
                        : "bg-[#161619] border-[#373735] text-[#eaeaea] focus:border-[#3E927B] focus:bg-[#0f0f12]"
                  }`}
                  id="inp_support_email"
                />
              </div>

              {/* Predmet zahteva */}
              <div className="space-y-1">
                <label className="text-xs font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#ada9a3]" />
                  <span>{lang === "sr" ? "Predmet zahteva" : "Subject of request"}</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition cursor-pointer ${
                    isLightTheme
                      ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#3E927B]"
                      : "bg-[#161619] border-[#373735] text-[#eaeaea] focus:border-[#3E927B]"
                  }`}
                  id="select_support_topic"
                >
                  <option value="technical">
                    {lang === "sr" ? "Tehnički problem" : "Technical issue"}
                  </option>
                  <option value="suggestion">
                    {lang === "sr" ? "Predlog za aplikaciju" : "App suggestion"}
                  </option>
                  <option value="translation_help">
                    {lang === "sr" ? "Pomoć oko prevoda" : "Translation help"}
                  </option>
                  <option value="other">
                    {lang === "sr" ? "Drugo" : "Other"}
                  </option>
                </select>
              </div>

              {/* Automatic Language Dropdown when 'translation_help' is selected */}
              {topic === "translation_help" && (
                <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                  <label className="text-xs font-semibold flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" />
                    <span>{lang === "sr" ? "Jezik" : "Language"}</span>
                  </label>
                  <select
                    value={translationHelpLang}
                    onChange={(e) => setTranslationHelpLang(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition cursor-pointer ${
                      isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#3E927B]"
                        : "bg-[#161619] border-[#373735] text-[#eaeaea] focus:border-[#3E927B]"
                    }`}
                    id="select_support_translation_lang"
                  >
                    {SUPPORTED_TRANSLATION_LANGUAGES.filter(l => l.code !== "sr").map(l => {
                      const displayName = lang === "sr" ? l.nameSr.toLowerCase() : l.nameEn;
                      return (
                        <option key={l.code} value={l.code}>
                          {l.flag} {displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Tekst poruke */}
              <div className="space-y-1">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#ada9a3]" />
                    <span>{lang === "sr" ? "Tekst poruke" : "Message text"}</span>
                    <span className="text-[#A34836]">*</span>
                  </span>
                  {errors.message && <span className="text-[11px] text-[#A34836] font-normal">{errors.message}</span>}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                  }}
                  placeholder={
                    lang === "sr"
                      ? "Opišite detaljno problem, sugestiju ili pitanje..."
                      : "Describe the issue, suggestion, or question in detail..."
                  }
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition resize-y ${
                    errors.message
                      ? "border-[#A34836] focus:ring-1 focus:ring-[#A34836] bg-[#A34836]/5"
                      : isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#3E927B] focus:bg-white"
                        : "bg-[#161619] border-[#373735] text-[#eaeaea] focus:border-[#3E927B] focus:bg-[#0f0f12]"
                  }`}
                  id="textarea_support_message"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1E443A]/30">
                <p className="text-[11px] text-[#ada9a3]">
                  {lang === "sr" ? "Odgovori stižu na imejl adresu koju ste uneli." : "Replies sent to the email address you entered."}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isLightTheme ? "hover:bg-slate-100 text-slate-600" : "bg-[#161619] border border-[#373735] hover:bg-[#25252b] text-[#ada9a3]"
                    }`}
                  >
                    {lang === "sr" ? "Otkaži" : "Cancel"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#1E443A] hover:bg-[#255246] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50 active:scale-95 border border-[#3E927B]/40"
                    id="btn_support_submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === "sr" ? "Slanje..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === "sr" ? "Pošalji upit" : "Send request"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
