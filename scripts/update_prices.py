#!/usr/bin/env python3
"""อัปเดตราคาน้ำมันจาก API ของบางจาก (ตัวเดียวกับที่เว็บ bangchak.co.th/th/oilprice ใช้)

ใช้:  python scripts/update_prices.py

ผลลัพธ์ 2 ไฟล์ (เนื้อหาเดียวกัน):
  data/prices.json  - ให้หน้าเว็บ fetch ได้เมื่อโฮสต์บนเซิร์ฟเวอร์ (GitHub Pages ฯลฯ)
  data/prices.js    - ให้หน้าเว็บอ่านได้แม้เปิดไฟล์ตรงจากเครื่อง (ไม่ต้อง fetch)

- ใช้ไลบรารีมาตรฐานของ Python เท่านั้น
- เบราว์เซอร์เรียก API ของบางจากตรงๆ ไม่ได้ (ไม่มี CORS) จึงต้องรันสคริปต์นี้แล้ว push ไฟล์ข้อมูล
- เก็บประวัติราคา (history) ต่อเนื่อง: เพิ่มจุดใหม่เฉพาะเมื่อราคาเปลี่ยนจากครั้งก่อน
- โครงข้อมูลต่อรายการ = FuelPrice (id, name, category, price, previousPrice, effectiveDate, previousEffectiveDate, history)
"""
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

API = 'https://oil-price.bangchak.co.th/ApiOilPrice2/th'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'data', 'prices.json')
OUT_JS = os.path.join(HERE, '..', 'data', 'prices.js')
BKK = timezone(timedelta(hours=7))

# ชื่อในระบบบางจาก -> (id, ชื่อที่แสดงบนเว็บ, category)
FUELS = {
    'แก๊สโซฮอล์ 95 S EVO': ('gasohol95', 'Gasohol 95 S EVO', 'gasohol'),
    'แก๊สโซฮอล์ 91 S EVO': ('gasohol91', 'Gasohol 91 S EVO', 'gasohol'),
    'แก๊สโซฮอล์ E20 S EVO': ('e20', 'Gasohol E20 S EVO', 'gasohol'),
    'แก๊สโซฮอล์ E85 S EVO': ('e85', 'Gasohol E85 S EVO', 'gasohol'),
    'ไฮ พรีเมียม 98 พลัส': ('premium98', 'Hi Premium 98 Plus', 'gasohol'),
    'ดีเซล B20': ('b20', 'Diesel B20', 'diesel'),
    'ไฮดีเซล S': ('dieselS', 'Hi Diesel S', 'diesel'),
    'ไฮ พรีเมียม ดีเซล พลัส': ('premiumDiesel', 'Hi Premium Diesel Plus', 'diesel'),
}
# id รุ่นเก่า (อ่านประวัติราคาจากไฟล์รุ่นก่อนตอนย้ายโครงข้อมูล)
OLD_IDS = {'gasohol95': 'g95', 'gasohol91': 'g91', 'premium98': 'p98', 'dieselS': 'hds', 'premiumDiesel': 'pds'}
TH_MONTHS = {'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
             'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12}


def fetch():
    req = urllib.request.Request(API, headers={'User-Agent': 'oasis-park-site-price-updater'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)[0]


def effective_from(remark):
    """'ราคามีผล ณ วันที่ 11 พ.ย. 69 เวลา 05.00 น.' -> ('2026-11-11', '05:00')"""
    m = re.search(r'(\d{1,2})\s*(\S+?)\s*(\d{2,4})\s*เวลา\s*(\d{1,2})[.:](\d{2})', remark or '')
    if not m or m.group(2) not in TH_MONTHS:
        return None, None
    y = int(m.group(3))
    y = y + 2500 if y < 100 else y
    return '%04d-%02d-%02d' % (y - 543, TH_MONTHS[m.group(2)], int(m.group(1))), '%02d:%s' % (int(m.group(4)), m.group(5))


def load_old():
    if not os.path.exists(OUT):
        return {}
    with open(OUT, encoding='utf-8') as f:
        return {x['id']: x for x in json.load(f).get('fuels', []) if 'id' in x}


def main():
    src = fetch()
    eff_date, eff_time = effective_from(src.get('OilRemark2'))
    if not eff_date:
        sys.exit('อ่านวันที่ราคามีผลไม่ได้: %r' % src.get('OilRemark2'))

    old = load_old()
    fuels = []
    for o in json.loads(src['OilList']):
        if o['OilName'] not in FUELS:
            print('ข้าม (ไม่รู้จักชื่อ):', o['OilName'])
            continue
        fid, name, category = FUELS[o['OilName']]
        price, prev, tomorrow = o['PriceToday'], o['PriceYesterday'], o['PriceTomorrow']
        hist = list((old.get(fid) or old.get(OLD_IDS.get(fid, '')) or {}).get('history', []))
        if not hist and prev != price:
            hist.append({'date': None, 'price': prev})   # ราคาก่อนหน้า (ยังไม่ทราบวันที่ประกาศ)
        if not hist or hist[-1]['price'] != price:
            hist.append({'date': eff_date, 'price': price})
        dated = [h for h in hist if h.get('date')]
        fuels.append({
            'id': fid, 'name': name, 'category': category,
            'price': price, 'previousPrice': prev, 'tomorrowPrice': tomorrow,
            'effectiveDate': eff_date,
            'previousEffectiveDate': dated[-2]['date'] if len(dated) > 1 else None,
            'history': hist[-12:],
        })

    order = [v[0] for v in FUELS.values()]
    fuels.sort(key=lambda x: order.index(x['id']))

    out = {
        'updated': datetime.now(BKK).isoformat(timespec='minutes'),
        'effective': {'date': eff_date, 'time': eff_time},
        'announced': {'date': src.get('OilPriceDate'), 'time': src.get('OilPriceTime')},
        'source': 'https://www.bangchak.co.th/th/oilprice',
        'remark': 'ราคาปลีก กทม. ยังไม่รวมภาษีบำรุงท้องถิ่น ราคาหน้าปั๊มอาจแตกต่างเล็กน้อย',
        'fuels': fuels,
    }
    text = json.dumps(out, ensure_ascii=False, indent=2)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text + '\n')
    with open(OUT_JS, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* สร้างโดย scripts/update_prices.py - อย่าแก้มือ (สำเนาของ prices.json ให้เปิดไฟล์ตรงได้โดยไม่ต้อง fetch) */\n')
        f.write('window.FUEL_PRICES_BUNDLE = ' + text + ';\n')
    print('อัปเดตแล้ว %d รายการ · ราคามีผล %s %s' % (len(fuels), eff_date, eff_time))


if __name__ == '__main__':
    main()
