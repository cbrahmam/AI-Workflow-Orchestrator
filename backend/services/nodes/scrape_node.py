import time
import httpx
from bs4 import BeautifulSoup
from services.nodes.base import BaseNode, NodeOutput


class ScrapeNode(BaseNode):
    node_type = "scrape"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        url = self.resolve_variables(self.config.get("url", ""), context)
        extraction_type = self.config.get("extractionType", "fullText")

        if not url:
            return NodeOutput(error="URL is required")

        start = time.time()

        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; FlowPilot/1.0)"
            })

        soup = BeautifulSoup(response.text, "html.parser")
        duration = time.time() - start

        if extraction_type == "fullText":
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            text = soup.get_text(separator="\n", strip=True)
            return NodeOutput(data=text, output_type="text", metadata={"duration_s": round(duration, 2)})

        elif extraction_type == "cssSelector":
            selector = self.config.get("selector", "")
            elements = soup.select(selector)
            texts = [el.get_text(strip=True) for el in elements]
            return NodeOutput(data=texts, output_type="array", metadata={"count": len(texts), "duration_s": round(duration, 2)})

        elif extraction_type == "metadata":
            meta = {
                "title": soup.title.string if soup.title else "",
                "description": "",
                "og_title": "",
                "og_description": "",
                "og_image": "",
            }
            desc_tag = soup.find("meta", attrs={"name": "description"})
            if desc_tag:
                meta["description"] = desc_tag.get("content", "")
            for prop in ("og:title", "og:description", "og:image"):
                tag = soup.find("meta", attrs={"property": prop})
                if tag:
                    key = prop.replace(":", "_")
                    meta[key] = tag.get("content", "")
            return NodeOutput(data=meta, output_type="json", metadata={"duration_s": round(duration, 2)})

        elif extraction_type == "links":
            links = []
            for a in soup.find_all("a", href=True):
                links.append({"text": a.get_text(strip=True), "href": a["href"]})
            return NodeOutput(data=links, output_type="json", metadata={"count": len(links), "duration_s": round(duration, 2)})

        elif extraction_type == "tables":
            tables = []
            for table in soup.find_all("table"):
                rows = []
                headers = [th.get_text(strip=True) for th in table.find_all("th")]
                for tr in table.find_all("tr"):
                    cells = [td.get_text(strip=True) for td in tr.find_all(["td"])]
                    if cells:
                        if headers and len(cells) == len(headers):
                            rows.append(dict(zip(headers, cells)))
                        else:
                            rows.append(cells)
                tables.append(rows)
            return NodeOutput(data=tables, output_type="json", metadata={"table_count": len(tables), "duration_s": round(duration, 2)})

        return NodeOutput(error=f"Unknown extraction type: {extraction_type}")
