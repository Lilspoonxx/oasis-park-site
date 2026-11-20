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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import price_gate  # noqa: E402  ด่านตรวจรอบปกติ/รอบแปลก

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
    # E85 ไม่ได้ขายที่ปั๊มเขาย้อย (สปูนยืนยัน 18 พ.ย. 69) → ไม่แสดงบนเว็บ
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


OFFSETS = os.path.join(HERE, 'price_offsets.json')
HOLD = os.path.join(HERE, 'price_hold.json')
APPROVED = os.path.join(HERE, 'price_approved.json')


def approved_keys():
    """รอบแปลกที่สปูนยืนยันราคาหน้าตู้แล้ว (เพิ่มโดย workflow approve-price.yml)"""
    try:
        with open(APPROVED, encoding='utf-8') as f:
            return set(json.load(f).get('approved', {}))
    except (OSError, ValueError):
        return set()


def held():
    """สวิตช์ฉุกเฉิน: ถ้า price_hold.json มี hold=true → ไม่แตะราคาบนเว็บเลยไม่ว่ารอบไหน"""
    if not os.path.exists(HOLD):
        return None
    with open(HOLD, encoding='utf-8') as f:
        h = json.load(f)
    return h if h.get('hold') else None


def load_offsets():
    """ส่วนต่างราคาเพชรบุรีต่อชนิด (บาท/ลิตร) คืน {} ถ้ายังตั้งไม่ครบทุกชนิด (ใช้ราคา กทม. ตามเดิม)"""
    if not os.path.exists(OFFSETS):
        return {}
    with open(OFFSETS, encoding='utf-8') as f:
        offs = json.load(f).get('offsets', {})
    if any(offs.get(v[0]) is None for v in FUELS.values()):
        return {}
    return {k: float(v) for k, v in offs.items() if v is not None}


