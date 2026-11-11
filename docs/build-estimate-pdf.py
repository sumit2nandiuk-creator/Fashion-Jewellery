"""Generate the client-facing project estimate PDF.

Usage:  python3 docs/build-estimate-pdf.py
Output: docs/Fashion-Jewellery-Website-Estimate.pdf
"""

from fpdf import FPDF
from fpdf.fonts import FontFace
from fpdf.enums import XPos, YPos, Align

MAROON = (110, 18, 36)
DEEP = (43, 7, 13)
GOLD = (190, 151, 77)
IVORY = (251, 245, 233)
SAND = (238, 228, 208)
LINE = (222, 208, 186)
INK = (43, 35, 30)
MUTED = (107, 97, 86)

FONTS = "/usr/share/fonts/truetype/dejavu/"

SCOPE = [
    ("Homepage", "Sticky header with wordmark, currency and cart, hero, collection teasers, story and footer."),
    ("Collections page", "Filter tabs with shareable category links, product grid and a styling call to action."),
    ("Product pages (3)", "Image viewer, thumbnails, live price, specifications, related pieces and add to bag."),
    ("Cart page", "Quantity steppers, remove, live subtotal, WhatsApp order hand-off and an empty state."),
    ("Bag engine", "Browser-persisted bag, quantities merged per piece, header badge, +1 animation and toast."),
    ("Currency system", "INR, USD and GBP in a custom dropdown, auto-detected by country, manual choice saved."),
    ("Policy pages (4)", "Shipping, returns, privacy and terms on the shared page layout."),
    ("Responsive and motion", "Phone, tablet, landscape and desktop layouts, category list in the menu, reduced motion."),
    ("Technical and handover", "Hand-written HTML, CSS and JavaScript, no build step, accessibility and Cloudflare Pages."),
]

COSTS = [
    ("Discovery, sitemap and wireframes", "8", "11,200"),
    ("Visual design system and page designs", "16", "22,400"),
    ("Homepage build", "10", "14,000"),
    ("Collections page with filters and deep links", "8", "11,200"),
    ("Product detail pages (3)", "14", "19,600"),
    ("Cart page and bag engine", "12", "16,800"),
    ("Multi-currency switcher and location detection", "6", "8,400"),
    ("Policy pages (4)", "4", "5,600"),
    ("Copy polish and Bengali typography", "6", "8,400"),
    ("QA, device testing and accessibility", "8", "11,200"),
    ("SEO basics, performance, deployment and handover", "6", "8,400"),
    ("Project management and review rounds", "8", "11,200"),
]

ADDONS = [
    ("Extra product page, fully built and populated", "3,500 each"),
    ("Payment gateway checkout (Razorpay or Stripe)", "38,000"),
    ("Self-service CMS so you can edit pieces yourself", "45,000"),
    ("Order and inventory dashboard", "65,000"),
    ("Product photography direction and retouching", "1,500 per image"),
    ("Email capture with newsletter integration", "8,000"),
    ("Bilingual English / Bengali interface", "15,000"),
    ("Analytics, conversion tracking and Search Console", "6,000"),
    ("Care plan: monitoring, backups, 4 hours of changes", "7,500 per month"),
]

TIMELINE = [
    ("Advance received, content and images collected", "Day 0"),
    ("Wireframes and visual design sign-off", "Day 5"),
    ("Build complete, preview link shared for review", "Day 12"),
    ("Revisions closed, launch on your domain", "Day 15"),
]


class Estimate(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_xy(18, 10)
        self.cell(0, 5, "FASHION JEWELLERY  ·  WEBSITE ESTIMATE  ·  FJ-WEB-2026-01", align="L")
        self.set_draw_color(*LINE)
        self.set_line_width(0.2)
        self.line(18, 16.5, 192, 16.5)
        self.set_y(24)

    def footer(self):
        self.set_y(-16)
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_draw_color(*LINE)
        self.line(18, self.get_y() - 3, 192, self.get_y() - 3)
        self.cell(0, 6, "Prepared by Sumit Nandi  ·  valid until 4 December 2026", align="L")
        self.set_xy(18, self.get_y())
        self.cell(174, 6, "Page %d of {nb}" % self.page_no(), align="R")


def heading(pdf, text, gap=6):
    pdf.ln(gap)
    pdf.set_font("body", "B", 8)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 5, text.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.3)
    pdf.line(18, pdf.get_y() + 1.5, 46, pdf.get_y() + 1.5)
    pdf.ln(5)


