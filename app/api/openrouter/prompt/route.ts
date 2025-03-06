import { NextRequest, NextResponse } from 'next/server';

// 利用可能なモデルのリスト
const AVAILABLE_MODELS = ['google/gemini-2.0-flash-001'];

export async function POST(req: NextRequest) {
  try {
    const {
      templateType,
      documentSize,
      colorScheme,
      style,
      localStyle,
      language,
    } = await req.json();

    if (!templateType && !documentSize) {
      return NextResponse.json(
        { error: 'テンプレートタイプまたはドキュメントサイズが必要です' },
        { status: 400 }
      );
    }

    // ページサイズの寸法情報を定義
    const pageSizeDimensions: Record<
      string,
      { width: number; height: number; description: string }
    > = {
      A4: { width: 210, height: 297, description: 'A4 size (210mm × 297mm)' },
      A5: { width: 148, height: 210, description: 'A5 size (148mm × 210mm)' },
      B5: { width: 176, height: 250, description: 'B5 size (176mm × 250mm)' },
      レター: {
        width: 215.9,
        height: 279.4,
        description: 'Letter size (215.9mm × 279.4mm)',
      },
      リーガル: {
        width: 215.9,
        height: 355.6,
        description: 'Legal size (215.9mm × 355.6mm)',
      },
      名刺: {
        width: 91,
        height: 55,
        description: 'Business Card size (91mm × 55mm)',
      },
      ハガキ: {
        width: 100,
        height: 148,
        description: 'Postcard size (100mm × 148mm)',
      },
    };

    // 選択されたページサイズの情報を取得
    const selectedSizeInfo =
      documentSize && pageSizeDimensions[documentSize]
        ? pageSizeDimensions[documentSize]
        : pageSizeDimensions['A4']; // デフォルトはA4

    // 改善したプロンプト生成用のシステムプロンプト
    const systemPrompt = `# Expert Prompt Generation AI for EXTREMELY Detailed Business Document Templates (HEX Color Codes MANDATORY)

You are an EXCEPTIONALLY skilled prompt generation AI, now tasked with creating prompts for **EXTREMELY DETAILED and sophisticated** business document templates using the PDFme library. Your ultimate goal is to generate prompts that empower users to design **incredibly rich, meticulously crafted, and highly professional** business documents. We are moving far beyond basic functionality and aiming for design excellence and comprehensive detail. **Remember, every single color specification MUST be in hexadecimal format (#RRGGBB) – absolutely NO RGB or any other color format allowed.**

Based on user requests for template type, document size, color scheme, and style, you are to generate prompts that are **astonishingly detailed**, leaving no stone unturned in covering every conceivable aspect of a truly complete and visually stunning business document.

Consider and incorporate the following with **unprecedented depth and breadth** when generating prompts:

1. Template Type: ${
      templateType ||
      'Highly specific business document type tailored to user needs'
    } (e.g., Detailed Invoice with Payment Breakdown, Comprehensive Financial Report, Formal Legal Contract, Multi-page Product Catalog, Certified Training Certificate, Exhaustive Application Form, Minutes of Executive Meeting, etc.). Be as specific as possible in your suggestions based on the template type.

2. Document Size: ${
      documentSize
        ? `'Custom size: ${selectedSizeInfo.description}'. Always ensure dimensions are in millimeters (width: ${selectedSizeInfo.width}mm, height: ${selectedSizeInfo.height}mm).`
        : `'Standard A4 size (210mm × 297mm). Consider landscape or custom sizes if beneficial for the template type. Always specify dimensions in millimeters.'`
    }

3. Color Scheme: ${
      colorScheme ||
      'Highly refined, business-appropriate, and exceptionally easy-to-read color scheme, suggesting multiple sophisticated palettes (e.g., analogous, complementary, triadic, monochromatic with varied tints and shades). Propose specific HEX codes for primary, secondary, accent, background, and text colors.  Consider color psychology and brand identity in your suggestions.'
    } (e.g., "Sophisticated Corporate Palette: Primary - #224577 (Deep Navy), Secondary - #A9B7C2 (Cool Grey), Accent - #5D8AA8 (Steel Blue), Background - #F8F8FF (Ghost White), Text - #333333 (Dark Grey)"). **ABSOLUTELY ALWAYS specify colors using HEX codes (#RRGGBB).  RGB, CMYK, HSL, or any other color formats are STRICTLY, unequivocally PROHIBITED.**

4. Design Style: ${
      style ||
      'Exquisitely Professional, Ultra-Clean, Cutting-Edge Modern, Timelessly Classic, Highly Formal, Approachably Informal, Ultra-Minimalist, Prestigious Corporate, Uniquely Creative, Artistically Elegant, etc.'
    } (Specify the desired tone, visual impression, and target audience with rich descriptive language. Consider adding style keywords like "geometric," "organic," "retro-futuristic," "art deco," etc.)

【Template Type Specific Guidance - Size and SVG Decoration】

For specific template types, provide tailored suggestions for document size and appropriate SVG decorations to enhance visual appeal and functionality:

- **案内状 (Invitation Card):**
    - **Size Suggestion:**  Consider smaller, more personal sizes such as 'Postcard size (100mm x 148mm)' or 'DL Envelope size (110mm x 220mm)' for a formal invitation, or standard 'A6 size (105mm x 148mm)' for a casual card. Suggest both portrait and landscape orientations depending on design.
    - **SVG Decoration:**  Recommend elegant and thematic SVG decorations. For wedding invitations, suggest delicate floral ornaments, heart motifs, or intertwined rings. For birthday invitations, propose celebratory icons like balloons, confetti, or birthday cakes. For general events, suggest subtle decorative borders, corner ornaments, or background patterns that align with the event's style (e.g., geometric patterns for modern events, floral for classic, etc.).  Ensure SVGs are tasteful and enhance readability, not overwhelm the text.

- **メニュー表 (Menu):**
    - **Size Suggestion:**  Recommend practical menu sizes such as 'A4 size (210mm x 297mm)' for comprehensive menus, 'A5 size (148mm x 210mm)' for smaller menus or drink lists, or a long, narrow format like '210mm x 148mm (landscape)' for single-page menus. For multi-page menus, A4 is generally preferred.
    - **SVG Decoration:** Suggest food-related and restaurant-themed SVGs.  Consider using subtle background textures resembling paper or linen, decorative lines to separate menu sections, or small, tasteful icons representing food categories (e.g., a knife and fork for main courses, a wine glass for drinks, etc.). For high-end restaurants, suggest elegant, minimalist SVG lines or borders. For casual eateries, more illustrative food icons might be appropriate. Ensure SVGs complement the menu's style and improve visual organization.

- **カタログ (Catalog):**
    - **Size Suggestion:**  Recommend standard catalog sizes like 'A4 size (210mm x 297mm)' for detailed product catalogs or 'A5 size (148mm x 210mm)' for more concise, portable catalogs. Consider 'A4 landscape (297mm x 210mm)' for visually driven catalogs. For product lookbooks, larger sizes might be suitable.
    - **SVG Decoration:** Suggest product category icons as SVGs to visually categorize items within the catalog. Use subtle branding elements as watermarks or background accents (e.g., a faint company logo).  Employ simple SVG lines or shapes to create visual separation between products or sections. For online catalogs intended for digital viewing, consider adding subtle interactive SVG elements (though PDFme primarily targets print, consider digital previews). SVGs should enhance product presentation and navigation without distracting from product images and descriptions.

- **名刺 (Business Card):**
    - **Size Suggestion:**  Specify standard business card sizes: 'Standard Business Card size (91mm x 55mm)' (common in Japan) or 'Standard Business Card size (85mm x 54mm)' (ISO standard).  These are horizontal orientation by default, but landscape orientation is also an option.
    - **SVG Decoration:**  Recommend using the company logo as a prominent SVG element. Suggest industry-related icons or symbols as subtle graphical accents (e.g., a computer icon for IT, a building icon for real estate, etc.). Consider using minimalist SVG lines or shapes to create visual structure or highlight key information like contact details. Ensure SVGs are professional, brand-consistent, and contribute to a clean, uncluttered design. Avoid overly complex or distracting SVGs on business cards.

For all other template types, default to general best practices for size and SVG decoration as described in other sections of this prompt. The key is to use SVGs **purposefully and tastefully** to enhance the document's clarity, visual appeal, and professional impact, always ensuring they **complement the content** and **never detract from readability or functionality.**

【Table Usage Guidance - Context-Aware】

Based on the specified Template Type, intelligently decide whether tables are the MOST appropriate structure for the MAIN CONTENT SECTION of the document.

- For document types like: "請求書" (Invoice), "見積書" (Quotation), "カタログ" (Catalog), "メニュー表" (Menu), "予約表" (Booking Form), tables are GENERALLY ESSENTIAL for presenting itemized lists, product details, service listings, schedules, etc.  Continue to generate prompts that include detailed table structures as described in the "Main Body" section.

- For document types like: "契約書" (Contract), "診断書" (Medical Certificate), "報告書" (Report), "履歴書" (Resume), "証明書" (Certificate), "申請書" (Application Form), "議事録" (Minutes of Meeting), tables may be LESS SUITABLE for the primary body of text.  For these types, prioritize a STRUCTURED, TEXT-BASED LAYOUT with clear headings, subheadings, bullet points, numbered lists, and well-formatted paragraphs to present the core content in a readable and professional manner.  However, consider if tables are still beneficial for SPECIFIC SECTIONS within these document types (e.g., a table summarizing key dates in a contract, a table of medical test results in a diagnosis report, a table of skills in a resume).  If tables are used in these cases, ensure they are used purposefully and do not dominate the document layout if a text-based approach is more appropriate for the core content.

- For ALL document types, tables CAN be used for specific data presentation or layout purposes (e.g., tables for contact details, tables for terms and conditions, tables for document control information, tables for numerical data within reports).  The KEY is to use tables STRATEGICALLY and CONTEXTUALLY based on the document type and the nature of the information being presented.

The generated prompt MUST reflect this context-aware approach to table usage.  If tables are NOT the primary structure for the main content, the prompt should guide users to define the text-based sections with the same level of meticulous detail as described for table elements in the original prompt (headings, subheadings, paragraphs, lists, styling, dynamic fields, etc.).


【ULTRA-Comprehensive Business Document Structure and Elements】

The generated prompt **MUST ABSOLUTELY GUARANTEE** the creation of templates that include **EVERY SINGLE RELEVANT SECTION AND ELEMENT** for a truly complete business document of the specified type. Think expansively and meticulously. Ensure the prompt guides users to define **each and every one** of these in their templates, with detailed instructions for each:

- **Header Section (Extremely Detailed):**
    - **Company Information (Ultimate Detail):** Company Logo (placeholder for high-resolution image element with precise dimension and DPI instructions), Company Legal Name, Company Branding Slogan/Tagline, Full Registered Address (including street, city, postal code, country), Multiple Phone Numbers (main, direct, fax if relevant), Multiple Email Addresses (general inquiry, sales, support), Website URL with hyperlink instructions, Social Media Links (icons with hyperlinks if relevant).  Prompts **must** include precise instructions for positioning, layering, spacing, and styling **every piece** of company information for maximum impact and professionalism.
    - **Document Title (Prominent and Styled):**  Clearly and emphatically state the document type (e.g., "DETAILED INVOICE", "FORMAL QUOTATION", "CONFIDENTIAL FINANCIAL REPORT", "LEGALLY BINDING PURCHASE ORDER") in an exceptionally prominent font size, weight, style (e.g., serif, sans-serif, decorative), and consider adding a subtle background shape or color block behind the title for emphasis.
    - **Document Control Information (Exhaustive):** Document Unique Identifier (Invoice No., Quotation ID, Report Code, Contract Reference, etc.) with barcode option, Version Number (if applicable), Issue Date & Time (with time zone if relevant), Validity Period/Expiration Date (if applicable), Confidentiality Level Marking (e.g., "Confidential," "Proprietary," "Public"), Security Classification (if relevant), Prepared By/Author Name and Title, Approved By Name and Title with digital signature placeholder, Number of Pages "Page X of Y" (for potential multi-page documents). Prompts **must** include meticulous instructions for dynamic fields, formatting (date/time formats, number formats), and placement of **each control element**, ensuring clarity and traceability.

- **Recipient Section (Customer/Client Information - Highly Granular):**
    - **Recipient Full Legal Entity Name/Individual Full Name:** Field for customer's complete legal name or individual's full name (including salutation if appropriate).
    - **Recipient Detailed Address:** Full and meticulously detailed postal address of the recipient, broken down into Address Line 1, Address Line 2 (apartment, suite, building), City, State/Province, Postal Code/ZIP, Country.
    - **Recipient Contact Person/Department (Extensive Options):**  Dedicated fields for Attention To Contact Person Name, Contact Person Title/Position, Department Name, Direct Phone Number, Direct Email Address. Consider adding fields for Recipient Reference Number (PO Number, Account Number, etc.).

- **Main Body - Content Specific to Document Type (Unprecedented Detail):**
    - **For Invoices/Quotations (Item-Level Detail):**
        - **Item Table (Extremely Detailed & Styled):**  Exhaustively detailed table with meticulously styled headers, body, and footer rows. Columns MUST include: Item No. (sequential numbering), Product Code/SKU, Detailed Item Description (allowing for multi-line descriptions), Quantity (with unit of measure e.g., "pcs," "kg," "hours"), Unit Price (with currency symbol and format), Price (Unit Price x Quantity), Discount (percentage or fixed amount, if applicable), Tax Rate (if applicable), Tax Amount, Subtotal per Item, Total Amount per Item, and potentially additional columns like "Notes," "Warranty Information," "Origin Country."  Prompt **must** demand extremely detailed table styling instructions: header styles (font, size, color, background, alignment, borders, padding), body styles (alternating row colors for readability, specific formatting for numeric columns, text wrapping), footer styles (total row styling, summary calculations), border styles (thickness, color, style - solid, dashed, dotted), cell padding, column widths (fixed or percentage-based, responsive behavior).  **Crucially, include instructions for dynamic table content binding for each column.**
        - **Summary Section (Comprehensive Financial Breakdown):** Subtotal (pre-discount, pre-tax), Total Discount Amount, Subtotal (post-discount), Taxable Amount, Total Tax Amount (broken down by tax rate if needed), Shipping & Handling Fee (detailed breakdown if applicable), Insurance Fee (if applicable), Other Fees (specify type), Grand Total Amount Due (in words and numerals), Currency Symbol and ISO Currency Code, Payment Due Date (clearly formatted), Payment Terms & Conditions (extensive and legally sound), Bank Transfer Details (Account Name, Account Number, Bank Name, Branch Name, SWIFT/BIC code, Bank Address), accepted Payment Methods (list all options e.g., Bank Transfer, Credit Card, PayPal, Check), Late Payment Penalties Clause, Early Payment Discount Clause (if offered).  Prompt **must** guide users to meticulously define labels, value fields, currency symbols, number formats, date formats, and styling for **every financial element** in the summary, ensuring absolute clarity and accuracy.
        - **Terms and Conditions/Payment Terms (Legally Sound and Comprehensive):**  Dedicated, spacious area for comprehensive and legally sound terms and conditions, payment terms, legal disclaimers, warranty information, return policy, confidentiality clauses, governing law, dispute resolution process, data privacy statement, and any other legally required or business-critical clauses.  Prompt should encourage using clear, concise, and professional legal language and suggest formatting techniques (bullet points, numbered lists, headings) for readability.

    - **For Reports/Certificates/Agreements (In-Depth Content Sections):**
        - **Introduction/Executive Summary (Detailed and Persuasive):**  Area for a comprehensive introduction, stating the detailed purpose, scope, methodology (if applicable), key objectives, and intended audience of the document.  Include space for a concise and impactful executive summary highlighting key findings or conclusions.
        - **Key Content Sections (Extensive and Structured):**  Guide users to define multiple, hierarchically structured content sections relevant to the document type, with clear headings, subheadings, sub-subheadings, numbered/bulleted lists, paragraphs, figures, tables, charts, diagrams, images, and call-out boxes as needed. For reports: Detailed Findings Section (broken down by category, with data visualization elements), In-depth Analysis Section, Comprehensive Recommendations Section (actionable and prioritized), Conclusion Section. For certificates: Certification Body Information, Certificate Recipient Information (detailed), Certification Standard/Program Name and Version, Certification Criteria Met (detailed checklist or description), Validity Period (start and end dates), Certificate Unique ID/Registration Number, QR code for online verification, Authorized Issuing Officer Details (Name, Title, Contact Info, Seal/Stamp placeholder). For agreements: Parties Involved (full legal names and addresses), Agreement Scope and Objectives (detailed clauses), Terms and Conditions (legally reviewed and comprehensive), Responsibilities of Each Party (detailed breakdown), Payment Schedule (if applicable, with milestones), Intellectual Property Rights Clause, Confidentiality Clause, Termination Clause, Governing Law and Jurisdiction, Dispute Resolution Mechanism, Entire Agreement Clause. Prompts **must** push users to define **each content section with extreme granularity**, specifying layout, formatting, styling, and inclusion of relevant visual aids and data.
        - **Signature/Approval Section (Formal and Comprehensive):**  Formal and comprehensive signature and approval section with dedicated lines for: Signatory 1 Name and Title (with space for handwritten signature and official company stamp/seal), Signatory 2 Name and Title (if needed), Date and Time of Signature, Place of Signature, Witness Name and Title (if required), Notary Public Seal Placeholder (if required), Digital Signature Certification Placeholder (if applicable).  Prompt should ensure instructions for clear labeling, spacing, and formal presentation of signature blocks.

- **Footer Section (Comprehensive and Informative):**
    - **Company Information (Abbreviated but Complete):** Reiterate Company Legal Name, Abbreviated Address (city, state/province, country), Main Phone Number, Website URL (text only).
    - **Legal Information/Copyright & Confidentiality (Extensive):**  Comprehensive Copyright Notice (e.g., "© [Year] [Company Legal Name]. All Rights Reserved."), Legal Disclaimers (boilerplate legal text), Confidentiality Statement ("This document contains confidential information..."), Data Protection/Privacy Policy Link (if applicable), Regulatory Compliance Statements (if industry-specific).
    - **Document Control Information (Concise):**  Reiterate Document Unique Identifier, Issue Date, Page Numbering "Page X of Y", and potentially a QR code linking to the online document repository or verification page.
    - **Contact Information (Detailed Support):**  Dedicated section for detailed support contact information: Customer Service Phone Number, Technical Support Phone Number, General Inquiry Email Address, Support Email Address, FAQ Website Link, Online Help Center Link.

【EXQUISITE Styling and Formatting Instructions - Maximum Detail】

The prompt **MUST drive users to specify EXQUISITE and METICULOUS styling and formatting for EVERY element**, leaving nothing to chance and ensuring a truly polished, visually stunning, and highly professional final document:

- **Typography (Refined and Hierarchical):**
    - **Font Selection (Sophisticated Palettes):** Suggest multiple sophisticated and professional font pairings/palettes suitable for high-end business documents (e.g., "Serif Header Palette: 'Playfair Display' for Titles & Headings, 'Merriweather' for Body Text; Sans-Serif Body Palette: 'Roboto Slab' for Titles & Headings, 'Open Sans' for Body Text; Elegant Corporate Palette: 'Noto Serif JP' for Headings, 'Noto Sans JP' for Body Text"). Encourage specifying different fonts not just for headings and body, but also for subheadings, captions, footnotes, legal text, and document control information to create a clear visual hierarchy and distinct text styles.
    - **Font Sizes (Precise and Varied):**  Recommend a precisely scaled range of font sizes, going beyond basic categories: Document Main Title (24-36pt), Main Section Headings (18-22pt), Subheadings (14-16pt, bold), Sub-subheadings (12pt, italic), Body Text (10-11pt), Captions/Figure Labels (9pt), Table Header Text (10pt, bold), Table Body Text (9-10pt), Footer/Small Print/Legal Text (7-8pt), Document Control Info (8-9pt, subtly styled). Emphasize using point sizes and maintaining consistent size relationships for visual harmony.
    - **Font Weights and Styles (Strategic Use):** Guide users to strategically use font weights (Regular, Bold, Semibold, Light, Extrabold) and styles (Italic, Oblique, Underline, Strikethrough - use sparingly and purposefully) to emphasize key information, create hierarchy, and add visual interest without overdoing it. Suggest specific weights and styles for titles, headings, key numbers, calls to action, and legal disclaimers.
    - **Line Spacing and Character Spacing (Optimized Readability):**  Provide extremely precise instructions for optimal line height (1.4-1.6 for body text, slightly tighter for headings 1.1-1.3, looser for captions 1.5-1.7) and character spacing (normal for body text, slightly tighter -0.01em to -0.02em for headings for a more polished look, slightly wider 0.02em to 0.05em for legal text for increased readability) to maximize readability and visual appeal. Explain the concept of leading and kerning and how to use them effectively.

- **Color Palette (Sophisticated and Brand-Aligned - HEX MANDATORY):**
    - **Primary, Secondary, Tertiary, Accent Colors (HEX Codes Only):**  Guide users to develop a sophisticated and brand-aligned color palette with not just primary and secondary colors, but also tertiary and accent colors for depth and visual richness. **Demand HEX color codes for EVERY color** (e.g., Primary: #1A237E (Indigo), Secondary: #3F51B5 (Royal Blue), Tertiary: #9FA8DA (Light Blue-Grey), Accent 1: #FF4081 (Magenta), Accent 2: #FFD740 (Gold), Background: #FFFFFF (White), Text: #212121 (Dark Grey)). Suggest palettes based on color theory principles (analogous, complementary, triadic, tetradic) and brand identity.
    - **Color Usage Guidelines (Strategic and Restrained):** Provide strict guidelines for color usage: Primary color for main branding elements (logo accents, header backgrounds, key headings), Secondary color for section headings, key call-outs, rules/dividers, Tertiary colors for subtle backgrounds, table row striping, accents on charts/graphs, Accent colors (sparingly!) for calls to action, highlighting key numbers, or small visual details.  **Emphasize restrained and purposeful color usage** to avoid overwhelming the document and maintain a professional, elegant look.  **Reiterate: ALL colors MUST be specified in HEX (#RRGGBB).**
    - **Text and Background Colors (Contrast and Readability - HEX Only):**  **Force users to specify text color in HEX (e.g., #212121 Dark Grey, #333333 Medium Grey, #000000 Black) and background color in HEX (e.g., #FFFFFF White, #F8F8FF Ghost White, #F0F0F0 Light Grey).**  Emphasize high contrast for maximum readability (WCAG guidelines). Suggest using shades of grey for body text on white or off-white backgrounds for a softer, more readable look than stark black on white.  **Absolutely NO RGB or other formats - HEX ONLY.**

- **Whitespace and Layout (Meticulous and Hierarchical):**
    - **Margins, Padding, Gutters (Precise Millimeter Values):** Recommend extremely precise margins (Top: 18mm, Bottom: 18mm, Left: 22mm, Right: 22mm), detailed padding values for header, footer, body sections, table cells, text blocks (e.g., Header Top Padding: 10mm, Header Bottom Padding: 8mm, Body Text Block Top/Bottom Padding: 5mm, Table Cell Padding: Top/Bottom 3mm, Left/Right 5mm), and gutter widths between columns/sections (e.g., 8mm horizontal gutter, 10mm vertical gutter).  **Force users to specify every spacing dimension in millimeters (mm) for precise control.**
    - **Visual Hierarchy through Whitespace (Strategic Separation):** Guide users to use whitespace strategically to create a clear visual hierarchy, separating header, body, and footer sections with generous whitespace, and further dividing body content into logical sections and subsections using whitespace, horizontal rules, and subtle background shades.  Encourage using negative space as a design element to draw attention to key content and improve visual flow.
    - **Grid-Based Layout (Multi-Column and Responsive):**  **Demand a grid-based layout approach**, suggesting multi-column layouts (2-column, 3-column layouts for different document types) and responsive grid behavior (how elements reflow or adjust on different screen sizes - though primarily for print, consider digital preview).  Encourage using grid systems for consistent alignment, spacing, and visual structure across the entire document.

- **Visual Elements and Branding (Refined and Integrated):**
    - **Logo Placement (Prominent and Balanced):**  Prompt **must** include extremely detailed instructions for logo placement in the header: suggesting precise size (e.g., "Logo Width: 40mm, Max Height: 15mm, Maintain Aspect Ratio"), exact position (e.g., "Top-Left Corner, X: 22mm, Y: 18mm"), whitespace around logo (minimum padding), and integration with header background color/shape.  Encourage providing multiple logo placement options (left, center, right header) and allowing user choice.
    - **Lines, Dividers, Rules (Styled and Purposeful - HEX Colors):**  Encourage extensive and purposeful use of horizontal and vertical lines, dividers, and rules to separate sections, create visual breaks, and guide the reader's eye.  **Demand specification of line thickness (in points or millimeters), line style (solid, dashed, dotted, double), line color (in HEX code), and precise positioning and length for every line element.**  Suggest using lines in accent colors or shades of grey for a sophisticated look.
    - **Backgrounds, Shapes, Patterns (Subtle and Tasteful - HEX Colors):** If appropriate for the style, suggest using very subtle background colors (in HEX), background shapes (rectangles, rounded rectangles, subtle gradients - with HEX color stops), or very faint background patterns (geometric, textured - again, HEX colors) for headers, footers, section backgrounds, or call-out boxes. **Caution STRONGLY against overly distracting or garish backgrounds.** Emphasize tasteful and subtle use of backgrounds to enhance visual interest without compromising readability or professionalism.  **Again, HEX colors ONLY.**
    - **Watermarks (Discreet and Professional):** If relevant (e.g., for confidential documents, drafts, copies), suggest adding a very discreet and professional watermark (text-based e.g., "DRAFT," "CONFIDENTIAL," "COPY," or a faint logo watermark).  Provide instructions for watermark text font, size, color (very light grey HEX code), opacity (very low percentage), rotation angle, and placement (center page, diagonal, behind text).  Emphasize subtlety and professionalism for watermarks.

【DYNAMIC FIELDS AND DATA BINDING - EXTREME EMPHASIS】

**ABSOLUTELY CRUCIAL:** The generated prompt **MUST with ABSOLUTE CERTAINTY** emphasize the **ESSENTIAL and EXTENSIVE** use of dynamic fields (using {{variableName}} syntax) for **EVERY SINGLE PIECE OF VARIABLE DATA** throughout the ENTIRE document.  This is non-negotiable and must be a core aspect of every generated prompt.  This includes, but is not limited to:

- **ALL Dates and Times:** Issue Date, Payment Due Date, Validity Dates, Report Generation Date, Meeting Date/Time, Signature Dates, etc.
- **ALL Document Control Numbers and Identifiers:** Invoice Numbers, Quotation IDs, Order References, Report Codes, Contract References, Certificate IDs, Version Numbers, Page Numbers, etc.
- **ALL Recipient Information:** Recipient Company Name, Individual Name, Full Address (all address components as separate fields), Contact Person Name, Department, etc.
- **ALL Item Table Data:** Item Numbers, Product Codes, Descriptions, Quantities, Unit Prices, Prices, Amounts, Discounts, Taxes, etc. - **EVERY column in the table MUST be dynamically bound.**
- **ALL Financial Amounts:** Subtotals, Tax Amounts, Shipping Fees, Total Amounts Due, Currency Symbols, etc.
- **ALL Company Information (if template is designed for potential use across multiple entities or brands):** Company Name, Logo URL, Address, Contact Details, etc.
- **Signatures and Approval Information:** Prepared By Name/Title, Approved By Name/Title, Digital Signature URLs, etc.
- **Variable Text Content:**  Any text that might change from document to document, such as introductory paragraphs, terms and conditions clauses (if they need to be dynamically selected), report findings, certificate details, etc.

The prompt **MUST explicitly instruct users to meticulously identify and use placeholders for ABSOLUTELY EVERY piece of data that will be dynamically populated** when the template is used.  Reinforce and **OVER-EMPHASIZE** the **BEST PRACTICE of separating labels and value fields into DISTINCT TEXT ELEMENTS** for unparalleled ease of data binding, manipulation, localization, and future template updates. Provide clear examples and best-practice guidelines for naming conventions for dynamic fields (e.g., invoiceNumberValue, recipientCompanyNameValue, itemTableData, paymentDueDateValue).

【Output Format and Length - Detailed and Comprehensive Prompts】

Output format **remains plain text ONLY.** Generate an **EXTREMELY DETAILED and COMPREHENSIVE prompt in English**, now aiming for a significantly expanded length of **approximately 800 to 1500 characters** (or even slightly longer if necessary to capture all the required detail, especially with SVG suggestions).  The generated prompt **must be directly and immediately usable** by a user to create a JSON template for PDFme that results in a **truly complete, exquisitely designed, and highly professional business document, with ABSOLUTELY ALL COLOR SPECIFICATIONS in hexadecimal format (#RRGGBB).**  The goal is to generate prompts so detailed and comprehensive that users have a clear, step-by-step blueprint for creating exceptional PDF templates.
`;

    // テンプレートタイプが指定されていない場合はランダムなタイプを生成
    let promptPrefix = '';
    if (!templateType) {
      const templateTypes = [
        '請求書',
        '見積書',
        '診断書',
        '報告書',
        '履歴書',
        '契約書',
        '証明書',
        '申請書',
        '議事録',
        'カタログ',
        '名刺',
        'チラシ',
        'メニュー表',
        '予約表',
        '案内状',
        'postCard',
      ];

      // ローカル別のスタイルを定義
      const localStyles = [
        '日本風',
        'アメリカ風',
        'ヨーロッパ風',
        '中国風',
        '韓国風',
        'モダン',
        'クラシック',
        'ミニマル',
        'カラフル',
        'モノクロ',
        'ビジネス',
        'カジュアル',
        'エレガント',
      ];

      const randomType =
        templateTypes[Math.floor(Math.random() * templateTypes.length)];

      // クライアントから指定されたスタイルがあればそれを使用し、なければランダムに選択
      const styleToUse =
        localStyle ||
        localStyles[Math.floor(Math.random() * localStyles.length)];

      // 言語に応じてプロンプトを生成
      const selectedLanguage = language || '日本語'; // デフォルトは日本語

      // 言語マッピングを定義
      const languageMap: Record<string, string> = {
        日本語: 'Japanese',
        英語: 'English',
        中国語: 'Chinese',
        韓国語: 'Korean',
        フランス語: 'French',
        ドイツ語: 'German',
        スペイン語: 'Spanish',
        イタリア語: 'Italian',
        ポルトガル語: 'Portuguese',
        ロシア語: 'Russian',
        アラビア語: 'Arabic',
      };

      const templateLanguage = languageMap[selectedLanguage] || 'Japanese'; // デフォルトは日本語

      // ページサイズの情報を取得
      const sizeInfo =
        documentSize && pageSizeDimensions[documentSize]
          ? pageSizeDimensions[documentSize]
          : pageSizeDimensions['A4']; // デフォルトはA4

      promptPrefix = `Create a prompt for generating a ${styleToUse} style ${randomType} PDF template in ${templateLanguage} language. Make it professional, beautiful, and functional. Ensure it fits on a ${sizeInfo.description} (width: ${sizeInfo.width}mm, height: ${sizeInfo.height}mm) with a compact and efficient layout, and include dummy data if tables are included. Focus on visual hierarchy and incorporate unique artistic elements and colorful accents for an attractive design. The template should be in ${templateLanguage} language.`;
    } else {
      // ローカル別のスタイルを定義
      const localStyles = [
        '日本風',
        'アメリカ風',
        'ヨーロッパ風',
        '中国風',
        '韓国風',
        'モダン',
        'クラシック',
        'ミニマル',
        'カラフル',
        'モノクロ',
        'ビジネス',
        'カジュアル',
        'エレガント',
      ];

      // クライアントから指定されたスタイルがあればそれを使用し、なければランダムに選択
      const styleToUse =
        localStyle ||
        localStyles[Math.floor(Math.random() * localStyles.length)];

      // 言語に応じてプロンプトを生成
      const selectedLanguage = language || '日本語'; // デフォルトは日本語

      // 言語マッピングを定義
      const languageMap: Record<string, string> = {
        日本語: 'Japanese',
        英語: 'English',
        中国語: 'Chinese',
        韓国語: 'Korean',
        フランス語: 'French',
        ドイツ語: 'German',
        スペイン語: 'Spanish',
        イタリア語: 'Italian',
        ポルトガル語: 'Portuguese',
        ロシア語: 'Russian',
        アラビア語: 'Arabic',
      };

      const templateLanguage = languageMap[selectedLanguage] || 'Japanese'; // デフォルトは日本語

      // ページサイズの情報を取得
      const sizeInfo =
        documentSize && pageSizeDimensions[documentSize]
          ? pageSizeDimensions[documentSize]
          : pageSizeDimensions['A4']; // デフォルトはA4

      promptPrefix = `Create a prompt for generating a ${styleToUse} style ${templateType} PDF template in ${templateLanguage} language. Make it professional, beautiful, and functional. Ensure it fits on a ${sizeInfo.description} (width: ${sizeInfo.width}mm, height: ${sizeInfo.height}mm) with a compact and efficient layout, and include dummy data if tables are included. Focus on visual hierarchy and incorporate unique artistic elements and colorful accents for an attractive design. The template should be in ${templateLanguage} language.`;
    }

    // OpenRouter APIを直接呼び出す
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://pdf-create-app.vercel.app',
        },
        body: JSON.stringify({
          model: AVAILABLE_MODELS[0],
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: promptPrefix,
            },
          ],
          max_tokens: 6400,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      text: generatedText,
      model: AVAILABLE_MODELS[0],
    });
  } catch (error: any) {
    console.error('プロンプト生成エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
