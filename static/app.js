
const imageInput = document.getElementById("image");
const previewBox = document.getElementById("previewBox");
const generateBtn = document.getElementById("generate");
const output = document.getElementById("output");
const status = document.getElementById("status");
let lastData = null;

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  previewBox.innerHTML = `<img class="previewImg" src="${url}" alt="Product preview">`;
});

generateBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    status.textContent = "Please upload a product image first.";
    return;
  }

  const fd = new FormData();
  fd.append("image", file);
  fd.append("product_name", document.getElementById("product").value);
  fd.append("platform", document.getElementById("platform").value);
  fd.append("tone", document.getElementById("tone").value);
  fd.append("audience", document.getElementById("audience").value);
  fd.append("language", document.getElementById("language").value);
  fd.append("length", document.getElementById("length").value);

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  status.textContent = "AI is analyzing the product image...";
  output.innerHTML = `<div class="empty"><div>⏳</div><h3>Creating your campaign...</h3><p>Please wait.</p></div>`;

  try {
    const res = await fetch("/api/generate", {method:"POST", body:fd});
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    lastData = data;
    render(data);
    status.textContent = data.mode === "demo"
      ? "Demo mode: add OPENAI_API_KEY in .env for real image analysis."
      : "Campaign generated successfully.";
  } catch (e) {
    output.innerHTML = `<div class="empty"><div>⚠️</div><h3>Generation failed</h3><p>${escapeHtml(e.message)}</p></div>`;
    status.textContent = "Something went wrong.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "✨ Generate Advertisement";
  }
});

function render(d) {
  const hashtags = (d.hashtags || []).map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("");
  const keywords = (d.keywords || []).map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("");
  output.innerHTML = `
    <div class="cards">
      ${card("Product", d.product_name)}
      ${card("Slogan", d.slogan)}
      ${card("Headline", d.headline)}
      ${card("Product Description", d.description)}
      ${card("Advertisement Copy", d.ad_copy)}
      ${card("Social Media Caption", d.social_caption)}
      <div class="card"><h3>Hashtags</h3><div class="chips">${hashtags}</div></div>
      ${card("Call to Action", d.call_to_action)}
      ${card("SEO Title", d.seo_title)}
      <div class="card"><h3>SEO Keywords</h3><div class="chips">${keywords}</div></div>
    </div>`;
}

function card(title, text) {
  return `<div class="card"><h3>${title}</h3><p>${escapeHtml(text || "")}</p></div>`;
}

document.getElementById("copyAll").addEventListener("click", async () => {
  if (!lastData) return;
  const text = `PRODUCT: ${lastData.product_name}
SLOGAN: ${lastData.slogan}
HEADLINE: ${lastData.headline}
DESCRIPTION: ${lastData.description}
AD COPY: ${lastData.ad_copy}
SOCIAL CAPTION: ${lastData.social_caption}
HASHTAGS: ${(lastData.hashtags || []).join(" ")}
CTA: ${lastData.call_to_action}
SEO TITLE: ${lastData.seo_title}
KEYWORDS: ${(lastData.keywords || []).join(", ")}`;
  await navigator.clipboard.writeText(text);
  document.getElementById("copyAll").textContent = "Copied!";
  setTimeout(() => document.getElementById("copyAll").textContent = "Copy All", 1400);
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
