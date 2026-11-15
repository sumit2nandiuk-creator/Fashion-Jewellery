"""Generate the hosting and running-costs estimate PDF.

Usage:  python3 docs/hosting-estimate-pdf.py
Output: docs/Fashion-Jewellery-Hosting-Estimate.pdf  (two pages)

Rates used (verified November 2026, Cloudflare published pricing):
  .com at Cloudflare Registrar  $11.17 / year  (at cost, after the Nov 2026 registry rise)
  Cloudflare Pro                $20 / month billed annually ($25 monthly)
  Workers Paid                  $5 / month (10M requests included)
  R2                            $0.015 / GB-month, 10 GB + 10M reads free, egress free
  Cloudflare Images             $5 / 100,000 images stored, $1 / 100,000 delivered
  Exchange rate                 $1 = Rs 88
"""

from fpdf import FPDF
from fpdf.fonts import FontFace
from fpdf.enums import XPos, YPos

MAROON = (110, 18, 36)
GOLD = (190, 151, 77)
IVORY = (251, 245, 233)
SAND = (238, 228, 208)
LINE = (222, 208, 186)
INK = (43, 35, 30)
MUTED = (107, 97, 86)
GREEN = (57, 104, 76)

FONTS = "/usr/share/fonts/truetype/dejavu/"
RATE = 88  # rupees per US dollar


def inr(value):
    return "\u20b9" + format(int(round(value)), ",d")


# item, monthly rupees, yearly rupees, note
MONTHLY = [
    (".com domain, Cloudflare Registrar", 82, 983, "at cost, renews at the same price, free WHOIS privacy"),
    ("Pages hosting, CDN, SSL, DNS", 0, 0, "static site, 500 builds a month, unmetered delivery"),
    ("Cloudflare Pro", 1760, 21120, "managed WAF, image optimisation, ticket support"),
    ("Workers Paid", 440, 5280, "contact form, redirects, scheduled jobs"),
    ("R2 image storage, 5 GB billed", 7, 79, "first 10 GB and 10M reads free, no egress fee"),
    ("Web Analytics, Email Routing, backups", 0, 0, "cookieless analytics, contact@ forwarding, git history"),
]

SCENARIOS = [
    ("Essentials", 82, 984, "Domain only. Photos stay in the repository, free Cloudflare plan."),
    ("Recommended", 2289, 27468, "Pro + Workers + R2. Covers growth to roughly 5 lakh visits."),
    ("Scale", 5452, 65424, "Adds Cloudflare Images, 65 GB storage, business email and a care plan."),
]

SETUP = [
    ("Domain and DNS on Cloudflare, repo on Pages, SSL", "2", "1,700", "once"),
    ("Branded 404 page, deploy hooks, preview branches", "2", "1,700", "once"),
    ("Photograph pipeline to R2 with WebP and AVIF variants", "3", "2,550", "once"),
    ("Search Console, sitemap, robots.txt, Web Analytics", "2", "1,700", "once"),
    ("Contact form through a Pages Function and Resend", "2", "1,700", "once"),
    ("Razorpay live payments, replacing the mock checkout", "6", "5,100", "optional, 2% a sale"),
    ("WhatsApp Business API for order confirmations", "4", "3,400", "optional, per chat"),
]

CHANGES = [
    ("DNS and deployment", "Nameservers to Cloudflare, the repo on Pages, so each push to main publishes."),
    ("Delivery rules", "_headers is in the repo: photo caching, HSTS, no framing. CSP follows the R2 host."),
    ("Old links", "_redirects is in the repo too, so boutique, cart and product links resolve on .com."),
    ("Photography", "Photographs served from R2 as WebP and AVIF, so the repository stays light."),
    ("Contact and orders", "Form posts to a Pages Function and emails via Resend; orders stay on WhatsApp."),
    ("Measurement", "Cloudflare Web Analytics and Search Console, cookieless, so no banner is needed."),
]


class Hosting(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_xy(18, 10)
        self.cell(0, 5, "FASHION JEWELLERY  \u00b7  HOSTING AND RUNNING COSTS  \u00b7  FJ-HOST-2026-01", align="L")
        self.set_draw_color(*LINE)
        self.line(18, 16.5, 192, 16.5)
        self.set_y(24)

    def footer(self):
        self.set_y(-16)
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_draw_color(*LINE)
        self.line(18, self.get_y() - 3, 192, self.get_y() - 3)
        self.cell(0, 6, "Prepared by Sumit Nandi  \u00b7  rates verified 1 November 2026", align="L")
        self.set_xy(18, self.get_y())
        self.cell(174, 6, "Page %d of {nb}" % self.page_no(), align="R")


def heading(pdf, text, gap=5):
    pdf.ln(gap)
    pdf.set_font("body", "B", 8)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 5, text.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.3)
    pdf.line(18, pdf.get_y() + 1.5, 46, pdf.get_y() + 1.5)
    pdf.ln(4.5)


