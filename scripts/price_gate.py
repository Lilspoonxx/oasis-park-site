#!/usr/bin/env python3
"""ด่านตรวจรอบปรับราคา: รอบปกติ → เว็บอัปเองได้ · รอบแปลก → พักไว้รอสปูนยืนยันราคาหน้าตู้

(ไฟล์นี้มีสำเนาเหมือนกันทุกตัวอักษรใน repo oasis-park-line/scripts/price_gate.py — แก้ที่หนึ่งต้องแก้อีกที่)

รอบปกติ = ผ่านทุกข้อ
  1. มีผลเวลา 05:00 น.
  2. ประกาศล่วงหน้าก่อนวันมีผล (ไม่ใช่ประกาศวันเดียวกัน)
  3. ทุกชนิดที่เปลี่ยน ขยับอย่างน้อย 0.10 และไม่เกิน 3.00 บาท
  4. หลังเวลามีผล: ราคา ปตท. (OR) ตรงกับบางจาก ทุกชนิดที่ขายเหมือนกัน (ปตท. ไม่มีราคาล่วงหน้า จึงเช็คได้เฉพาะหลังมีผล)
ใช้ไลบรารีมาตรฐานเท่านั้น
"""
import html
import json
import re
import urllib.request
from datetime import datetime, timedelta, timezone

