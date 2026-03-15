"""
TikTok用スライド動画生成モジュール
投稿はHubSpot Social API経由で行う
"""

import re
import textwrap
import requests
import tempfile
from PIL import Image, ImageDraw, ImageFont
import moviepy.editor as mp
import numpy as np


# スライド設定
SLIDE_SIZE = (1080, 1920)  # TikTok縦型
SLIDE_DURATION = 3         # 各スライド表示秒数
BG_COLOR = (30, 144, 200)  # ACGブランドカラー（青系）
TEXT_COLOR = (255, 255, 255)
FONT_SIZE = 72


def parse_slides(tiktok_content: str) -> list[str]:
    """generator.pyが生成したスライドテキストをパースする"""
    slides = []
    for line in tiktok_content.split("\n"):
        match = re.match(r"SLIDE\d+:\s*(.+)", line.strip())
        if match:
            slides.append(match.group(1).strip())
    return slides if slides else [tiktok_content[:30]]


def _create_slide_image(text: str, bg_image_url: str = None) -> np.ndarray:
    """1枚のスライド画像を生成する"""
    img = Image.new("RGB", SLIDE_SIZE, BG_COLOR)

    # 背景画像がある場合は使用（暗くして文字を見やすく）
    if bg_image_url:
        try:
            res = requests.get(bg_image_url, timeout=5)
            bg = Image.open(res.raw).convert("RGB")
            bg = bg.resize(SLIDE_SIZE)
            overlay = Image.new("RGBA", SLIDE_SIZE, (0, 0, 0, 140))
            img = Image.alpha_composite(bg.convert("RGBA"), overlay).convert("RGB")
        except Exception:
            pass

    draw = ImageDraw.Draw(img)

    # フォント（システムフォントにフォールバック）
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc", FONT_SIZE)
    except Exception:
        font = ImageFont.load_default()

    # テキストを折り返して中央に配置
    lines = textwrap.wrap(text, width=10)
    total_height = len(lines) * (FONT_SIZE + 16)
    y = (SLIDE_SIZE[1] - total_height) // 2

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        x = (SLIDE_SIZE[0] - w) // 2
        draw.text((x, y), line, font=font, fill=TEXT_COLOR)
        y += FONT_SIZE + 16

    return np.array(img)


def create_slide_video(slides: list[str], image_url: str = None) -> str:
    """スライド動画を生成してファイルパスを返す"""
    clips = []
    for text in slides:
        frame = _create_slide_image(text, image_url)
        clip = mp.ImageClip(frame, duration=SLIDE_DURATION)
        clips.append(clip)

    video = mp.concatenate_videoclips(clips, method="compose")

    output_path = tempfile.mktemp(suffix=".mp4")
    video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio=False,
        logger=None,
    )
    return output_path


def generate_tiktok_video(tiktok_content: str, image_url: str = None) -> str:
    """スライド動画を生成してファイルパスを返す（HubSpot経由で投稿）"""
    slides = parse_slides(tiktok_content)
    return create_slide_video(slides, image_url)
