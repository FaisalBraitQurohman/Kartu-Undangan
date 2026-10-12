"use client";
import { useEffect, useId, useRef, useState } from "react";
import { LayoutGroup, motion, useAnimate } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import { isTemplateKey } from "@/templates/registry";
import { PhoneMockup } from "./phone-mockup";
import {
  categoryLabels,
  templatePresentation,
  type CatalogTemplate,
} from "./template-presentation";
function TemplateCard({ template }: { template: CatalogTemplate }) {
  const reduceMotion = usePrefersReducedMotion();
  const presentation = templatePresentation[template.key];
  const [accent, setAccent] = useState(
    presentation?.palette[0]?.value || "#b59a75",
  );
  const demoHref = `/demo/${template.key}?accent=${encodeURIComponent(accent)}`;
  return (
    <motion.article
      className="marketplace-card"
      layout={reduceMotion ? false : "position"}
      initial={false}
      transition={{ layout: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
    >
      <Link
        href={demoHref}
        className={`card-stage stage-${presentation?.surface || "ivory"}`}
        aria-label={`Preview ${template.name}`}
      >
        <span className={`card-badge ${template.isFree ? "badge-free" : ""}`}>
          {template.isFree ? "Gratis" : "Premium"}
        </span>
        <span className="stage-arch" aria-hidden="true" />
        {isTemplateKey(template.key) && (
          <PhoneMockup
            templateKey={template.key}
            accent={accent}
            className="card-phone"
          />
        )}
        <span className="stage-caption" aria-hidden="true">
          {presentation?.styles[0] || "UndangKita"} collection
        </span>
      </Link>
      <div className="card-info">
        <h3>
          <Link href={`/templates/${template.slug}`}>{template.name}</Link>
        </h3>
        <div className="card-tags">
          <span>{categoryLabels[template.category] || template.category}</span>
          <span>{presentation?.styles[0]}</span>
        </div>
        <div className="card-price-row">
          <fieldset className="color-swatches">
            <legend className="sr-only">Warna aksen {template.name}</legend>
            {presentation?.palette.map((color) => (
              <button
                key={color.value}
                type="button"
                aria-label={`${template.name}: ${color.name}`}
                aria-pressed={accent === color.value}
                title={color.name}
                style={{ "--swatch": color.value } as React.CSSProperties}
                onClick={() => setAccent(color.value)}
              />
            ))}
          </fieldset>
          <p className={template.isFree ? "free-price" : ""}>
            {template.isFree ? "Gratis" : money(template.price)}
          </p>
        </div>
        <div className="card-actions">
          <Button asChild variant="outline" size="sm">
            <Link href={demoHref}>
              Preview <ArrowUpRight size={13} />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/templates/${template.slug}#gunakan`}>
              {template.isFree ? "Gunakan" : "Beli template"}
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
export function CatalogBrowser({
  templates,
}: {
  templates: CatalogTemplate[];
}) {
  const filterGroup = useId();
  const reduceMotion = usePrefersReducedMotion();
  const [scope, animate] = useAnimate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("");
  const styles = [
    ...new Set(
      templates.flatMap((t) => templatePresentation[t.key]?.styles || []),
    ),
  ];
  const colors = [
    ...new Set(
      templates.flatMap(
        (t) => templatePresentation[t.key]?.palette.map((p) => p.name) || [],
      ),
    ),
  ];
  const categories = [...new Set(templates.map((t) => t.category))];
  const filtered = templates.filter((t) => {
    const presentation = templatePresentation[t.key];
    const searchable = [
      t.name,
      t.description,
      categoryLabels[t.category],
      ...(presentation?.styles || []),
      ...(presentation?.palette.map((p) => p.name) || []),
    ]
      .join(" ")
      .toLocaleLowerCase("id-ID");
    return (
      searchable.includes(query.trim().toLocaleLowerCase("id-ID")) &&
      (!category || category === t.category) &&
      (!style || presentation?.styles.includes(style)) &&
      (!color || presentation?.palette.some((p) => p.name === color)) &&
      (!price || (price === "free" ? t.isFree : !t.isFree))
    );
  });
  const hasFilters = !!(query || category || style || color || price);
  const resultKey = filtered.map((template) => template.id).join(",");
  const previousResults = useRef(resultKey);
  useEffect(() => {
    const changed = previousResults.current !== resultKey;
    previousResults.current = resultKey;
    if (!changed || !resultKey || reduceMotion) return;
    const animation = animate(
      ".marketplace-card",
      { opacity: [0.65, 1] },
      { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    );
    return () => animation.cancel();
  }, [animate, reduceMotion, resultKey]);
  const reset = () => {
    setQuery("");
    setCategory("");
    setStyle("");
    setColor("");
    setPrice("");
  };
  return (
    <div ref={scope} className="catalog-browser">
      <div className="catalog-controls" id="pencarian-template">
        <div className="catalog-search-row">
          <label className="catalog-search">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Cari template</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari template untuk momen spesialmu…"
            />
          </label>
          <label className="catalog-category">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Kategori acara</span>
            <select
              aria-label="Kategori acara"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c] || c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="catalog-filter-row">
          <div className="style-filters" role="group" aria-label="Gaya desain">
            <LayoutGroup id={filterGroup}>
              {["", ...styles].map((s) => (
                <button
                  type="button"
                  key={s}
                  aria-pressed={style === s}
                  onClick={() => setStyle(s)}
                >
                  {style === s && (
                    <motion.span
                      className="style-filter-indicator"
                      layoutId="selected-style"
                      initial={false}
                      transition={{
                        duration: reduceMotion ? 0 : 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      aria-hidden="true"
                    />
                  )}
                  {s || "Semua"}
                </button>
              ))}
            </LayoutGroup>
          </div>
          <div className="catalog-selects">
            <label>
              <span className="sr-only">Filter warna</span>
              <select
                aria-label="Filter warna"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              >
                <option value="">Semua warna</option>
                {colors.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter harga</span>
              <select
                aria-label="Filter harga"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              >
                <option value="">Semua harga</option>
                <option value="free">Gratis</option>
                <option value="premium">Premium</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="catalog-results-row">
        <p role="status" aria-live="polite">
          {filtered.length} desain tersedia
          {hasFilters ? " sesuai pilihanmu" : " untuk ceritamu"}
        </p>
        {hasFilters && (
          <button type="button" onClick={reset}>
            <X size={13} /> Reset filter
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="marketplace-grid">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <Search size={25} />
          <h3>Desain yang kamu cari belum ditemukan.</h3>
          <p>Coba kata kunci lain atau tampilkan semua desain.</p>
          {hasFilters && (
            <Button variant="outline" onClick={reset}>
              Tampilkan semua template
            </Button>
          )}
        </div>
      )}
      <p className="catalog-footnote">
        Warna adalah pilihan aksen yang dapat kamu sesuaikan di editor. Template
        premium dibeli satu kali untuk akunmu.
      </p>
    </div>
  );
}
