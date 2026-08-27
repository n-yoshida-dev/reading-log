---
title: 週次レビュー
permalink: /reviews/
---

# 週次レビュー

[最新の週次レビュー]({{ '/reviews/latest/' | relative_url }})

{% assign reviews = site.pages | where: 'type', 'weekly_review' | sort: 'week' | reverse %}
{% if reviews.size > 0 %}
  <ul>
  {% for review in reviews %}
    <li><a href="{{ review.url | relative_url }}">{{ review.title }}</a></li>
  {% endfor %}
  </ul>
{% else %}
過去の週次レビューはまだありません。
{% endif %}
