"""Generate the client-facing project estimate PDF.

Usage:  python3 docs/build-estimate-pdf.py
Output: docs/Fashion-Jewellery-Website-Estimate.pdf  (two pages)
"""

from fpdf import FPDF
from fpdf.fonts import FontFace
from fpdf.enums import XPos, YPos, Align

MAROON = (110, 18, 36)
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
    ("Currency system", "INR, USD and GBP, chosen automatically from the visitor's country, manual choice saved."),
    ("Policy pages (4)", "Shipping, returns, privacy and terms on the shared page layout."),
    ("Responsive build", "Phone, tablet, landscape and desktop layouts, category list inside the menu."),
    ("Handover", "Hand-written HTML, CSS and JavaScript with no build step, accessibility labels and README."),
]

COSTS = [
    ("Design system and page designs", "12", "10,200"),
    ("Homepage, collections and three product pages", "22", "18,700"),
    ("Cart, quantities and WhatsApp ordering", "8", "6,800"),
    ("Multi-currency with country detection", "4", "3,400"),
    ("Policy pages (4) and contact details", "3", "2,550"),
    ("Copy polish and Bengali typography", "3", "2,550"),
    ("Testing, SEO basics, deployment and handover", "7", "5,950"),
    ("Project management and two revision rounds", "7", "5,950"),
]

RUNNING = [
    ("Domain name, e.g. fashionjewellery.in", "\u20b9900\u20131,500 / year", "  at the registrar"),
    ("Hosting on Cloudflare Pages", "Free", "  static, no server"),
    ("Care plan (optional)", "\u20b92,500 / month", "  monitoring, backups, 2 h of changes"),
    ("Professional email (optional)", "\u20b9150 / user / month", "  Google Workspace or similar"),
]

MILESTONES = [
    ("Advance received, content and images collected", "Day 0", "40%  \u00b7  \u20b922,000"),
    ("Design sign-off", "Day 5", "40%  \u00b7  \u20b922,000"),
    ("Launch on your domain", "Day 12", "20%  \u00b7  \u20b911,000"),
]


class Estimate(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_xy(18, 10)
        self.cell(0, 5, "FASHION JEWELLERY  \u00b7  WEBSITE ESTIMATE  \u00b7  FJ-WEB-2026-01", align="L")
        self.set_draw_color(*LINE)
        self.line(18, 16.5, 192, 16.5)
        self.set_y(24)

    def footer(self):
        self.set_y(-16)
        self.set_font("body", "", 7.5)
        self.set_text_color(*MUTED)
        self.set_draw_color(*LINE)
        self.line(18, self.get_y() - 3, 192, self.get_y() - 3)
        self.cell(0, 6, "Prepared by Sumit Nandi  \u00b7  valid until 4 December 2026", align="L")
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


def simple_table(pdf, headings, rows, widths, aligns, style, size=8.4):
    pdf.set_text_color(*INK)
    pdf.set_font("body", "", size)
    pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.15)
    with pdf.table(
        col_widths=widths,
        text_align=aligns,
        headings_style=style,
        borders_layout="HORIZONTAL_LINES",
        line_height=5.5,
        padding=1.0,
    ) as table:
        head = table.row()
        for text in headings:
            head.cell(text)
        for row in rows:
            cells = table.row()
            for text in row:
                cells.cell(text)


