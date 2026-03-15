"""
HubSpot Social API を使ってX・Instagram・Facebook・TikTokに下書き投稿を作成するモジュール
"""

import os
from pathlib import Path
import requests
from scraper import Article


HUBSPOT_API_BASE = "https://api.hubapi.com"


def _headers() -> dict:
    token = os.getenv("HUBSPOT_ACCESS_TOKEN")
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def get_social_channels() -> list[dict]:
    """接続済みのSNSチャンネル一覧を取得する"""
    res = requests.get(
        f"{HUBSPOT_API_BASE}/broadcast/v1/channels/setting/publish/current",
        headers=_headers(),
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def create_draft_broadcast(
    channel_guid: str,
    message: str,
    article: Article,
) -> dict:
    """HubSpotにSNS下書き投稿を作成する（承認後に手動公開）"""
    payload = {
        "channelGuid": channel_guid,
        "content": {
            "body": message,
            "photoUrl": article.image_url or "",
            "linkUrl": article.url,
        },
        "status": "DRAFT",
    }

    res = requests.post(
        f"{HUBSPOT_API_BASE}/broadcast/v1/broadcasts",
        headers=_headers(),
        json=payload,
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def upload_video_to_hubspot(video_path: str) -> str:
    """動画をHubSpotファイルマネージャーにアップロードしてURLを返す"""
    token = os.getenv("HUBSPOT_ACCESS_TOKEN")
    with open(video_path, "rb") as f:
        res = requests.post(
            f"{HUBSPOT_API_BASE}/filemanager/api/v3/files/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": (Path(video_path).name, f, "video/mp4")},
            data={"folderPath": "/sns-auto-poster/tiktok", "options": '{"access": "PUBLIC_INDEXABLE"}'},
            timeout=120,
        )
    res.raise_for_status()
    return res.json()["objects"][0]["url"]


def create_tiktok_draft(article: Article, message: str, video_path: str) -> dict:
    """TikTok用の下書きをHubSpot経由で作成する"""
    channel_guid = os.getenv("HUBSPOT_CHANNEL_TIKTOK")
    if not channel_guid:
        return {"status": "error", "error": "HUBSPOT_CHANNEL_TIKTOK が未設定"}

    video_url = upload_video_to_hubspot(video_path)
    Path(video_path).unlink(missing_ok=True)

    payload = {
        "channelGuid": channel_guid,
        "content": {
            "body": message,
            "photoUrl": video_url,
            "linkUrl": article.url,
        },
        "status": "DRAFT",
    }
    res = requests.post(
        f"{HUBSPOT_API_BASE}/broadcast/v1/broadcasts",
        headers=_headers(),
        json=payload,
        timeout=10,
    )
    res.raise_for_status()
    return {"status": "ok", "broadcast_id": res.json().get("id")}


def create_all_drafts(article: Article, generated_posts: dict, tiktok_video_path: str = None) -> dict:
    """X・Instagram・Facebook・TikTok の下書きをまとめて作成する"""
    platform_map = {
        "x": os.getenv("HUBSPOT_CHANNEL_X"),
        "instagram": os.getenv("HUBSPOT_CHANNEL_INSTAGRAM"),
        "facebook": os.getenv("HUBSPOT_CHANNEL_FACEBOOK"),
    }

    results = {}

    # X・Instagram・Facebook（テキスト投稿）
    for platform, channel_guid in platform_map.items():
        if not channel_guid:
            print(f"[hubspot] {platform} のチャンネルGUIDが未設定のためスキップ")
            continue
        if platform not in generated_posts:
            continue
        message = generated_posts[platform]["content"]
        try:
            result = create_draft_broadcast(channel_guid, message, article)
            results[platform] = {"status": "ok", "broadcast_id": result.get("id")}
            print(f"[hubspot] {platform} 下書き作成完了: {result.get('id')}")
        except Exception as e:
            results[platform] = {"status": "error", "error": str(e)}
            print(f"[hubspot] {platform} 下書き作成エラー: {e}")

    # TikTok（動画投稿）
    if tiktok_video_path and "tiktok" in generated_posts:
        try:
            result = create_tiktok_draft(article, generated_posts["tiktok"]["content"], tiktok_video_path)
            results["tiktok"] = result
            print(f"[hubspot] tiktok 下書き作成完了: {result.get('broadcast_id')}")
        except Exception as e:
            results["tiktok"] = {"status": "error", "error": str(e)}
            print(f"[hubspot] tiktok 下書き作成エラー: {e}")

    return results
