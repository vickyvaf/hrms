import { PrismaClient, Role, JabatanType, DepartemenType, JenisPegawai, GenderType, StatusKawin } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const INDONESIAN_NAMES = [
  'Budi Santoso', 'Siti Aminah', 'Ahmad Fauzi', 'Dewi Lestari', 'Rizky Pratama',
  'Anita Wijaya', 'Eko Prasetyo', 'Maya Indah', 'Bambang Hermawan', 'Lesti Kejora',
  'Agus Setiawan', 'Putri Rahayu', 'Hendra Kusuma', 'Sari Puspita', 'Dedi Kurniawan',
  'Rina Marlina', 'Fajar Ramadhan', 'Indah Permatasari', 'Andi Wijaya', 'Yanti Susanti',
  'Taufik Hidayat', 'Sri Wahyuni', 'Iwan Fals', 'Rossa Rosliana', 'Glenn Fredly',
  'Raisa Andriana', 'Isyana Sarasvati', 'Tulus Rusydi', 'Afgan Syahreza', 'Bunga Citra Lestari'
];

const STREET_NAMES = [
  'Jl. Malioboro', 'Jl. Gejayan', 'Jl. Kaliurang', 'Jl. Solo', 'Jl. Magelang',
  'Jl. Godean', 'Jl. Parangtritis', 'Jl. Bantul', 'Jl. Wonosari', 'Jl. Imogiri'
];

function generateNIP(birthDate: Date, joinDate: Date, gender: GenderType, index: number): string {
  const yyyymmdd = birthDate.toISOString().slice(0, 10).replace(/-/g, '');
  const joinYm = joinDate.toISOString().slice(0, 7).replace(/-/g, '');
  const genderCode = gender === GenderType.PRIA ? '1' : '2';
  const sequence = (index + 1).toString().padStart(3, '0');
  return `${yyyymmdd}${joinYm}${genderCode}${sequence}`;
}

function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    // Simple CSV split that handles potential quotes (though these files shouldn't have nested commas)
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

