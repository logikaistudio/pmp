import jsPDF from 'jspdf';

/**
 * PREMIUM "Aktivasi OSP KIKC" Professional Report
 * Layout: S-Curve TOP, WBS Bottom
 * Style: Fancy, Modern, Clean, 28px Margins
 * REVISION: PORTRAIT, Header #DBD7D2, Lighter Rows
 */
export const handleDownloadPDF = (projectInfo, wbsData) => {
    try {
        console.log("Generating PDF Portrait Light Colors...");
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // --- CONFIG ---
        const margin = 10;
        const marginYTop = 10;
        const pageW = 210;
        const pageH = 297;
        const contentW = pageW - (margin * 2);

        // Colors
        const colPrimary = [31, 107, 255];
        const colTextHead = [20, 20, 20];
        const colTextBody = [60, 60, 67];
        const colTextMuted = [150, 150, 150];
        const colPlanned = [168, 168, 168];

        // NEW HEADER COLOR: #DBD7D2 -> RGB(219, 215, 210)
        const colBgHeader = [219, 215, 210];

        // Lighter Summary Bg
        const colSummaryBg = [250, 251, 252];

        let cursorY = marginYTop;

        // Helpers
        const drawLineDiv = (y) => {
            doc.setDrawColor(226, 226, 226);
            doc.setLineWidth(0.1);
            const lineW = contentW * 0.9;
            const lineX = margin + (contentW - lineW) / 2;
            doc.line(lineX, y, lineX + lineW, y);
        };

        const drawText = (txt, x, y, size, weight = 'normal', color = colTextBody, align = 'left') => {
            doc.setFont('helvetica', weight);
            doc.setFontSize(size);
            doc.setTextColor(...color);
            doc.text(String(txt), x, y, { align });
        };


        // --- 1. HEADER ---
        drawText("Aktivasi OSP KIKC", margin, cursorY + 8, 18, 'bold', colTextHead);
        drawText("PROJECT REPORT", margin, cursorY + 14, 8, 'bold', colTextMuted);

        const rLabels = ["OWNER:", "EXECUTOR:", "REPORT DATE:", "WEEK:", "DURATION:"];
        const rValues = [
            projectInfo.projectOwner || "-",
            projectInfo.pelaksana || "-",
            new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            "W-5",
            "01 Nov 23 – 31 Dec 23"
        ];

        let rY = cursorY + 2;
        const rX = pageW - margin;

        rLabels.forEach((l, i) => {
            doc.setFontSize(6);
            doc.setTextColor(...colTextMuted);
            doc.setFont('helvetica', 'normal');
            const lw = doc.getTextWidth(l);
            doc.text(l, rX - 60 - lw, rY, { align: 'left' });
            drawText(rValues[i], rX, rY, 7, 'bold', colTextHead, 'right');
            rY += 4;
        });

        cursorY = Math.max(cursorY + 20, rY + 2);
        drawLineDiv(cursorY);
        cursorY += 12;


        // --- 2. S-CURVE (REFINED) ---
        const chartH = 65;
        const chartW = contentW * 0.85;
        const chartX = margin + (contentW - chartW) / 2;
        const chartY = cursorY;
        const chartBottom = chartY + chartH;

        // Title
        drawText("S-Curve Progress Analysis (Planned vs Actual)", margin + contentW / 2, chartY - 4, 9, 'bold', colTextHead, 'center');

        // --- AXES & LABELS ---
        const allDates = wbsData.flatMap(d => [new Date(d.startDate), new Date(d.endDate)]).filter(d => !isNaN(d));
        let minDate = allDates.length ? new Date(Math.min(...allDates)) : new Date();
        let maxDate = allDates.length ? new Date(Math.max(...allDates)) : new Date();
        if (minDate.getTime() === maxDate.getTime()) { maxDate.setDate(maxDate.getDate() + 30); }

        // Y-Axis
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.1);
        [0, 0.25, 0.5, 0.75, 1].forEach(p => {
            const ly = chartBottom - (chartH * p);
            if (p > 0) doc.line(chartX, ly, chartX + chartW, ly);
            drawText(`${p * 100}%`, chartX - 2, ly + 1, 6, 'normal', colTextMuted, 'right');
        });

        // X-Axis
        doc.setDrawColor(...colTextMuted);
        doc.setLineWidth(0.2);
        doc.line(chartX, chartBottom, chartX + chartW, chartBottom);
        doc.line(chartX, chartY, chartX, chartBottom);

        const dateFmt = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        drawText(dateFmt(minDate), chartX, chartBottom + 4, 6, 'bold', colTextMuted, 'left');
        drawText(dateFmt(maxDate), chartX + chartW, chartBottom + 4, 6, 'bold', colTextMuted, 'right');
        const midDate = new Date((minDate.getTime() + maxDate.getTime()) / 2);
        drawText(dateFmt(midDate), chartX + chartW / 2, chartBottom + 4, 6, 'bold', colTextMuted, 'center');


        // --- CURVE (SMOOTH) ---
        const steps = 50;
        const stepW = chartW / steps;

        // Planned
        const plannedPoints = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const yVal = (1 - Math.cos(t * Math.PI)) / 2;
            plannedPoints.push({ x: chartX + (i * stepW), y: chartBottom - (yVal * chartH) });
        }

        doc.setDrawColor(...colPlanned);
        doc.setLineWidth(0.3);
        doc.setLineDash([2, 2], 0);
        for (let i = 0; i < plannedPoints.length - 1; i++) {
            doc.line(plannedPoints[i].x, plannedPoints[i].y, plannedPoints[i + 1].x, plannedPoints[i + 1].y);
        }
        doc.setLineDash([], 0);


        // Actual
        const actualPoints = [];
        const progressSteps = Math.floor(steps * 0.6);
        const actualFinalY = 0.48;

        for (let i = 0; i <= progressSteps; i++) {
            const t = i / progressSteps;
            const yVal = ((1 - Math.cos(t * Math.PI)) / 2) * actualFinalY;
            actualPoints.push({ x: chartX + (i * stepW), y: chartBottom - (yVal * chartH) });
        }

        doc.setDrawColor(...colPrimary);
        doc.setLineWidth(0.6);
        for (let i = 0; i < actualPoints.length - 1; i++) {
            doc.line(actualPoints[i].x, actualPoints[i].y, actualPoints[i + 1].x, actualPoints[i + 1].y);
        }


        // Legend 
        const legX = chartX + 4;
        const legY = chartY + 2;
        doc.setDrawColor(...colPlanned); doc.setLineWidth(0.3); doc.setLineDash([2, 1]);
        doc.line(legX, legY + 2, legX + 5, legY + 2);
        drawText("Planned", legX + 7, legY + 3, 6, 'normal', colPlanned);

        doc.setDrawColor(...colPrimary); doc.setLineWidth(0.6); doc.setLineDash([]);
        doc.line(legX + 20, legY + 2, legX + 25, legY + 2);
        drawText("Actual", legX + 27, legY + 3, 6, 'bold', colPrimary);


        cursorY = chartBottom + 12;
        drawLineDiv(cursorY - 6);


        // --- 3. WBS TABLE ---
        const cols = [
            { h: 'TASK', w: 55 },
            { h: 'START', w: 22, align: 'center' },
            { h: 'END', w: 22, align: 'center' },
            { h: 'WGT', w: 15, align: 'center' },
            { h: 'PROGRESS', w: 45 },
            { h: 'NOTES', w: 35 }
        ];

        const rowH = 7;
        doc.setFillColor(...colBgHeader); // Use new Beige color
        doc.rect(margin, cursorY, contentW, rowH, 'F');

        let cx = margin;
        cols.forEach(c => {
            const tx = c.align === 'center' ? cx + c.w / 2 : cx + 2;
            // Use darker text on the beige background for contrast
            drawText(c.h, tx, cursorY + 4.5, 6, 'bold', [80, 80, 80], c.align || 'left');
            cx += c.w;
        });
        cursorY += rowH;

        // Rows
        const summaryH = 18;
        const maxPageY = pageH - margin - summaryH - 10;

        let shownCount = 0;
        wbsData.forEach((row, i) => {
            if (cursorY > maxPageY) return;
            shownCount++;

            // Alt fill: "perbaiki warna cell yang gelap... menjadi warna terang"
            // We use very subtle off-white: [253, 253, 254]
            if (i % 2 === 1) {
                doc.setFillColor(253, 253, 254);
                doc.rect(margin, cursorY, contentW, rowH, 'F');
            }

            let rcx = margin;
            const name = row.level > 0 ? `  ${row.name}` : row.name;
            drawText(name.substring(0, 30), rcx + 2, cursorY + 4.5, 7, row.level === 0 ? 'bold' : 'normal'); rcx += cols[0].w;

            drawText(row.startDate, rcx + cols[1].w / 2, cursorY + 4.5, 7, 'normal', colTextBody, 'center'); rcx += cols[1].w;
            drawText(row.endDate, rcx + cols[2].w / 2, cursorY + 4.5, 7, 'normal', colTextBody, 'center'); rcx += cols[2].w;
            drawText(`${row.weight}%`, rcx + cols[3].w / 2, cursorY + 4.5, 7, 'normal', colTextBody, 'center'); rcx += cols[3].w;

            // Bar
            const maxBarW = cols[4].w * 0.70;
            const barBoxX = rcx + 2; const barBoxY = cursorY + 2; const barBoxH = 3;

            // Lighter progress bar bg
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(barBoxX, barBoxY, maxBarW, barBoxH, 1, 1, 'F');

            const fillW = maxBarW * (row.progress / 100);
            if (fillW > 0) {
                doc.setFillColor(...colPrimary); doc.roundedRect(barBoxX, barBoxY, fillW, barBoxH, 1, 1, 'F');
            }
            drawText(`${row.progress}%`, rcx + maxBarW + 4, cursorY + 4.5, 6, 'bold', colPrimary);
            rcx += cols[4].w;

            if (row.notes) drawText(row.notes.substring(0, 18), rcx + 2, cursorY + 4.5, 6, 'italic', colTextMuted);

            cursorY += rowH;
        });

        if (wbsData.length > shownCount) {
            drawText(`... (${wbsData.length - shownCount} more tasks hidden)`, margin + contentW / 2, cursorY + 4, 7, 'italic', colTextMuted, 'center');
            cursorY += 6;
        }

        cursorY += 4;
        drawLineDiv(cursorY);
        cursorY += 6;


        // --- 4. SUMMARY BOX ---
        const sumW = 90;
        const sumH = 16;
        const sumX = pageW - margin - sumW;

        doc.setFillColor(240, 240, 240); // Lighter shadow
        doc.roundedRect(sumX + 1, cursorY + 1, sumW, sumH, 3, 3, 'F');
        doc.setFillColor(...colSummaryBg); doc.roundedRect(sumX, cursorY, sumW, sumH, 3, 3, 'F');

        const colW = sumW / 3;
        const metrics = [
            { l: 'PLANNED', v: '65%', c: colTextMuted },
            { l: 'ACTUAL', v: '48%', c: colPrimary },
            { l: 'VARIANCE', v: '-17%', c: [239, 68, 68] }
        ];

        metrics.forEach((m, i) => {
            const mx = sumX + (i * colW);
            drawText(m.l, mx + colW / 2, cursorY + 5, 6, 'bold', colTextMuted, 'center');
            doc.setFontSize(10); doc.setTextColor(...m.c); doc.text(m.v, mx + colW / 2, cursorY + 11, { align: 'center' });
            if (i < 2) { doc.setDrawColor(240, 240, 240); doc.line(mx + colW, cursorY + 4, mx + colW, cursorY + sumH - 4); }
        });

        const timeStr = new Date().getHours() + "" + new Date().getMinutes() + "" + new Date().getSeconds();
        doc.save(`${projectInfo.projectName}_Report_Light_${timeStr}.pdf`);

    } catch (e) {
        console.error("PDF Fail:", e);
        alert("PDF Error: " + e.message);
    }
};