def para(pdf, text, size=9.5, color=INK, lead=5.6):
    pdf.set_font("body", "", size)
    pdf.set_text_color(*color)
    pdf.multi_cell(0, lead, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def build():
    pdf = Estimate(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(True, margin=22)
    pdf.set_margins(18, 18, 18)

    pdf.add_font("display", "", FONTS + "DejaVuSerif.ttf")
    pdf.add_font("display", "B", FONTS + "DejaVuSerif-Bold.ttf")
    pdf.add_font("body", "", FONTS + "DejaVuSans.ttf")
    pdf.add_font("body", "B", FONTS + "DejaVuSans-Bold.ttf")
    pdf.alias_nb_pages()

    # ---------------------------------------------------------------- cover
    pdf.add_page()
    pdf.set_fill_color(*MAROON)
    pdf.rect(0, 0, 210, 46, style="F")
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 46, 210, 1.2, style="F")

    pdf.set_xy(18, 11)
    pdf.set_font("body", "", 8)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 5, "F A S H I O N   J E W E L L E R Y", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(18, 18)
    pdf.set_font("display", "B", 24)
    pdf.set_text_color(*IVORY)
    pdf.cell(0, 11, "Website design and build", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(18)
    pdf.set_font("body", "", 9)
    pdf.set_text_color(*SAND)
    pdf.cell(0, 8, "Project estimate and scope sheet  ·  handcrafted Bengali jewellery, Kolkata",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # meta
    pdf.set_y(54)
    pdf.set_font("body", "", 8.5)
    meta = [
        ("Prepared for", "Fashion Jewellery, Baghajatin, Kolkata 700086"),
        ("Prepared by", "Sumit Nandi — design and front-end"),
        ("Date", "4 November 2026"),
        ("Reference", "FJ-WEB-2026-01"),
        ("Valid until", "4 December 2026"),
        ("Live preview", "fashion-jewellery.pages.dev"),
    ]
    left = 18
    for label, value in meta:
        pdf.set_xy(left, pdf.get_y())
        pdf.set_text_color(*MUTED)
        pdf.cell(34, 5.8, label.upper(), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_text_color(*INK)
        pdf.cell(0, 5.8, value, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # at a glance
    pdf.ln(4)
    boxes = [
        ("Fixed project price", "\u20b91,45,000", "106 hours at \u20b91,400/hr"),
        ("Timeline", "15 working days", "from advance and content"),
        ("To be delivered", "10 pages", "plus shared components"),
        ("Included", "2 revision rounds", "30-day bug warranty"),
    ]
    box_w = (174 - 3 * 5) / 4
    top = pdf.get_y()
    pdf.set_draw_color(*LINE)
    for index, (label, value, note) in enumerate(boxes):
        x = 18 + index * (box_w + 5)
        pdf.set_fill_color(*IVORY)
        pdf.rect(x, top, box_w, 24, style="DF")
        pdf.set_xy(x + 4, top + 4)
        pdf.set_font("body", "", 6.8)
        pdf.set_text_color(*GOLD)
        pdf.cell(box_w - 8, 4, label.upper())
        pdf.set_xy(x + 4, top + 8.6)
        size = 13
        pdf.set_font("display", "B", size)
        while size > 8 and pdf.get_string_width(value) > box_w - 8:
            size -= 0.4
            pdf.set_font("display", "B", size)
        pdf.set_text_color(*MAROON)
        pdf.cell(box_w - 8, 7, value)
        pdf.set_xy(x + 4, top + 16)
        pdf.set_font("body", "", 6.8)
        pdf.set_text_color(*MUTED)
        pdf.cell(box_w - 8, 4, note)
    pdf.set_y(top + 30)

    para(pdf,
         "A complete, mobile-first storefront: home, collections, three product pages, cart and four "
         "policy pages, with multi-currency pricing and WhatsApp ordering. The design stays quiet so "
         "the jewellery carries the page, and the build is plain HTML, CSS and JavaScript that can be "
         "hosted free and edited by hand. The build is already in preview, so these figures can be "
         "issued either as a proposal or as the scope and value statement for the completed work.")

    heading(pdf, "Scope of work")
    for title, detail in SCOPE:
        pdf.set_font("body", "B", 8.6)
        pdf.set_text_color(*MAROON)
        pdf.multi_cell(0, 4.9, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("body", "", 8.2)
        pdf.set_text_color(*MUTED)
        pdf.multi_cell(0, 4.7, detail, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1.0)

    # ------------------------------------------------------------- costs
    pdf.add_page()
    heading(pdf, "Itemised effort and cost", gap=0)

    head_style = FontFace(emphasis="BOLD", color=IVORY, fill_color=MAROON)
    pdf.set_text_color(*INK)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_font("body", "", 8.6)
    with pdf.table(
        col_widths=(10, 98, 26, 40),
        text_align=(Align.C, Align.L, Align.R, Align.R),
        headings_style=head_style,
        borders_layout="HORIZONTAL_LINES",
        line_height=6.2,
        padding=1.4,
    ) as table:
        header = table.row()
        for text in ("#", "Work package", "Hours", "Amount"):
            header.cell(text)
        for index, (name, hours, amount) in enumerate(COSTS, start=1):
            row = table.row()
            row.cell(str(index))
            row.cell(name)
            row.cell(hours)
            row.cell("\u20b9" + amount)
        total = table.row()
        total.cell("")
        total.cell("Total effort")
        total.cell("106")
        total.cell("\u20b91,48,400")

    pdf.ln(4)
    pdf.set_font("display", "B", 12)
    pdf.set_text_color(*MAROON)
    pdf.cell(0, 7, "Fixed project price:  \u20b91,45,000", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    para(pdf, "The effort total of \u20b91,48,400 is rounded down to a fixed price of \u20b91,45,000, which "
              "includes both the design work and the completed build. GST at 18% is additional where "
              "applicable; domain registration (about \u20b91,200 a year) and any paid third-party service "
              "are billed at cost. Rate basis: \u20b91,400 per hour, about \u20b911,200 per working day.",
              size=8.4, color=MUTED, lead=4.6)

    heading(pdf, "Timeline")
    pdf.set_text_color(*INK)
    pdf.set_font("body", "", 8.6)
    with pdf.table(
        col_widths=(128, 46),
        text_align=(Align.L, Align.R),
        headings_style=head_style,
        borders_layout="HORIZONTAL_LINES",
        line_height=6.2,
        padding=1.4,
    ) as table:
        header = table.row()
        header.cell("Stage")
        header.cell("Working days")
        for stage, day in TIMELINE:
            row = table.row()
            row.cell(stage)
            row.cell(day)

    para(pdf, "Content needed from you: product photographs, final prices and specifications, workshop "
              "story details and the email address for the contact line.", size=8.4, color=MUTED, lead=4.6)

    # ------------------------------------------------------------- terms
    pdf.add_page()
    heading(pdf, "Optional additions, quoted separately", gap=0)
    pdf.set_text_color(*INK)
    pdf.set_font("body", "", 8.6)
    with pdf.table(
        col_widths=(128, 46),
        text_align=(Align.L, Align.R),
        headings_style=head_style,
        borders_layout="HORIZONTAL_LINES",
        line_height=6.2,
        padding=1.4,
    ) as table:
        header = table.row()
        header.cell("Addition")
        header.cell("Price")
        for name, price in ADDONS:
            row = table.row()
            row.cell(name)
            row.cell("\u20b9" + price)

    heading(pdf, "Payment terms")
    para(pdf, "40% on approval of this estimate, 40% on design sign-off and 20% before go-live. Payment by "
              "bank transfer or UPI; invoices are raised with GST where applicable.", size=9, lead=5.2)

    heading(pdf, "Included")
    for item in (
        "Two rounds of revisions per page",
        "Testing on iOS Safari, Android Chrome, desktop Chrome, Safari and Firefox",
        "Accessibility labels, keyboard support and readable contrast",
        "30 days of bug fixes after launch",
        "Source files and documentation handed over on final payment",
    ):
        pdf.set_font("body", "", 8.8)
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 5.0, "\u2022   " + item, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    heading(pdf, "Not included")
    for item in (
        "Domain name, hosting or any third-party subscription fees",
        "Studio photography or model shoots",
        "Legal review of the policy text (drafted here, to be checked by your adviser)",
        "Paid stock imagery or commissioned illustration",
        "Content updates after the 30-day warranty (available under the care plan)",
    ):
        pdf.set_font("body", "", 8.8)
        pdf.set_text_color(*MUTED)
        pdf.multi_cell(0, 5.0, "\u2022   " + item, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(6)
    pdf.set_draw_color(*LINE)
    pdf.line(18, pdf.get_y(), 192, pdf.get_y())
    pdf.ln(5)
    para(pdf, "Acceptance", size=8, color=GOLD)
    pdf.set_font("display", "B", 11)
    pdf.set_text_color(*INK)
    pdf.ln(1)
    pdf.cell(0, 7, "Signature: ______________________________", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 7, "Name and date: ___________________________", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    para(pdf, "Any change to the scope is estimated and agreed in writing before the work continues.",
         size=8, color=MUTED)

    pdf.set_title("Fashion Jewellery \u2014 website design and build: project estimate")
    pdf.set_author("Sumit Nandi")
    pdf.set_subject("Project estimate and scope sheet, FJ-WEB-2026-01")
    pdf.set_creator("Fashion Jewellery")

    pdf.output("docs/Fashion-Jewellery-Website-Estimate.pdf")
    print("written", pdf.pages_count, "pages")


if __name__ == "__main__":
    build()
