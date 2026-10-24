---
title: 週次レビュー
permalink: /reviews/
---

# 週次レビュー

{% assign reviews = site.pages | where: 'type', 'weekly_review' | sort: 'week' | reverse %}
{% if reviews.size > 0 %}
<ul class="review-list">
{% for review in reviews %}
{% unless review.url == '/reviews/latest/' %}
<li><a href="{{ review.url | relative_url }}">{{ review.title }}</a></li>
{% endunless %}
{% endfor %}
</ul>
{% else %}
<p>過去の週次レビューはまだありません。</p>
{% endif %}
