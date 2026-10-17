// Nana Appiah — Portfolio interactions

(function () {
  "use strict";

  // ---- Reveal on scroll ----
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // ---- Active nav link ----
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function setActive() {
    var pos = window.scrollY + 140;
    var current = sections.length ? sections[0].id : null;
    sections.forEach(function (s) {
      if (s.offsetTop <= pos) current = s.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  // ---- Mobile menu ----
  var toggle = document.getElementById("menuToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Copy email ----
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = "ny.nappiah@gmail.com";
      function done() {
        var original = copyBtn.textContent;
        copyBtn.textContent = "Copied ✓";
        setTimeout(function () { copyBtn.textContent = original; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () { fallbackCopy(); });
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        var ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* noop */ }
        document.body.removeChild(ta);
      }
    });
  }

  // ---- Footer year ----
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---- Medium articles: refresh from RSS (graceful fallback to hardcoded cards) ----
  (function () {
    var grid = document.getElementById("articlesGrid");
    if (!grid || !("fetch" in window)) return;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);
    fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=" +
        encodeURIComponent("https://medium.com/feed/@nkappiah92"),
      { signal: controller.signal }
    )
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then(function (data) {
        if (!data || data.status !== "ok" || !data.items || !data.items.length) return;
        renderArticles(data.items.slice(0, 3));
      })
      .catch(function () {
        /* keep the hardcoded fallback cards */
      });

    function renderArticles(items) {
      grid.innerHTML = "";
      items.forEach(function (item) {
        var card = document.createElement("article");
        card.className = "article-card reveal visible";
        var thumb =
          item.thumbnail && item.thumbnail.indexOf("/_/stat") === -1
            ? item.thumbnail
            : null;
        if (thumb) {
          var a = document.createElement("a");
          a.className = "article-img";
          a.href = item.link;
          a.target = "_blank";
          a.rel = "noopener";
          a.setAttribute("aria-hidden", "true");
          a.tabIndex = -1;
          var img = document.createElement("img");
          img.src = thumb;
          img.alt = "";
          img.loading = "lazy";
          a.appendChild(img);
          card.appendChild(a);
        } else {
          var ph = document.createElement("div");
          ph.className = "article-img article-img-fallback";
          ph.setAttribute("aria-hidden", "true");
          card.appendChild(ph);
        }
        var body = document.createElement("div");
        body.className = "article-body";
        var date = document.createElement("span");
        date.className = "article-date";
        date.textContent = formatDate(item.pubDate);
        body.appendChild(date);
        var h3 = document.createElement("h3");
        var ta = document.createElement("a");
        ta.href = item.link;
        ta.target = "_blank";
        ta.rel = "noopener";
        ta.textContent = item.title;
        h3.appendChild(ta);
        body.appendChild(h3);
        var p = document.createElement("p");
        p.textContent = excerpt(item.description);
        body.appendChild(p);
        var more = document.createElement("a");
        more.className = "article-link";
        more.href = item.link;
        more.target = "_blank";
        more.rel = "noopener";
        more.textContent = "Read on Medium \u2197";
        body.appendChild(more);
        card.appendChild(body);
        grid.appendChild(card);
      });
    }

    function formatDate(s) {
      var d = new Date(s);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    function excerpt(htmlStr) {
      var tmp = document.createElement("div");
      tmp.innerHTML = htmlStr || "";
      var t = (tmp.textContent || "").replace(/\s+/g, " ").trim();
      return t.length > 150 ? t.slice(0, 150).trimEnd() + "\u2026" : t;
    }
  })();
})();