def para(pdf, text, size=9, color=INK, lead=4.9):
    pdf.set_font("body", "", size)
    pdf.set_text_color(*color)
    pdf.multi_cell(0, lead, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def table(pdf, headings, rows, widths, aligns, style, size=8.2, lead=5.2):
    pdf.set_text_color(*INK)
    pdf.set_font("body", "", size)
    pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.15)
    with pdf.table(
        col_widths=widths,
        text_align=aligns,
        headings_style=style,
        borders_layout="HORIZONTAL_LINES",
        line_height=lead,
        padding=1.1,
    ) as t:
        head = t.row()
        for text in headings:
            head.cell(text)
        for row in rows:
            cells = t.row()
            for text in row:
                cells.cell(text)


def build():
    pdf = Hosting(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(True, margin=18)
    pdf.set_margins(18, 18, 18)
    pdf.alias_nb_pages()

    pdf.add_font("display", "", FONTS + "DejaVuSerif.ttf")
    pdf.add_font("display", "B", FONTS + "DejaVuSerif-Bold.ttf")
    pdf.add_font("body", "", FONTS + "DejaVuSans.ttf")
    pdf.add_font("body", "B", FONTS + "DejaVuSans-Bold.ttf")

    head_style = FontFace(emphasis="BOLD", color=IVORY, fill_color=MAROON)

    # ------------------------------------------------------------------ page 1
    pdf.add_page()
    pdf.set_fill_color(*MAROON)
    pdf.rect(0, 0, 210, 46, style="F")
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 46, 210, 1.2, style="F")
    pdf.image("images/logo-mark.png", x=172, y=9, w=24)

    pdf.set_xy(18, 11)
    pdf.set_font("body", "", 8)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 5, "F A S H I O N   J E W E L L E R Y", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(18, 18)
    pdf.set_font("display", "B", 23)
    pdf.set_text_color(*IVORY)
    pdf.cell(0, 11, "Hosting and running costs", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(18)
    pdf.set_font("body", "", 9)
    pdf.set_text_color(*SAND)
    pdf.cell(0, 8, "Monthly and yearly estimate  \u00b7  .com domain, Cloudflare hosting and image storage",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(54)
    pdf.set_font("body", "", 8.5)
    meta = [
        ("Prepared for", "Fashion Jewellery, Baghajatin, Kolkata 700086"),
        ("Prepared by", "Sumit Nandi \u2014 design and front-end"),
        ("Date", "4 November 2026"),
        ("Reference", "FJ-HOST-2026-01"),
        ("Scope", "Domain, hosting, image storage, email and delivery"),
        ("Currency", "\u20b9 converted from USD at \u20b988 = $1"),
    ]
    for label, value in meta:
        pdf.set_x(18)
        pdf.set_text_color(*MUTED)
        pdf.cell(34, 5.3, label.upper(), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_text_color(*INK)
        pdf.cell(0, 5.3, value, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(2.5)
    boxes = [
        ("Recommended monthly", inr(2289), "domain, Pro, Workers, R2"),
        ("Recommended yearly", inr(27468), "billed in dollars"),
        ("Yearly including 18% GST", inr(32412), "if registered for GST"),
        ("Leanest setup", inr(984), "domain only, free plan"),
    ]
    box_w = (174 - 3 * 5) / 4
    top = pdf.get_y()
    pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.2)
    for index, (label, value, note) in enumerate(boxes):
        x = 18 + index * (box_w + 5)
        pdf.set_fill_color(*IVORY)
        pdf.rect(x, top, box_w, 24, style="DF")
        pdf.set_xy(x + 3.5, top + 3.6)
        pdf.set_font("body", "", 6.6)
        pdf.set_text_color(*GOLD)
        pdf.cell(box_w - 7, 4, label.upper())
        pdf.set_xy(x + 3.5, top + 8.4)
        size = 14
        pdf.set_font("display", "B", size)
        while size > 8 and pdf.get_string_width(value) > box_w - 7:
            size -= 0.4
            pdf.set_font("display", "B", size)
        pdf.set_text_color(*MAROON)
        pdf.cell(box_w - 7, 7, value)
        pdf.set_xy(x + 3.5, top + 15.6)
        pdf.set_font("body", "", 6.4)
        pdf.set_text_color(*MUTED)
        pdf.cell(box_w - 7, 4, note)

    pdf.set_y(top + 30)
    heading(pdf, "What you pay for, month by month")
    rows = [(item, inr(m), inr(y), note) for item, m, y, note in MONTHLY]
    rows.append(("Total", inr(2289), inr(27468), "add 18% GST where it applies: " + inr(2701) + " a month"))
    table(pdf, ["Line", "Monthly", "Per year", "Notes"], rows,
          [58, 20, 22, 74], ["LEFT", "RIGHT", "RIGHT", "LEFT"], head_style)

    para(pdf, "Cloudflare bills in dollars, so the rupee figures move with the exchange rate and with the "
              "3% your card adds for a foreign transaction. The domain is bought at wholesale through Cloudflare "
              "Registrar: no markup, no renewal jump, free WHOIS privacy.", 8.4, MUTED)
    pdf.ln(1)
    heading(pdf, "What the site is assumed to do")
    assumptions = [
        ("Traffic", "20,000 page views and 60,000 image requests a month, roughly five times today's load before any cost moves."),
        ("Photography", "5 GB today across 37 pieces, growing to about 65 GB in the Scale case."),
        ("Catalogue", "40 products now; Pages and R2 add nothing per product, only per gigabyte stored."),
        ("Payments", "The store is a demo. Card and UPI charges only begin with a gateway such as Razorpay: 2% plus GST a transaction."),
    ]
    for label, text in assumptions:
        pdf.set_x(18)
        pdf.set_font("body", "B", 8.2)
        pdf.set_text_color(*MAROON)
        pdf.cell(30, 5.4, label, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("body", "", 8.2)
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 5.4, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ------------------------------------------------------------------ page 2
    pdf.add_page()
    heading(pdf, "Three ways to run it", 2)
    table(pdf, ["Option", "Monthly", "Per year", "What it buys"],
          [(name, inr(m), inr(y), note) for name, m, y, note in SCENARIOS],
          [30, 22, 24, 98], ["LEFT", "RIGHT", "RIGHT", "LEFT"], head_style)
    para(pdf, "Start on Essentials if the aim is simply to be online with the catalogue as it stands. Move to "
              "Recommended once the shop takes orders or the photography passes a few gigabytes; the Pro plan also "
              "adds managed firewall rules and lossless image optimisation, which is why the pages get lighter rather "
              "than heavier as the catalogue grows.", 8.4, MUTED)

    heading(pdf, "One-time setup at launch")
    rows = [(item, h + " h", inr(float(amount.replace(",", ""))), kind) for item, h, amount, kind in SETUP]
    rows.append(("Core setup total", "11 h", inr(9350), "first five lines only"))
    table(pdf, ["Work", "Time", "Cost", "When"], rows, [92, 16, 22, 44], ["LEFT", "RIGHT", "RIGHT", "LEFT"], head_style, size=7.9)

    heading(pdf, "Changes the site needs to run this way")
    for label, text in CHANGES:
        pdf.set_x(18)
        pdf.set_font("body", "B", 8.2)
        pdf.set_text_color(*MAROON)
        pdf.cell(38, 5.2, label, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("body", "", 8.2)
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 5.2, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(0.6)

    heading(pdf, "Notes")
    notes = [
        "Pages serves the site from Cloudflare's edge: static requests and bandwidth unmetered, 500 builds a month.",
        "R2 includes 10 GB and 10M reads free and never charges egress, which is why a photo-heavy shop costs rupees, not a hosting bill.",
        "Cloudflare bills in dollars at the rates shown (\u20b988 to the dollar, before card markup); GST at 18% applies to an Indian business.",
        "Not included: ads, photography, copywriting, gateway or WhatsApp fees. The \u20b955,000 build fee is unaffected.",
    ]
    for note in notes:
        pdf.set_x(18)
        pdf.set_font("body", "", 8)
        pdf.set_text_color(*MUTED)
        pdf.cell(4, 4.6, "\u00b7")
        pdf.multi_cell(0, 4.6, note, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(0.8)

    pdf.output("docs/Fashion-Jewellery-Hosting-Estimate.pdf")
    print("wrote docs/Fashion-Jewellery-Hosting-Estimate.pdf")


if __name__ == "__main__":
    build()