def main():
    h = held()
    if h:
        print('พักอัปเดตราคา (price_hold.json) ตั้งแต่ %s: %s' % (h.get('since'), h.get('reason')))
        return
    src = fetch()
    offsets = load_offsets()
    eff_date, eff_time = effective_from(src.get('OilRemark2'))
    if not eff_date:
        sys.exit('อ่านวันที่ราคามีผลไม่ได้: %r' % src.get('OilRemark2'))

    old = load_old()
    # บางจากประกาศล่วงหน้า (เช่น 19:45 มีผลพรุ่งนี้ 05:00) ช่วงก่อนมีผล PriceToday = ราคาเก่า
    # ห้ามติดป้ายวันที่ใหม่ให้ราคาเก่า: ก่อนเวลามีผล คงราคาปัจจุบันจากไฟล์เดิม แล้วเก็บราคาใหม่ไว้ใน upcoming
    eff_dt = datetime.strptime(eff_date + ' ' + eff_time, '%Y-%m-%d %H:%M').replace(tzinfo=BKK)
    pending = datetime.now(BKK) < eff_dt
    fuels = []
    for o in json.loads(src['OilList']):
        if o['OilName'] not in FUELS:
            print('ข้าม (ไม่รู้จักชื่อ):', o['OilName'])
            continue
        fid, name, category = FUELS[o['OilName']]
        off = offsets.get(fid, 0.0)
        price, prev, tomorrow = (round(o[k] + off, 2) for k in ('PriceToday', 'PriceYesterday', 'PriceTomorrow'))
        prior = old.get(fid) or old.get(OLD_IDS.get(fid, '')) or {}
        if pending and prior.get('price') is not None and prior.get('effectiveDate') != eff_date:
            fuels.append(dict(prior, id=fid, name=name, category=category, tomorrowPrice=tomorrow))
            continue
        hist = list(prior.get('history', []))
        delta = round(off - prior.get('offset', 0.0), 2)
        if delta:   # ส่วนต่างเปลี่ยน: ปรับประวัติเดิมให้อยู่บนฐานราคาเดียวกัน
            hist = [dict(h, price=round(h['price'] + delta, 2)) for h in hist]
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
            'offset': off,
        })

    order = [v[0] for v in FUELS.values()]
    fuels.sort(key=lambda x: order.index(x['id']))

    cur_eff = {'date': eff_date, 'time': eff_time}
    upcoming = None
    if pending:
        try:
            with open(OUT, encoding='utf-8') as f:
                cur_eff = json.load(f).get('effective') or cur_eff
        except (OSError, ValueError):
            pass
        if cur_eff.get('date') != eff_date:
            upcoming = {'date': eff_date, 'time': eff_time}
    out = {
        'updated': datetime.now(BKK).isoformat(timespec='minutes'),
        'effective': cur_eff,
        'announced': {'date': src.get('OilPriceDate'), 'time': src.get('OilPriceTime')},
        'source': 'https://www.bangchak.co.th/th/oilprice',
        'local': bool(offsets),
        'remark': ('ราคาหน้าปั๊ม Oasis Park เขาย้อย เพชรบุรี' if offsets
                   else 'ราคาปลีก กทม. ยังไม่รวมภาษีบำรุงท้องถิ่น ราคาหน้าปั๊มอาจแตกต่างเล็กน้อย'),
        'fuels': fuels,
    }
    if upcoming:
        out['upcoming'] = upcoming   # ราคาใหม่ประกาศแล้วแต่ยังไม่มีผล (ดู tomorrowPrice ของแต่ละชนิด)
    # ด่านตรวจ: ราคาบนเว็บจะเปลี่ยน → ต้องเป็นรอบปกติ หรือสปูนอนุมัติรอบนี้แล้ว
    changed = any((old.get(x['id']) or {}).get(k) != x.get(k) for x in fuels for k in ('price', 'tomorrowPrice'))
    if changed:
        key = price_gate.round_key(src)
        reasons = price_gate.check(src)
        if reasons and key not in approved_keys():
            print('⏸ รอบแปลก ยังไม่อัปเว็บ (รอสปูนยืนยันราคาหน้าตู้ · รอบ %s):\n- %s' % (key, '\n- '.join(reasons)))
            touch_checked()   # ราคาบนเว็บตั้งใจคงไว้ (ตรงหน้าตู้) = ยังถือว่าเช็คแล้ว
            return
        print('✔ %s รอบ %s' % ('สปูนอนุมัติแล้ว' if reasons else 'รอบปกติ', key))
    out['checked'] = out['updated']
    if os.path.exists(OUT):   # ไม่มีอะไรเปลี่ยน: ไม่เขียนไฟล์ (GitHub Actions จะได้ไม่ commit ทุกชั่วโมง)
        with open(OUT, encoding='utf-8') as f:
            prev_out = json.load(f)
        skip = ('updated', 'checked')
        if {k: v for k, v in prev_out.items() if k not in skip} == {k: v for k, v in out.items() if k not in skip}:
            print('ราคาไม่เปลี่ยน · ราคามีผล %s %s' % (eff_date, eff_time))
            touch_checked()
            return
    write_out(out)
    print('อัปเดตแล้ว %d รายการ · ราคามีผล %s %s%s' % (len(fuels), out['effective'].get('date'), out['effective'].get('time'),
                                                     (' · ราคาใหม่รอมีผล %s %s' % (eff_date, eff_time)) if upcoming else ''))


def touch_checked():
    """ราคาไม่เปลี่ยน: บันทึกเวลา "เช็คล่าสุด" วันละครั้ง (หน้าเว็บจะได้ไม่เตือนว่าข้อมูลเก่า ทั้งที่ราคาถูกต้อง)"""
    try:
        with open(OUT, encoding='utf-8') as f:
            cur = json.load(f)
    except (OSError, ValueError):
        return
    now = datetime.now(BKK).isoformat(timespec='minutes')
    if (cur.get('checked') or '')[:10] == now[:10]:
        return
    cur['checked'] = now
    write_out(cur)
    print('บันทึกเวลาเช็คล่าสุด', now)


def write_out(out):
    text = json.dumps(out, ensure_ascii=False, indent=2)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text + '\n')
    with open(OUT_JS, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* สร้างโดย scripts/update_prices.py - อย่าแก้มือ (สำเนาของ prices.json ให้เปิดไฟล์ตรงได้โดยไม่ต้อง fetch) */\n')
        f.write('window.FUEL_PRICES_BUNDLE = ' + text + ';\n')


if __name__ == '__main__':
    main()
