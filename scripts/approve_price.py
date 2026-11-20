#!/usr/bin/env python3
"""บันทึกว่าสปูนอนุมัติรอบประกาศปัจจุบันของบางจาก (เรียกจาก workflow approve-price.yml เท่านั้น)"""
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import price_gate  # noqa: E402
import update_prices  # noqa: E402

src = update_prices.fetch()
key = price_gate.round_key(src)
try:
    with open(update_prices.APPROVED, encoding='utf-8') as f:
        data = json.load(f)
except (OSError, ValueError):
    data = {}
appr = data.setdefault('approved', {})
appr[key] = datetime.now(price_gate.BKK).isoformat(timespec='minutes')
data['approved'] = dict(list(appr.items())[-30:])   # เก็บ 30 รอบล่าสุดพอ
with open(update_prices.APPROVED, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write('\n')
print('✅ อนุมัติรอบ %s (%s)' % (key, src.get('OilRemark2')))
