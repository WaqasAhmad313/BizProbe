const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const { URL } = require("url");
const translate = require("@vitalets/google-translate-api");

puppeteer.use(StealthPlugin());

function normalizeRootUrl(inputUrl) {
  try {
    const url = new URL(
      inputUrl.startsWith("http") ? inputUrl : "https://" + inputUrl
    );
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return inputUrl;
  }
}

function isValidEmail(email) {
  const invalidPatterns = [
    "@sentry",
    "@wixpress",
    "@no-reply",
    "@example",
    "@test",
    "@noreply",
  ];
  return (
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) &&
    !invalidPatterns.some((p) => email.includes(p))
  );
}

async function scrapeBusinessData(websiteUrl) {
  const originalWebsiteUrl = websiteUrl;
  websiteUrl = normalizeRootUrl(websiteUrl);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const type = request.resourceType();
    if (["font", "stylesheet"].includes(type)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  try {
    console.log(`Visiting homepage: ${websiteUrl}`);
    await page.goto(websiteUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const visited = new Set([websiteUrl]);
    const allLinksToVisit = new Set();

    const emails = new Set();
    const socialMediaLinks = new Map();
    const businessDirectories = new Map();
    let logoUrl = null;
    const serviceImageUrls = new Set();

    const socialPlatforms = {
      "facebook.com": "Facebook",
      "twitter.com": "Twitter",
      "x.com": "Twitter (X)",
      "instagram.com": "Instagram",
      "linkedin.com": "LinkedIn",
      "tiktok.com": "TikTok",
      "youtube.com": "YouTube",
      "pinterest.com": "Pinterest",
      "threads.net": "Threads",
      "snapchat.com": "Snapchat",
    };

    const directorySites = {
      "yelp.com": "Yelp",
      "yellowpages.com": "Yellow Pages",
      "bbb.org": "Better Business Bureau",
      "foursquare.com": "Foursquare",
      "manta.com": "Manta",
      "chamberofcommerce.com": "Chamber of Commerce",
      "citysearch.com": "Citysearch",
      "hotfrog.com": "Hotfrog",
      "kompass.com": "Kompass",
      "thomasnet.com": "ThomasNet",
      "trustpilot.com": "Trustpilot",
      "angieslist.com": "Angie’s List",
      "sitejabber.com": "SiteJabber",
      "crunchbase.com": "Crunchbase",
      "glassdoor.com": "Glassdoor",
      "cylex.com": "Cylex",
      "tupalo.com": "Tupalo",
      "showmelocal.com": "ShowMeLocal",
      "businesslistings.net.au": "Business Listings AU",
      "businessfinder.com": "Business Finder",
      "mapsconnect.apple.com": "Apple Maps Connect",
      "superpages.com": "SuperPages",
    };

    const extractDataFromPage = async (url) => {
      const html = await page.content();
      const $ = cheerio.load(html);

      const bodyText = $("body").text();
      const foundEmails = [];

      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        const rawEmail = href
          .replace(/^mailto:/i, "")
          .split("?")[0]
          .trim();
        if (isValidEmail(rawEmail)) {
          foundEmails.push(rawEmail.toLowerCase());
          emails.add(rawEmail.toLowerCase());
        }
      });

      // ✅ Flexible Logo Extraction
      if (!logoUrl) {
        const headerImage = $("header img").first();

        if (headerImage.length === 0) {
          console.log("No <img> found inside <header>.");
        } else {
          const rawSrc = headerImage.attr("src");

          console.log("Found <img> in <header>");
          console.log("   - src:", rawSrc);

          const logoSrc = rawSrc || dataSrc;

          if (!logoSrc) {
            console.log("No usable src or data-src found.");
          } else if (logoSrc.startsWith("data:")) {
            console.log("Skipping inline base64 image.");
          } else {
            try {
              logoUrl = new URL(logoSrc, websiteUrl).href;
              console.log("Resolved logo URL:", logoUrl);
            } catch (err) {
              console.warn("Failed to construct full URL for logo:", logoSrc);
            }
          }
        }
      }

      // ✅ All service-related image collection logic starts here
      const isGalleryPage = /gallery|media/i.test(url);
      const foundImageSet = new Set(); // Temporary collector for this page

      // ✅ METHOD 0 — GALLERY PAGE CHECK
      if (isGalleryPage) {
        console.log(`[Method 0] Scanning gallery/media page: ${url}`);

        const contentArea = $("body")
          .clone()
          .find("header, footer, nav, aside")
          .remove()
          .end();

        contentArea.find("img").each((_, el) => {
          const rawSrc = $(el).attr("src") || $(el).attr("data-src");
          if (
            rawSrc &&
            !rawSrc.startsWith("data:") &&
            /\.(png|webp|jpeg|jpg)$/i.test(rawSrc)
          ) {
            try {
              const fullUrl = new URL(rawSrc, websiteUrl).href;
              foundImageSet.add(fullUrl);
              console.log(`[Method 0] Found image: ${fullUrl}`);
            } catch (err) {
              console.warn("❌ [Method 0] Bad image URL:", rawSrc);
            }
          }
        });

        console.log(`[Method 0] Found ${foundImageSet.size} gallery images`);

        for (const img of foundImageSet) {
          serviceImageUrls.add(img);
        }

        // ✅ EARLY RETURN IF METHOD 0 FOUND IMAGES
        if (foundImageSet.size > 0) {
          console.log("[Method 0] Images found — skipping methods 1 to 4.");
          return;
        }
      }
      // ✅ Continue link discovery
      try {
        const currentPageUrl = page.url();

        $("a").each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;

          let finalLink = href.trim().split("?")[0].split("#")[0];

          if (
            finalLink.startsWith("/") ||
            finalLink.startsWith(websiteUrl) ||
            finalLink.includes(new URL(websiteUrl).hostname)
          ) {
            if (!finalLink.startsWith("http")) {
              finalLink = new URL(finalLink, websiteUrl).href;
            }

            // ✅ Exclude internal links when scraping homepage, except about/contact
            const lower = finalLink.toLowerCase();
            const isHome =
              currentPageUrl === websiteUrl ||
              currentPageUrl === websiteUrl + "/";

            const isAllowedPage =
              /\/(about|contact|about-us|contact-us)(\/)?$/i.test(lower) ||
              lower === websiteUrl ||
              lower === websiteUrl + "/";

            if (!visited.has(finalLink)) {
              if (!isHome || isAllowedPage) {
                allLinksToVisit.add(finalLink);
              }
            }
          }

          for (const key in socialPlatforms) {
            if (href.includes(key)) {
              socialMediaLinks.set(socialPlatforms[key], href);
            }
          }

          for (const key in directorySites) {
            if (href.includes(key)) {
              businessDirectories.set(directorySites[key], href);
            }
          }
        });
      } catch (err) {
        console.warn("Error during link discovery:", err);
      }
    };

    await extractDataFromPage(websiteUrl);
    for (const link of allLinksToVisit) {
      if (visited.has(link)) continue;
      if (/\.(jpg|jpeg|png|webp|gif|svg|pdf|docx?|xlsx?|zip)$/i.test(link))
        continue;
      visited.add(link);
      try {
        console.log(`Visiting: ${link}`);
        await page.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 40000,
        });
        await extractDataFromPage(link);
      } catch (err) {
        console.warn(`Failed to visit: ${link}`);
      }
    }

    await browser.close();

    console.log("Scraping Complete");
    console.log("Emails:", Array.from(emails));
    console.log("Social Media Links:", Array.from(socialMediaLinks.entries()));
    console.log(
      "Business Directories:",
      Array.from(businessDirectories.entries())
    );
    console.log("Logo URL:", logoUrl);
    console.log("Service Images:", Array.from(serviceImageUrls));

    return {
      emails: Array.from(emails),
      socialMediaLinks: Object.fromEntries(socialMediaLinks),
      businessDirectories: Object.fromEntries(businessDirectories),
      website: originalWebsiteUrl,
      logo_url: logoUrl,
      service_images: Array.from(serviceImageUrls),
    };
  } catch (error) {
    console.error(`Error scraping ${websiteUrl}:`, error);
    await browser.close();
    return null;
  }
}

module.exports = { scrapeBusinessData };
