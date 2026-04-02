import { Injectable, Logger } from '@nestjs/common';
const PDFDocument = require('pdfkit');
import { Buffer } from 'buffer';
import * as path from 'path';

/**
 * 🧾 ANN OFFICIAL PDF RECEIPT GENERATOR
 * Generates production-grade, branded receipts for Stripe and Manual payments.
 */

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generateReceipt(data: {
    transactionId: string;
    amount: number;
    currency: string;
    date: Date;
    senderName: string;
    senderEmail: string;
    receiverName?: string;
    receiverAccount?: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    planName: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: any[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- 🎨 Color Palette ---
      const colors = {
        primary: '#002868', // ANN Blue
        secondary: '#C8102E', // ANN Red
        success: '#10b981', // Green
        failed: '#ef4444', // Red
        pending: '#f59e0b', // Yellow
        text: '#1f2937',
        muted: '#6b7280',
        bg: '#f9fafb',
      };

      const statusColor = 
        data.status === 'SUCCESS' ? colors.success : 
        data.status === 'FAILED' ? colors.failed : 
        colors.pending;

      // --- 🏛️ Header & Logo ---
      const logoPath = path.join(process.cwd(), '../frontend/public/logo.png');
      try {
        doc.image(logoPath, 50, 45, { width: 60 });
      } catch (e) {
        this.logger.warn(`Logo not found at ${logoPath}, falling back to text.`);
        doc.fillColor(colors.primary).fontSize(20).text('ANN.', 50, 45, { bold: true });
      }

      doc
        .fillColor(colors.primary)
        .fontSize(16)
        .text('America Needs Nurses (ANN)', 120, 50, { align: 'right' })
        .fontSize(10)
        .fillColor(colors.muted)
        .text('OFFICIAL PAYMENT RECEIPT', 120, 70, { align: 'right' });

      doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e5e7eb').stroke();

      // --- 🆔 TRANSACTION DETAILS ---
      doc
        .fillColor(colors.primary)
        .fontSize(12)
        .text('TRANSACTION DETAILS', 50, 120, { bold: true });

      doc
        .fillColor(colors.text)
        .fontSize(10)
        .text('Date & Time:', 50, 140)
        .text('Transaction ID:', 50, 155)
        .text('Status:', 50, 170);

      doc
        .text(data.date.toLocaleString(), 150, 140)
        .text(data.transactionId, 150, 155, { bold: true })
        .fillColor(statusColor)
        .text(data.status, 150, 170, { bold: true });

      // --- 👤 SENDER & RECEIVER ---
      // Left Column: Sender
      doc
        .fillColor(colors.primary)
        .fontSize(12)
        .text('SENDER DETAILS', 50, 205, { bold: true });

      doc
        .fillColor(colors.text)
        .fontSize(10)
        .text(`Name: ${data.senderName}`, 50, 225)
        .text(`Email: ${data.senderEmail}`, 50, 240);

      // Right Column: Receiver
      doc
        .fillColor(colors.primary)
        .fontSize(12)
        .text('RECEIVER DETAILS', 300, 205, { bold: true });

      doc
        .fillColor(colors.text)
        .fontSize(10)
        .text(`Receiver: ${data.receiverName || 'America Needs Nurses'}`, 300, 225)
        .text(`Account: ${data.receiverAccount || 'Corporate Subscription Account'}`, 300, 240);

      // --- 📊 PAYMENT SUMMARY TABLE ---
      const tableTop = 290;
      doc
        .fillColor(colors.bg)
        .rect(50, tableTop, 495, 25)
        .fill();

      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .text('DESCRIPTION', 60, tableTop + 8, { bold: true })
        .text('AMOUNT', 480, tableTop + 8, { width: 60, align: 'right', bold: true });

      const rowY = tableTop + 40;
      doc
        .fillColor(colors.text)
        .text(`${data.planName} Subscription Plan`, 60, rowY)
        .text(`${data.currency} ${data.amount.toFixed(2)}`, 480, rowY, { width: 60, align: 'right' });

      doc.moveTo(50, rowY + 25).lineTo(545, rowY + 25).strokeColor('#e5e7eb').stroke();

      // --- 💰 TOTAL ---
      doc
        .fillColor(colors.primary)
        .fontSize(14)
        .text('TOTAL PAID', 350, rowY + 45, { bold: true })
        .fillColor(colors.secondary)
        .text(`${data.currency} ${data.amount.toFixed(2)}`, 450, rowY + 43, { width: 95, align: 'right', bold: true });

      // --- 🏁 FOOTER ---
      const footerY = 750;
      doc.moveTo(50, footerY - 20).lineTo(545, footerY - 20).strokeColor('#f3f4f6').stroke();
      
      doc
        .fontSize(8)
        .fillColor(colors.muted)
        .text('This is an official system-generated receipt by America Needs Nurses.', 50, footerY, { align: 'center', width: 495 })
        .text('If this is a manual payment, please upload this receipt in the verification portal for approval.', 50, footerY + 12, { align: 'center', width: 495 })
        .fillColor(colors.primary)
        .text('annplatform.com | support@annplatform.com', 50, footerY + 30, { align: 'center', width: 495 });

      doc.end();
    });
  }
}
