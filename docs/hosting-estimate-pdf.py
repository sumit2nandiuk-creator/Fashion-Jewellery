"""Generate the hosting and running-costs estimate PDF.

Usage:  python3 docs/hosting-estimate-pdf.py
Output: docs/Fashion-Jewellery-Hosting-Estimate.pdf  (two pages)

Scope: the shop as it will actually run -- static site on Pages, Postgres on
Supabase for products/orders/accounts, images on R2, mail from Resend, and both
Razorpay (India) and Stripe (international) for payments.

Rates used (verified November 2026):
  .com at Cloudflare Registrar  $11.17 / year  (at cost, after the Nov 2026 registry rise)
  Cloudflare Pages, Functions   free (static + 100,000 function requests a day)
  R2                            $0.015 / GB-month, 10 GB + 10M reads free, egress free
  Supabase Pro                  $25 / month (8 GB Postgres, 100k users, daily backups)
  Resend                        free to 3,000 emails a month, then $20 / 50,000
  Razorpay                      UPI 0%, domestic cards 2%, international 3%, +18% GST
  Stripe India                  domestic cards 2%, international 3% + $2, +18% GST
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
    (".com domain, Cloudflare Registrar", 82, 983, "at cost, renews at the same price"),
    ("Cloudflare Pages, CDN, SSL, DNS", 0, 0, "static site, bandwidth unmetered"),
    ("Supabase Pro: Postgres, auth, backups", 2200, 26400, "$25: 8 GB, 100k users, daily backups"),
    ("R2 image storage, 5 GB billed", 7, 79, "first 10 GB free, no egress fee"),
    ("Resend: order, OTP and receipt email", 0, 0, "3,000 messages a month free"),
    ("Pages Functions: webhooks and cron", 0, 0, "100,000 requests a day free"),
]

# option, monthly, yearly, note
SCENARIOS = [
    ("Essentials", 89, 1062, "Free tiers: Supabase Free, Resend free, R2. Staging before launch."),
    ("Recommended", 2289, 27462, "Supabase Pro, R2: daily backups, 8 GB Postgres, 100,000 users."),
    ("Scale", 5875, 70499, "Adds Cloudflare Pro, Resend Pro and 65 GB of photography."),
]

# monthly sales, gateway fees, what lands in the bank
PER_SALE = [
    ("25 orders at \u20b92,000  \u00b7  \u20b950,000", 531, 49469),
    ("30 orders at \u20b93,000  \u00b7  \u20b91,00,000", 1062, 98938),
    ("40 orders at \u20b912,500  \u00b7  \u20b95,00,000", 5310, 494690),
]

# work, hours, rupees
SETUP = [
    ("Domain, DNS, Pages, SSL and the environment keys", "2", "1,700"),
    ("Supabase project, schema load and row-level security", "3", "2,550"),
    ("Razorpay and Stripe accounts, KYC, webhooks in test mode", "3", "2,550"),
    ("Photo pipeline to R2, Resend domain and DKIM verification", "2", "1,700"),
    ("Search Console, sitemap, analytics and launch checks", "2", "1,700"),
]

CHANGES = [
    ("Database", "Postgres tables for products, variants, stock, orders, customers, coupons."),
    ("Accounts", "Email and Google sign-in; profiles, addresses and order history kept server-side."),
    ("Roles", "Row-level security: a customer reads only their rows; admin claims unlock the panel."),
    ("Checkout", "Razorpay for UPI and Indian cards, Stripe abroad; signed webhooks confirm and cut stock."),
    ("Admin", "Products, stock, orders, refunds, coupons and a daily sales view behind the admin role."),
    ("Email", "Order, shipping and OTP mail from Resend on a verified domain with SPF and DKIM."),
    ("Safety", "Signed webhooks, idempotent retries, rate limits, daily backups, card data never kept."),
]

class Hosting(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_xy(18, 10)
        self.cell(0, 5, "FASHION JEWELLERY  \u00b7  HOSTING AND RUNNING COSTS  \u00b7  FJ-HOST-2026-02", align="L")
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
    pdf.cell(0, 8, "Monthly and yearly estimate  \u00b7  Cloudflare, Supabase, Resend, Razorpay and Stripe",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(54)
    pdf.set_font("body", "", 8.5)
    meta = [
        ("Prepared for", "Fashion Jewellery, Baghajatin, Kolkata 700086"),
        ("Prepared by", "Sumit Nandi \u2014 design and front-end"),
        ("Date", "4 November 2026"),
        ("Reference", "FJ-HOST-2026-02  (replaces FJ-HOST-2026-01)"),
        ("Scope", "Domain, hosting, database, accounts, images and payments"),
        ("Currency", "\u20b9 converted from USD at \u20b988 = $1"),
    ]
    for label, value in meta:
        pdf.set_x(18)
        pdf.set_text_color(*MUTED)
        pdf.cell(34, 5.1, label.upper(), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_text_color(*INK)
        pdf.cell(0, 5.1, value, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(2.5)
    boxes = [
        ("Fixed monthly", inr(2289), "before sales and GST"),
        ("Fixed yearly", inr(27462), "billed in dollars"),
        ("Including 18% GST", inr(32405), "if registered for GST"),
        ("Leanest fixed", inr(1062), "free tiers, \u20b989 a month"),
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
    heading(pdf, "Fixed cost, whatever you sell")
    rows = [(item, inr(m), inr(y), note) for item, m, y, note in MONTHLY]
    rows.append(("Total", inr(2289), inr(27462), "add 18% GST where it applies: " + inr(2701) + " a month"))
    table(pdf, ["Line", "Monthly", "Per year", "Notes"], rows,
          [58, 20, 22, 74], ["LEFT", "RIGHT", "RIGHT", "LEFT"], head_style)

    pdf.ln(2)
    heading(pdf, "Only when you sell: gateway fees")
    table(pdf, ["Monthly sales", "Fees", "You keep"],
          [(label, inr(fee), inr(net)) for label, fee, net in PER_SALE],
          [92, 30, 42], ["LEFT", "RIGHT", "RIGHT"], head_style)
    para(pdf, "1.06% of sales at a 60% UPI, 30% card and 10% international mix. No monthly gateway fee.", 8.4, MUTED)
    pdf.ln(1)
    # ------------------------------------------------------------------ page 2
    pdf.add_page()
    heading(pdf, "Three ways to run it", 2)
    table(pdf, ["Option", "Monthly", "Per year", "What it buys"],
          [(name, inr(m), inr(y), note) for name, m, y, note in SCENARIOS],
          [26, 20, 22, 106], ["LEFT", "RIGHT", "RIGHT", "LEFT"], head_style)
    para(pdf, "Recommended starts the day the shop takes money; Scale is for a busy international catalogue.",
         8.4, MUTED)

    heading(pdf, "One-time setup at launch")
    rows = [(item, h + " h", inr(float(amount.replace(",", "")))) for item, h, amount in SETUP]
    rows.append(("Total launch configuration", "12 h", inr(10200)))
    table(pdf, ["Work", "Time", "Cost"], rows, [124, 20, 30], ["LEFT", "RIGHT", "RIGHT"], head_style, size=8.0)

    heading(pdf, "What the site needs to run this way")
    for label, text in CHANGES:
        pdf.set_x(18)
        pdf.set_font("body", "B", 8.2)
        pdf.set_text_color(*MAROON)
        pdf.cell(26, 4.8, label, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("body", "", 8.2)
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 4.8, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    heading(pdf, "What the numbers assume")
    assumptions = [
        ("Traffic", "20,000 page views, 60,000 image requests and 30 orders a month at \u20b93,000."),
        ("Data", "40 products, 20,000 order rows and 500 customers a year: far inside 8 GB and 100,000 users."),
        ("Photography", "5 GB today across 37 pieces, growing to about 65 GB in the Scale case."),
    ]
    for label, text in assumptions:
        pdf.set_x(18)
        pdf.set_font("body", "B", 8.2)
        pdf.set_text_color(*MAROON)
        pdf.cell(30, 5.2, label, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("body", "", 8.2)
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 5.2, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    heading(pdf, "Notes", 3)
    notes = [
        "Cards never reach our database: Razorpay and Stripe return a payment id and a signed webhook, which keeps the site out of PCI scope.",
        "Supabase and Cloudflare bill in dollars at the rates shown (\u20b988 to the dollar, before card markup); GST at 18% applies to an Indian business.",
        "The \u20b955,000 build fee is unchanged. The backend, admin panel, accounts and gateway integration are new scope, quoted separately.",
        "Both gateways need KYC before the first sale: PAN, GST certificate, bank proof and a live site. Razorpay clears in days; Stripe India can take longer.",
    ]
    for note in notes:
        pdf.set_x(18)
        pdf.set_font("body", "", 8)
        pdf.set_text_color(*MUTED)
        pdf.cell(4, 4.3, "\u00b7")
        pdf.multi_cell(0, 4.3, note, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(0.45)

    pdf.output("docs/Fashion-Jewellery-Hosting-Estimate.pdf")
    print("wrote docs/Fashion-Jewellery-Hosting-Estimate.pdf")


if __name__ == "__main__":
    build()