async function main() {
  console.log('Cleaning up existing data...');
  // Delete in reverse order of relations
  await prisma.otpSession.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.pendidikan.deleteMany({});
  await prisma.presensi.deleteMany({});
  await prisma.tunjanganTransport.deleteMany({});
  await prisma.pegawai.deleteMany({});
  await prisma.kalurahan.deleteMany({});
  await prisma.kecamatan.deleteMany({});
  await prisma.kabupaten.deleteMany({});
  await prisma.provinsi.deleteMany({});
  await prisma.settingTunjanganTransport.deleteMany({});
  await prisma.captchaSession.deleteMany({});

  const seedsDir = path.join(process.cwd(), 'prisma', 'seeds');

  console.log('Seeding regional data from CSV...');

  // Provinces
  console.log('Seeding provinces...');
  const provincesData = parseCSV(path.join(seedsDir, 'provinces.csv'));
  for (const p of provincesData) {
    await prisma.provinsi.create({
      data: {
        id: p.code.replace(/\./g, ''),
        nama: p.name
      }
    });
  }

  // Regencies
  console.log('Seeding regencies...');
  const regenciesData = parseCSV(path.join(seedsDir, 'regencies.csv'));
  // Chunking regencies just in case, though 500 is small
  for (const r of regenciesData) {
    await prisma.kabupaten.create({
      data: {
        id: r.code.replace(/\./g, ''),
        provinsiId: r.province_code.replace(/\./g, ''),
        nama: r.name
      }
    });
  }

  // Districts
  console.log('Seeding districts (chunked)...');
  const districtsData = parseCSV(path.join(seedsDir, 'districts.csv'));
  const districtChunks = [];
  for (let i = 0; i < districtsData.length; i += 1000) {
    districtChunks.push(districtsData.slice(i, i + 1000));
  }
  for (const chunk of districtChunks) {
    await prisma.kecamatan.createMany({
      data: chunk.map(d => ({
        id: d.code.replace(/\./g, ''),
        kabupatenId: d.regency_code.replace(/\./g, ''),
        nama: d.name
      }))
    });
  }

  // Villages
  console.log('Seeding villages (chunked, 80k+ records)...');
  const villagesData = parseCSV(path.join(seedsDir, 'villages.csv'));
  const villageChunks = [];
  for (let i = 0; i < villagesData.length; i += 1000) {
    villageChunks.push(villagesData.slice(i, i + 1000));
  }
  let count = 0;
  for (const chunk of villageChunks) {
    await prisma.kalurahan.createMany({
      data: chunk.map(v => ({
        id: v.code.replace(/\./g, ''),
        kecamatanId: v.district_code.replace(/\./g, ''),
        nama: v.name
      }))
    });
    count += chunk.length;
    if (count % 10000 === 0) console.log(`Seeded ${count} villages...`);
  }

  console.log('Seeding users and employees...');
  const hashedPassword = await bcrypt.hash('Admin@12345', 10);
  const managerPassword = await bcrypt.hash('Manager@12345', 10);

  // Reference IDs for DIY / Sleman
  const DIY_CODE = '34';
  const SLEMAN_CODE = '3404';
  const BANTUL_CODE = '3402';
  const YOGYA_CITY_CODE = '3471';
  const DEPOK_SLEMAN_CODE = '340401'; // Depok in Sleman
  const CATURTUNGGAL_CODE = '3404012003'; // Caturtunggal
  const MAGUWOHARJO_CODE = '3404012001'; // Maguwoharjo

  // Superadmin
  const birthSuper = new Date('1985-01-01');
  const joinSuper = new Date('2020-01-01');
  const superPegawai = await prisma.pegawai.create({
    data: {
      nip: generateNIP(birthSuper, joinSuper, GenderType.PRIA, 0),
      nama: 'Bambang Sudjatmiko',
      email: 'bambang.s@hrms.com',
      nomorHp: '+6281234567890',
      jabatan: JabatanType.MANAGER,
      departemen: DepartemenType.EXECUTIVE,
      jenisPegawai: JenisPegawai.TETAP,
      gender: GenderType.PRIA,
      statusKawin: StatusKawin.KAWIN,
      tanggalLahir: birthSuper,
      tempatLahirId: YOGYA_CITY_CODE,
      tanggalMasuk: joinSuper,
      provinsi: 'DI Yogyakarta',
      kabupatenNama: 'Kota Yogyakarta',
      kecamatanId: DEPOK_SLEMAN_CODE,
      kalurahanId: CATURTUNGGAL_CODE,
      alamatDetail: 'Jl. Malioboro No. 12, Gedong Tengen',
      latitude: -7.7829,
      longitude: 110.3671,
    }
  });
  await prisma.user.create({
    data: {
      pegawaiId: superPegawai.id,
      username: 'superadmin',
      email: superPegawai.email,
      nomorHp: superPegawai.nomorHp,
      password: hashedPassword,
      role: Role.SUPERADMIN,
    }
  });

  // Manager HRD
  const birthManager = new Date('1990-05-05');
  const joinManager = new Date('2021-02-01');
  const managerPegawai = await prisma.pegawai.create({
    data: {
      nip: generateNIP(birthManager, joinManager, GenderType.WANITA, 1),
      nama: 'Siti Rohani',
      email: 'siti.rohani@hrms.com',
      nomorHp: '+6282112233445',
      jabatan: JabatanType.MANAGER,
      departemen: DepartemenType.HRD,
      jenisPegawai: JenisPegawai.TETAP,
      gender: GenderType.WANITA,
      statusKawin: StatusKawin.KAWIN,
      tanggalLahir: birthManager,
      tempatLahirId: SLEMAN_CODE,
      tanggalMasuk: joinManager,
      provinsi: 'DI Yogyakarta',
      kabupatenNama: 'Sleman',
      kecamatanId: DEPOK_SLEMAN_CODE,
      kalurahanId: MAGUWOHARJO_CODE,
      alamatDetail: 'Jl. Kaliurang KM 5, Sleman',
      latitude: -7.7599,
      longitude: 110.3738,
    }
  });
  await prisma.user.create({
    data: {
      pegawaiId: managerPegawai.id,
      username: 'managerhrd',
      email: managerPegawai.email,
      nomorHp: managerPegawai.nomorHp,
      password: managerPassword,
      role: Role.MANAGER_HRD,
    }
  });

  // Admin HRD
  const birthAdmin = new Date('1995-10-10');
  const joinAdmin = new Date('2022-03-01');
  const adminPegawai = await prisma.pegawai.create({
    data: {
      nip: generateNIP(birthAdmin, joinAdmin, GenderType.PRIA, 2),
      nama: 'Agus Prayitno',
      email: 'agus.p@hrms.com',
      nomorHp: '+6283119988776',
      jabatan: JabatanType.STAF,
      departemen: DepartemenType.HRD,
      jenisPegawai: JenisPegawai.TETAP,
      gender: GenderType.PRIA,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      tanggalLahir: birthAdmin,
      tempatLahirId: BANTUL_CODE,
      tanggalMasuk: joinAdmin,
      provinsi: 'DI Yogyakarta',
      kabupatenNama: 'Bantul',
      kecamatanId: DEPOK_SLEMAN_CODE,
      kalurahanId: CATURTUNGGAL_CODE, // Just use available valid codes for the seed
      alamatDetail: 'Jl. Parangtritis No. 50, Bantul',
      latitude: -7.8333,
      longitude: 110.3619,
    }
  });
  await prisma.user.create({
    data: {
      pegawaiId: adminPegawai.id,
      username: 'adminhrd',
      email: adminPegawai.email,
      nomorHp: adminPegawai.nomorHp,
      password: hashedPassword,
      role: Role.ADMIN_HRD,
    }
  });

  // Realistic Employees
  console.log('Seeding 25 realistic employees across Indonesia...');
  const kabs = [SLEMAN_CODE, BANTUL_CODE, YOGYA_CITY_CODE, '3171', '3273']; // Sleman, Bantul, Yogya, Jakpus, Bandung
  const kabNames = ['Sleman', 'Bantul', 'Kota Yogyakarta', 'Kota Jakarta Pusat', 'Kota Bandung'];

  for (let i = 0; i < 25; i++) {
    const gender = i % 3 === 0 ? GenderType.WANITA : GenderType.PRIA;
    const birthDate = new Date(1988 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const joinDate = new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const name = INDONESIAN_NAMES[i % INDONESIAN_NAMES.length];
    const kabIdx = i % kabs.length;
    const kabCode = kabs[kabIdx];
    const kabName = kabNames[kabIdx];
    const street = STREET_NAMES[i % STREET_NAMES.length];

    // Find a random kecamatan and kalurahan for this regency
    const kecamatan = districtsData.find(d => d.regency_code.replace(/\./g, '') === kabCode);
    const kecamatanId = kecamatan ? kecamatan.code.replace(/\./g, '') : DEPOK_SLEMAN_CODE;
    
    const kalurahan = villagesData.find(v => v.district_code.replace(/\./g, '') === kecamatanId);
    const kalurahanId = kalurahan ? kalurahan.code.replace(/\./g, '') : CATURTUNGGAL_CODE;

    await prisma.pegawai.create({
      data: {
        nip: generateNIP(birthDate, joinDate, gender, i + 3),
        nama: name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@hrms.com`,
        nomorHp: `+628${Math.floor(100000000 + Math.random() * 900000000)}`,
        jabatan: i % 4 === 0 ? JabatanType.STAF : JabatanType.KARYAWAN,
        departemen: i % 3 === 0 ? DepartemenType.PRODUCTION : (i % 3 === 1 ? DepartemenType.MARKETING : DepartemenType.HRD),
        jenisPegawai: i < 18 ? JenisPegawai.TETAP : JenisPegawai.KONTRAK,
        gender: gender,
        statusKawin: i % 2 === 0 ? StatusKawin.KAWIN : StatusKawin.TIDAK_KAWIN,
        tanggalLahir: birthDate,
        tempatLahirId: kabCode,
        tanggalMasuk: joinDate,
        provinsi: parseInt(kabCode) < 35 ? 'DI Yogyakarta' : (parseInt(kabCode) < 33 ? 'DKI Jakarta' : 'Jawa Barat'),
        kabupatenNama: kabName,
        kecamatanId: kecamatanId,
        kalurahanId: kalurahanId,
        alamatDetail: `${street} No. ${Math.floor(Math.random() * 100) + 1}`,
        latitude: -7.7956 + (Math.random() - 0.5) * 0.2, 
        longitude: 110.3695 + (Math.random() - 0.5) * 0.2,
      }
    });
  }


  // Tunjangan Setting
  await prisma.settingTunjanganTransport.create({
    data: {
      baseFare: 2500,
      keterangan: 'Tarif Transport Pegawai 2024',
      isActive: true,
    }
  });

  // Presensi Seeds
  console.log('Seeding presensi records...');
  const allPegawai = await prisma.pegawai.findMany();
  const lokasi = ['GEDUNG_UTAMA', 'GEDUNG_A', 'GEDUNG_B'];
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const targetBulan = lastMonth.getMonth() + 1;
  const targetTahun = lastMonth.getFullYear();

  for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
    const d = new Date();
    d.setMonth(d.getMonth() - monthOffset);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const daysInMonth = new Date(y, m, 0).getDate();

    console.log(`Seeding presensi for ${m}/${y}...`);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const p of allPegawai) {
        const rand = Math.random();
        let status = 'HADIR';
        if (rand > 0.95) status = 'IZIN';
        else if (rand > 0.90) status = 'CUTI';

        const checkinHour = 7 + Math.floor(Math.random() * 2);
        const checkinMin = Math.floor(Math.random() * 60);
        const checkoutHour = 16 + Math.floor(Math.random() * 2);
        const checkoutMin = Math.floor(Math.random() * 60);
        
        const waktuCheckin = new Date(date);
        waktuCheckin.setHours(checkinHour, checkinMin, 0);
        
        const waktuCheckout = new Date(date);
        waktuCheckout.setHours(checkoutHour, checkoutMin, 0);

        const durasiJam = status === 'HADIR' ? (checkoutHour - checkinHour) + (checkoutMin - checkinMin) / 60 : 0;

        await prisma.presensi.create({
          data: {
            pegawaiId: p.id,
            tanggal: new Date(date),
            statusKehadiran: status as any,
            lokasiCheckin: status === 'HADIR' ? lokasi[Math.floor(Math.random() * lokasi.length)] as any : null,
            lokasiCheckout: status === 'HADIR' ? lokasi[Math.floor(Math.random() * lokasi.length)] as any : null,
            waktuCheckin: status === 'HADIR' ? waktuCheckin : null,
            waktuCheckout: status === 'HADIR' ? waktuCheckout : null,
            durasiJam: status === 'HADIR' ? durasiJam : 0,
            statusTerpenuhi: status === 'HADIR' && durasiJam >= 8,
            verifikasi: 'DISETUJUI',
            bulan: m,
            tahun: y,
          }
        });
      }
    }
  }

  console.log('Calculating tunjangan transport...');
  const settingTunjangan = await prisma.settingTunjanganTransport.findFirst({ where: { isActive: true } });
  const baseFare = settingTunjangan ? Number(settingTunjangan.baseFare) : 2500;

  for (const p of allPegawai) {
    if (p.jenisPegawai !== JenisPegawai.TETAP) continue;

    const hadirCount = await prisma.presensi.count({
      where: {
        pegawaiId: p.id,
        bulan: targetBulan,
        tahun: targetTahun,
        statusKehadiran: 'HADIR'
      }
    });

    if (hadirCount >= 1) {
      const distance = 5 + Math.random() * 15;
      const roundedDistance = Math.round(distance);
      const totalTunjangan = baseFare * roundedDistance * hadirCount;

      await prisma.tunjanganTransport.create({
        data: {
          pegawaiId: p.id,
          bulan: targetBulan,
          tahun: targetTahun,
          baseFare: baseFare,
          jarakKm: distance,
          jarakKmBulatkan: roundedDistance,
          jumlahHariMasuk: hadirCount,
          totalTunjangan: totalTunjangan,
          keterangan: 'Perhitungan Transport Periode ' + targetBulan + '/' + targetTahun,
        }
      });
    }
  }

  console.log('Seed finished successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


