(function () {
  function client() {
    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_KEY) {
      return null;
    }
    if (!window.__sb) {
      window.__sb = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_KEY
      );
    }
    return window.__sb;
  }

  function slugify(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  function excerptFrom(body) {
    const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length <= 180) return text;
    return text.slice(0, 177).trim() + "...";
  }

  function textToHtml(text) {
    return text
      .trim()
      .split(/\n{2,}/)
      .map(function (block) {
        const lines = block
          .split("\n")
          .map(function (line) {
            return escapeHtml(line);
          })
          .join("<br />");
        return "<p>" + lines + "</p>";
      })
      .join("\n");
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function listPublished() {
    const sb = client();
    if (!sb) return { data: [], error: new Error("Supabase is not loaded") };
    return sb
      .from("writings")
      .select("id, slug, title, kicker, excerpt, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
  }

  async function getBySlug(slug) {
    const sb = client();
    if (!sb) return { data: null, error: new Error("Supabase is not loaded") };
    return sb
      .from("writings")
      .select("id, slug, title, kicker, excerpt, body, created_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
  }

  window.Writings = {
    client: client,
    slugify: slugify,
    excerptFrom: excerptFrom,
    textToHtml: textToHtml,
    escapeHtml: escapeHtml,
    listPublished: listPublished,
    getBySlug: getBySlug,
  };
})();
