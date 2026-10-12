import { jsPDF } from 'jspdf';
import { MedicalRecord } from '../types/emr';

export async function exportMedicalRecordPDF(
  record: MedicalRecord,
  qrDataUrl?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(8, 145, 178); // #0891b2
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Hospital Name & Ministry Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('BO Y TE - HE THONG BENH AN DIEN TU ON-CHAIN', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(record.hospitalName.toUpperCase(), 14, y);
  doc.text(`Khoa: ${record.department}`, pageWidth - 14, y, { align: 'right' });
  y += 10;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(8, 145, 178);
  doc.text('PHIEU KHAM BENH & TOA THUOC DIEN TU', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ma Benh An: ${record.recordCode} | Ngay Kham: ${new Date(record.examinationDate).toLocaleString('vi-VN')}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Section: Patient Information
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Ho va Ten: ${record.patientName}`, 18, y + 7);
  doc.text(`Dinh danh PHID: ${record.patientPhid}`, 110, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`CCCD: ${record.patientCccd}`, 18, y + 14);
  doc.text(`Bac si dieu tri: ${record.doctorName}`, 110, y + 14);
  doc.text(`Ma so bac si: ${record.doctorId}`, 18, y + 21);
  doc.text(`Dia chi vi bac si: ${record.doctorAddress.slice(0, 10)}...${record.doctorAddress.slice(-8)}`, 110, y + 21);
  y += 34;

  // Section: Diagnosis & Clinical findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('I. CHAN DOAN VA TRIEU CHUNG', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Trieu chung lam sang: ${record.symptoms}`, 18, y, { maxWidth: pageWidth - 36 });
  y += 10;
  doc.text(`Kham thuc the: ${record.physicalExamination}`, 18, y, { maxWidth: pageWidth - 36 });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 145, 178);
  doc.text(`Chan doan chinh: ${record.diagnosis} (${record.icd10Code})`, 18, y, { maxWidth: pageWidth - 36 });
  y += 8;

  if (record.secondaryDiagnosis) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Chan doan phu: ${record.secondaryDiagnosis}`, 18, y);
    y += 7;
  }

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text(`Loi dan cua bac si: ${record.doctorAdvice}`, 18, y, { maxWidth: pageWidth - 36 });
  y += 12;

  // Section: Prescription Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('II. CHI DINH TOA THUOC', 14, y);
  y += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('STT', 17, y + 5);
  doc.text('Ten thuoc & Hoat chat', 28, y + 5);
  doc.text('Ham luong', 85, y + 5);
  doc.text('So luong', 115, y + 5);
  doc.text('Cach dung', 140, y + 5);
  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  record.prescriptions.forEach((rx, idx) => {
    doc.text(String(idx + 1), 17, y + 4);
    doc.text(`${rx.drugName} (${rx.activeSubstance})`, 28, y + 4, { maxWidth: 54 });
    doc.text(rx.dosage, 85, y + 4);
    doc.text(`${rx.quantity} ${rx.unit}`, 115, y + 4);
    doc.text(rx.instructions, 140, y + 4, { maxWidth: pageWidth - 140 - 16 });
    y += 8;
  });

  y += 8;

  // Section: Blockchain Verification & Anchor Seal
  doc.setFillColor(240, 253, 250); // Light teal
  doc.roundedRect(14, y, pageWidth - 28, 36, 3, 3, 'F');
  doc.setDrawColor(45, 212, 191);
  doc.roundedRect(14, y, pageWidth - 28, 36, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136);
  doc.text('XAC THUC TOAN VEN TREN BLOCKCHAIN (SMART CONTRACT ANCHOR)', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Record Hash (SHA-256): ${record.recordHash}`, 18, y + 14);
  doc.text(`Transaction Hash (TxHash): ${record.txHash}`, 18, y + 20);
  doc.text(`Network: ${record.network} | Block: #${record.blockNumber} | Status: CONFIRMED`, 18, y + 26);
  doc.text('Quet ma QR ben phai de kiem tra toan ven truc tiep tren Etherscan / Trinh kham pha chuoi.', 18, y + 32);

  // If QR image provided, embed QR code in PDF
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', pageWidth - 46, y + 4, 28, 28);
    } catch (e) {
      console.warn('Could not embed QR image', e);
    }
  }

  y += 44;

  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Benh Nhan', 30, y);
  doc.text('(Ky va ghi ro ho ten)', 24, y + 5);

  doc.text('Bac Si Dieu Tri (Da ky so EIP-712)', pageWidth - 65, y);
  doc.text('(Xac thuc bang dia chi vi on-chain)', pageWidth - 67, y + 5);

  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(record.patientName, 26, y);
  doc.text(record.doctorName, pageWidth - 60, y);

  // Save the PDF
  doc.save(`${record.recordCode}_${record.patientName.replace(/\s+/g, '_')}.pdf`);
}
