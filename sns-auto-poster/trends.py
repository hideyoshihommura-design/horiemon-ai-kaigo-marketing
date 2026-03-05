"""
トレンド・ニュース収集モジュール
Google Trends と RSSニュースフィードから最新情報を取得する
"""

import feedparser
import requests
from datetime import datetime
from typing import Optional


# 日本語ニュースRSSフィード一覧
RSS_FEEDS = {
    "NHKニュース": "https://www.nhk.or.jp/rss/news/cat0.xml",
    "朝日新聞": "https://rss.asahi.com/rss/asahi/newsheadlines.rdf",
    "ITmedia": "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
    "TechCrunch日本版": "https://jp.techcrunch.com/feed/",
    "日経テクノロジー": "https://xtech.nikkei.com/rss/index.rdf",
}

# AIビジネス向けRSSフィード
AI_BUSINESS_FEEDS = {
    "AIsmiley": "https://aismiley.co.jp/feed/",
    "AI-SCHOLAR": "https://ai-scholar.tech/feed",
    "AINOW": "https://ainow.ai/feed/",
}


def fetch_rss_news(max_items: int = 10) -> list[dict]:
    """
    複数のRSSフィードからニュース記事を取得する

    Args:
        max_items: 各フィードから取得する最大記事数

    Returns:
        記事情報のリスト（title, summary, source, published）
    """
    articles = []
    all_feeds = {**RSS_FEEDS, **AI_BUSINESS_FEEDS}

    for source_name, feed_url in all_feeds.items():
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:max_items]:
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                published = entry.get("published", datetime.now().isoformat())

                # HTMLタグを除去（簡易）
                import re
                summary = re.sub(r"<[^>]+>", "", summary)
                summary = summary[:200] if len(summary) > 200 else summary

                if title:
                    articles.append({
                        "title": title,
                        "summary": summary,
                        "source": source_name,
                        "published": published,
                    })
        except Exception:
            # フィード取得失敗は無視して続行
            continue

    return articles


def fetch_google_trends(geo: str = "JP", count: int = 10) -> list[str]:
    """
    Google Trendsから日本のトレンドキーワードを取得する

    Args:
        geo: 国コード（JP = 日本）
        count: 取得するトレンド数

    Returns:
        トレンドキーワードのリスト
    """
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl="ja-JP", tz=540)
        trending_searches = pytrends.trending_searches(pn="japan")
        keywords = trending_searches[0].tolist()[:count]
        return keywords
    except Exception:
        # pytrends が使えない場合は空リストを返す
        return []


def fetch_trending_topics(theme: Optional[str] = None) -> dict:
    """
    トレンド情報をまとめて取得する

    Args:
        theme: 絞り込みテーマ（例：「AI」「介護」「マーケティング」）

    Returns:
        {
            "google_trends": [...],
            "news_articles": [...],
            "fetched_at": "ISO datetime",
        }
    """
    news = fetch_rss_news(max_items=5)

    # テーマが指定されている場合はニュースをフィルタリング
    if theme:
        keywords = [kw.strip() for kw in theme.split("、") if kw.strip()]
        if keywords:
            filtered = [
                article for article in news
                if any(kw in article["title"] or kw in article["summary"] for kw in keywords)
            ]
            # フィルタ結果が少なければ元のニュースも追加
            if len(filtered) < 3:
                filtered += [a for a in news if a not in filtered]
            news = filtered[:10]

    google_trends = fetch_google_trends()

    return {
        "google_trends": google_trends,
        "news_articles": news[:8],
        "fetched_at": datetime.now().isoformat(),
    }
