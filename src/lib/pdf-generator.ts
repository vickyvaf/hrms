import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Pegawai, Pendidikan } from '@prisma/client';

export const generatePegawaiPDF = async (
  pegawai: Pegawai & { pendidikan: Pendidikan[] }
): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Portrait
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const width = page.getWidth();
  const height = page.getHeight();

  page.drawText('DETAIL DATA PEGAWAI', { 
    x: (width / 2) - 100, 
    y: height - 60, 
    size: 20, 
    font: boldFont 
  });
  
  let y = height - 100;
  const drawLine = (label: string, value: string) => {
    page.drawText(`${label}:`, { x: 50, y, size: 12, font: boldFont });
    page.drawText(String(value || '-'), { x: 160, y, size: 12, font });
    y -= 25;
  };

  drawLine('NIP', pegawai.nip);
  drawLine('Nama', pegawai.nama);
  drawLine('Email', pegawai.email);
  drawLine('Jabatan', pegawai.jabatan);
  drawLine('Departemen', pegawai.departemen);
  drawLine('Jenis', pegawai.jenisPegawai);
  drawLine('Tgl Masuk', pegawai.tanggalMasuk ? new Date(pegawai.tanggalMasuk).toLocaleDateString('id-ID') : '-');
  
  y -= 15;
  page.drawText('Alamat', { x: 50, y, size: 14, font: boldFont });
  y -= 25;
  drawLine('Provinsi', pegawai.provinsi);
  drawLine('Kabupaten', pegawai.kabupatenNama);
  drawLine('Detail', pegawai.alamatDetail);

  y -= 15;
  page.drawText('Riwayat Pendidikan', { x: 50, y, size: 14, font: boldFont });
  y -= 25;
  if (pegawai.pendidikan && pegawai.pendidikan.length > 0) {
    pegawai.pendidikan.forEach((edu: any, i: number) => {
       page.drawText(`${i+1}. ${edu.jenjang} - ${edu.institusi} (${edu.tahunLulus})`, { x: 50, y, size: 11, font });
       y -= 20;
    });
  } else {
    page.drawText('Tidak ada data pendidikan', { x: 50, y, size: 11, font });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

export const generatePegawaiListPDF = async (
  pegawaiList: (Pegawai & { masaKerja: number })[]
): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([841.89, 595.28]); // A4 Landscape
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const width = page.getWidth();
  const height = page.getHeight();

  page.drawText('DAFTAR PEGAWAI', { 
    x: (width / 2) - 80, 
    y: height - 50, 
    size: 20, 
    font: boldFont 
  });
  
  const headers = ['No', 'NIP', 'Nama', 'Jabatan', 'Jenis', 'Tgl Masuk', 'Masa Kerja'];
  const colX = [30, 60, 150, 380, 480, 580, 700];
  
  let y = height - 90;
  headers.forEach((h, i) => {
    page.drawText(h, { x: colX[i], y, size: 11, font: boldFont });
  });

  page.drawLine({ 
    start: { x: 30, y: y - 8 }, 
    end: { x: width - 30, y: y - 8 }, 
    thickness: 1, 
    color: rgb(0, 0, 0) 
  });
  
  y -= 30;
  for (let i = 0; i < pegawaiList.length; i++) {
    const p = pegawaiList[i];
    
    if (y < 50) {
      page = pdfDoc.addPage([841.89, 595.28]);
      y = height - 50;
      // Re-draw header on new page if needed, but let's keep it simple for now
    }

    page.drawText(String(i + 1), { x: colX[0], y, size: 10, font });
    page.drawText(String(p.nip || '-'), { x: colX[1], y, size: 10, font });
    page.drawText(String(p.nama || '-'), { x: colX[2], y, size: 10, font });
    page.drawText(String(p.jabatan || '-'), { x: colX[3], y, size: 10, font });
    page.drawText(String(p.jenisPegawai || '-'), { x: colX[4], y, size: 10, font });
    page.drawText(p.tanggalMasuk ? new Date(p.tanggalMasuk).toLocaleDateString('id-ID') : '-', { x: colX[5], y, size: 10, font });
    page.drawText(`${p.masaKerja || 0} Thn`, { x: colX[6], y, size: 10, font });
    
    y -= 22;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
