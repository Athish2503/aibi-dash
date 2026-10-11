import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any


class SiteScraperService:
    @staticmethod
    async def extract_site_intel(url: str) -> Dict[str, Any]:
        """Extracts title, meta descriptions, headings, and commercial conversion signals."""
        target_url = url.strip()
        if not target_url.startswith("http://") and not target_url.startswith("https://"):
            target_url = f"https://{target_url}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(target_url, headers=headers)
                if resp.status_code >= 400:
                    return {
                        "url": target_url,
                        "title": "",
                        "meta_description": "",
                        "h1_headlines": [],
                        "subheadings": [],
                        "signals": {
                            "has_pricing_page": False,
                            "has_case_studies": False,
                            "has_interactive_demo": False,
                            "has_security_badges": False,
                            "has_self_serve_cta": False,
                        },
                        "error": f"HTTP status {resp.status_code}",
                    }

                soup = BeautifulSoup(resp.text, "html.parser")
                title = soup.title.string.strip() if soup.title and soup.title.string else ""

                meta_desc = ""
                desc_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
                if desc_tag and desc_tag.get("content"):
                    meta_desc = desc_tag["content"].strip()

                h1s = [h.get_text(strip=True) for h in soup.find_all("h1") if h.get_text(strip=True)][:3]
                h2s = [h.get_text(strip=True) for h in soup.find_all("h2") if h.get_text(strip=True)][:6]

                page_text = soup.get_text().lower()
                signals = {
                    "has_pricing_page": bool("pricing" in page_text or soup.find("a", href=lambda h: h and "pricing" in h.lower())),
                    "has_case_studies": bool(
                        "case study" in page_text or "case studies" in page_text or "customer" in page_text or "testimonial" in page_text
                        or soup.find("a", href=lambda h: h and ("case-stud" in h.lower() or "customer" in h.lower() or "testimonial" in h.lower()))
                    ),
                    "has_interactive_demo": bool("interactive demo" in page_text or "product tour" in page_text or "sandbox" in page_text),
                    "has_security_badges": bool("soc 2" in page_text or "gdpr" in page_text or "iso 27001" in page_text or "hipaa" in page_text),
                    "has_self_serve_cta": bool("start free" in page_text or "free trial" in page_text or "sign up" in page_text),
                }

                return {
                    "url": target_url,
                    "title": title,
                    "meta_description": meta_desc,
                    "h1_headlines": h1s,
                    "subheadings": h2s,
                    "signals": signals
                }
        except Exception as exc:
            return {
                "url": target_url,
                "title": "",
                "meta_description": "",
                "h1_headlines": [],
                "subheadings": [],
                "signals": {
                    "has_pricing_page": False,
                    "has_case_studies": False,
                    "has_interactive_demo": False,
                    "has_security_badges": False,
                    "has_self_serve_cta": False,
                },
                "error": str(exc),
            }