def build():
    pdf = Estimate(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(True, margin=20)
    pdf.set_margins(18, 18, 18)
    pdf.alias_nb_pages()

    pdf.add_font("display", "", FONTS + "DejaVuSerif.ttf")
    pdf.add_font("display", "B", FONTS + "DejaVuSerif-Bold.ttf")
    pdf.add_font("body", "", FONTS + "DejaVuSans.ttf")
    pdf.add_font("body", "B", FONTS + "DejaVuSans-Bold.ttf")

    head_style = FontFace(emphasis="BOLD", color=IVORY, fill_color=MAROON)

    # ---------------------------------------------------------------- page 1
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
    pdf.cell(0, 8, "Project estimate for a Kolkata startup  \u00b7  handcrafted Bengali jewellery",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(54)
    pdf.set_font("body", "", 8.5)
    meta = [
        ("Prepared for", "Fashion Jewellery, Baghajatin, Kolkata 700086"),
        ("Prepared by", "Sumit Nandi \u2014 design and front-end"),
        ("Date", "4 November 2026"),
        ("Reference", "FJ-WEB-2026-01"),
        ("Valid until", "4 December 2026"),
        ("Live preview", "fashion-jewellery.pages.dev"),
    ]
    for label, value in meta:
        pdf.set_xy(18, pdf.get_y())
        pdf.set_text_color(*MUTED)
        pdf.cell(34, 5.8, label.upper(), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_text_color(*INK)
        pdf.cell(0, 5.8, value, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)
    boxes = [
        ("Fixed project price", "\u20b955,000", "66 hours at \u20b9850/hr"),
        ("Timeline", "12 working days", "from advance and content"),
        ("To be delivered", "10 pages", "plus shared components"),
        ("Included", "2 revision rounds", "30-day bug warranty"),
    ]
    box_w = (174 - 3 * 5) / 4
    top = pdf.get_y()
    pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.2)
    for index, (label, value, note) in enumerate(boxes):
        x = 18 + index * (box_w + 5)
        pdf.set_fill_color(*IVORY)
        pdf.rect(x, top, box_w, 23, style="DF")
        pdf.set_xy(x + 4, top + 3.6)
        pdf.set_font("body", "", 6.8)
        pdf.set_text_color(*GOLD)
        pdf.cell(box_w - 8, 4, label.upper())
        pdf.set_xy(x + 4, top + 8.2)
        size = 13
        pdf.set_font("display", "B", size)
        while size > 8 and pdf.get_string_width(value) > box_w - 8:
            size -= 0.4
            pdf.set_font("display", "B", size)
        pdf.set_text_color(*MAROON)
        pdf.cell(box_w - 8, 7, value)
        pdf.set_xy(x + 4, top + 15.4)
        pdf.set_font("body", "", 6.8)
        pdf.set_text_color(*MUTED)
        pdf.cell(box_w - 8, 4, note)
    pdf.set_y(top + 29)

    para(pdf,
         "A compact, mobile-first storefront for Fashion Jewellery: home, collections, three product pages, "
         "cart and four policy pages, with multi-currency pricing and ordering handed off to WhatsApp. The "
         "build is plain HTML, CSS and JavaScript, hosted free, so the running cost stays close to zero "
         "while the shop grows.", size=9, lead=5.0)

    heading(pdf, "What the shop gets")
    for title, detail in SCOPE:
        pdf.set_font("body", "B", 8.6)
        pdf.set_text_color(*MAROON)
        pdf.multi_cell(0, 4.9, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("body", "", 8.2)
        pdf.set_text_color(*MUTED)
        pdf.multi_cell(0, 4.7, detail, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(0.7)

    heading(pdf, "Included and not included", gap=3)
    para(pdf, "Included: two rounds of revisions per page, testing on iOS, Android and desktop browsers, "
              "accessibility labels and keyboard support, 30 days of bug fixes after launch, and the source "
              "files with documentation on final payment.", size=8.3, color=INK, lead=4.5)
    pdf.ln(1.2)
    para(pdf, "Not included: domain and hosting fees, studio photography, legal review of the policy text, "
              "paid stock imagery, and content updates after the warranty \u2014 available through the care "
              "plan or quoted separately.", size=8.3, color=MUTED, lead=4.5)

    # ---------------------------------------------------------------- page 2
    pdf.add_page()
    heading(pdf, "Investment", gap=0)
    rows = [(str(i), name, hours, "\u20b9" + amount) for i, (name, hours, amount) in enumerate(COSTS, start=1)]
    rows.append(("", "Total effort", "66", "\u20b956,100"))
    simple_table(pdf, ("#", "Work package", "Hours", "Amount"), rows,
                 (10, 98, 26, 40), (Align.C, Align.L, Align.R, Align.R), head_style)

    pdf.ln(3.5)
    pdf.set_font("display", "B", 12)
    pdf.set_text_color(*MAROON)
    pdf.cell(0, 7, "Startup price:  \u20b955,000  (all inclusive)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    para(pdf, "The effort total of \u20b956,100 is rounded down to a flat \u20b955,000 for the whole build, "
              "design and handover included. There is no monthly fee to us; everything below is optional.",
         size=8.4, color=MUTED, lead=4.6)

    heading(pdf, "Domain, hosting and maintenance")
    simple_table(pdf, ("Item", "Cost", "Notes"), RUNNING,
                 (72, 38, 64), (Align.L, Align.R, Align.L), head_style)
    para(pdf, "The first 30 days after launch are covered for fixes and small adjustments at no charge.",
         size=8.2, color=MUTED, lead=4.5)

    heading(pdf, "Milestones and payment")
    simple_table(pdf, ("Stage", "Day", "Payment"), MILESTONES,
                 (96, 26, 52), (Align.L, Align.R, Align.R), head_style)
    para(pdf, "Bank transfer or UPI. Please send product photographs, final prices and specifications, "
              "workshop story details and the email address for the contact line.",
         size=8.2, color=MUTED, lead=4.5)

    pdf.ln(4)
    pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.2)
    pdf.line(18, pdf.get_y(), 192, pdf.get_y())
    pdf.ln(4)
    para(pdf, "Acceptance", size=8, color=GOLD)
    pdf.ln(1)
    pdf.set_font("display", "B", 10.5)
    pdf.set_text_color(*INK)
    pdf.cell(90, 6.5, "Signature: ______________________", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 6.5, "Date: ______________", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.5)
    para(pdf, "Any change to the scope is estimated and agreed in writing before the work continues.",
         size=7.8, color=MUTED)

    pdf.set_title("Fashion Jewellery \u2014 website design and build: project estimate")
    pdf.set_author("Sumit Nandi")
    pdf.set_subject("Project estimate and scope sheet, FJ-WEB-2026-01")
    pdf.set_creator("Fashion Jewellery")

    pdf.output("docs/Fashion-Jewellery-Website-Estimate.pdf")
    print("written", pdf.pages_count, "pages")


if __name__ == "__main__":
    build()
