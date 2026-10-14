"""Unit tests for URL validation, slug generation, and link metadata parsing."""
import pytest
from app.utils.helpers import generate_slug, normalize_url, parse_link_metadata, validate_url


class TestUrlValidation:
    """Unit tests for validate_url function."""

    @pytest.mark.parametrize("valid_url", [
        "https://www.google.com",
        "http://github.com/pallets/flask",
        "https://sub.domain.co.uk/path/to/page?param=1&filter=true#heading",
        "http://localhost:5174",
        "http://127.0.0.1:5000/api/links",
        "https://react.dev",
    ])
    def test_valid_urls_pass(self, valid_url):
        assert validate_url(valid_url) is True

    @pytest.mark.parametrize("invalid_url", [
        "",
        "   ",
        None,
        "not-a-valid-url",
        "javascript:alert(1)",
        "javascript:void(0)",
        "data:text/html;base64,PHNjcmlwdD4=",
        "file:///C:/Users/passwords.txt",
        "vbscript:msgbox(1)",
        "http://",
        "https://",
        "http:///bad-url",
    ])
    def test_invalid_and_malicious_urls_rejected(self, invalid_url):
        assert validate_url(invalid_url) is False


class TestSlugGeneration:
    """Unit tests for generate_slug function."""

    def test_standard_title_slug(self):
        title = "Flask 3.x REST API Architecture"
        assert generate_slug(title) == "flask-3x-rest-api-architecture"

    def test_special_characters_and_punctuation(self):
        title = "Design Tokens 🎨 & UI Guidelines (v2.0)!!!"
        assert generate_slug(title) == "design-tokens-ui-guidelines-v20"

    def test_whitespace_and_underscores_collapse(self):
        title = "   multiple    spaces___and---dashes   "
        assert generate_slug(title) == "multiple-spaces-and-dashes"

    def test_empty_and_none_input(self):
        assert generate_slug("") == ""
        assert generate_slug(None) == ""


class TestLinkMetadataParsing:
    """Unit tests for parse_link_metadata function."""

    def test_url_metadata_extraction_without_html(self):
        url = "https://github.com/pallets/flask"
        meta = parse_link_metadata(url)
        assert meta["domain"] == "github.com"
        assert meta["favicon_url"] == "https://github.com/favicon.ico"
        assert meta["title"] is None
        assert meta["description"] is None

    def test_html_title_and_description_extraction(self):
        url = "https://example.com/blog/article-1"
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>10 Best Practices for Flask APIs</title>
            <meta name="description" content="A comprehensive guide to building scalable Flask APIs.">
        </head>
        <body><h1>Welcome</h1></body>
        </html>
        """
        meta = parse_link_metadata(url, html_snippet=html)
        assert meta["domain"] == "example.com"
        assert meta["favicon_url"] == "https://example.com/favicon.ico"
        assert meta["title"] == "10 Best Practices for Flask APIs"
        assert meta["description"] == "A comprehensive guide to building scalable Flask APIs."

    def test_html_missing_meta_tags(self):
        url = "https://example.com/empty"
        html = "<html><head></head><body>No meta here</body></html>"
        meta = parse_link_metadata(url, html_snippet=html)
        assert meta["domain"] == "example.com"
        assert meta["title"] is None
        assert meta["description"] is None
