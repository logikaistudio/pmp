import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const handleDownloadPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            backgroundColor: '#0f172a', // Background color match
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Create new pages if content overflows
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('project-report.pdf');
    } catch (error) {
        console.error('PDF Export Failed', error);
    }
};
