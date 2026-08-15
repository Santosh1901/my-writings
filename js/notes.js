(function () {
  var OWNER_ID = "b72f5225-7dd0-4b46-878f-e3115ee010db";
  var PIN_SLUG = "_pin";

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
    var text = htmlToText(body).replace(/\s+/g, " ").trim();
    if (text.length <= 180) return text;
    return text.slice(0, 177).trim() + "...";
  }

  function textToHtml(text) {
    return text
      .trim()
      .split(/\n{2,}/)
      .map(function (block) {
        var lines = block
          .split("\n")
          .map(function (line) {
            return escapeHtml(line);
          })
          .join("<br />");
        return "<p>" + lines + "</p>";
      })
      .join("\n");
  }

  function htmlToText(html) {
    return String(html || "")
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isOwner(user) {
    return Boolean(user && user.id === OWNER_ID);
  }

  async function currentUser() {
    var sb = client();
    if (!sb) return null;
    var result = await sb.auth.getUser();
    return result.data && result.data.user ? result.data.user : null;
  }

  async function listPublished() {
    var sb = client();
    if (!sb) return { data: [], error: new Error("Supabase is not loaded") };
    var notes = await sb
      .from("writings")
      .select("id, slug, title, kicker, excerpt, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (notes.error || !notes.data) return notes;
    var pin = await getPinnedSlug();
    var data = notes.data.filter(function (note) {
      return note.slug !== PIN_SLUG && note.kicker !== "Pin";
    });
    if (pin) {
      data.sort(function (a, b) {
        if (a.slug === pin) return -1;
        if (b.slug === pin) return 1;
        return 0;
      });
    }
    return { data: data, error: null, pinnedSlug: pin };
  }

  async function getBySlug(slug) {
    var sb = client();
    if (!sb) return { data: null, error: new Error("Supabase is not loaded") };
    return sb
      .from("writings")
      .select("id, slug, title, kicker, excerpt, body, created_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
  }

  async function getPinnedSlug() {
    var sb = client();
    if (!sb) return "";
    var result = await sb
      .from("writings")
      .select("title")
      .eq("slug", PIN_SLUG)
      .maybeSingle();
    return result.data && result.data.title ? result.data.title : "";
  }

  async function setPinnedSlug(slug) {
    var sb = client();
    var user = await currentUser();
    if (!sb || !isOwner(user)) return { error: new Error("Not allowed") };
    return sb.from("writings").upsert(
      {
        slug: PIN_SLUG,
        title: slug,
        kicker: "Pin",
        excerpt: "",
        body: slug,
        published: true,
        author_id: user.id,
      },
      { onConflict: "slug" }
    );
  }

  async function removeNote(id) {
    var sb = client();
    var user = await currentUser();
    if (!sb || !isOwner(user)) return { error: new Error("Not allowed") };
    return sb.from("writings").delete().eq("id", id);
  }

  window.Writings = {
    OWNER_ID: OWNER_ID,
    PIN_SLUG: PIN_SLUG,
    client: client,
    slugify: slugify,
    excerptFrom: excerptFrom,
    textToHtml: textToHtml,
    htmlToText: htmlToText,
    escapeHtml: escapeHtml,
    isOwner: isOwner,
    currentUser: currentUser,
    listPublished: listPublished,
    getBySlug: getBySlug,
    getPinnedSlug: getPinnedSlug,
    setPinnedSlug: setPinnedSlug,
    removeNote: removeNote,
  };
})();
