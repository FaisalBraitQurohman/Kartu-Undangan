"use client";
import { useState } from "react";
import {
  Check,
  Heart,
  ImageIcon,
  Palette,
  PencilLine,
  Settings2,
} from "lucide-react";
import { PhoneMockup } from "./phone-mockup";
import { demoContent } from "@/validators/invitation";
import { templatePresentation } from "./template-presentation";
export function EditorShowcase() {
  const [partner1, setPartner1] = useState("Alya");
  const [partner2, setPartner2] = useState("Rizky");
  const [accent, setAccent] = useState("#b59a75");
  return (
    <div className="editor-showcase" id="coba-editor">
      <div className="editor-window">
        <div className="editor-toolbar">
          <span className="editor-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Editor UndangKita</span>
          <span className="editor-live">
            <span /> Live preview
          </span>
        </div>
        <div className="editor-window-body">
          <div className="editor-sidebar" aria-hidden="true">
            <Heart size={17} />
            <PencilLine size={17} />
            <ImageIcon size={17} />
            <Palette size={17} />
            <Settings2 size={17} />
          </div>
          <div className="editor-fields">
            <span className="editor-form-title">Cerita kalian</span>
            <p>Ubah nama, lihat hasilnya.</p>
            <label>
              Nama mempelai
              <input
                value={partner1}
                maxLength={24}
                onChange={(event) => setPartner1(event.target.value)}
              />
            </label>
            <label>
              Nama pasangan
              <input
                value={partner2}
                maxLength={24}
                onChange={(event) => setPartner2(event.target.value)}
              />
            </label>
            <fieldset className="editor-palette">
              <legend>Warna aksen</legend>
              {templatePresentation["minimalist-ivory"].palette.map((color) => (
                <button
                  type="button"
                  aria-label={`Editor: ${color.name}`}
                  aria-pressed={accent === color.value}
                  key={color.value}
                  style={{ background: color.value }}
                  onClick={() => setAccent(color.value)}
                >
                  {accent === color.value && <Check size={13} />}
                </button>
              ))}
            </fieldset>
            <p className="editor-demo-note">
              Coba di sini. Perubahan contoh ini tidak disimpan.
            </p>
          </div>
          <div className="editor-preview">
            <PhoneMockup
              templateKey="minimalist-ivory"
              accent={accent}
              content={{ ...demoContent, partner1, partner2 }}
              className="editor-phone"
            />
            <span>Pratinjau langsung</span>
          </div>
        </div>
      </div>
      <div className="editor-laptop-base" aria-hidden="true" />
      <p className="sr-only" role="status" aria-live="polite">
        Pratinjau undangan: {partner1 || "Nama"} dan {partner2 || "Pasangan"}.
      </p>
    </div>
  );
}
