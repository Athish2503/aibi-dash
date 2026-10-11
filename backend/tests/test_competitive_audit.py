import pytest
from unittest.mock import AsyncMock, patch
from pydantic import ValidationError
from fastapi.testclient import TestClient

from backend.app.schemas.competitor_audit import (
    CompetitorAuditRequest,
    CompetitorAuditResponse,
    CompetitorMatrixRow,
    RevenueLeak,
    GrowthBet,
    SprintPhase,
)
from backend.app.services.scraper_service import SiteScraperService
from backend.app.executive.competitive_audit_engine import CompetitiveAuditEngine
from backend.app.main import app

client = TestClient(app)


def test_schema_valid_request():
    req = CompetitorAuditRequest(
        company_name="Acme Analytics",
        company_url="https://acmeanalytics.io",
        value_proposition="Real-time predictive telemetry for high-scale enterprise fleets",
        competitor_urls=["https://competitor-alpha.com", "https://competitor-beta.com"],
        primary_objective="Accelerate Qualified Enterprise Pipeline",
    )
    assert req.company_name == "Acme Analytics"
    assert len(req.competitor_urls) == 2


def test_schema_invalid_competitor_count():
    # Less than 1 competitor URL should fail
    with pytest.raises(ValidationError):
        CompetitorAuditRequest(
            company_name="Acme Analytics",
            company_url="https://acme.io",
            value_proposition="Fast data analytics",
            competitor_urls=[],
        )

    # More than 4 competitor URLs should fail
    with pytest.raises(ValidationError):
        CompetitorAuditRequest(
            company_name="Acme Analytics",
            company_url="https://acme.io",
            value_proposition="Fast data analytics",
            competitor_urls=[
                "https://c1.com",
                "https://c2.com",
                "https://c3.com",
                "https://c4.com",
                "https://c5.com",
            ],
        )


@pytest.mark.anyio
async def test_scraper_service_extraction():
    fake_html = """
    <!DOCTYPE html>
    <html>
      <head>
        <title>Alpha Corp - Enterprise Telemetry</title>
        <meta name="description" content="World-leading enterprise telemetry platform">
      </head>
      <body>
        <h1>Stop guessing, start observing</h1>
        <h2>Scalable infrastructure for modern teams</h2>
        <a href="/pricing">View Transparent Pricing</a>
        <a href="/case-studies">Read Customer Stories</a>
        <p>SOC 2 certified and ISO 27001 compliant.</p>
        <a href="/signup">Start Free Trial</a>
      </body>
    </html>
    """

    class DummyResponse:
        status_code = 200
        text = fake_html

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = DummyResponse()
        intel = await SiteScraperService.extract_site_intel("https://alphacorp.com")

        assert intel["url"] == "https://alphacorp.com"
        assert "Alpha Corp" in intel["title"]
        assert "telemetry platform" in intel["meta_description"]
        assert "Stop guessing, start observing" in intel["h1_headlines"]
        assert intel["signals"]["has_pricing_page"] is True
        assert intel["signals"]["has_case_studies"] is True
        assert intel["signals"]["has_security_badges"] is True
        assert intel["signals"]["has_self_serve_cta"] is True


@pytest.mark.anyio
async def test_scraper_service_handles_error():
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = Exception("Connection refused")
        intel = await SiteScraperService.extract_site_intel("https://offline-domain.com")

        assert intel["url"] == "https://offline-domain.com"
        assert "Connection refused" in intel["error"]
        assert intel["signals"]["has_pricing_page"] is False


@pytest.mark.anyio
async def test_competitive_audit_engine_grounded_execution():
    engine = CompetitiveAuditEngine()

    req = CompetitorAuditRequest(
        company_name="CloudPulse",
        company_url="https://cloudpulse.io",
        value_proposition="Autonomous cluster optimization for Kubernetes fleets",
        competitor_urls=["https://competitor-one.com", "https://competitor-two.com"],
        primary_objective="Accelerate Qualified Enterprise Pipeline",
    )

    mock_intel = {
        "url": "https://competitor-one.com",
        "title": "Competitor One - Enterprise Cloud",
        "meta_description": "Cloud management",
        "h1_headlines": ["Modern K8s"],
        "subheadings": ["Overview"],
        "signals": {
            "has_pricing_page": True,
            "has_case_studies": True,
            "has_interactive_demo": True,
            "has_security_badges": True,
            "has_self_serve_cta": True,
        },
    }

    with patch.object(SiteScraperService, "extract_site_intel", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_intel
        res = await engine.run_audit(req)

        assert isinstance(res, CompetitorAuditResponse)
        assert len(res.executive_summary) > 50
        assert len(res.gap_matrix) >= 4
        assert len(res.revenue_leaks) >= 3
        assert len(res.growth_bets) >= 3
        assert len(res.sprint_plan) == 3

        # Check deliverables structure
        p1_bets = [b for b in res.growth_bets if "P1" in b.priority]
        assert len(p1_bets) > 0
        assert p1_bets[0].expected_business_lift

        high_leaks = [l for l in res.revenue_leaks if l.estimated_revenue_risk == "High"]
        assert len(high_leaks) > 0


def test_growth_audit_api_endpoint():
    payload = {
        "company_name": "TestCorp",
        "company_url": "https://testcorp.com",
        "value_proposition": "Fast vector embeddings for microservices",
        "competitor_urls": ["https://rival1.com", "https://rival2.com"],
        "primary_objective": "Accelerate Qualified Enterprise Pipeline",
    }

    mock_intel = {
        "url": "https://rival1.com",
        "title": "Rival One",
        "meta_description": "Leading vector database",
        "h1_headlines": ["Vectors at scale"],
        "subheadings": [],
        "signals": {
            "has_pricing_page": True,
            "has_case_studies": True,
            "has_interactive_demo": True,
            "has_security_badges": True,
            "has_self_serve_cta": True,
        },
    }

    with patch.object(SiteScraperService, "extract_site_intel", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_intel
        response = client.post("/api/v1/growth/audit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "executive_summary" in data
        assert "gap_matrix" in data
        assert "revenue_leaks" in data
        assert "growth_bets" in data
        assert "sprint_plan" in data
        assert len(data["gap_matrix"]) > 0


def test_growth_preview_api_endpoint():
    mock_intel = {
        "url": "https://sample.com",
        "title": "Sample Title",
        "meta_description": "Sample Meta",
        "h1_headlines": ["Hero headline"],
        "subheadings": [],
        "signals": {
            "has_pricing_page": True,
            "has_case_studies": False,
            "has_interactive_demo": False,
            "has_security_badges": False,
            "has_self_serve_cta": True,
        },
    }

    with patch.object(SiteScraperService, "extract_site_intel", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_intel
        response = client.post("/api/v1/growth/scrape-preview", json={"url": "https://sample.com"})
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://sample.com"
        assert data["signals"]["has_pricing_page"] is True
