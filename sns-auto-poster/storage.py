"""
投稿データの保存・読み込みモジュール
生成した投稿文をJSONファイルで管理する
"""

import json
import os
from datetime import date, datetime
from pathlib import Path


def get_output_dir() -> Path:
    """出力ディレクトリのパスを返す"""
    output_dir = Path(os.getenv("OUTPUT_DIR", "./output"))
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def save_posts(posts: dict, trending_data: dict, theme: str, business_name: str) -> Path:
    """
    生成した投稿文をJSONファイルに保存する

    Returns:
        保存したファイルのパス
    """
    today = date.today().isoformat()
    output_dir = get_output_dir()
    file_path = output_dir / f"{today}.json"

    # 既存データがあれば読み込む
    existing_data = {}
    if file_path.exists():
        with open(file_path, encoding="utf-8") as f:
            existing_data = json.load(f)

    record = {
        "date": today,
        "generated_at": datetime.now().isoformat(),
        "theme": theme,
        "business_name": business_name,
        "posts": posts,
        "trending_data": {
            "google_trends": trending_data.get("google_trends", []),
            "news_articles": trending_data.get("news_articles", []),
            "fetched_at": trending_data.get("fetched_at", ""),
        },
    }

    existing_data[datetime.now().strftime("%H%M%S")] = record

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)

    return file_path


def load_history(days: int = 30) -> list[dict]:
    """
    過去の投稿履歴を読み込む

    Args:
        days: 取得する日数

    Returns:
        日付降順の投稿記録リスト
    """
    output_dir = get_output_dir()
    records = []

    json_files = sorted(output_dir.glob("*.json"), reverse=True)[:days]
    for file_path in json_files:
        try:
            with open(file_path, encoding="utf-8") as f:
                day_data = json.load(f)
            # 各ファイルの最新レコードを取得
            if day_data:
                latest_key = sorted(day_data.keys())[-1]
                records.append(day_data[latest_key])
        except Exception:
            continue

    return records


def load_today() -> dict | None:
    """今日の最新投稿を読み込む"""
    today = date.today().isoformat()
    file_path = get_output_dir() / f"{today}.json"

    if not file_path.exists():
        return None

    try:
        with open(file_path, encoding="utf-8") as f:
            day_data = json.load(f)
        if day_data:
            latest_key = sorted(day_data.keys())[-1]
            return day_data[latest_key]
    except Exception:
        return None

    return None
