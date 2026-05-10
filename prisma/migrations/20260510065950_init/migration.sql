-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD');

-- CreateEnum
CREATE TYPE "JabatanType" AS ENUM ('MANAGER', 'STAF', 'MAGANG', 'KARYAWAN');

-- CreateEnum
CREATE TYPE "DepartemenType" AS ENUM ('MARKETING', 'HRD', 'PRODUCTION', 'EXECUTIVE', 'COMMISSIONER');

-- CreateEnum
CREATE TYPE "JenisPegawai" AS ENUM ('KONTRAK', 'TETAP', 'MAGANG');

-- CreateEnum
CREATE TYPE "StatusKawin" AS ENUM ('KAWIN', 'TIDAK_KAWIN');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('PRIA', 'WANITA');

-- CreateEnum
CREATE TYPE "ModulLog" AS ENUM ('LOGIN', 'LOGOUT', 'USER', 'PEGAWAI', 'TUNJANGAN', 'SETTING_TUNJANGAN', 'PRESENSI', 'LOG', 'DASHBOARD');

-- CreateEnum
CREATE TYPE "AksiLog" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'IMPORT', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "StatusVerifikasi" AS ENUM ('DISETUJUI', 'DITOLAK', 'PENDING');

-- CreateEnum
CREATE TYPE "Verifikator" AS ENUM ('LEAD', 'MANAGER', 'HRD');

-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('HADIR', 'CUTI', 'IZIN', 'UNPAID_LEAVE');

-- CreateEnum
CREATE TYPE "LokasiGedung" AS ENUM ('GEDUNG_UTAMA', 'GEDUNG_A', 'GEDUNG_B');

-- CreateTable
CREATE TABLE "Provinsi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Provinsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kabupaten" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "provinsiId" TEXT NOT NULL,

    CONSTRAINT "Kabupaten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kecamatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kabupatenId" TEXT NOT NULL,

    CONSTRAINT "Kecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kalurahan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kecamatanId" TEXT NOT NULL,

    CONSTRAINT "Kalurahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pegawai" (
    "id" UUID NOT NULL,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nomorHp" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "jabatan" "JabatanType" NOT NULL,
    "departemen" "DepartemenType" NOT NULL,
    "jenisPegawai" "JenisPegawai" NOT NULL,
    "gender" "GenderType" NOT NULL,
    "statusKawin" "StatusKawin" NOT NULL,
    "jumlahAnak" INTEGER NOT NULL DEFAULT 0,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "tempatLahirId" TEXT NOT NULL,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kabupatenNama" TEXT NOT NULL,
    "kecamatanId" TEXT NOT NULL,
    "kalurahanId" TEXT NOT NULL,
    "alamatDetail" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendidikan" (
    "id" UUID NOT NULL,
    "pegawaiId" UUID NOT NULL,
    "jenjang" TEXT NOT NULL,
    "institusi" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL,
    "tahunLulus" INTEGER NOT NULL,

    CONSTRAINT "Pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "pegawaiId" UUID,
    "nama" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nomorHp" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "rememberToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "otpCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptchaSession" (
    "id" UUID NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaptchaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingTunjanganTransport" (
    "id" UUID NOT NULL,
    "baseFare" DECIMAL(10,2) NOT NULL,
    "keterangan" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettingTunjanganTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TunjanganTransport" (
    "id" UUID NOT NULL,
    "pegawaiId" UUID NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "baseFare" DECIMAL(10,2) NOT NULL,
    "jarakKm" DECIMAL(10,2) NOT NULL,
    "jarakKmBulatkan" INTEGER NOT NULL,
    "jumlahHariMasuk" INTEGER NOT NULL,
    "totalTunjangan" DECIMAL(10,2) NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TunjanganTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presensi" (
    "id" UUID NOT NULL,
    "pegawaiId" UUID NOT NULL,
    "tanggal" DATE NOT NULL,
    "lokasiCheckin" "LokasiGedung",
    "lokasiCheckout" "LokasiGedung",
    "waktuCheckin" TIMESTAMP(3),
    "waktuCheckout" TIMESTAMP(3),
    "statusKehadiran" "StatusKehadiran" NOT NULL,
    "durasiJam" DECIMAL(4,1),
    "statusTerpenuhi" BOOLEAN NOT NULL DEFAULT false,
    "verifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'PENDING',
    "verifikator" "Verifikator",
    "keterangan" TEXT,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "username" TEXT NOT NULL,
    "modul" "ModulLog" NOT NULL,
    "aksi" "AksiLog" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_nip_key" ON "Pegawai"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_email_key" ON "Pegawai"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CaptchaSession_sessionKey_key" ON "CaptchaSession"("sessionKey");

-- CreateIndex
CREATE UNIQUE INDEX "TunjanganTransport_pegawaiId_bulan_tahun_key" ON "TunjanganTransport"("pegawaiId", "bulan", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "Presensi_pegawaiId_tanggal_key" ON "Presensi"("pegawaiId", "tanggal");

-- AddForeignKey
ALTER TABLE "Kabupaten" ADD CONSTRAINT "Kabupaten_provinsiId_fkey" FOREIGN KEY ("provinsiId") REFERENCES "Provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kecamatan" ADD CONSTRAINT "Kecamatan_kabupatenId_fkey" FOREIGN KEY ("kabupatenId") REFERENCES "Kabupaten"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kalurahan" ADD CONSTRAINT "Kalurahan_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "Kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendidikan" ADD CONSTRAINT "Pendidikan_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "Pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpSession" ADD CONSTRAINT "OtpSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TunjanganTransport" ADD CONSTRAINT "TunjanganTransport_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