BKK = timezone(timedelta(hours=7))
MIN_STEP, MAX_STEP = 0.10, 3.00
NORMAL_TIME = (5, 0)
PTT_URL = 'https://orapiweb.pttor.com/oilservice/OilPrice.asmx'
TH_MONTHS = {'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
             'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12}

# ชนิดที่ปั๊มเขาย้อยขาย (ชื่อในระบบบางจาก → ชื่อสั้น)
SOLD = {
    'ไฮดีเซล S': 'ไฮดีเซล S',
    'ดีเซล B20': 'ดีเซล B20',
    'ไฮ พรีเมียม ดีเซล พลัส': 'ไฮพรีเมียมดีเซล',
    'แก๊สโซฮอล์ 95 S EVO': 'แก๊สโซฮอล์ 95',
    'แก๊สโซฮอล์ 91 S EVO': 'แก๊สโซฮอล์ 91',
    'แก๊สโซฮอล์ E20 S EVO': 'แก๊สโซฮอล์ E20',
    'ไฮ พรีเมียม 98 พลัส': 'ไฮพรีเมียม 98',
}
# ชนิดที่ ปตท. ขายเหมือนกัน (ราคาเท่ากันเสมอ): ชื่อบางจาก → ฟังก์ชันจับชื่อ ปตท.
PTT_MATCH = {
    'ไฮดีเซล S': lambda n: n == 'ดีเซล',
    'ดีเซล B20': lambda n: n == 'ดีเซล B20',
    'แก๊สโซฮอล์ 95 S EVO': lambda n: 'แก๊สโซฮอล์' in n and n.endswith(' 95'),
    'แก๊สโซฮอล์ 91 S EVO': lambda n: 'แก๊สโซฮอล์' in n and n.endswith(' 91'),
    'แก๊สโซฮอล์ E20 S EVO': lambda n: 'แก๊สโซฮอล์' in n and n.endswith(' E20'),
}


def effective_at(src):
    """'ราคามีผล ณ วันที่ 11 พ.ย. 69 เวลา 05.00 น.' → datetime"""
    m = re.search(r'(\d{1,2})\s*(\S+?)\s*(\d{2,4})\s*เวลา\s*(\d{1,2})[.:](\d{2})', src.get('OilRemark2') or '')
    if not m or m.group(2) not in TH_MONTHS:
        return None
    y = int(m.group(3))
    y = y + 2500 if y < 100 else y
    return datetime(y - 543, TH_MONTHS[m.group(2)], int(m.group(1)), int(m.group(4)), int(m.group(5)), tzinfo=BKK)


def announced_at(src):
    try:
        d, mo, y = (int(x) for x in src['OilPriceDate'].split('/'))
        h, mi = (int(x) for x in src['OilPriceTime'].split(':'))
        return datetime(y - 543, mo, d, h, mi, tzinfo=BKK)
    except (KeyError, ValueError, AttributeError):
        return None


def round_key(src):
    """รหัสรอบประกาศ เช่น '20/11/2569 14:05' (ใช้อนุมัติรอบแปลก)"""
    return '%s %s' % (src.get('OilPriceDate'), src.get('OilPriceTime'))


def fetch_ptt():
    """ราคาปัจจุบันของ ปตท. (OR) → {ชื่อสินค้า: ราคา}"""
    body = ('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
            '<soap:Body><CurrentOilPrice xmlns="http://www.pttor.com"><Language>th</Language></CurrentOilPrice>'
            '</soap:Body></soap:Envelope>').encode('utf-8')
    req = urllib.request.Request(PTT_URL, data=body, headers={
        'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': 'http://www.pttor.com/CurrentOilPrice',
        'User-Agent': 'oasis-park-price-check'})
    with urllib.request.urlopen(req, timeout=30) as r:
        text = html.unescape(r.read().decode('utf-8'))
    out = {}
    for prod, price in re.findall(r'<PRODUCT>(.*?)</PRODUCT>.*?<PRICE>(.*?)</PRICE>', text, re.S):
        try:
            out[prod.strip()] = float(price)
        except ValueError:
            pass
    return out


def check(src, now=None, ptt=fetch_ptt):
    """คืนรายการเหตุผลที่ "ไม่ใช่รอบปกติ" · ว่าง = รอบปกติ อัปอัตโนมัติได้"""
    now = now or datetime.now(BKK)
    reasons = []
    eff, ann = effective_at(src), announced_at(src)
    if not eff or not ann:
        return ['อ่านเวลาประกาศ/เวลามีผลของบางจากไม่ได้']
    if (eff.hour, eff.minute) != NORMAL_TIME:
        reasons.append('มีผลเวลา %s น. (รอบปกติมีผลตี 5)' % eff.strftime('%H.%M'))
    if ann.date() >= eff.date():
        reasons.append('ประกาศ %s น. วันเดียวกับที่มีผล (รอบปกติประกาศล่วงหน้าตั้งแต่วันก่อน)' % ann.strftime('%H.%M'))
    pending = now < eff
    a, b = ('PriceToday', 'PriceTomorrow') if pending else ('PriceYesterday', 'PriceToday')
    rows = {o['OilName']: o for o in json.loads(src['OilList'])}
    for name, label in SOLD.items():
        o = rows.get(name)
        if not o:
            reasons.append('ไม่พบ %s ในข้อมูลบางจาก' % label)
            continue
        d = round(o[b] - o[a], 2)
        if d and abs(d) < MIN_STEP:
            reasons.append('%s ขยับแค่ %+.2f บาท (น้อยผิดปกติ)' % (label, d))
        elif abs(d) > MAX_STEP:
            reasons.append('%s ขยับ %+.2f บาท (มากผิดปกติ)' % (label, d))
    if not pending:
        try:
            p = ptt()
        except Exception as e:  # noqa: BLE001 — เน็ต/เซิร์ฟเวอร์ ปตท. ล่ม = ยังยืนยันไม่ได้ (รอบถัดไปเช็คใหม่)
            p = None
            reasons.append('เช็คราคากับ ปตท. ไม่ได้ (%s)' % type(e).__name__)
        if p is not None:
            for name, match in PTT_MATCH.items():
                hit = [v for k, v in p.items() if match(k)]
                bc = rows.get(name, {}).get('PriceToday')
                if not hit:
                    reasons.append('ไม่พบ %s ในข้อมูล ปตท.' % SOLD[name])
                elif bc is not None and round(hit[0] - bc, 2):
                    reasons.append('%s บางจาก %.2f แต่ ปตท. %.2f (ไม่ตรงกัน)' % (SOLD[name], bc, hit[0]))
    return reasons
